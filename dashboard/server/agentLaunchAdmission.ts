// Which requests the local launch boundary (`./agentLaunchPlugin.ts`)
// admits, and the refusal each other one gets: a launch, a read of one
// project's launch records, a done mark on a session it recorded
// (`./doneMarks.ts`), and a terminal upgrade (`./agentTerminals.ts`). Every
// request must come from this dashboard's own origin and name a catalog
// project; a done mark or an upgrade must name a session this dashboard
// recorded for that project, in its existing folder. Nothing here runs a host
// process except the listing an upgrade's admission reads.

import type { IncomingMessage } from "node:http";
import {
  agentLaunchRequestSchema,
  attachOpens,
  launchWorkflows,
  type AgentLaunchRequest,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import { agentDoneEndpoint, markDoneRequestSchema } from "../src/doneMark.ts";
import { sourceById, type PublishedSource } from "../src/publishedSource.ts";
import type { AgentLaunches, Recorded } from "./agentLaunches.ts";
import type { TerminalSession } from "./agentTerminals.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import type { ProjectFolder } from "./projectFolders.ts";

// Enough for the longest request the limits allow, in any UTF-8 spelling.
const bodyLimitBytes = 32 * 1024;

export type Admitted =
  | { readonly kind: "records"; readonly source: PublishedSource }
  | {
      readonly kind: "launch";
      readonly source: PublishedSource;
      readonly request: AgentLaunchRequest;
    }
  | {
      readonly kind: "done";
      readonly source: PublishedSource;
      readonly record: LaunchRecord;
      readonly folder: ProjectFolder;
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
        reject(new RefusedRequest(413, "The request is too large."));
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

async function jsonBody(req: IncomingMessage): Promise<unknown> {
  if (!/^application\/json\b/.test(req.headers["content-type"] ?? "")) {
    throw new RefusedRequest(415, "A request here is JSON.");
  }
  try {
    return JSON.parse(await readBody(req));
  } catch (error) {
    if (error instanceof RefusedRequest) {
      throw error;
    }
    throw new RefusedRequest(400, "The request is not JSON.");
  }
}

// A session this dashboard recorded for the project in its existing folder,
// or the refusal a request naming another gets.
async function recordedSession(
  launches: AgentLaunches,
  source: PublishedSource,
  sessionId: string,
): Promise<Extract<Recorded, { readonly kind: "recorded" }>> {
  const recorded = await launches.recorded(source, sessionId);
  switch (recorded.kind) {
    case "recorded":
      return recorded;
    case "unrecorded":
      throw new RefusedRequest(
        404,
        "This dashboard launched no such session for this project.",
      );
    case "folder-not-found":
      throw new RefusedRequest(
        404,
        `The project folder ${recorded.folder.shown} was not found on this machine.`,
      );
  }
}

async function doneRequest(
  req: IncomingMessage,
  launches: AgentLaunches,
): Promise<Admitted> {
  const parsed = markDoneRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, "The done request is malformed.");
  }
  const source = knownSource(parsed.data.source);
  const { record, folder } = await recordedSession(
    launches,
    source,
    parsed.data.session,
  );
  return { kind: "done", source, record, folder };
}

async function launchRequest(req: IncomingMessage): Promise<Admitted> {
  const parsed = agentLaunchRequestSchema.safeParse(await jsonBody(req));
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

export async function admitted(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
): Promise<Admitted> {
  verifyLocalOrigin(req);
  if (url.pathname === agentDoneEndpoint) {
    if (req.method !== "POST") {
      throw new RefusedRequest(405, "Only POST is accepted here.");
    }
    return doneRequest(req, launches);
  }
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

// The one session an upgrade may attach to, or the refusal it gets: one this
// dashboard recorded for the project, in its existing folder, that Claude
// Code does not report unlisted -- the rule the page's open action follows
// too. `claude` is run only for a recorded session in an existing folder,
// and then only to list sessions.
export async function admittedAttach(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
): Promise<TerminalSession> {
  verifyLocalOrigin(req);
  const source = knownSource(url.searchParams.get("source"));
  const { record, folder } = await recordedSession(
    launches,
    source,
    url.searchParams.get("session") ?? "",
  );
  const joined = await launches.stateOf(source, record);
  if (!attachOpens(joined.sessionState)) {
    throw new RefusedRequest(410, "Claude Code no longer lists this session.");
  }
  const { sessionId, shortId } = record.session;
  return {
    sourceId: source.id,
    sessionId,
    markedDone: record.doneAt !== undefined,
    shortId,
    folder,
  };
}
