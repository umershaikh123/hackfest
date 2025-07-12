
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

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

export async function generateVisualDesign(user_stories: string) {
  const { object } = await generateObject({
    model: google("models/gemini-1.5-flash"),
    schema: visualDesignSchema,
    prompt: `
      You are a visual design agent. Your task is to generate a visually appealing and modern design for a web page based on the provided user stories.
      The design should be described in a structured format, specifying colors, fonts, layout, and components.
      The final output should be a JSON object containing the design specifications.

      User Stories:
      ${user_stories}
    `,
  });

  return object;
}
