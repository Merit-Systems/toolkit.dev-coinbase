"use client";

import { useAccount, useWalletClient } from "wagmi";
import { wrapFetchWithPayment } from "x402-fetch";

export function useX402() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  if (!isConnected || !address || !walletClient) {
    return {
      fetchWithPayment: null,
      isReady: false,
      address: undefined,
    };
  }

  // Create account object for x402 - minimal interface
  const account = {
    address,
    signMessage: async ({ message }: { message: string | Uint8Array }) => {
      return await walletClient.signMessage({
        account: address,
        message: typeof message === "string" ? message : { raw: message },
      });
    },
  };

  // Wrap fetch with payment
  const fetchWithPayment = wrapFetchWithPayment(fetch, account as never);

  return {
    fetchWithPayment,
    isReady: true,
    address,
  };
}
