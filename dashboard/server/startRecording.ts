// What a start writes to its store once its script has answered.

import type { EstablishedStart, SessionPolicy } from "../src/agentLaunch.ts";
import { keepsStart, type StartResult } from "./startResult.ts";
import { removeStart, updateStart, type StartsWorkflow } from "./startStore.ts";

// The established start an accepted result makes: the facts the script ran
// with, what it reported, and, for a rerun (`existing`) that omits claim
// facts, the ones already retained for this same start.
export function establishedStart(
  facts: Omit<ClaimedStart, "publishedSha">,
  result: Extract<StartResult, { kind: "accepted" }>,
  earlier: EstablishedStart | undefined,
): ClaimedStart {
  // Only a claimed earlier start shares this start's claim facts.
  const claimed = earlier !== undefined && "publishedSha" in earlier;
  const agent = result.agent ?? (claimed ? earlier.agent : undefined);
  const plan = result.plan ?? (claimed ? earlier.plan : undefined);
  const startingRevision =
    result.startingRevision ?? (claimed ? earlier.startingRevision : undefined);
  const candidateSha =
    result.candidateSha ?? (claimed ? earlier.candidateSha : undefined);
  const changedSinceReview =
    result.changedSinceReview ??
    (claimed ? earlier.changedSinceReview : undefined);
  return {
    ...facts,
    publishedSha: result.publishedSha,
    ...(agent === undefined ? {} : { agent }),
    ...(plan === undefined ? {} : { plan }),
    ...(startingRevision === undefined ? {} : { startingRevision }),
    ...(candidateSha === undefined ? {} : { candidateSha }),
    ...(changedSinceReview === undefined ? {} : { changedSinceReview }),
  };
}

type ClaimedStart = Extract<EstablishedStart, { publishedSha: string }>;

// The established context a prepared one-shot start or preparation makes:
// the facts it ran with, where it runs (the default checkout's role as the
// start reported it), the policy's landing, and the revision and fetched
// trunk the start reported. It names no assignment.
export function establishedOneShot<Facts extends object>(
  facts: Facts,
  result: {
    readonly startingRevision: string;
    readonly role?: "default-checkout";
    readonly landing?: "auto-land";
    readonly fetched?: string;
  },
  policy: SessionPolicy,
) {
  return {
    tracking: "one-shot" as const,
    ...facts,
    role: result.role ?? ("isolated" as const),
    landing: result.landing ?? policy.landing,
    startingRevision: result.startingRevision,
    ...(result.fetched === undefined ? {} : { fetched: result.fetched }),
  };
}

// A store that cannot be written never fails a script that already ran.
export async function record(write: () => Promise<void>): Promise<void> {
  try {
    await write();
  } catch {
    // The launch's answer stands; the next start is chosen afresh.
  }
}

// Keeps what a stop that may have published a claim carries for a resume, and
// removes the start of any other stop, which left nothing to resume.
export async function recordStop(
  workflow: StartsWorkflow,
  sourceId: string,
  identity: string,
  result: Exclude<StartResult, { kind: "accepted" | "prepared" }>,
): Promise<void> {
  if (!keepsStart(result)) {
    await removeStart(sourceId, identity, workflow);
    return;
  }
  const recovery = result.kind === "stopped" ? result.recovery : undefined;
  if (recovery?.startingRevision && recovery.candidateSha) {
    await updateStart(
      sourceId,
      identity,
      {
        startingRevision: recovery.startingRevision,
        candidateSha: recovery.candidateSha,
      },
      workflow,
    );
  }
}
