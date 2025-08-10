import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const baseCompetitorFinderTool = createBaseTool({
  description: "Find competitors of a company",
  inputSchema: z.object({
    company: z.string().min(1).max(100),
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
