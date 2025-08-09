import { CdpClient } from "@coinbase/cdp-sdk";
import { encodeFunctionData, type Abi } from "viem";
import {
  MERIT_ABI,
  MERIT_CONTRACT_ADDRESS,
  USDC_ADDRESS,
  GITHUB_REPO_ID,
  ERC20_CONTRACT_ABI,
} from "./on-chain";

export interface FundRepoResult {
  success: boolean;
  userOpHash: string;
  smartAccountAddress: string;
  amount: number;
  repoId: string;
  tokenAddress: string;
}

export async function fundRepo(amount: number): Promise<FundRepoResult> {
  if (!amount || typeof amount !== "number") {
    throw new Error("Invalid amount provided");
  }

  const repoId = GITHUB_REPO_ID;
  const tokenAddress = USDC_ADDRESS;
  const repoInstanceId = 0;
  const amountBigInt = BigInt(amount * 10 ** 6);

  // CDP wallets
  const cdp = new CdpClient();
  const owner = await cdp.evm.getOrCreateAccount({
    name: "toolkit-fund-owner",
  });
  const smartAccount = await cdp.evm.getOrCreateSmartAccount({
    name: "toolkit-fund-smart-account",
    owner,
  });

  // Send user operation to fund the repo
  const result = await cdp.evm.sendUserOperation({
    smartAccount,
    network: "base-sepolia",
    calls: [
        {
            to: tokenAddress,
            value: 0n,
            data: encodeFunctionData({
              abi: ERC20_CONTRACT_ABI as Abi,
              functionName: "approve",
              args: [MERIT_CONTRACT_ADDRESS, amountBigInt],
            }),
          },
      {
        to: MERIT_CONTRACT_ADDRESS,
        value: 0n,
        data: encodeFunctionData({
          abi: MERIT_ABI as Abi,
          functionName: "fundRepo",
          args: [
            BigInt(repoId),
            BigInt(repoInstanceId),
            tokenAddress,
            amountBigInt,
            "0x",
          ],
        }),
      },
    ],
  });

  // Wait for the user operation to be processed
  await cdp.evm.waitForUserOperation({
    smartAccountAddress: smartAccount.address,
    userOpHash: result.userOpHash,
  });

  return {
    success: true,
    userOpHash: result.userOpHash,
    smartAccountAddress: smartAccount.address,
    amount: amount,
    repoId: repoId,
    tokenAddress: tokenAddress,
  };
} 