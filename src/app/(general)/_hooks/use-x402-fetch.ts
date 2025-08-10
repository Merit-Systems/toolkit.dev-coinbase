import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useWalletClient } from "wagmi";
import { wrapFetchWithPayment } from "x402-fetch";
import { useBalance } from "./use-balance";

export const useX402Fetch = (
  url: string,
  init?: RequestInit,
  options?: Omit<UseMutationOptions, "mutationFn">,
) => {
  const queryClient = useQueryClient();

  const { queryKey } = useBalance();

  const { data: walletClient } = useWalletClient({
    chainId: 8453,
  });
  const fetchWithPayment = wrapFetchWithPayment(
    fetch,
    walletClient as unknown as Parameters<typeof wrapFetchWithPayment>[1],
    1000000000000000000n,
  );
  return useMutation({
    mutationFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return fetchWithPayment(url, init).then(async (response) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        response.json(),
      );
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey });
      options?.onSuccess?.(data, variables, context);
    },
  });
};
