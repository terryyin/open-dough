// Shared by the specs that drive the terminal boundary without a page
// (./agent-terminal-boundary.spec.ts, ./agent-terminal-close.spec.ts,
// ./agent-terminal-reopen.spec.ts, and ./agent-launch-done.spec.ts): a
// session launched through the real launch boundary, in any project and for
// any story and workflow (as ./session-sidebar.spec.ts launches outside the
// shown project), and a raw WebSocket to
// the terminal boundary for it, opened or refused, whose output and ending the
// synthetic `claude` reports.

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
  work: Partial<
    Pick<typeof launchRequest, "identity" | "title" | "workflow">
  > = {},
): Promise<LaunchedSession> {
  server.claudeScenario("launched");
  const response = await launch(server, { ...launchRequest, source, ...work });
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

// The real HTTP response to a refused upgrade; fails if a socket opens.
export function refusedResponse(
  url: string,
  options: WebSocket.ClientOptions,
): Promise<{ readonly status: number; readonly body: string }> {
  const socket = new WebSocket(url, options);
  return new Promise((resolve, reject) => {
    socket.on("unexpected-response", (req, res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk: string) => {
        body += chunk;
      });
      res.on("error", reject);
      res.on("aborted", () => {
        reject(new Error("The refusal body was cut short."));
      });
      res.on("end", () => {
        resolve({ status: res.statusCode ?? 0, body });
        req.destroy();
      });
    });
    socket.on("open", () => {
      socket.close();
      reject(new Error("The terminal boundary opened a refused socket."));
    });
    socket.on("error", reject);
  });
}

// Status-only callers also consume the complete HTTP response; no body format
// is required for their origin, record or workspace refusal assertions.
export async function refusedStatus(
  url: string,
  options: WebSocket.ClientOptions,
): Promise<number> {
  return (await refusedResponse(url, options)).status;
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
