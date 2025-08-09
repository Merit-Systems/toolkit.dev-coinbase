"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";

import { signOut } from "next-auth/react";
import { useSignOut } from "@coinbase/cdp-hooks";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Session } from "next-auth";

interface Props {
  session: Session;
}

export const Authenticated: React.FC<Props> = ({ session }) => {
  const { signOut: signOutWallet } = useSignOut();

  const handleSignOut = async () => {
    await signOutWallet();
    await signOut();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex size-8 items-center justify-center overflow-hidden p-0"
          size="icon"
        >
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? ""}
              className="size-full"
            />
          ) : (
            <User className="size-8" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/account">
            <User />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
