"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import { OnrampDialog } from "./onramp-dialog";
import { OnrampSessionDialog } from "./session-dialog";

interface OnrampContextType {
  open: () => void;
}

export const OnrampContext = createContext<OnrampContextType>({
  open: () => {
    void 0;
  },
});

interface Props {
  children: React.ReactNode;
}

export const OnrampProvider: React.FC<Props> = ({ children }) => {
  const [isOnrampDialogOpen, setIsOnrampDialogOpen] = useState(false);

  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("onramp_token")) {
      setSessionToken(searchParams.get("onramp_token") ?? null);
      setIsSessionDialogOpen(true);
    }
  }, [searchParams]);

  return (
    <OnrampContext.Provider value={{ open: () => setIsOnrampDialogOpen(true) }}>
      {children}
      <OnrampDialog open={isOnrampDialogOpen} setOpen={setIsOnrampDialogOpen} />
      <OnrampSessionDialog
        sessionToken={sessionToken ?? ""}
        isOpen={isSessionDialogOpen}
        onOpenChange={setIsSessionDialogOpen}
        setSessionToken={setSessionToken}
      />
    </OnrampContext.Provider>
  );
};

export const useOnramp = () => {
  const context = useContext(OnrampContext);

  if (!context) {
    throw new Error("useOnramp must be used within an OnrampProvider");
  }

  return context;
};
