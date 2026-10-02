// Verifying a story attempt whose launch is uncertain from its host's own
// session listing (`LaunchHost.launchedSessions`), when a page's Recheck asks
// (`./launchAttemptOwner.ts`). The listing is read once. Of the sessions it
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
  policyOf,
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
import { startWorkspaceFolder } from "./launchWorkspace.ts";
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

// Of the listed sessions, those no other launch record holds, and the
// attempt's own records.
function unheld(
  listed: readonly SessionObservation[],
  records: readonly LaunchRecord[],
  request: StoryLaunchRequest,
  acceptedAt: string,
) {
  const own = records.filter((record) =>
    ownRecord(record, request, acceptedAt),
  );
  const held = new Set(
    records
      .filter((record) => !own.includes(record))
      .map((record) => sessionKey(record.session)),
  );
  return {
    own,
    candidates: listed.filter(({ session }) => !held.has(sessionKey(session))),
  };
}

export async function verifyLaunch(
  source: PublishedSource,
  {
    request,
    acceptedAt,
  }: LaunchAttemptRecord & { request: StoryLaunchRequest },
  signal: AbortSignal,
): Promise<Verified> {
  const host = launchHost(request.host);
  if (host?.launchedSessions === undefined)
    return unresolved(
      "This host offers no session listing to recheck the launch against, so whether its session started is still not known.",
    );
  const check = host.description.uncertaintyHint ?? "";
  const project = projectFolder(source);
  const kept = await keptStart(source.id, request.identity, request.workflow);
  // A kept start that established its facts: the launch started in its
  // workspace, with its policy.
  const established =
    kept?.start === undefined && kept?.preparation === undefined
      ? undefined
      : kept;
  const startedIn =
    established === undefined
      ? project
      : startWorkspaceFolder(project, established.workspace);
  const requested = recordedRequest(request, new Date(acceptedAt));
  const recording =
    established === undefined
      ? requested
      : withStartPolicy(requested, policyOf(established));
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
  const records = await readableRecordsByProject();
  if (records === undefined)
    return unresolved(
      "This machine's launch records could not be read, so whether a listed session belongs to this launch is not known.",
    );
  const { own, candidates } = unheld(
    listed,
    [...records.values()].flat(),
    request,
    acceptedAt,
  );
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
  if (
    own.some(
      (record) => sessionKey(record.session) === sessionKey(found.session),
    )
  )
    return outcome;
  const record: LaunchRecord = {
    request: recording,
    session: found.session,
    ...(established?.start === undefined ? {} : { start: established.start }),
    ...(established?.preparation === undefined
      ? {}
      : { preparation: established.preparation }),
    launchedAt: new Date().toISOString(),
  };
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
