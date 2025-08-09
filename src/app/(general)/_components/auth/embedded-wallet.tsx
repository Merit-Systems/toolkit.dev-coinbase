"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSignMessage } from "wagmi";
import {
  useSignInWithEmail,
  useVerifyEmailOTP,
  useCurrentUser,
} from "@coinbase/cdp-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, X } from "lucide-react";
import { signInWithEthereum } from "@/server/auth/providers/siwe/sign-in";
import { getCsrfToken } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { z } from "zod";

export const EmbeddedWallet = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const { signInWithEmail } = useSignInWithEmail();
  const { verifyEmailOTP } = useVerifyEmailOTP();
  const { currentUser } = useCurrentUser();
  const { signMessageAsync } = useSignMessage();

  // Mutation for sending OTP
  const {
    mutate: signIn,
    isPending: isSigningIn,
    error: signInError,
    data: signInData,
    reset: resetSignIn,
  } = useMutation({
    mutationFn: async (email: string) => {
      return signInWithEmail({ email });
    },
    onSuccess: (_, email) => {
      toast.success(`A One-Time Password has been sent to ${email}`);
    },
    onError: () => {
      toast.error("Sign in failed");
    },
  });

  const flowId = signInData?.flowId;

  // Mutation for verifying OTP
  const {
    mutate: verifyOTP,
    isPending: isVerifyingOTP,
    error: verifyOTPError,
    isSuccess: verifyOTPSuccess,
    reset: resetVerifyOTP,
  } = useMutation({
    mutationFn: async ({ flowId, otp }: { flowId: string; otp: string }) => {
      const result = await verifyEmailOTP({
        flowId,
        otp,
      });
      if (!result.user.evmAccounts?.[0]) {
        toast.error("No EVM address found");
        return;
      }
      await signInWithEthereum({
        address: result.user.evmAccounts[0],
        csrfToken: getCsrfToken,
        chainId: 8453,
        signMessage: async (message) => {
          const signature = await signMessageAsync({ message });
          return signature;
        },
        email: result.user.authenticationMethods.email?.email ?? "",
      });
    },
    onSuccess: () => {
      toast.success("Signed in successfully");
    },
    onError: () => {
      toast.error("OTP verification failed");
    },
  });

  const handleSignIn = async () => {
    if (!email) {
      return;
    }
    signIn(email);
  };

  const handleVerifyOTP = async () => {
    if (!otp || !flowId) {
      return;
    }

    verifyOTP({ flowId, otp });
  };

  const handleReset = () => {
    setEmail("");
    setOtp("");
    resetSignIn();
    resetVerifyOTP();
  };

  if (currentUser) {
    if (isVerifyingOTP) {
      return <Loader2 className="mx-auto size-8 animate-spin" />;
    } else if (verifyOTPSuccess) {
      return <Check className="mx-auto size-8 text-green-500" />;
    } else {
      return (
        <div className="mx-auto flex flex-col items-center gap-2">
          <X className="mx-auto size-8 text-red-500" />
          <p className="text-muted-foreground text-sm">
            Something went wrong: {verifyOTPError?.message}
          </p>
        </div>
      );
    }
  }

  if (flowId) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">OTP Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isVerifyingOTP}
            maxLength={6}
          />
          <p className="text-muted-foreground text-xs">
            Check your email for the OTP code
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleVerifyOTP}
            disabled={isVerifyingOTP}
            className="flex-1"
          >
            {isVerifyingOTP ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isVerifyingOTP}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="richard@piedpiper.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSigningIn}
          className={cn(
            "h-fit py-4 md:text-base",
            signInError && "border-destructive",
          )}
        />
        {signInError && (
          <p className="text-sm text-red-500">{signInError.message}</p>
        )}
      </div>
      <Button
        onClick={handleSignIn}
        disabled={isSigningIn || !z.string().email().safeParse(email).success}
        className="user-message h-12 w-full"
      >
        {isSigningIn ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending OTP...
          </>
        ) : (
          "Send OTP"
        )}
      </Button>
    </div>
  );
};
