// Records the launch and attach requests a Frontend page sends, for journeys
// whose promise includes that the page launches or attaches no agent
// (../../frontend-tests/navigation/story-url-destination.spec.ts).

import type { Page } from "@playwright/test";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import { agentTerminalEndpoint } from "../../src/agentTerminal.ts";

// Every launch or attach request the page sends from now on: a non-GET
// agent-launch request, or any request or WebSocket to the agent terminal.
export function recordHostRequests(page: Page) {
  const requests: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (
      (request.method() !== "GET" &&
        pathname.startsWith(agentLaunchEndpoint)) ||
      pathname.startsWith(agentTerminalEndpoint)
    )
      requests.push(`${request.method()} ${pathname}`);
  });
  page.on("websocket", (socket) => {
    if (new URL(socket.url()).pathname.startsWith(agentTerminalEndpoint))
      requests.push(`WS ${socket.url()}`);
  });
  return () => requests;
}
