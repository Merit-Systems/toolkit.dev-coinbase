import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

const inputSchema = z.object({
  prompt: z.string().min(1).max(250).describe("The image generation prompt"),
});

const outputSchema = z.object({
  url: z.string().describe("The URL of the generated image"),
});

export const baseGenerateTool = createBaseTool({
  description: "Generate an image",
  inputSchema,
  outputSchema,
  price: 0.2,
});

export type GenerateToolArgs = z.infer<typeof inputSchema>;
export type GenerateToolResult = z.infer<typeof outputSchema>;
