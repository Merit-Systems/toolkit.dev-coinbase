"use client";

import { createContext, Suspense, useContext, useState } from "react";

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

  return (
    <OnrampContext.Provider value={{ open: () => setIsOnrampDialogOpen(true) }}>
      {children}
      <OnrampDialog open={isOnrampDialogOpen} setOpen={setIsOnrampDialogOpen} />
      <Suspense fallback={null}>
        <OnrampSessionDialog />
      </Suspense>
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
