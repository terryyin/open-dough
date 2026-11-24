import { renameSync } from "node:fs";
import path from "node:path";
import WebSocket from "ws";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { claudeSessionName } from "../server/hosts/claude/launch.ts";
import { productionSeedProjects } from "../server/projectConfigurationSeed.ts";
import { agentTerminalEndpoint } from "../src/agentTerminal.ts";
import { launchRequest } from "./agentLaunchBoundary.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { keepMoreLaunchRecordsBesideServer } from "./support/launchStore.ts";
import { waitUntil } from "./support/waitUntil.ts";
import { processRunning } from "./support/processGroup.ts";

export type RecordedSession = {
  readonly sessionId: string;
  readonly shortId: string;
};

let sessionSerial = 0;

export async function composeSession(
  server: DashboardServer,
  source = "open-dough",
  work: Partial<
    Pick<typeof launchRequest, "identity" | "title" | "workflow" | "model">
  > & { startedAt?: number } = {},
): Promise<RecordedSession> {
  const project = productionSeedProjects.find(({ id }) => id === source);
  if (project === undefined) throw new Error(`Unknown project ${source}`);
  const {
    startedAt = Date.now(),
    identity = `${launchRequest.identity}#${++sessionSerial}`,
    title = launchRequest.title,
    workflow = launchRequest.workflow,
  } = work;
  const story = { source, identity, title };
  const name = claudeSessionName(project, {
    ...story,
    workflow,
    host: "claude",
  });
  const sessionId = server.claudeListsSession({
    name,
    cwd: path.join(server.home, "git", source),
    startedAt,
  });
  const record = makeMe.aLaunchRecord
    .ofWorkflow(workflow, story)
    .inClaudeSession({ sessionId, name })
    .launchedAt(new Date(startedAt).toISOString());
  if (work.model !== undefined) record.requestingModel(work.model);
  await keepMoreLaunchRecordsBesideServer(server, [record.please()], source);
  return { sessionId, shortId: sessionId.slice(0, 8) };
}

// Answers `request` while the project's execution checkout on the dashboard's machine is
// missing, and puts the folder back afterwards.
export async function withoutProjectFolder<T>(
  server: DashboardServer,
  source: string,
  request: () => Promise<T>,
): Promise<T> {
  const folder = path.join(server.home, "git", source);
  const moved = `${folder}.moved`;
  renameSync(folder, moved);
  try {
    return await request();
  } finally {
    renameSync(moved, folder);
  }
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
  session: RecordedSession,
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
