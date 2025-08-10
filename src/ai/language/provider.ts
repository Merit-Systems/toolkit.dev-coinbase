import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouter = (token: string) => createOpenRouter({
  headers: {
    "HTTP-Referer": "https://toolkit.dev",
    "X-Title": "Toolkit.dev",
  },
  baseURL: "https://echo-staging.up.railway.app/",
  apiKey: token,
});
