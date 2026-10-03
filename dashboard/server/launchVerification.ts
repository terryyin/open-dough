// Verifying a story attempt whose launch is uncertain from its host's own
// record or session listing (`LaunchHost.launchedSessions`), when a page's
// Recheck asks (`./launchAttemptOwner.ts`). The latest own launch record
// settles it as launched before any listing is read. Otherwise the listing
// is read once. Of the sessions it
// names with the launch's name, started in the folder the launch started in
// (the project folder, or its kept start's workspace) at or after the
// attempt was accepted, those another launch record holds are not this
// launch's. Exactly one left is this launch's session: it is kept as a launch
// confirmation keeps it, with the kept start's facts, and the attempt settles
// as launched. None left settles it as not launched. A listing or record file
// that cannot be read, or more than one session left, leaves it unresolved,
// saying why. A record of the same story launched since the attempt was
// accepted is this attempt's own: while it is unresolved no other start of
// its story is accepted.

import {
  type AttemptOutcome,
  type LaunchAttemptRecord,
  type LaunchRecord,
  type StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { sessionKey } from "../src/sessionReference.ts";
import {
  recordedRequest,
  withStartPolicy,
  type SessionObservation,
} from "./hostLaunch.ts";
import { launchHost } from "./launchHosts.ts";
import { keepRecord, readableRecordsByProject } from "./launchRecordStore.ts";
import { launchRecord, launchStartContext } from "./launchRecord.ts";
import { projectFolder } from "./projectFolders.ts";
import { keptStart, removeLaunchedStart } from "./startStore.ts";

// What a verification settles, or why the attempt stays unresolved.
export type Verified =
  | Extract<AttemptOutcome, { readonly kind: "launched" | "failed" }>
  | { readonly kind: "unresolved"; readonly explanation: string };

const unresolved = (explanation: string): Verified => ({
  kind: "unresolved",
  explanation,
});

// Whether the record is of the attempt's story and launched since it was
// accepted: the attempt's own.
const ownRecord = (
  record: LaunchRecord,
  request: StoryLaunchRequest,
  acceptedAt: string,
) =>
  record.request.workflow === request.workflow &&
  record.request.identity === request.identity &&
  record.request.source === request.source &&
  Date.parse(record.launchedAt) >= Date.parse(acceptedAt);

// Of the listed sessions, those no launch record holds. An own record has
// already settled the attempt before this listing is read.
function unheld(
  listed: readonly SessionObservation[],
  records: readonly LaunchRecord[],
) {
  const held = new Set(records.map((record) => sessionKey(record.session)));
  return listed.filter(({ session }) => !held.has(sessionKey(session)));
}

export async function verifyLaunch(
  source: PublishedSource,
  {
    request,
    acceptedAt,
    reporting,
  }: LaunchAttemptRecord & { request: StoryLaunchRequest },
  signal: AbortSignal,
): Promise<Verified> {
  const host = launchHost(request.host);
  if (host?.launchedSessions === undefined)
    return unresolved(
      "This host offers no session listing to recheck the launch against, so whether its session started is still not known.",
    );
  const records = await readableRecordsByProject();
  if (records === undefined)
    return unresolved(
      "This machine's launch records could not be read, so whether a listed session belongs to this launch is not known.",
    );
  const own = (records.get(source.id) ?? [])
    .filter((record) => ownRecord(record, request, acceptedAt))
    .sort((a, b) => Date.parse(b.launchedAt) - Date.parse(a.launchedAt))[0];
  if (own !== undefined)
    return {
      kind: "launched",
      session: { host: own.session.host, sessionId: own.session.sessionId },
    };
  const check = host.description.uncertaintyHint ?? "";
  const project = projectFolder(source);
  const kept = await keptStart(source.id, request.identity, request.workflow);
  // A kept start that established its facts: the launch started in its
  // workspace, with its policy.
  const established =
    kept?.start === undefined && kept?.preparation === undefined
      ? undefined
      : kept;
  const context =
    established === undefined
      ? undefined
      : launchStartContext(project, established);
  const startedIn = context?.workspace ?? project;
  const requested = recordedRequest(request, new Date(acceptedAt));
  const baseRecording =
    context === undefined
      ? requested
      : withStartPolicy(requested, context.policy);
  const recording =
    reporting === undefined ? baseRecording : { ...baseRecording, reporting };
  const listed = await host.launchedSessions(
    source,
    recording,
    startedIn,
    new Date(acceptedAt),
    project,
    signal,
  );
  if (listed === undefined)
    return unresolved(
      `${host.name}'s session listing could not be read, so whether this launch started its session is still not known. ${check}`.trim(),
    );
  const candidates = unheld(listed, [...records.values()].flat());
  const [found, ...others] = candidates;
  if (found === undefined)
    return {
      kind: "failed",
      reason: "not-listed",
      explanation: `${host.name} lists no session this launch started in ${startedIn.shown}, so none was launched.`,
    };
  if (others.length > 0)
    return unresolved(
      `${host.name} lists ${String(candidates.length)} sessions this launch could have started in ${startedIn.shown}, so which one it started is not known. ${check}`.trim(),
    );
  const outcome: Verified = {
    kind: "launched",
    session: { host: found.session.host, sessionId: found.session.sessionId },
  };
  const record = launchRecord(
    recording,
    found.session,
    context?.facts ?? {},
    new Date().toISOString(),
  );
  try {
    await keepRecord(source.id, record);
    await removeLaunchedStart(source.id, record);
  } catch {
    return unresolved(
      "This machine's launch records could not be written, so the session this launch started was not recorded.",
    );
  }
  return outcome;
}
