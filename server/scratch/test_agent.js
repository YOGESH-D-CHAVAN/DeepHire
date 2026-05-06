import 'dotenv/config';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGroq } from "@langchain/groq";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const saveAndEvaluate = tool(
  async (args) => {
    console.log("Tool called with:", args);
    return JSON.stringify({ status: "saved", nextDifficulty: 2, insights: {} });
  },
  {
    name: "save_and_evaluate",
    description: "Evaluate candidate answer",
    schema: z.object({
      question: z.string(),
      answer: z.string(),
      feedback: z.string(),
      score: z.number(),
      aiLikelihood: z.number(),
      difficultyAssigned: z.number(),
      candidateReadiness: z.enum(["low", "medium", "high"]),
      followUpNeeded: z.boolean(),
    }),
  }
);

async function testAgent() {
  try {
    const llm = new ChatGroq({
      model: "llama-3.1-8b-instant",
      temperature: 0.35,
      apiKey: process.env.GROQ_API_KEY,
    });

    const checkpointer = new MemorySaver();
    const agent = createReactAgent({
      llm,
      tools: [saveAndEvaluate],
      checkpointSaver: checkpointer,
    });

    const config = { configurable: { thread_id: "test-thread" } };
    const input = {
      messages: [
        new SystemMessage("You are an interviewer."),
        new HumanMessage("Hello")
      ]
    };

    console.log("Invoking agent...");
    const result = await agent.invoke(input, config);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Test Error:", error);
  }
}

testAgent();
