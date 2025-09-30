import type { ZodObject, ZodRawShape, ZodTypeAny } from "zod";
import type { HTTPRequestStructure } from "x402/types";

/**
 * Lite version of zod-to-json-schema conversion for zod v3
 * Note: zod v4+ has built-in .toJSONSchema() method, but we're using v3
 */
export function zodToJsonSchema(zodSchema: ZodObject<ZodRawShape>) {
  const shape = zodSchema.shape;

  const properties = Object.entries(shape).reduce((acc, [fieldName, zodField]) => {
    acc[fieldName] = getZodFieldInfo(zodField);
    return acc;
  }, {} as Record<string, any>);

  return {
    type: "object",
    properties,
    required: Object.entries(properties)
      .filter(([_, fieldInfo]) => fieldInfo.required)
      .map(([fieldName]) => fieldName),
  };
}

function getZodFieldInfo(zodType: ZodTypeAny): any {
  const def = zodType._def;

  // Handle optional wrapper
  if (def.typeName === "ZodOptional") {
    const innerInfo = getZodFieldInfo(def.innerType);
    return {
      ...innerInfo,
      required: false,
    };
  }

  // Base type mapping
  const baseInfo = (() => {
    switch (def.typeName) {
      case "ZodString":
        return { type: "string" };
      case "ZodNumber":
        return { type: "number" };
      case "ZodBoolean":
        return { type: "boolean" };
      case "ZodArray":
        return { type: "array" };
      case "ZodEnum":
        return { type: "string", enum: def.values };
      case "ZodObject":
        return { type: "object" };
      case "ZodRecord":
        return { type: "object" };
      default:
        return { type: "any" };
    }
  })();

  return {
    ...baseInfo,
    required: true, // Default to required unless wrapped in ZodOptional
    ...(def.description && { description: def.description }),
  };
}

export function inputSchemaToX402(inputSchema: ZodObject<ZodRawShape>): HTTPRequestStructure {
  const jsonSchema = zodToJsonSchema(inputSchema);

  const bodyFields = Object.entries(jsonSchema.properties).reduce((acc, [fieldName, fieldInfo]) => {
    acc[fieldName] = fieldInfo;
    return acc;
  }, {} as Record<string, any>);

  return {
    type: "http" as const,
    method: "POST" as const,
    bodyType: "json" as const,
    bodyFields,
  };
}