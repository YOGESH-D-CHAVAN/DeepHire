import InterviewSession from "../models/InterviewSession.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGroq } from "@langchain/groq";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { sessionManager } from "../services/SessionManager.js";

const uniqueList = (items = []) => [
  ...new Set(
    items
      .filter(Boolean)
      .map((item) => item.trim())
      .filter(Boolean),
  ),
];

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
  return sessionManager.getState(threadId, createDefaultSessionState);
};

const getRecentScores = (threadId, count = 2) => {
  const evaluations = sessionManager.getEvaluations(threadId);
  return evaluations.slice(-count).map((item) => item.score);
};

const getNextDifficulty = (threadId, currentDifficulty) => {
  const recentAverage = average(getRecentScores(threadId, 2));

  if (recentAverage >= 8) return Math.min(5, currentDifficulty + 1);
  if (recentAverage > 0 && recentAverage < 5)
    return Math.max(1, currentDifficulty - 1);
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
  const evaluations = sessionManager.getEvaluations(threadId);
  const state = getSessionState(threadId);

  const confidenceBySkill = Object.entries(state.confidenceBySkill)
    .map(([skill, details]) => ({
      skill,
      averageScore: Number((details.scoreTotal / details.samples).toFixed(1)),
      samples: details.samples,
    }))
    .sort((a, b) => b.averageScore - a.averageScore);

  const averageScore = Number(
    average(evaluations.map((item) => item.score)).toFixed(1),
  );
  const recentScores = getRecentScores(threadId, 3);
  const trendLabel =
    recentScores.length >= 2 &&
    recentScores[recentScores.length - 1] > recentScores[0]
      ? "improving"
      : recentScores.length >= 2 &&
          recentScores[recentScores.length - 1] < recentScores[0]
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
    queuedFollowUps: state.followUpQueue
      .slice(0, 2)
      .map((item) => item.question),
    confidenceBySkill,
  };
};

const saveAndEvaluate = tool(
  async (
    {
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
    },
    config,
  ) => {
    try {
      console.log(
        `[TOOL] save_and_evaluate called for thread: ${config.configurable.thread_id}`,
      );
      const threadId = config.configurable.thread_id;
      const state = getSessionState(threadId);
      const normalizedAnswer = answer?.trim() || "";

      if (!normalizedAnswer) {
        return JSON.stringify({
          status: "skipped",
          reason: "No answer provided.",
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

      sessionManager.addEvaluation(threadId, evaluation);

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
      upsertConfidenceBySkill(
        state.confidenceBySkill,
        evaluation.skillsDemonstrated,
        score,
      );

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
      console.log(
        `Score: ${score}, Difficulty: ${difficultyAssigned}, Next: ${state.currentDifficulty}`,
      );

      // RETURN MINIMAL DATA TO SAVE TOKENS IN HISTORY
      return JSON.stringify({
        status: "saved",
        score: score,
        nextDifficulty: state.currentDifficulty,
        followUpNeeded: followUpNeeded,
      });
    } catch (error) {
      console.error("[TOOL ERROR] save_and_evaluate:", error);
      return JSON.stringify({
        status: "error",
        error: error.message,
      });
    }
  },
  {
    name: "save_and_evaluate",
    description:
      "Evaluate every candidate answer, update session state, and keep track of skills demonstrated, skills missing, and follow-up needs.",
    schema: z.object({
      question: z.string(),
      answer: z.string(),
      feedback: z.string(),
      score: z.number().min(0).max(10),
      aiLikelihood: z.number().min(0).max(10),
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
  },
);

const defaultSystemMessage = `
You are a Senior Technical Interviewer running a structured adaptive interview.

INTERNAL CONDUCT:
- Never mention tool names, scoring internals, or hidden state to the candidate.
- Keep responses natural, concise, and human.
- Give brief encouragement, then move forward.

STATEFUL INTERVIEW RULES:
- You must build the interview progressively across the full session, not only from the latest turn.
- After every substantive candidate answer, call the evaluation tool exactly once before replying.
- CRITICAL: When calling tools, ensure the JSON is valid and contains NO duplicate keys.
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
- Once the domain/role is provided, ask the candidate to give a brief introduction of themselves before starting technical questions.
- Ask one question at a time.
- Keep transitions brief.
- End with a concise performance and integrity summary only when the candidate clearly indicates the interview is over.

STT LENIENCY:
- The speech-to-text engine may distort technical terms. If the intended meaning is clear, interpret generously and do not penalize phonetic mistakes.
`;

const buildResumeSystemMessage = (resumeData) => {
  const skills = [
    ...(resumeData.skills || []),
    ...(resumeData.technicalSkills || []),
  ]
    .slice(0, 15)
    .join(", ");
  const softSkills = (resumeData.softSkills || []).slice(0, 5).join(", ");
  const role = resumeData.currentRole || "the candidate";
  const experience = resumeData.totalExperience || "unspecified years of";
  const name = resumeData.name || "the candidate";

  const experienceBlock = (resumeData.workExperience || [])
    .slice(0, 3)
    .map(
      (exp) =>
        `- ${exp.role} at ${exp.company} (${exp.duration}): ${(exp.highlights || []).slice(0, 2).join("; ")}`,
    )
    .join("\n");

  const projectsBlock = (resumeData.projects || [])
    .slice(0, 3)
    .map(
      (p) =>
        `- ${p.name}: ${p.description} (${(p.technologies || []).join(", ")})`,
    )
    .join("\n");

  const certBlock = (resumeData.certifications || []).slice(0, 5).join(", ");
  const achievementsBlock = (resumeData.achievements || [])
    .slice(0, 5)
    .map((a) => `- ${a}`)
    .join("\n");

  return `
You are a Senior Technical Interviewer conducting a REAL, strictly structured interview for ${name}, who is a ${role} with ${experience} of experience.

CANDIDATE RESUME SUMMARY:
${resumeData.summary || ""}

TECHNICAL SKILLS: ${skills || "not specified"}
SOFT SKILLS: ${softSkills || "not specified"}
CERTIFICATIONS: ${certBlock || "none listed"}

WORK EXPERIENCE:
${experienceBlock || "Not provided"}

PROJECTS:
${projectsBlock || "Not provided"}

ACHIEVEMENTS:
${achievementsBlock || "Not provided"}

EDUCATION:
${(resumeData.education || []).map((e) => `${e.degree} from ${e.institution} (${e.year})`).join(", ") || "Not provided"}

=== INTERVIEW STRUCTURE — FOLLOW STRICTLY IN THIS ORDER ===

SECTION 1: INTRODUCTION (1 question)
- MANDATORY START: You MUST start the interview by saying: "${name !== "the candidate" ? `Hello ${name}, ` : "Hello, "}I see you've been working as a ${resumeData.workExperience?.[0]?.role || "professional"} at ${resumeData.workExperience?.[0]?.company || "your most recent company"}. Could you please introduce yourself and walk me through your professional background and key responsibilities there?"
- FAILURE to mention the specific role (${resumeData.workExperience?.[0]?.role}) and company (${resumeData.workExperience?.[0]?.company}) in the first question is a violation of your protocol.
- Do NOT use any other greeting or introduction template.

SECTION 2: SKILLS ASSESSMENT (STRICTLY 3-4 questions)
- Transition: "Thank you. Now, let's deep dive strictly into the technical skills you've mentioned in your resume."
- Ask exactly 3 to 4 specific, probing questions about the skills listed: ${skills}.
- CRITICAL: Never ask "Tell me about your skills". Instead, pick a specific skill like React or Python from the list and ask a technical scenario or implementation question about it.
- Do NOT jump to experience until at least 3 skill questions are answered.

SECTION 3: EXPERIENCE & CAREER (2-3 questions)
- Transition: "Great. Moving on, I'd like to discuss your work experience and career journey."
- Ask about specific roles and responsibilities based on:
${experienceBlock}
- CRITICAL: Refer to specific companies (e.g. "At [Company Name], you mentioned [Task]...") and probe into the "why" and "how".

SECTION 4: PROJECTS & ACHIEVEMENTS (2-3 questions)
- Transition: "Finally, let's talk about the specific projects and achievements you've highlighted."
- Ask technical details about:
${projectsBlock}
And achievements:
${achievementsBlock}
- CRITICAL: Ask about the architecture of [Project Name] or the impact of [Achievement]. No generic project questions.

=== CONDUCT RULES ===
- Ask ONE question at a time.
- After EVERY candidate answer, call the save_and_evaluate tool ONCE.
- NEVER ask generic, common, or template-based questions.
- ALWAYS reference specific names, technologies, or responsibilities found in the resume summary blocks.
- Maintain the strict order: Intro -> Skills (3-4) -> Experience -> Projects/Achievements.
- Give brief acknowledgment before moving to the next question.
- Keep responses concise for a spoken interview.
- End with a professional summary when finished.

DIFFICULTY GUIDE:
- 1 = definitions | 2 = implementation | 3 = debugging | 4 = design | 5 = architecture

FOLLOW-UP RULES:
- Ask a follow-up if an answer lacks evidence or depth.
- Follow-ups count towards the question count for that section.

STT LENIENCY:
- Speech-to-text may distort terms; interpret generously.
`;
};

let llm;
const getLLM = () => {
  if (!llm) {
    llm = new ChatGroq({
      model: "llama-3.3-70b-versatile", // More powerful model for complex reasoning
      temperature: 0.35,
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return llm;
};

// Per-thread state is now handled by sessionManager

// Single agent instance — no static prompt baked in.
let agent;
const getAgent = () => {
  if (!agent) {
    const checkpointer = new MemorySaver();
    agent = createReactAgent({
      llm: getLLM(),
      tools: [saveAndEvaluate],
      checkpointSaver: checkpointer,
    });
  }
  return agent;
};

export const processInterviewMessage = async (req, res) => {
  const { message, threadId, resumeData } = req.body;

  if (!threadId) {
    return res
      .status(400)
      .json({ success: false, error: "threadId is required" });
  }

  const config = { configurable: { thread_id: threadId } };
  getSessionState(threadId);

  // Store resumeData for this thread on first message
  const hasResume =
    resumeData &&
    typeof resumeData === "object" &&
    Object.keys(resumeData).length > 0;
  if (!sessionManager.hasResumeData(threadId)) {
    sessionManager.setResumeData(threadId, hasResume ? resumeData : null);
  }

  const activeAgent = getAgent();
  if (!process.env.GROQ_API_KEY) {
    console.error(
      "[ERROR] GROQ_API_KEY is missing from environment variables!",
    );
  }

  try {
    // Inject system message on the first turn only
    let inputMessages;
    if (!sessionManager.isInitialized(threadId)) {
      sessionManager.setInitialized(threadId);
      const storedResume = sessionManager.getResumeData(threadId);
      console.log(`[DEBUG] Thread ${threadId} - Stored Resume:`, !!storedResume);
      if (storedResume) {
        console.log(`[DEBUG] Resume Name: ${storedResume.name}, Work Exp Count: ${storedResume.workExperience?.length}`);
      }

      const systemText = storedResume
        ? buildResumeSystemMessage(storedResume)
        : defaultSystemMessage;

      console.log(`[DEBUG] System Message Preview: ${systemText.substring(0, 200)}...`);

      inputMessages = [
        new SystemMessage(systemText),
        new HumanMessage(storedResume ? "I have provided my resume. Please start the structured interview now by referencing my recent role as required." : "Hello, let's start the interview setup."),
      ];
      console.log(
        `[AGENT] Thread ${threadId} initialized | Mode: ${storedResume ? "RESUME" : "MANUAL"}`,
      );
    } else {
      inputMessages = [new HumanMessage(message || "Continue.")];
    }

    const input = { messages: inputMessages };
    console.log(
      `[AGENT] Processing message for thread: ${threadId} | Messages: ${inputMessages.length}`,
    );

    const result = await activeAgent.invoke(input, config);
    console.log(`[AGENT] Invoke successful for thread: ${threadId}`);
    const agentMessages = result.messages || [];
    if (agentMessages.length === 0) {
      throw new Error("AI Agent failed to generate a response message.");
    }
    const lastMessage = agentMessages[agentMessages.length - 1];

    // Safely extract text for TTS
    const rawContent = lastMessage.content;
    const responseText =
      typeof rawContent === "string"
        ? rawContent
        : Array.isArray(rawContent)
          ? rawContent
              .filter((b) => b?.type === "text")
              .map((b) => b.text)
              .join(" ")
              .trim()
          : String(rawContent || "");

    if (!responseText) {
      throw new Error("AI Agent generated an empty response.");
    }

    const evaluations = sessionManager.getEvaluations(threadId);
    const sessionInsights = buildSessionInsights(threadId);

    res.status(200).json({
      success: true,
      response: responseText,
      evaluations,
      latestEvaluation: evaluations[evaluations.length - 1] || null,
      sessionInsights,
    });
  } catch (error) {
    console.error("Interview Agent Error Stack:", error.stack);

    // Provide a more helpful error for rate limits
    if (error.message?.includes("rate_limit_exceeded")) {
      return res.status(429).json({
        success: false,
        error:
          "AI Interviewer is currently busy (Rate Limit Exceeded). Please check your Groq API usage or try again in a moment.",
        isRateLimit: true,
      });
    }

    res
      .status(500)
      .json({ success: false, error: error.message, stack: error.stack });
  }
};

export const getInterviewHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await InterviewSession.find({ userId }).sort({
      createdAt: -1,
    });
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
          goalsMet: "0/0",
          practiceTime: "0h",
        },
      });
    }

    const totalInterviews = sessions.length;
    const avgScore =
      sessions.reduce((acc, s) => acc + (s.analysis?.score || 0), 0) /
      totalInterviews;

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
        goalsMet: `${sessions.filter((s) => (s.analysis?.score || 0) >= 80).length}/${totalInterviews}`,
        practiceTime: `${practiceTimeHours}h`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
