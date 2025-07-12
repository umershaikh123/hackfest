import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const visualDesignSchema = z.object({
  colors: z.object({
    primary: z.string().describe("Primary color for the website"),
    secondary: z.string().describe("Secondary color for the website"),
    accent: z.string().describe("Accent color for buttons and highlights"),
    text: z.string().describe("Main text color"),
  }),
  fonts: z.object({
    heading: z.string().describe("Font for headings"),
    body: z.string().describe("Font for body text"),
  }),
  layout: z.object({
    type: z.string().describe("Layout type (e.g., grid, flexbox)"),
    columns: z.number().optional().describe("Number of columns for grid layout"),
    gap: z.string().optional().describe("Gap between layout elements"),
  }),
  components: z.array(
    z.object({
      name: z.string().describe("Name of the UI component (e.g., Navbar, HeroSection)"),
      props: z.object({ title: z.string().optional(), subtitle: z.string().optional(), text: z.string().optional(), links: z.array(z.string()).optional() }).describe("Properties for the component"),
    })
  ),
});

export const visualDesignTool = createTool({
  id: "visual_design_generator",
  description: "Generates a visual design for a web page based on user stories.",
  inputSchema: z.object({
    user_stories: z.string().describe("The user stories to generate the visual design from."),
  }),
  outputSchema: visualDesignSchema,
  execute: async ({ context, runtimeContext }) => {
    // This is a placeholder for the actual visual design generation logic.
    // In a real implementation, this would involve calling a visual design generation model or service.
    const design = {
      colors: {
        primary: "#4A90E2",
        secondary: "#F5A623",
        accent: "#9013FE",
        text: "#333333",
      },
      fonts: {
        heading: "Poppins, sans-serif",
        body: "Roboto, sans-serif",
      },
      layout: {
        type: "grid",
        columns: 12,
        gap: "20px",
      },
      components: [
        {
          name: "Navbar",
          props: {
            title: "YourLogo",
            links: ["Home", "About", "Contact"],
          },
        },
        {
          name: "HeroSection",
          props: {
            title: "Welcome to Our Awesome Website",
            subtitle: "A place where amazing things happen.",
          },
        },
        {
          name: "Footer",
          props: {
            text: "© 2025 Your Company",
          },
        },
      ],
    };
    return design;
  },
});