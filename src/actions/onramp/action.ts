"use server";

import { redirect } from "next/navigation";

import { auth } from "@/server/auth";

import { createSessionToken } from "./lib";
import { Experience, PaymentMethod } from "./types";

import { env } from "@/env";

interface OnrampParams {
  amount: number;
}

export async function onramp({ amount }: OnrampParams) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const { user } = session;

  let sessionToken: string;

  try {
    const { token } = await createSessionToken(user.id);
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
    presetCryptoAmount: amount.toString(),
    defaultPaymentMethod: PaymentMethod.Card,
    partnerUserId: user.id,
    redirectUrl: `${env.NEXTAUTH_URL}?onramp_token=${sessionToken}`,
  };

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return redirect(url.toString());
}
