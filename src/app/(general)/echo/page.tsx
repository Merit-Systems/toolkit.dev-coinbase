import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";

export default async function EchoPage() {
  const session = await auth();

  if (!session) {
    redirect(`/login?redirect=/echo`);
  }

  // Check if user has an Echo account connected
  const hasEchoAccount = await api.accounts.hasProviderAccount("echo");

  if (!hasEchoAccount) {
    // Redirect to auth flow for Echo
    redirect(`/api/auth/signin?callbackUrl=/echo`);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Echo Payments</h1>
        <p className="text-gray-600 mb-6">
          You are connected to Echo and can now send money.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Send Money</h2>
            <p className="text-sm text-gray-600">
              Use Echo&apos;s payment functionality to send money to other users.
            </p>
            {/* Add money sending form/functionality here */}
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Payment History</h2>
            <p className="text-sm text-gray-600">
              View your previous transactions and payment history.
            </p>
            {/* Add payment history here */}
          </div>
        </div>
      </div>
    </div>
  );
} 