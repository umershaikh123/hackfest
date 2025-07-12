import { ideaGenerationStep } from "./steps/ideaGenerationStep";
import { userStoryGenerationStep } from "./steps/userStoryGenerationStep";
import { visualDesignStep } from "./steps/visualDesignStep";
import { UserStorySchema } from "../../types/productMaestro";
import { z } from "zod";

export const visualDesignWorkflow = async (idea: string) => {
    const ideaResult = await ideaGenerationStep.execute({ inputData: { rawIdea: idea }, runtimeContext: {} });
    const userStoriesResult = await userStoryGenerationStep.execute({ inputData: ideaResult, runtimeContext: {} });

    const userStoriesString = userStoriesResult.userStories
        .map((story: z.infer<typeof UserStorySchema>) => `As a ${story.persona}, I want to ${story.userAction} so that ${story.benefit}.`)
        .join('\n');

    const design = await visualDesignStep.execute({ inputData: { userStories: userStoriesString }, runtimeContext: {} });
    return design;
};