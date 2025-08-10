import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const baseSearchMemoriesTool = createBaseTool({
  description:
    "Search through stored memories. This method is called ANYTIME the user asks anything.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "The search query. This is the query that the user has asked for. Example: 'What did I tell you about the weather last week?' or 'What did I tell you about my friend John?'",
      ),
  }),
  outputSchema: z.object({
    memories: z.array(
      z.object({
        memory: z.string(),
        score: z.number(),
        metadata: z.record(z.any()).optional(),
      }),
    ),
    query: z.string(),
  }),
  price: 0.01,
});
