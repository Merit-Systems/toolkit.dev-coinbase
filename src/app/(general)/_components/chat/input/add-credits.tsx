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
import { BrainCircuit, Loader2Icon } from "lucide-react";
import { useState } from "react";
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
  } = api.accounts.getEchoBalance.useQuery();

  const { data: echoAccount } =
    api.accounts.getAccountByProvider.useQuery("echo");

  const {
    mutate: addCredits,
    isPending,
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={needsCredits ? "default" : "outline"}
          className={cn("rounded-xl", needsCredits ? "user-message" : "")}
        >
          <BrainCircuit className="h-4 w-4" />
          {needsCredits ? (
            "Add Credits"
          ) : isLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            `${formatCurrency(echoBalance ?? 0)} Credits`
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Credits</DialogTitle>
          <DialogDescription>
            Add credits to use for LLM access.
          </DialogDescription>
        </DialogHeader>
        <MoneyInput setAmount={setAmount} placeholder="0.00" />
        <DialogFooter>
          <Button
            disabled={isPending || !amount || isSuccess}
            onClick={() => addCredits()}
            className="w-full"
          >
            {isPending
              ? "Adding..."
              : isSuccess
                ? "Credits Added"
                : "Add Credits"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
