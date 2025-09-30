import type { ZodObject, ZodRawShape } from "zod";
import type { HTTPRequestStructure } from "x402/types";

export function convertInputSchemaToHTTPRequest(inputSchema: ZodObject<ZodRawShape>): HTTPRequestStructure {
  // Use zod's built-in JSON schema generation
  const jsonSchema = (inputSchema as any).toJSONSchema();

  // Convert JSON schema properties to our field format
  const bodyFields: Record<string, any> = {};

  if (jsonSchema.properties) {
    for (const [fieldName, fieldSchema] of Object.entries(jsonSchema.properties)) {
      const schema = fieldSchema as any;
      const isRequired = jsonSchema.required?.includes(fieldName) ?? false;

      bodyFields[fieldName] = {
        type: schema.type || "any",
        required: isRequired,
        ...(schema.description && { description: schema.description }),
        ...(schema.enum && { enum: schema.enum }),
      };
    }
  }

  return {
    type: "http" as const,
    method: "POST" as const,
    bodyType: "json" as const,
    bodyFields,
  };
}