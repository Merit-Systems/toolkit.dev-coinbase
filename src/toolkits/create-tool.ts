import type { ZodObject, ZodRawShape } from "zod";
import type {
  BaseTool,
  ClientTool,
  ClientToolConfig,
  ServerTool,
  ServerToolConfig,
} from "./types";

export const createBaseTool = <
  Args extends ZodRawShape,
  Output extends ZodRawShape,
>({
  description,
  inputSchema,
  outputSchema,
  price,
}: {
  description: string;
  inputSchema: ZodObject<Args>;
  outputSchema: ZodObject<Output>;
  price?: number;
}): BaseTool<Args, Output> => {
  return { description, inputSchema, outputSchema, price };
};

export const createServerTool = <
  Args extends ZodRawShape,
  Result extends ZodRawShape,
>(
  tool: BaseTool<Args, Result>,
  config: ServerToolConfig<Args, Result>,
): ServerTool<Args, Result> => {
  return {
    ...tool,
    ...config,
  };
};

export const createClientTool = <
  Args extends ZodRawShape,
  Result extends ZodRawShape,
>(
  tool: BaseTool<Args, Result>,
  config: ClientToolConfig<Args, Result>,
): ClientTool<Args, Result> => {
  return {
    ...tool,
    ...config,
  };
};
