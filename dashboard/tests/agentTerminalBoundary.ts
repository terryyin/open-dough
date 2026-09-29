// Shared by the specs that drive the terminal boundary without a page
// (./agent-terminal-boundary.spec.ts, ./agent-terminal-close.spec.ts, and
// ./agent-launch-done.spec.ts): a session launched through the real launch
// boundary, and a raw WebSocket to the terminal boundary for it, opened or
// refused, whose output and ending the synthetic `claude` reports.

import WebSocket from "ws";
import { agentTerminalEndpoint } from "../src/agentTerminal.ts";
import { launch, launchRequest } from "./agentLaunchBoundary.ts";
import { waitUntil, type DashboardServer } from "./support/dashboardServer.ts";
import { processRunning } from "./support/processGroup.ts";

export type LaunchedSession = {
  readonly sessionId: string;
  readonly shortId: string;
};

export async function launched(
  server: DashboardServer,
  source = "open-dough",
): Promise<LaunchedSession> {
  server.claudeScenario("launched");
  const response = await launch(server, { ...launchRequest, source });
  const answer = JSON.parse(response.body) as {
    record: { session: LaunchedSession };
  };
  return answer.record.session;
}

export function terminalUrl(
  server: DashboardServer,
  source: string,
  session: string | undefined,
): string {
  const query = new URLSearchParams({ source });
  if (session !== undefined) {
    query.set("session", session);
  }
  return `${server.baseURL.replace(/^http/, "ws")}${agentTerminalEndpoint}?${query.toString()}`;
}

export type Terminal = {
  readonly socket: WebSocket;
  output(): string;
  // The close code, once the socket closed.
  readonly closed: Promise<number>;
  send(message: unknown): void;
};

export async function openTerminal(
  server: DashboardServer,
  session: LaunchedSession,
  source = "open-dough",
): Promise<Terminal> {
  const socket = new WebSocket(terminalUrl(server, source, session.sessionId), {
    origin: server.origin,
  });
  let output = "";
  socket.on("message", (data: Buffer) => {
    output += data.toString("utf8");
  });
  const closed = new Promise<number>((resolve) => {
    socket.on("close", resolve);
  });
  await new Promise((resolve, reject) => {
    socket.once("open", resolve);
    socket.once("error", reject);
  });
  return {
    socket,
    output: () => output,
    closed,
    send(message) {
      socket.send(
        typeof message === "string" ? message : JSON.stringify(message),
      );
    },
  };
}

// The HTTP status a refused upgrade answers; fails if a socket opens.
export function refusedStatus(
  url: string,
  options: WebSocket.ClientOptions,
): Promise<number> {
  const socket = new WebSocket(url, options);
  return new Promise((resolve, reject) => {
    socket.on("unexpected-response", (req, res) => {
      resolve(res.statusCode ?? 0);
      req.destroy();
    });
    socket.on("open", () => {
      socket.close();
      reject(new Error("The terminal boundary opened a refused socket."));
    });
    socket.on("error", reject);
  });
}

export function shows(terminal: Terminal, text: string): Promise<boolean> {
  return waitUntil(() => terminal.output().includes(text), {
    timeoutMs: 5_000,
  });
}

// Waits for the newest attach process to end, and answers the signal that
// ended it.
export async function lastAttachEnded(
  server: DashboardServer,
): Promise<string | undefined> {
  await waitUntil(
    () => {
      const last = server.claudeAttaches().at(-1);
      return last?.endedBy !== undefined && !processRunning(last.pid);
    },
    { timeoutMs: 5_000 },
  );
  return server.claudeAttaches().at(-1)?.endedBy;
}
