import { serverCookieUtils } from "@/lib/cookies/server";
import type { PersistedToolkit } from "@/lib/cookies/types";
import { fundRepo } from "@/server/funding/fund-repo";
import { getClientToolkit } from "@/toolkits/toolkits/client";
import { getServerToolkit } from "@/toolkits/toolkits/server";
import { type ServerToolkitNames, Toolkits } from "@/toolkits/toolkits/shared";
import { NextResponse, type NextRequest } from "next/server";

export const POST = async (
  req: NextRequest,
  {
    params: routeParams,
  }: { params: Promise<{ toolkit: string; tool: string }> },
) => {
  console.log("route");
  const { toolkit: untypedToolkit, tool } = await routeParams;
  const toolkit = untypedToolkit as Toolkits;

  const serverToolkit = getServerToolkit(toolkit);
  const clientToolkit = getClientToolkit(toolkit);

  console.log(clientToolkit, serverToolkit);

  if (!serverToolkit || !clientToolkit) {
    return new Response("Toolkit not found", { status: 404 });
  }

  const typedTool = tool as ServerToolkitNames[typeof toolkit];

  const fundRepoPromise = fundRepo(clientToolkit.tools[typedTool].price ?? 0);

  const serverPreferences = await serverCookieUtils.getPreferences();

  const params = serverPreferences.toolkits?.find(
    (persistedToolkit: PersistedToolkit) =>
      (persistedToolkit.id as Toolkits) === toolkit,
  )?.parameters;

  if (!params && toolkit !== Toolkits.Image && toolkit !== Toolkits.Video) {
    return new Response(
      "Misconfiguration: Toolkit not found in server preferences",
      { status: 400 },
    );
  }

  const args = clientToolkit.tools[typedTool].inputSchema.parse(
    await req.json(),
  );

  const serverTools = await serverToolkit.tools(params ? params : {});
  const serverTool = serverTools[typedTool];

  console.log(serverTool);

  if (!serverTool) {
    return new Response("Tool not found", { status: 404 });
  }

  const result = await serverTool.callback(args);

  await fundRepoPromise.catch((error) => {
    console.error(error);
  });

  return NextResponse.json(result, { status: 200 });
};
