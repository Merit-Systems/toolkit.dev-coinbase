import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { useWalletClient } from "wagmi";
import { wrapFetchWithPayment } from "x402-fetch";
import { useBalance } from "./use-balance";
import { useEvmAddress } from "@coinbase/cdp-hooks";

export const useX402Fetch = (
  url: string,
  init?: RequestInit,
  options?: Omit<UseMutationOptions, "mutationFn">,
) => {
  const { evmAddress } = useEvmAddress();

  const { refetch: refetchBalance } = useBalance(evmAddress ?? undefined);

  const { data: walletClient } = useWalletClient({
    chainId: 8453,
  });
  const fetchWithPayment = wrapFetchWithPayment(
    fetch,
    walletClient as unknown as Parameters<typeof wrapFetchWithPayment>[1],
  );
  return useMutation({
    mutationFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return fetchWithPayment(url, init).then(async (response) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        response.json(),
      );
    },
    onSuccess: (data, variables, context) => {
      void refetchBalance();
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
