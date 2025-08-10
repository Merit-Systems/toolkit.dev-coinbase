import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const baseGithubSearchTool = createBaseTool({
  description: "Search GitHub repositories and accounts",
  inputSchema: z.object({
    query: z.string().min(1).max(100),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string().nullable(),
        url: z.string().url(),
        content: z.string(),
        publishedDate: z.string().optional(),
        image: z.string().optional(),
        favicon: z.string().optional(),
        score: z.number().optional(),
        author: z.string().optional(),
      }),
    ),
  }),
  price: 0.05,
});
