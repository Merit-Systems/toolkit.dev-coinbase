"use client";

import { CDPHooksProvider as CDPHooksProviderBase } from "@coinbase/cdp-hooks";
import { createCDPEmbeddedWalletConnector } from "@coinbase/cdp-wagmi";
import { createConfig, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { http } from "wagmi";

import { env } from "@/env";

interface Props {
  children: React.ReactNode;
}

const cdpConfig = {
  projectId: env.NEXT_PUBLIC_CDP_PROJECT_ID,
};

const connector = createCDPEmbeddedWalletConnector({
  cdpConfig,
  providerConfig: {
    chains: [base],
    transports: {
      [base.id]: http(),
    },
  },
});

const wagmiConfig = createConfig({
  connectors: [connector],
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

export const CDPHooksProvider = ({ children }: Props) => {
  return (
    <CDPHooksProviderBase
      config={{
        projectId: env.NEXT_PUBLIC_CDP_PROJECT_ID,
      }}
    >
      <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
    </CDPHooksProviderBase>
  );
};
