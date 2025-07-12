
import { generateVisualDesign } from './visualDesignAgent';

export const visualDesignTool = {
  name: "visual_design_generator",
  description: "Generates a visual design for a web page based on user stories.",
  inputSchema: {
    type: "object",
    properties: {
      user_stories: {
        type: "string",
        description: "The user stories to generate the visual design from.",
      },
    },
    required: ["user_stories"],
  },
  run: async ({ user_stories }: { user_stories: string }) => {
    return await generateVisualDesign(user_stories);
  },
};
