import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { onramp } from "@/actions/onramp";
import { MoneyInput } from "@/components/ui/money-input";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const OnrampDialog: React.FC<Props> = ({ open, setOpen }) => {
  const [amount, setAmount] = useState<number>();

  const { mutate: addFunds, isPending: isAddingFunds } = useMutation({
    mutationFn: () => {
      if (!amount) {
        throw new Error("Amount is required");
      }

      return onramp({ amount });
    },
    onError: (error) => {
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });

  const { data: session } = useSession();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Add funds to your account to continue.
          </DialogDescription>
        </DialogHeader>
        <MoneyInput
          address={session?.user?.id}
          setAmount={setAmount}
          initialAmount={amount}
          placeholder="0.00"
        />
        <DialogFooter>
          <Button
            className="user-message w-full"
            onClick={() => addFunds()}
            disabled={!amount || isAddingFunds}
          >
            {isAddingFunds ? <Loader2 className="animate-spin" /> : "Add Funds"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
