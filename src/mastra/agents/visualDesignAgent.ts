import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { visualDesignTool } from "../tools/visualDesignTool";

export const visualDesignAgent = new Agent({
  name: "Visual Design Agent",
  description: "An agent that generates visual designs for web pages based on user stories.",
  instructions: `
    You are a visual design agent. Your task is to generate a visually appealing and modern design for a web page based on the provided user stories.
    The design should be described in a structured format, specifying colors, fonts, layout, and components.
    The final output should be a JSON object containing the design specifications.
  `,
  model: google("models/gemini-1.5-flash"),
  tools: {
    visualDesignTool,
  },
});