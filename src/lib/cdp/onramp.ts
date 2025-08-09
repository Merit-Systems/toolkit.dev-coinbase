import { cdpFetch } from "./lib";

import type { OnrampTransactionsResponse } from "./types";

export const getOnrampTransactions = async (
  partnerUserRef: string,
): Promise<OnrampTransactionsResponse> => {
  return cdpFetch({
    requestHost: "api.developer.coinbase.com",
    requestPath: `/onramp/v1/buy/user/${partnerUserRef}/transactions`,
    requestMethod: "GET",
  });
};
