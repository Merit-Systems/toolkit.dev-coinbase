import { generateJwt as generateJwtCdp } from "@coinbase/cdp-sdk/auth";
import type { CdpRequest } from "./types";

const generateJwt = async (payload: CdpRequest) =>
  generateJwtCdp({
    apiKeyId: process.env.CDP_API_KEY_ID!,
    apiKeySecret: process.env.CDP_API_KEY_SECRET!,
    expiresIn: 120,
    ...payload,
  });

export const cdpFetch = async <T>(
  request: CdpRequest,
  init?: RequestInit,
): Promise<T> => {
  const jwt = await generateJwt(request);

  const url = `https://${request.requestHost}${request.requestPath}`;

  const response = await fetch(url, {
    ...init,
    method: request.requestMethod,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch from CDP: ${errorText}`);
  }

  return (await response.json()) as T;
};
