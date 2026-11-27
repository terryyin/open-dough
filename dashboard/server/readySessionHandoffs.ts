import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import { formatEstablishedSession } from "../../Distribution/src/skills/dough-execute-plan/scripts/established-session.mjs";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { sendsFirstInput } from "../src/unattachedSession.ts";
import { machineDocumentAt } from "./machineHome.ts";
import { readMachineJson, replaceMachineJson } from "./machineJsonStore.ts";
import { formatReportingContext } from "./reportingInstruction.ts";

const schema = z.record(
  z.string(),
  z.object({
    workspace: z.string(),
    branch: z.string(),
    repository: z.string(),
    text: z.string(),
  }),
);
type Handoffs = z.infer<typeof schema>;

function readyHandoff({
  request,
  session,
  establishedSession,
  landingReporting,
  doneAt,
}: LaunchRecord): Handoffs[string] | undefined {
  if (
    request.workflow !== "ad-hoc" ||
    request.host !== session.host ||
    sendsFirstInput(request) ||
    request.policy?.landing !== "auto-land" ||
    establishedSession?.landing !== "auto-land" ||
    request.policy.workspace !== establishedSession.role ||
    doneAt !== undefined ||
    landingReporting?.settledAt === undefined ||
    landingReporting.deletedAt !== undefined
  )
    return undefined;
  const { authority } = landingReporting;
  const { reporting, storyIdentity } = request;
  if (
    storyIdentity === undefined ||
    storyIdentity !== authority.identity ||
    reporting?.landingContext === undefined ||
    reporting.origin !== landingReporting.origin ||
    establishedSession.workspace !== authority.workspace ||
    establishedSession.branch !== authority.branch ||
    establishedSession.remote !== authority.remote ||
    `refs/heads/${establishedSession.target}` !== authority.target ||
    ("continuation" in session &&
      session.continuation !== undefined &&
      session.continuation.workspace !== authority.workspace)
  )
    return undefined;
  const { workspace, branch, repository } = authority;
  return {
    workspace,
    branch,
    repository,
    text: [
      formatEstablishedSession(establishedSession),
      `Taken story: ${storyIdentity}`,
      `Landing context: ${reporting.landingContext}`,
      formatReportingContext(request, reporting),
    ].join("\n\n"),
  };
}

function handoffsOf(records: Iterable<LaunchRecord>): Handoffs {
  const ready = new Map<string, Handoffs[string]>();
  const seen = new Set<string>();
  for (const record of records) {
    const key = sessionKey(record.session);
    if (seen.has(key)) {
      ready.delete(key);
      continue;
    }
    seen.add(key);
    const handoff = readyHandoff(record);
    if (handoff !== undefined) ready.set(key, handoff);
  }
  return Object.fromEntries(ready);
}

// The launch-record writer holds its lock through withdrawal, its own
// replacement, and the publication of any new handoffs. An interrupted
// write can leave a handoff absent until retried, never available early.
export async function prepareReadyHandoffUpdate(
  records: Iterable<LaunchRecord>,
): Promise<(() => Promise<void>) | undefined> {
  const store = {
    file: machineDocumentAt("ready-session-handoffs.json"),
    schema,
    empty: {},
  };
  const next = handoffsOf(records);
  const read = await readMachineJson(store);
  const previous = read.kind === "document" ? read.document : {};
  const kept = Object.fromEntries(
    Object.entries(previous).filter(([key, handoff]) =>
      isDeepStrictEqual(handoff, next[key]),
    ),
  );
  if (read.kind === "unreadable" || !isDeepStrictEqual(kept, previous))
    await replaceMachineJson(store, () => kept);
  if (!isDeepStrictEqual(kept, next))
    return () => replaceMachineJson(store, () => next);
  return undefined;
}
