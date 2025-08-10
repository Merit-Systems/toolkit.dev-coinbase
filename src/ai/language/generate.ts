import { generateText as generateTextAi, streamText as streamTextAi } from "ai";

import { openrouter } from "./provider";

export const generateText = (
  model: `${string}/${string}`,
  token: string,
  params: Omit<Parameters<typeof generateTextAi>[0], "model">,
) => {
  return generateTextAi({
    model: openrouter(token)(model),
    ...params,
  });
};

export const streamText = (
  model: `${string}/${string}`,
  token: string,
  params: Omit<Parameters<typeof streamTextAi>[0], "model">,
) => {
  return streamTextAi({
    model: openrouter(token)(model),
    ...params,
  });
};
