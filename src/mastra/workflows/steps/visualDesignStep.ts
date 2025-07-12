import { visualDesignAgent } from "../../agents";

export const visualDesignStep = async (userStories: string) => {
    console.log("------ Visual Design Generation ------");
    const design = await visualDesignAgent(userStories);
    console.log("Generated Visual Design:", design);
    return design;
};