"use client";

import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { useMutation } from "@tanstack/react-query";

import { useAccount, useSignMessage } from "wagmi";
import {
  useSignInWithEmail,
  useVerifyEmailOTP,
  useCurrentUser,
} from "@coinbase/cdp-hooks";

import { z } from "zod";

import { toast } from "sonner";

import { getCsrfToken } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { signInWithEthereum } from "@/server/auth/providers/siwe/sign-in";

import { cn } from "@/lib/utils";

export const EmbeddedWallet = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const { signInWithEmail } = useSignInWithEmail();
  const { verifyEmailOTP } = useVerifyEmailOTP();
  const account = useAccount();
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
    mutateAsync: verifyOTP,
    isPending: isVerifyingOTP,
    error: verifyOTPError,
    isSuccess: verifyOTPSuccess,
    reset: resetVerifyOTP,
  } = useMutation({
    mutationFn: async ({ flowId, otp }: { flowId: string; otp: string }) => {
      return verifyEmailOTP({
        flowId,
        otp,
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

    await verifyOTP({ flowId, otp });
  };

  useEffect(() => {
    if (account.address && currentUser) {
      void signInWithEthereum({
        address: account.address,
        csrfToken: getCsrfToken,
        chainId: 8453,
        signMessage: async (message) => {
          const signature = await signMessageAsync({ message });
          return signature;
        },
        email: currentUser?.authenticationMethods.email?.email ?? "",
      });
    }
  }, [account.address, currentUser, signMessageAsync]);

  const handleReset = () => {
    setEmail("");
    setOtp("");
    resetSignIn();
    resetVerifyOTP();
  };

  if (flowId) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">OTP Code</Label>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            containerClassName="w-full"
          >
            <InputOTPGroup {...otpGroupProps(verifyOTPSuccess)}>
              <InputOTPSlot index={0} {...otpSlotProps(verifyOTPSuccess)} />
              <InputOTPSlot index={1} {...otpSlotProps(verifyOTPSuccess)} />
              <InputOTPSlot index={2} {...otpSlotProps(verifyOTPSuccess)} />
            </InputOTPGroup>
            <InputOTPSeparator
              className={cn(verifyOTPSuccess && "text-green-600")}
            />
            <InputOTPGroup {...otpGroupProps(verifyOTPSuccess)}>
              <InputOTPSlot index={3} {...otpSlotProps(verifyOTPSuccess)} />
              <InputOTPSlot index={4} {...otpSlotProps(verifyOTPSuccess)} />
              <InputOTPSlot index={5} {...otpSlotProps(verifyOTPSuccess)} />
            </InputOTPGroup>
          </InputOTP>
          {verifyOTPError ? (
            <p className="text-muted-foreground text-xs">
              {verifyOTPError.message}
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              Check your email for the OTP code
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleVerifyOTP}
            disabled={isVerifyingOTP || verifyOTPSuccess || otp.length !== 6}
            className="user-message h-12"
          >
            {isVerifyingOTP ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Verifying...
              </>
            ) : verifyOTPSuccess ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="ghost"
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

const otpGroupProps = (isSuccess: boolean) => {
  return {
    className: cn(
      "flex-1 rounded-md",
      isSuccess && "shadow-[0_0_8px_var(--color-green-600)]",
    ),
  };
};

const otpSlotProps = (isSuccess: boolean) => {
  return {
    className: cn("h-12 flex-1 text-xl", isSuccess && "border-green-600"),
  };
};
