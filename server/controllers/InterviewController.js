import InterviewSession from '../models/InterviewSession.js';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGroq } from "@langchain/groq";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";

// Shared session data to track evaluations per thread (since MemorySaver only tracks messages)
const sessionEvaluations = new Map();

const saveAndEvaluate = tool(
  async ({ question, answer, feedback, score, aiLikelihood }, config) => {
    const threadId = config.configurable.thread_id;
    const evaluation = { question, answer, feedback, score, aiLikelihood, timestamp: new Date().toISOString() };
    
    // Store in our local session tracker
    if (!sessionEvaluations.has(threadId)) {
        sessionEvaluations.set(threadId, []);
    }
    sessionEvaluations.get(threadId).push(evaluation);

    console.log(`\n[AGENT LOG]: Evaluating answer for "${question}"`);
    console.log(`Score: ${score}, AI Likelihood: ${aiLikelihood}`);
    return `Logged evaluation for "${question}". integrity: ${aiLikelihood}/10. This is now saved in the structured session data.`;
  },
  {
    name: "save_and_evaluate",
    description: "Evaluates the answer and checks for AI patterns. Use this after EVERY response from the user.",
    schema: z.object({
      question: z.string(),
      answer: z.string(),
      feedback: z.string(),
      score: z.number().min(1).max(10),
      aiLikelihood: z.number().min(1).max(10),
    }),
  }
);

const systemMessage = `
You are a Senior Technical Interviewer.

INTERNAL CONDUCT:
- NEVER mention tool names like 'save_and_evaluate' to the candidate. 
- All evaluations and logging are SILENT background tasks. 
- Speak naturally but CONCISELY. Avoid long introductory filler or repetitive feedback.
- HUMAN-LIKE TRAITS: Use natural conversational markers occasionally (e.g., "Alright,", "Interesting point,", "I see,"). Give brief, encouraging feedback (e.g., "Nice," "Fair enough") before moving to the next question.

STT LENIENCY (CRITICAL):
- The speech-to-text engine often makes mistakes on technical terms (e.g., "front end" for "frontend", "reacting" for "React").
- DO NOT penalize the candidate for phonetic errors. If you can guess what they meant, proceed as if they said it perfectly.

INTERVIEW FLOW:
- START: Ask for domain and question count immediately.
- TRANSITIONS: Keep transitions between questions very brief (e.g., "Understood. Next question:").
- ADAPTIVE: One question at a time. Increase difficulty for high scores; simplify for low scores.
- REPORT: End with a performance and integrity summary.
`;

let llm;
const getLLM = () => {
  if (!llm) {
    llm = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
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
  
  try {
    const activeAgent = getAgent();
    const input = { 
      messages: [new HumanMessage(message || "Begin interview setup.")] 
    };
    
    console.log(`[AGENT] Processing message for thread: ${threadId}`);
    
    const result = await activeAgent.invoke(input, config);
    
    const messages = result.messages;
    const lastMessage = messages[messages.length - 1];

    // Retrieve evaluations for this thread
    const evaluations = sessionEvaluations.get(threadId) || [];

    res.status(200).json({
      success: true,
      response: lastMessage.content,
      evaluations: evaluations, // Send back the latest structured evaluations
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

