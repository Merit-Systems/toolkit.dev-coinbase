import type { ZodObject, ZodRawShape } from "zod";
import type { HTTPRequestStructure } from "x402/types";

export function convertInputSchemaToHTTPRequest(inputSchema: ZodObject<ZodRawShape>): HTTPRequestStructure {
    const shape = inputSchema.shape;
    const fieldNames = Object.keys(shape);
  
    // Convert all inputSchema fields to bodyFields since all tools use POST with JSON
    const bodyFields = fieldNames.reduce((acc, fieldName) => {
      acc[fieldName] = "any";
      return acc;
    }, {} as Record<string, any>);
  
    return {
      type: "http" as const,
      method: "POST" as const,
      bodyType: "json" as const,
      bodyFields,
    };
  }