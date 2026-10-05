// Catalog and kept host-qualified identity are shared across local session requests.
// Passive report admission does not require a project or continuation directory.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import {
  reportUnread,
  type CompletionReport,
} from "../src/completionReport.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { configuredProject } from "./projectConfiguration.ts";
import {
  sessionHostSchema,
  type SessionReference,
} from "../src/sessionReference.ts";
import type { IncomingMessage } from "node:http";
import { deleteRecordRequestSchema } from "../src/deleteRecord.ts";
import { markDoneRequestSchema } from "../src/doneMark.ts";
import type { AgentLaunches, Recorded } from "./agentLaunches.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { launchHost, type LaunchHost } from "./launchHosts.ts";
import { projectFolder } from "./projectFolders.ts";
import { keptSession } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";

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

// A kept session whose host can read its native final report, with that reader.
export type AdmittedResult = {
  readonly kind: "result";
  readonly record: LaunchRecord;
  readonly read: NonNullable<LaunchHost["readResult"]>;
};

export async function resultRequest(url: URL): Promise<AdmittedResult> {
  requireExactQuery(url, ["source", "host", "session"], "result");
  const source = knownSource(url.searchParams.get("source"));
  const host = sessionHostSchema.safeParse(url.searchParams.get("host"));
  const sessionId = url.searchParams.get("session");
  if (!host.success || !sessionId)
    throw new RefusedRequest(400, "The result session is malformed.");
  const record = await keptSession(source.id, { host: host.data, sessionId });
  if (record === undefined) throw noSuchSession();
  const boundary = launchHost(record.session.host);
  const read = boundary?.readResult?.bind(boundary);
  if (read === undefined)
    throw new RefusedRequest(400, "This host cannot read a final report.");
  return { kind: "result", record, read };
}
