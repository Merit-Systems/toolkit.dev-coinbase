"use client";

import { useAccount, useSignMessage } from "wagmi";
import { wrapFetchWithPayment } from "x402-fetch";

export function useX402() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  if (!isConnected || !address) {
    return {
      fetchWithPayment: null,
      isReady: false,
      address: undefined,
    };
  }

  // Create account object for x402
  const account = {
    address,
    signMessage: async ({ message }: { message: string | Uint8Array }) => {
      return await signMessageAsync({
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
