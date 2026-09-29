// The local launch boundary, mounted by Vite in dev and preview
// (`./localBoundaryPlugin.ts`) beside the authenticated read boundary. A same-origin
// POST to `/__agent-launch` asks to launch an agent on one work item
// (`./agentLaunches.ts`); a GET `?source=` answers that project's launch
// records with each session's current state. A same-origin WebSocket upgrade
// to `/__agent-terminal?source=&session=` attaches to one session this
// boundary recorded for that project (`./agentTerminals.ts`). Everything else
// -- another site, an unknown project, a workflow or host this boundary does
// not launch, malformed text, another method, a session it did not record --
// is refused before any host process starts, and a session Claude Code no
// longer lists is refused before any `claude attach`.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, HttpServer, Plugin } from "vite";
import {
  agentLaunchEndpoint,
  agentLaunchRequestSchema,
  launchWorkflows,
  type AgentLaunchRequest,
  type LaunchResult,
  type LaunchWithState,
} from "../src/agentLaunch.ts";
import { sourceById, type PublishedSource } from "../src/publishedSource.ts";
import { AgentLaunches } from "./agentLaunches.ts";
import { AgentTerminals, type TerminalSession } from "./agentTerminals.ts";
import { localBoundaryPlugin } from "./localBoundaryPlugin.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";

// Enough for the longest request the limits allow, in any UTF-8 spelling.
const bodyLimitBytes = 32 * 1024;

type Admitted =
  | { readonly kind: "records"; readonly source: PublishedSource }
  | {
      readonly kind: "launch";
      readonly source: PublishedSource;
      readonly request: AgentLaunchRequest;
    };

function knownSource(id: string | null): PublishedSource {
  const source = id === null ? undefined : sourceById(id);
  if (source === undefined) {
    throw new RefusedRequest(404, "Unknown catalog source.");
  }
  return source;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > bodyLimitBytes) {
        req.destroy();
        reject(new RefusedRequest(413, "The launch request is too large."));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

async function launchRequest(req: IncomingMessage): Promise<Admitted> {
  if (!/^application\/json\b/.test(req.headers["content-type"] ?? "")) {
    throw new RefusedRequest(415, "A launch request is JSON.");
  }
  let body: unknown;
  try {
    body = JSON.parse(await readBody(req));
  } catch (error) {
    if (error instanceof RefusedRequest) {
      throw error;
    }
    throw new RefusedRequest(400, "The launch request is not JSON.");
  }
  const parsed = agentLaunchRequestSchema.safeParse(body);
  if (!parsed.success) {
    throw new RefusedRequest(400, "The launch request is malformed.");
  }
  const request = parsed.data;
  const source = knownSource(request.source);
  // The request schema admits only the workflows in `launchWorkflows`.
  if (request.host !== "claude") {
    throw new RefusedRequest(
      400,
      `${launchWorkflows[request.workflow].name} can be launched only in Claude Code.`,
    );
  }
  return { kind: "launch", source, request };
}

async function admitted(req: IncomingMessage, url: URL): Promise<Admitted> {
  verifyLocalOrigin(req);
  if (req.method === "GET") {
    return {
      kind: "records",
      source: knownSource(url.searchParams.get("source")),
    };
  }
  if (req.method === "POST") {
    return launchRequest(req);
  }
  throw new RefusedRequest(405, "Only GET and POST are accepted here.");
}

type Answer =
  | { readonly status: number; readonly body: LaunchResult }
  | {
      readonly status: number;
      readonly body: { records: readonly LaunchWithState[] };
    }
  | { readonly status: number; readonly body: { error: string } };

async function answer(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
): Promise<Answer> {
  let request: Admitted;
  try {
    request = await admitted(req, url);
  } catch (error) {
    if (error instanceof RefusedRequest) {
      return { status: error.status, body: { error: error.message } };
    }
    throw error;
  }
  if (request.kind === "records") {
    return {
      status: 200,
      body: { records: await launches.recordsOf(request.source) },
    };
  }
  return {
    status: 200,
    body: await launches.launch(request.source, request.request),
  };
}

function respond(res: ServerResponse, { status, body }: Answer): void {
  if (res.writableEnded || res.destroyed) {
    return;
  }
  res.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(body));
}

// The one session an upgrade may attach to, or the refusal it gets.
async function admittedAttach(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
): Promise<TerminalSession> {
  verifyLocalOrigin(req);
  const source = knownSource(url.searchParams.get("source"));
  const attachable = await launches.attachable(
    source,
    url.searchParams.get("session") ?? "",
  );
  switch (attachable.kind) {
    case "attachable":
      return attachable;
    case "unrecorded":
      throw new RefusedRequest(
        404,
        "This dashboard launched no such session for this project.",
      );
    case "folder-not-found":
      throw new RefusedRequest(
        404,
        `The project folder ${attachable.folder.shown} was not found on this machine.`,
      );
    case "unlisted":
      throw new RefusedRequest(
        410,
        "Claude Code no longer lists this session.",
      );
  }
}

function installAgentLaunchMiddleware(
  middlewares: Connect.Server,
  httpServer: HttpServer | null,
): () => void {
  const launches = new AgentLaunches();
  const terminals = new AgentTerminals(httpServer, (req, url) =>
    admittedAttach(req, url, launches),
  );
  middlewares.use((req, res, next) => {
    const url = new URL(req.url ?? "", "http://placeholder");
    if (url.pathname !== agentLaunchEndpoint) {
      next();
      return;
    }
    void answer(req, url, launches).then((outcome) => {
      respond(res, outcome);
    }, next);
  });
  return () => {
    terminals.close();
    launches.close();
  };
}

export function agentLaunchPlugin(): Plugin {
  return localBoundaryPlugin(
    "dough-agent-launch",
    installAgentLaunchMiddleware,
  );
}
