import { paymentMiddleware, type RoutesConfig } from "x402-next";
import { clientToolkits } from "./toolkits/toolkits/client";
import { facilitator } from "@coinbase/x402";
import { convertInputSchemaToHTTPRequest } from "./lib/http-schema";


const tools = Object.entries(clientToolkits)
  .flatMap(([toolkitId, toolkit]) =>
    Object.entries(toolkit.tools)
      .filter(([_toolId, tool]) => tool.price && tool.price > 0)
      .map(([toolId, tool]) => [toolkitId, toolId, tool] as const)
  );

export const middleware = paymentMiddleware(
  "0x0cC2CDC0EB992860d6c2a216b1DC0895fD2DF82F",
  tools.reduce((acc, [toolkitId, toolId, tool]) => {
    acc[`/api/tool/${toolkitId}/${toolId}`] = {
      price: tool.price!,
      network: "base",
      config: {
        description: tool.description,
        inputSchema: convertInputSchemaToHTTPRequest(tool.inputSchema),
        outputSchema: tool.outputSchema,
      }
    };
    return acc;
  }, {} as RoutesConfig),
  facilitator,
);

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/tool/:path*"],
  runtime: "nodejs",
};
