import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

import type { Result, Logs } from "@e2b/code-interpreter";

export const baseRunCodeTool = createBaseTool({
  description:
    "Run Python code in a secure sandbox environment using E2B. Supports Jupyter Notebook syntax and returns execution results and logs.",
  inputSchema: z.object({
    code: z.string().describe("The Python code to execute in the sandbox"),
  }),
  outputSchema: z.object({
    results: z
      .array(z.custom<Result>())
      .describe("The execution results from running the code"),
    logs: z.custom<Logs>().describe("Execution logs"),
  }),
  price: 0.05,
});
