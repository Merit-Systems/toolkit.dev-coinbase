import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";
import { VStack } from "@/components/ui/stack";
import { EmbeddedWallet } from "../../auth/embedded-wallet";

interface AuthModalProps {
  children: React.ReactNode;
}

export const AuthModal = ({ children }: AuthModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false} className="gap-6 sm:max-w-sm">
        <DialogHeader className="items-center gap-2">
          <Logo className="size-16" />
          <VStack>
            <DialogTitle className="text-primary text-xl">
              Sign in to Toolkit
            </DialogTitle>
            <DialogDescription className="hidden">
              Sign in to your account to get started with Toolkit.
            </DialogDescription>
          </VStack>
        </DialogHeader>
        <EmbeddedWallet />
      </DialogContent>
    </Dialog>
  );
};
