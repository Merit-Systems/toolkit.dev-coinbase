import { onramp } from "@/actions/onramp";
import { useBalance } from "@/app/(general)/_hooks/use-balance";
import { useX402Fetch } from "@/app/(general)/_hooks/use-x402-fetch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { cn, formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { BrainCircuit, Check, Loader2Icon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
  needsCredits: boolean;
}

export const AddCreditsButton: React.FC<Props> = ({ needsCredits }) => {
  const [amount, setAmount] = useState<number>();
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: echoBalance,
    isLoading,
    refetch,
  } = api.accounts.getEchoBalance.useQuery(undefined, {
    refetchInterval: 2000,
  });

  const { data: balance, isLoading: isBalanceLoading } = useBalance();

  const { data: echoAccount, isLoading: isEchoAccountLoading } =
    api.accounts.getAccountByProvider.useQuery("echo");

  const {
    mutate: addCredits,
    isPending: isAddCreditsPending,
    isSuccess,
  } = useX402Fetch(
    `https://staging-echo.merit.systems/api/v1/base/payment-link?amount=${amount}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${echoAccount?.access_token}`,
      },
    },
    {
      onSuccess: () => {
        toast.success("Credits added successfully");
        setIsOpen(false);
        void refetch();
      },
      onError: () => {
        toast.error("Failed to add credits");
      },
    },
  );

  const {
    mutate: onrampMutate,
    isPending: isOnrampPending,
    isSuccess: isOnrampSuccess,
  } = useMutation({
    mutationFn: onramp,
    onError: () => {
      toast.error("Failed to build checkout link");
    },
  });

  const shouldConnectEcho = useMemo(() => {
    return !echoAccount;
  }, [echoAccount]);

  const shouldOnramp = useMemo(() => {
    return balance !== undefined && balance < 1;
  }, [balance]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn("user-message rounded-xl")}
          disabled={isLoading || isBalanceLoading}
        >
          <BrainCircuit className="h-4 w-4" />
          {isLoading || isBalanceLoading || isEchoAccountLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : needsCredits ? (
            "Add Credits"
          ) : (
            `${formatCurrency(echoBalance ?? 0)} Credits`
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {shouldConnectEcho
              ? "Connect to Echo"
              : `Add ${shouldOnramp ? "Funds" : "Credits"}`}
          </DialogTitle>
          <DialogDescription>
            {shouldConnectEcho
              ? "Echo is your global account for LLM access."
              : shouldOnramp
                ? "Add funds to your account to use the LLM."
                : "Add credits to use for LLM access."}
          </DialogDescription>
        </DialogHeader>
        {shouldConnectEcho ? (
          <Button
            className="user-message"
            size="lg"
            onClick={() => {
              void signIn("echo");
            }}
          >
            Connect to Echo
          </Button>
        ) : (
          <>
            <MoneyInput setAmount={setAmount} placeholder="0.00" />
            <DialogFooter>
              <Button
                disabled={
                  isAddCreditsPending ||
                  !amount ||
                  isSuccess ||
                  isOnrampPending ||
                  isOnrampSuccess
                }
                onClick={() => {
                  if (!amount) {
                    return;
                  }

                  if (shouldOnramp) {
                    void onrampMutate({
                      amount,
                    });
                    return;
                  } else {
                    addCredits();
                  }
                }}
                className="w-full"
              >
                {shouldOnramp ? (
                  isOnrampPending ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : isOnrampSuccess ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    "Checkout"
                  )
                ) : isAddCreditsPending ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : isSuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  "Add Credits"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
