import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { visualDesignAgent } from "../../agents";

const visualDesignSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    text: z.string(),
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  layout: z.object({
    type: z.string(),
    columns: z.number().optional(),
    gap: z.string().optional(),
  }),
  components: z.array(
    z.object({
      name: z.string(),
      props: z.record(z.any()),
    })
  ),
});

export const visualDesignStep = createStep({
    id: "visual-design-step",
    description: "Generate a visual design based on user stories",
    inputSchema: z.object({
        userStories: z.string(),
    }),
    outputSchema: visualDesignSchema,
    execute: async ({ inputData, runtimeContext }) => {
        console.log("------ Visual Design Generation ------");
        const agentResponse = await visualDesignAgent.generate(inputData.userStories, { runtimeContext });

        let structuredOutput;

        if (agentResponse.steps && agentResponse.steps.length > 0) {
            for (const step of agentResponse.steps) {
                if (step.toolCalls && step.toolCalls.length > 0) {
                    for (const toolCall of step.toolCalls) {
                        if (
                            toolCall.toolName === "visualDesignTool" &&
                            step.toolResults
                        ) {
                            const toolResult = step.toolResults.find(
                                r => r.toolCallId === toolCall.toolCallId
                            );
                            if (toolResult) {
                                structuredOutput = toolResult.result;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (!structuredOutput) {
            throw new Error("Could not generate visual design");
        }

        console.log("Generated Visual Design:", structuredOutput);
        return structuredOutput;
    },
});