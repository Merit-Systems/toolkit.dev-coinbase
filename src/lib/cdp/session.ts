import { cdpFetch } from "./lib";

import type { SessionTokenResponse } from "./types";

export const createSessionToken = async (
  address: string,
): Promise<SessionTokenResponse> => {
  return cdpFetch<SessionTokenResponse>(
    {
      requestHost: "api.developer.coinbase.com",
      requestPath: `/onramp/v1/token`,
      requestMethod: "POST",
    },
    {
      body: JSON.stringify({
        addresses: [
          {
            address,
            blockchains: ["base"],
          },
        ],
        assets: ["USDC"],
      }),
    },
  );
};
