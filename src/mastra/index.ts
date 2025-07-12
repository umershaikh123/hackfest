import { Mastra } from "@mastra/core/mastra"
import { PinoLogger } from "@mastra/loggers"
import { LibSQLStore } from "@mastra/libsql"
import { Memory } from "@mastra/memory"
import { ideaGenerationAgent } from "./agents/ideaGenerationAgent"
import { userStoryGeneratorAgent } from "./agents/userStoryGeneratorAgent"
import { productDevelopmentWorkflow } from "./workflows/productDevelopmentWorkflow"

import { pineconeStore, initializePineconeIndex } from "./vectors/pineconeSetup"
import "dotenv/config"
initializePineconeIndex().catch(console.error)

const storage = new LibSQLStore({
  url: process.env.DATABASE_URL || "file:./product-maestro.db",
})

// const pineconeStore = new PineconeStore({
//   apiKey: process.env.PINECONE_API_KEY!,
//   host: process.env.PINECONE_HOST!,
//   indexName: process.env.PINECONE_INDEX_NAME!,
// });

export const mastra = new Mastra({
  agents: {
    ideaGenerationAgent,
    userStoryGeneratorAgent,
    // We'll add more agents here as we build them
  },
  workflows: {
    productDevelopmentWorkflow,
    // We'll add more workflows here as we build them
  },

  storage,
  logger: new PinoLogger({
    name: "ProductMaestro",
    level: "info",
  }),
})
