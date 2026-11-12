// The terminal sockets a page asks for, each when it asks. A journey that
// promises no terminal was requested reads the list after the event that
// would have followed the request.
import type { Page, WebSocket } from "@playwright/test";
import { agentTerminalEndpoint } from "../../src/agentTerminal.ts";

export const isTerminalSocket = (socket: WebSocket) =>
  new URL(socket.url()).pathname === agentTerminalEndpoint;

// Every terminal socket `page` asks for from now on.
export function watchTerminalSockets(page: Page): readonly WebSocket[] {
  const sockets: WebSocket[] = [];
  page.on("websocket", (socket) => {
    if (isTerminalSocket(socket)) sockets.push(socket);
  });
  return sockets;
}
