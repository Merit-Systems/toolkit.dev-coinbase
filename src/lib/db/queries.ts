import { db } from "@/server/db";

export async function getAccountByUserId({ userId }: { userId: string }) {
  return db.account.findFirst({
    where: {
      userId: userId,
      provider: "echo",
    },
  });
}

export async function updateTokensByUserId(
  userId: string,
  tokens: {
    access_token: string;
    expires_at: number;
    refresh_token: string;
  },
) {
  return db.account.updateMany({
    where: {
      userId: userId,
      provider: "echo",
    },
    data: {
      access_token: tokens.access_token,
      expires_at: tokens.expires_at,
      refresh_token: tokens.refresh_token,
    },
  });
}
