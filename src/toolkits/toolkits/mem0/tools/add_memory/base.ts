import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const baseAddMemoryTool = createBaseTool({
  description:
    "Add a new memory. This method is called every time the user informs anything about themselves, their preferences, or anything that has any relevant information which can be useful in the future conversation. This can also be called when the user asks you to remember something.",
  inputSchema: z.object({
    content: z.string().describe("The content to store in memory"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    content: z.string(),
  }),
  price: 0.05,
});
