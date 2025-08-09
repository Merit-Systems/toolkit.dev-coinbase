import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { Navbar } from "../_components/navbar";

import { AppSidebar } from "./_components/sidebar";
import { InstallPromptProvider } from "@/app/(general)/_contexts/install-prompt-context";
import { OnrampProvider } from "./_contexts/onramp/context";
import { SessionProvider } from "next-auth/react";

export default async function GeneralLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <InstallPromptProvider>
        <OnrampProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex h-dvh flex-col">
              <Navbar />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </OnrampProvider>
      </InstallPromptProvider>
    </SessionProvider>
  );
}
