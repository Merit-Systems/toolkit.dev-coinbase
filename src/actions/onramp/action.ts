import type { Address } from "viem";
import { createSessionToken } from "./lib";
import { type PaymentMethod, Experience } from "./types";
import { env } from "@/env";
import { redirect } from "next/navigation";

interface OnrampParams {
  address: Address;
  method: PaymentMethod;
  partnerUserId: string;
}

export async function onramp({ address, method, partnerUserId }: OnrampParams) {
  let sessionToken: string;

  try {
    const { token } = await createSessionToken(address);
    sessionToken = token;
  } catch (error) {
    console.error("Failed to create CDP session token:", error);
    throw error;
  }

  const url = new URL("https://pay.coinbase.com/buy/select-asset");

  const params: Record<string, string> = {
    appId: env.NEXT_PUBLIC_CDP_PROJECT_ID,
    sessionToken,
    defaultNetwork: "base",
    defaultAsset: "USDC",
    defaultExperience: Experience.Buy,
    fiatCurrency: "USD",
    presetCryptoAmount: "100",
    defaultPaymentMethod: method,
    partnerUserId,
    redirectUrl: `${env.NEXTAUTH_URL}?onramp_token=${sessionToken}`,
  };

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return redirect(url.toString());
}
