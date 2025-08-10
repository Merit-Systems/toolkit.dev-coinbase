import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const accountsRouter = createTRPCRouter({
  getAccounts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const items = await ctx.db.account.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });

      const nextCursor =
        items.length > limit ? items[items.length - 1]?.id : undefined;
      const accounts = items.slice(0, limit);

      return {
        items: accounts,
        hasMore: items.length > limit,
        nextCursor,
      };
    }),

  getAccount: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.account.findFirst({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
      });
    }),

  getAccountByProvider: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.account.findFirst({
        where: {
          userId: ctx.session.user.id,
          provider: input,
        },
      });
    }),

  hasProviderAccount: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.account.findFirst({
        where: { userId: ctx.session.user.id, provider: input },
      });

      return !!account;
    }),

  deleteAccount: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.account.delete({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
      });
    }),

  getEchoBalance: protectedProcedure.query(async ({ ctx }) => {
    const echoAccount = await ctx.db.account.findFirst({
      where: {
        userId: ctx.session.user.id,
        provider: "echo",
      },
    });

    if (!echoAccount) return 0;

    const { balance } = await fetch(
      `https://staging-echo.merit.systems/api/v1/balance`,
      {
        headers: {
          Authorization: `Bearer ${echoAccount.access_token}`,
        },
      },
    ).then((res) => res.json() as Promise<{ balance: number }>);

    return balance;
  }),
});
