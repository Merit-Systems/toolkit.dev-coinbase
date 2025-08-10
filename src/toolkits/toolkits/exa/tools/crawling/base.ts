import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const baseCrawlingTool = createBaseTool({
  description: "Extract content from specific URLs",
  inputSchema: z.object({
    urls: z.array(z.string()),
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
