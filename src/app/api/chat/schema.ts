import { z } from "zod";

import { languageModels } from "@/ai/language";
import { MESSAGE_MAX_LENGTH, FILE_NAME_MAX_LENGTH } from "@/lib/constants";

import { Toolkits } from "@/toolkits/toolkits/shared";
import { clientToolkits } from "@/toolkits/toolkits/client";

const textPartSchema = z.object({
  text: z.string().min(1).max(MESSAGE_MAX_LENGTH),
  type: z.literal("text"),
});

const toolPartSchema = z.object({
  type: z.literal("tool-invocation"),
  toolInvocation: z.object({
    state: z.literal("result"),
    toolCallId: z.string(),
    toolName: z.string(),
    args: z.record(z.string(), z.any()),
    result: z.record(z.string(), z.any()),
  }),
});

const stepStartPartSchema = z.object({
  type: z.literal("step-start"),
});

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    createdAt: z.coerce.date(),
    role: z.enum(["user", "assistant"]),
    content: z.string().max(MESSAGE_MAX_LENGTH),
    parts: z.array(
      z.discriminatedUnion("type", [
        textPartSchema,
        toolPartSchema,
        stepStartPartSchema,
      ]),
    ),
    experimental_attachments: z
      .array(
        z.object({
          url: z.string().url(),
          name: z.string().min(1).max(FILE_NAME_MAX_LENGTH),
          contentType: z.enum([
            "image/png",
            "image/jpg",
            "image/jpeg",
            "application/pdf",
          ]),
        }),
      )
      .optional(),
  }),
  selectedChatModel: z.enum(
    languageModels.map((model) => `${model.provider}/${model.modelId}`) as [
      `${string}/${string}`,
      ...`${string}/${string}`[],
    ],
  ),
  selectedVisibilityType: z.enum(["public", "private"]),
  useNativeSearch: z.boolean(),
  systemPrompt: z.string().optional(),
  workbenchId: z.string().uuid().optional(),
  toolkits: z.array(
    z
      .object({
        id: z.nativeEnum(Toolkits),
        parameters: z.record(z.string(), z.any()),
      })
      .refine((toolkit) => {
        return toolkit.id in clientToolkits;
      })
      .refine((toolkit) => {
        return clientToolkits[toolkit.id].parameters?.parse(toolkit.parameters);
      }),
  ),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
