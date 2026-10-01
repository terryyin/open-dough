import { sessionResultEndpoint } from "../src/sessionResult.ts";
// Which requests the local launch boundary (`./agentLaunchPlugin.ts`) admits,
// and the refusal each other one gets: a launch, a read of the machine's
// sessions, a done mark on a session it recorded (`./doneMarks.ts`), a delete
// of a record it kept, and a terminal upgrade (`./agentTerminals.ts`). Every
// request must come from this dashboard's own origin; a launch, a done mark, a
// delete, or an upgrade must name a catalog project, and a done mark, a delete,
// or an upgrade a session this dashboard recorded for that project, in its
// existing folder. A launch's selected options are checked against the
// project's installed definition and kept in its order (`./launchOptions.ts`),
// and its session policy against the installation's start
// (`./launchSessionPolicy.ts`). Only terminal admission reads the host listing.

import { sessionHostSchema } from "../src/sessionReference.ts";
import { launchHost } from "./launchHosts.ts";
import type { IncomingMessage } from "node:http";
import {
  agentLaunchRequestSchema,
  attachOpens,
  launchKindName,
  type AgentLaunchRequest,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import {
  agentDeleteEndpoint,
  deleteRecordRequestSchema,
} from "../src/deleteRecord.ts";
import { agentDoneEndpoint, markDoneRequestSchema } from "../src/doneMark.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import type { TerminalSession } from "./agentTerminals.ts";
import { withSelectedOptions } from "./launchOptions.ts";
import { withSessionPolicy } from "./launchSessionPolicy.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { projectFolder, type ProjectFolder } from "./projectFolders.ts";
import {
  knownSource,
  recordedSession,
  resultRequest,
} from "./sessionAdmission.ts";

// Enough for the longest request the limits allow, in any UTF-8 spelling.
const bodyLimitBytes = 32 * 1024;

export type Admitted =
  | { readonly kind: "sessions" }
  | { readonly kind: "result"; readonly record: LaunchRecord }
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
    }
  | {
      readonly kind: "delete";
      readonly source: PublishedSource;
      readonly record: LaunchRecord;
    };

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

async function doneRequest(
  req: IncomingMessage,
  launches: AgentLaunches,
): Promise<Admitted> {
  const parsed = markDoneRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, "The done request is malformed.");
  }
  const source = knownSource(parsed.data.source);
  const { record, folder } = await recordedSession(launches, source, {
    sessionId: parsed.data.session,
    host: parsed.data.host,
  });
  if (launchHost(record.session.host)?.stop === undefined) {
    throw new RefusedRequest(400, "This host cannot mark a session done.");
  }
  return { kind: "done", source, record, folder };
}

async function deleteRequest(
  req: IncomingMessage,
  launches: AgentLaunches,
): Promise<Admitted> {
  const parsed = deleteRecordRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, "The delete request is malformed.");
  }
  const source = knownSource(parsed.data.source);
  const { record } = await recordedSession(launches, source, {
    sessionId: parsed.data.session,
    host: parsed.data.host,
  });
  return { kind: "delete", source, record };
}

async function launchRequest(req: IncomingMessage): Promise<Admitted> {
  const parsed = agentLaunchRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, "The launch request is malformed.");
  }
  const request = parsed.data;
  const source = knownSource(request.source);
  if (launchHost(request.host) === undefined) {
    throw new RefusedRequest(
      400,
      `${launchKindName(request.workflow)} cannot be launched in this host.`,
    );
  }
  if (request.host === "codex" && request.model !== undefined) {
    throw new RefusedRequest(
      400,
      "Codex uses its configured default model; a Claude model cannot be selected.",
    );
  }
  const project = projectFolder(source);
  const selected = await withSelectedOptions(request, project);
  return {
    kind: "launch",
    source,
    request: await withSessionPolicy(selected, project),
  };
}

export async function admitted(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
): Promise<Admitted> {
  verifyLocalOrigin(req);
  if (url.pathname === sessionResultEndpoint) {
    if (req.method !== "GET")
      throw new RefusedRequest(405, "Only GET is accepted here.");
    return resultRequest(url);
  }
  if (url.pathname === agentDoneEndpoint) {
    if (req.method !== "POST") {
      throw new RefusedRequest(405, "Only POST is accepted here.");
    }
    return doneRequest(req, launches);
  }
  if (url.pathname === agentDeleteEndpoint) {
    if (req.method !== "POST") {
      throw new RefusedRequest(405, "Only POST is accepted here.");
    }
    return deleteRequest(req, launches);
  }
  if (req.method === "GET") {
    return { kind: "sessions" };
  }
  if (req.method === "POST") {
    return launchRequest(req);
  }
  throw new RefusedRequest(405, "Only GET and POST are accepted here.");
}

// An upgrade attaches only a kept session through its host’s supported
// operation, in an existing folder, while the host still may list it.
export async function admittedAttach(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
): Promise<TerminalSession> {
  verifyLocalOrigin(req);
  const source = knownSource(url.searchParams.get("source"));
  const host = sessionHostSchema.safeParse(
    url.searchParams.get("host") ?? "claude",
  );
  if (!host.success)
    throw new RefusedRequest(400, "The session host is malformed.");
  const { record, folder } = await recordedSession(launches, source, {
    sessionId: url.searchParams.get("session") ?? "",
    host: host.data,
  });
  if (launchHost(record.session.host)?.attach === undefined) {
    throw new RefusedRequest(
      400,
      "This host cannot open an embedded terminal.",
    );
  }
  const joined = await launches.stateOf(source, record);
  if (!attachOpens(joined.sessionState)) {
    throw new RefusedRequest(410, "Claude Code no longer lists this session.");
  }
  return {
    sourceId: source.id,
    session: record.session,
    markedDone: record.doneAt !== undefined,
    folder,
  };
}
