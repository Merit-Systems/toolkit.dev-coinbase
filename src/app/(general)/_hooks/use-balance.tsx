import { USDC_ADDRESS } from "@/lib/utils";
import { useBalance as useBalanceWagmi } from "wagmi";
import { base } from "viem/chains";
import type { Address } from "viem";

export const useBalance = (address?: string) => {
  const result = useBalanceWagmi({
    address: address ? (address as Address) : undefined,
    token: USDC_ADDRESS,
    chainId: base.id,
  });

  return {
    ...result,
    data: result.data
      ? Number(result.data.value) / 10 ** result.data.decimals
      : undefined,
  };
};
