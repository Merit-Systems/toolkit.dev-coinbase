import z from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  serverOnlyProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { SessionStatus } from "@prisma/client";
import { getOnrampTransactions } from "@/lib/cdp/onramp";
import { OnrampTransactionStatus } from "@/lib/cdp/types/onramp-transaction";

export const onrampSessionsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const onrampSession = await ctx.db.onrampSession.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!onrampSession) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (
        onrampSession.status === SessionStatus.succeeded ||
        onrampSession.status === SessionStatus.failed
      ) {
        return onrampSession;
      }

      const { transactions } = await getOnrampTransactions(ctx.session.user.id);

      const transaction = transactions[0];

      if (!transaction) {
        return onrampSession;
      }

      return await ctx.db.onrampSession.update({
        where: { id: onrampSession.id },
        data: {
          // @ts-expect-error - dont want to use the enum since this is imported from the client
          status: transactionStatusToDbStatus[transaction.status],
          txHash: transaction.tx_hash,
          failureReason:
            transaction.status === OnrampTransactionStatus.Failed
              ? transaction.failure_reason
              : null,
        },
      });
    }),

  create: serverOnlyProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        amount: z.number(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.onrampSession.create({
        data: {
          id: input.sessionToken,
          amount: input.amount,
          userId: input.userId,
          origin: env.NEXTAUTH_URL,
        },
      });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.onrampSession.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        date: "desc",
      },
    });
  }),
});

const transactionStatusToDbStatus = {
  [OnrampTransactionStatus.Success]: "succeeded",
  [OnrampTransactionStatus.Failed]: "failed",
  [OnrampTransactionStatus.InProgress]: "pending",
};
