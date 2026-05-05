import InterviewSession from '../models/InterviewSession.js';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGroq } from "@langchain/groq";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";

const sessionEvaluations = new Map();
const sessionStates = new Map();

const uniqueList = (items = []) => [...new Set(items.filter(Boolean).map(item => item.trim()).filter(Boolean))];

const bumpCounts = (store, items = []) => {
  for (const item of uniqueList(items)) {
    store[item] = (store[item] || 0) + 1;
  }
  
};

const average = (values = []) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const topEntries = (store = {}, limit = 3) =>
  Object.entries(store)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label]) => label);

const createDefaultSessionState = () => ({
  targetRole: "",
  questionPlan: [],
  currentDifficulty: 2,
  difficultyTrend: [2],
  followUpQueue: [],
  confidenceBySkill: {},
  skillsObserved: {},
  missingSkills: {},
  conceptualGaps: {},
  communicationGaps: {},
  strongSignals: {},
  weakSignals: {},
  contradictions: [],
  readiness: "medium",
  totalAnswers: 0,
});

const getSessionState = (threadId) => {
  if (!sessionStates.has(threadId)) {
    sessionStates.set(threadId, createDefaultSessionState());
  }
  return sessionStates.get(threadId);
};

const getRecentScores = (threadId, count = 2) => {
  const evaluations = sessionEvaluations.get(threadId) || [];
  return evaluations.slice(-count).map(item => item.score);
};

const getNextDifficulty = (threadId, currentDifficulty) => {
  const recentAverage = average(getRecentScores(threadId, 2));

  if (recentAverage >= 8) return Math.min(5, currentDifficulty + 1);
  if (recentAverage > 0 && recentAverage < 5) return Math.max(1, currentDifficulty - 1);
  return currentDifficulty;
};

const upsertConfidenceBySkill = (confidenceBySkill, skills, score) => {
  for (const skill of uniqueList(skills)) {
    const current = confidenceBySkill[skill];
    if (!current) {
      confidenceBySkill[skill] = {
        scoreTotal: score,
        samples: 1,
      };
      continue;
    }

    current.scoreTotal += score;
    current.samples += 1;
  }
};

const buildSessionInsights = (threadId) => {
  const evaluations = sessionEvaluations.get(threadId) || [];
  const state = getSessionState(threadId);

  const confidenceBySkill = Object.entries(state.confidenceBySkill)
    .map(([skill, details]) => ({
      skill,
      averageScore: Number((details.scoreTotal / details.samples).toFixed(1)),
      samples: details.samples,
    }))
    .sort((a, b) => b.averageScore - a.averageScore);

  const averageScore = Number(average(evaluations.map(item => item.score)).toFixed(1));
  const recentScores = getRecentScores(threadId, 3);
  const trendLabel =
    recentScores.length >= 2 && recentScores[recentScores.length - 1] > recentScores[0]
      ? "improving"
      : recentScores.length >= 2 && recentScores[recentScores.length - 1] < recentScores[0]
        ? "slipping"
        : "steady";

  return {
    targetRole: state.targetRole,
    currentDifficulty: state.currentDifficulty,
    averageScore,
    trendLabel,
    readiness: state.readiness,
    totalAnswers: state.totalAnswers,
    strengths: topEntries(state.strongSignals),
    focusAreas: topEntries(state.weakSignals),
    missingSkills: topEntries(state.missingSkills, 5),
    conceptualGaps: topEntries(state.conceptualGaps, 5),
    communicationGaps: topEntries(state.communicationGaps, 5),
    observedSkills: topEntries(state.skillsObserved, 5),
    queuedFollowUps: state.followUpQueue.slice(0, 2).map(item => item.question),
    confidenceBySkill,
  };
};

const saveAndEvaluate = tool(
  async ({
    question,
    answer,
    feedback,
    score,
    aiLikelihood,
    difficultyAssigned,
    candidateReadiness,
    followUpNeeded,
    followUpQuestion,
    followUpReason,
    targetRole,
    skillsDemonstrated,
    skillsMissing,
    conceptualGaps,
    communicationGaps,
    strongSignals,
    weakSignals,
    contradictionFlag,
    evidenceLevel,
  }, config) => {
    const threadId = config.configurable.thread_id;
    const state = getSessionState(threadId);
    const normalizedAnswer = answer?.trim() || "";

    if (!normalizedAnswer) {
      return JSON.stringify({
        status: "skipped",
        reason: "No candidate answer was provided, so evaluation was not recorded.",
        insights: buildSessionInsights(threadId),
      });
    }

    const evaluation = {
      question,
      answer: normalizedAnswer,
      feedback,
      score,
      aiLikelihood,
      difficultyAssigned,
      candidateReadiness,
      followUpNeeded,
      followUpQuestion,
      followUpReason,
      targetRole,
      skillsDemonstrated: uniqueList(skillsDemonstrated),
      skillsMissing: uniqueList(skillsMissing),
      conceptualGaps: uniqueList(conceptualGaps),
      communicationGaps: uniqueList(communicationGaps),
      strongSignals: uniqueList(strongSignals),
      weakSignals: uniqueList(weakSignals),
      contradictionFlag: contradictionFlag?.trim() || "",
      evidenceLevel,
      timestamp: new Date().toISOString(),
    };

    if (!sessionEvaluations.has(threadId)) {
      sessionEvaluations.set(threadId, []);
    }
    sessionEvaluations.get(threadId).push(evaluation);

    if (targetRole?.trim()) {
      state.targetRole = targetRole.trim();
    }

    state.totalAnswers += 1;
    state.readiness = candidateReadiness;

    bumpCounts(state.skillsObserved, evaluation.skillsDemonstrated);
    bumpCounts(state.missingSkills, evaluation.skillsMissing);
    bumpCounts(state.conceptualGaps, evaluation.conceptualGaps);
    bumpCounts(state.communicationGaps, evaluation.communicationGaps);
    bumpCounts(state.strongSignals, evaluation.strongSignals);
    bumpCounts(state.weakSignals, evaluation.weakSignals);
    upsertConfidenceBySkill(state.confidenceBySkill, evaluation.skillsDemonstrated, score);

    if (evaluation.contradictionFlag) {
      state.contradictions.push({
        detail: evaluation.contradictionFlag,
        timestamp: evaluation.timestamp,
      });
    }

    if (evaluation.followUpNeeded && evaluation.followUpQuestion) {
      state.followUpQueue.push({
        question: evaluation.followUpQuestion,
        reason: evaluation.followUpReason || "Clarify a missing concept",
        sourceQuestion: question,
        timestamp: evaluation.timestamp,
      });
    }

    state.currentDifficulty = getNextDifficulty(threadId, difficultyAssigned);
    state.difficultyTrend.push(state.currentDifficulty);

    console.log(`\n[AGENT LOG]: Evaluated "${question}"`);
    console.log(`Score: ${score}, Difficulty: ${difficultyAssigned}, Next: ${state.currentDifficulty}`);

    return JSON.stringify({
      status: "saved",
      nextDifficulty: state.currentDifficulty,
      insights: buildSessionInsights(threadId),
    });
  },
  {
    name: "save_and_evaluate",
    description: "Evaluate every candidate answer, update session state, and keep track of skills demonstrated, skills missing, and follow-up needs.",
    schema: z.object({
      question: z.string(),
      answer: z.string(),
      feedback: z.string(),
      score: z.number().min(0).max(10),
      aiLikelihood: z.number().min(1).max(10),
      difficultyAssigned: z.number().min(1).max(5),
      candidateReadiness: z.enum(["low", "medium", "high"]),
      followUpNeeded: z.boolean(),
      followUpQuestion: z.string().optional().default(""),
      followUpReason: z.string().optional().default(""),
      targetRole: z.string().optional().default(""),
      skillsDemonstrated: z.array(z.string()).default([]),
      skillsMissing: z.array(z.string()).default([]),
      conceptualGaps: z.array(z.string()).default([]),
      communicationGaps: z.array(z.string()).default([]),
      strongSignals: z.array(z.string()).default([]),
      weakSignals: z.array(z.string()).default([]),
      contradictionFlag: z.string().optional().default(""),
      evidenceLevel: z.enum(["low", "medium", "high"]).default("medium"),
    }),
  }
);

const systemMessage = `
You are a Senior Technical Interviewer running a structured adaptive interview.

INTERNAL CONDUCT:
- Never mention tool names, scoring internals, or hidden state to the candidate.
- Keep responses natural, concise, and human.
- Give brief encouragement, then move forward.

STATEFUL INTERVIEW RULES:
- You must build the interview progressively across the full session, not only from the latest turn.
- After every substantive candidate answer, call the evaluation tool exactly once before replying.
- Do not call the evaluation tool when you are asking the first question, clarifying setup, or speaking before the candidate has answered.
- Use the tool output to track:
  - strengths shown repeatedly
  - missing skills or uncovered topics
  - conceptual gaps
  - communication gaps
  - whether a follow-up question is needed
- When the candidate answer is shallow, generic, contradictory, or incomplete, ask one focused follow-up instead of jumping topics.
- If the candidate answer is strong, increase difficulty gradually.
- If the candidate struggles, simplify the next question and narrow the scope.

DIFFICULTY GUIDE:
- 1 = definitions and basic recall
- 2 = practical implementation
- 3 = debugging and tradeoffs
- 4 = design under ambiguity
- 5 = edge cases, leadership, and architecture judgment

FOLLOW-UP RULES:
- Ask follow-ups when a claim lacks evidence, examples, tradeoffs, metrics, or implementation detail.
- Prefer one sharp follow-up question over multiple small ones.
- If a follow-up is needed, ask it immediately in your visible reply.
- If no follow-up is needed, ask the next best question for the current difficulty.

INTERVIEW FLOW:
- Start by asking for the target domain/role and number of questions.
- Ask one question at a time.
- Keep transitions brief.
- End with a concise performance and integrity summary only when the candidate clearly indicates the interview is over.

STT LENIENCY:
- The speech-to-text engine may distort technical terms. If the intended meaning is clear, interpret generously and do not penalize phonetic mistakes.
`;

let llm;
const getLLM = () => {
  if (!llm) {
    llm = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      temperature: 0.35,
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return llm;
};

let agent;
const getAgent = () => {
  if (!agent) {
    const checkpointer = new MemorySaver();
    agent = createReactAgent({
      llm: getLLM(),
      tools: [saveAndEvaluate],
      checkpointSaver: checkpointer,
      prompt: systemMessage,
    });
  }
  return agent;
};

export const processInterviewMessage = async (req, res) => {
  const { message, threadId } = req.body;

  if (!threadId) {
    return res.status(400).json({ success: false, error: "threadId is required" });
  }

  const config = { configurable: { thread_id: threadId } };
  getSessionState(threadId);

  try {
    const activeAgent = getAgent();
    const input = {
      messages: [new HumanMessage(message || "Begin interview setup.")],
    };

    console.log(`[AGENT] Processing message for thread: ${threadId}`);

    const result = await activeAgent.invoke(input, config);
    const messages = result.messages;
    const lastMessage = messages[messages.length - 1];
    const evaluations = sessionEvaluations.get(threadId) || [];
    const sessionInsights = buildSessionInsights(threadId);

    res.status(200).json({
      success: true,
      response: lastMessage.content,
      evaluations,
      latestEvaluation: evaluations[evaluations.length - 1] || null,
      sessionInsights,
    });
  } catch (error) {
    console.error("Interview Agent Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInterviewHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await InterviewSession.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await InterviewSession.find({ userId });

    if (sessions.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalInterviews: 0,
          avgConfidence: 0,
          goalsMet: '0/0',
          practiceTime: '0h'
        }
      });
    }

    const totalInterviews = sessions.length;
    const avgScore = sessions.reduce((acc, s) => acc + (s.analysis?.score || 0), 0) / totalInterviews;

    const totalDurationMs = sessions.reduce((acc, s) => {
      if (s.startTime && s.endTime) {
        return acc + (new Date(s.endTime) - new Date(s.startTime));
      }
      return acc;
    }, 0);

    const practiceTimeHours = (totalDurationMs / (1000 * 60 * 60)).toFixed(1);

    res.json({
      success: true,
      stats: {
        totalInterviews,
        avgConfidence: Math.round(avgScore),
        goalsMet: `${sessions.filter(s => (s.analysis?.score || 0) >= 80).length}/${totalInterviews}`,
        practiceTime: `${practiceTimeHours}h`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
