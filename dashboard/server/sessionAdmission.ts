// Catalog and kept host-qualified identity are shared across local session requests.
// Passive report admission does not require a project or continuation directory.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import {
  reportUnread,
  type CompletionReport,
} from "../src/completionReport.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { configuredProject } from "./projectConfiguration.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import type { IncomingMessage } from "node:http";
import { deleteRecordRequestSchema } from "../src/deleteRecord.ts";
import { markDoneRequestSchema } from "../src/doneMark.ts";
import { stopSessionRequestSchema } from "../src/sessionStop.ts";
import {
  recoverSessionRequestSchema,
  sessionUnfinished,
} from "../src/sessionRecovery.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import type { Recorded } from "./recordedSessionLookup.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { launchHost } from "./launchHosts.ts";
import { projectFolder } from "./projectFolders.ts";
import { keptSession } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { heldCursorSessions } from "./hosts/cursor/heldSessions.ts";
import { sessionKey } from "../src/sessionReference.ts";

export function knownSource(id: string | null): PublishedSource {
  const source = id === null ? undefined : configuredProject(id);
  if (source === undefined) {
    throw new RefusedRequest(404, "Unknown catalog source.");
  }
  return source;
}

// The refusal for a session this dashboard keeps no record of in the project.
export function noSuchSession(): RefusedRequest {
  return new RefusedRequest(
    404,
    "This dashboard launched no such session for this project.",
  );
}

// Refuses a GET whose query does not name exactly these parameters, once each.
export function requireExactQuery(
  url: URL,
  names: readonly string[],
  request: string,
): void {
  const keys = [...url.searchParams.keys()];
  if (
    keys.length !== names.length ||
    new Set(keys).size !== names.length ||
    keys.some((key) => !names.includes(key))
  )
    throw new RefusedRequest(400, `The ${request} request is malformed.`);
}

// A kept session and its existing folder, or a refusal.
export async function recordedSession(
  launches: AgentLaunches,
  source: PublishedSource,
  session: SessionReference,
): Promise<Extract<Recorded, { readonly kind: "recorded" }>> {
  const recorded = await launches.recorded(source, session);
  switch (recorded.kind) {
    case "recorded":
      return recorded;
    case "unrecorded":
      throw noSuchSession();
    case "folder-not-found":
      throw new RefusedRequest(
        404,
        `The project folder ${recorded.folder.shown} was not found on this machine.`,
      );
  }
}

// The recorded session a done mark or a delete names, in its project.
export async function namedSession(
  req: IncomingMessage,
  launches: AgentLaunches,
  kind: "done" | "delete",
) {
  const schema =
    kind === "done" ? markDoneRequestSchema : deleteRecordRequestSchema;
  const parsed = schema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, `The ${kind} request is malformed.`);
  }
  const source = knownSource(parsed.data.source);
  const session = { sessionId: parsed.data.session, host: parsed.data.host };
  const retained =
    kind === "done" ? await keptSession(source.id, session) : undefined;
  if (retained?.completion !== undefined) {
    return { source, record: retained, folder: projectFolder(source) };
  }
  const recorded = await recordedSession(launches, source, session);
  return { source, ...recorded };
}

// The recorded session a read mark names, in its project, while its report is
// unread. Only the retained record is needed: nothing native is touched.
export async function unreadReportSession(req: IncomingMessage): Promise<{
  readonly source: PublishedSource;
  readonly record: LaunchRecord & { readonly completion: CompletionReport };
}> {
  const parsed = markDoneRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, "The read request is malformed.");
  }
  const source = knownSource(parsed.data.source);
  const record = await keptSession(source.id, {
    sessionId: parsed.data.session,
    host: parsed.data.host,
  });
  if (record === undefined) {
    throw noSuchSession();
  }
  const { completion } = record;
  if (completion === undefined || !reportUnread(record)) {
    throw new RefusedRequest(400, "This session has no unread report.");
  }
  return { source, record: { ...record, completion } };
}

// A done mark on a recorded session, which its host can stop, which has
// reported, or whose host's Done is a local acknowledgement only.
export async function doneRequest(
  req: IncomingMessage,
  launches: AgentLaunches,
) {
  const { source, record, folder } = await namedSession(req, launches, "done");
  const host = launchHost(record.session.host);
  if (
    record.completion === undefined &&
    host?.doneStop === undefined &&
    host?.localDone !== true
  ) {
    throw new RefusedRequest(400, "This host cannot mark a session done.");
  }
  return { kind: "done" as const, source, record, folder };
}

// A stop on a recorded session whose host supplies a stop operation.
export async function stopRequest(
  req: IncomingMessage,
  launches: AgentLaunches,
) {
  const parsed = stopSessionRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, "The stop request is malformed.");
  }
  const source = knownSource(parsed.data.source);
  const session = { sessionId: parsed.data.session, host: parsed.data.host };
  const { record, folder } = await recordedSession(launches, source, session);
  if (launchHost(record.session.host)?.stop === undefined) {
    throw new RefusedRequest(400, "This host cannot stop a session.");
  }
  return { kind: "stop" as const, source, record, folder };
}

export async function readRequest(req: IncomingMessage) {
  return { kind: "read" as const, ...(await unreadReportSession(req)) };
}

export async function deleteRequest(
  req: IncomingMessage,
  launches: AgentLaunches,
) {
  const { source, record } = await namedSession(req, launches, "delete");
  return { kind: "delete" as const, source, record };
}

// An unfinished Cursor session the runner does not hold, for Recover.
export async function recoverRequest(
  req: IncomingMessage,
  launches: AgentLaunches,
) {
  const parsed = recoverSessionRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, "The recover request is malformed.");
  }
  if (parsed.data.host !== "cursor") {
    throw new RefusedRequest(400, "Only a Cursor session can be recovered.");
  }
  const source = knownSource(parsed.data.source);
  const session = { sessionId: parsed.data.session, host: parsed.data.host };
  const recorded = await recordedSession(launches, source, session);
  const { record } = recorded;
  if (!sessionUnfinished(record)) {
    throw new RefusedRequest(
      400,
      "This session is finished and cannot be recovered.",
    );
  }
  const held = await heldCursorSessions();
  if (
    held.runner === "running" &&
    held.sessions.some(
      (item) => sessionKey(item.record.session) === sessionKey(record.session),
    )
  ) {
    throw new RefusedRequest(
      400,
      "This session is already held by the Cursor runner.",
    );
  }
  return { kind: "recover" as const, source, record };
}
