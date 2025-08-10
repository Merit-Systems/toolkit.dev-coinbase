import { serverCookieUtils } from "@/lib/cookies/server";
import type { PersistedToolkit } from "@/lib/cookies/types";
import { fundRepo } from "@/server/funding/fund-repo";
import { getClientToolkit } from "@/toolkits/toolkits/client";
import { getServerToolkit } from "@/toolkits/toolkits/server";
import type { ServerToolkitNames, Toolkits } from "@/toolkits/toolkits/shared";
import { NextResponse, type NextRequest } from "next/server";

export const POST = async (
  req: NextRequest,
  {
    params: routeParams,
  }: { params: Promise<{ toolkit: Toolkits; tool: string }> },
) => {
  const { toolkit, tool } = await routeParams;

  const serverToolkit = getServerToolkit(toolkit);
  const clientToolkit = getClientToolkit(toolkit);

  if (!serverToolkit || !clientToolkit) {
    return new Response("Toolkit not found", { status: 404 });
  }

  const serverPreferences = await serverCookieUtils.getPreferences();

  const params = serverPreferences.toolkits?.find(
    (persistedToolkit: PersistedToolkit) =>
      (persistedToolkit.id as Toolkits) === toolkit,
  )?.parameters;

  if (!params) {
    return new Response(
      "Misconfiguration: Toolkit not found in server preferences",
      { status: 400 },
    );
  }

  const typedTool = tool as ServerToolkitNames[typeof toolkit];

  const args = clientToolkit.tools[typedTool].inputSchema.parse(
    await req.json(),
  );

  const serverTools = await serverToolkit.tools(params);
  const serverTool = serverTools[typedTool];

  if (!serverTool) {
    return new Response("Tool not found", { status: 404 });
  }

  const result = await serverTool.callback(args);

  console.log(clientToolkit.tools[typedTool]);

  if (clientToolkit.tools[typedTool].price) {
    void fundRepo(clientToolkit.tools[typedTool].price);
  }

  return NextResponse.json(result, { status: 200 });
};
