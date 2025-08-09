"use client";

import { createContext, useContext, useState } from "react";
import { OnrampDialog } from "./dialog";

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
  const [open, setOpen] = useState(false);

  return (
    <OnrampContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <OnrampDialog open={open} setOpen={setOpen} />
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
