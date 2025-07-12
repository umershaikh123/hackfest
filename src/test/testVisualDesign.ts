import { visualDesignWorkflow } from "../mastra/workflows/visualDesignWorkflow";

const testVisualDesign = async () => {
    const idea = "A social media platform for pet owners.";
    const design = await visualDesignWorkflow(idea);
    console.log(JSON.stringify(design, null, 2));
};

testVisualDesign();