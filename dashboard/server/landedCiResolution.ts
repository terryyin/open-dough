// What one recorded trunk landing resolves to now, as landed CI collection
// (`./landedCiCollection.ts`) asks in each pass: the CI timing comparison's
// Landed rule (`lookupResultBuild` with `storyBranchLandedExactLookup`,
// `./baseCiRevisionLookup.ts`) over the project's own CI read
// (`./intentCiComparisonSlots.ts`) -- the project folder's Git with its
// `ciWorkflow` runs or its `ciAdapter` discovery -- made once per project in
// a pass, at its first landing to resolve, with each revision's runs listed
// once, within the read boundary's wait. A resolution is final, or the
// landing is pending: while its build is queued or running, while its
// cancelled build awaits a later trunk build (`finalSlot`,
// `./revisionBuildSlot.ts`), while the CI could not be read, and, for a
// bounded wait (`stillAwaited`), while the Landed rule found no build for it
// that CI may still make or could not read the CI proof of the build that
// would stand for it.

import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { newestRunFor, type ListedRun } from "./baseCiNearest.ts";
import {
  lookupResultBuild,
  type RevisionBuildSlot,
} from "./baseCiRevisionLookup.ts";
import type {
  RevisionCiBuild,
  RevisionCiLookup,
} from "./baseCiRevisionNearest.ts";
import {
  baselineAncestorLimit,
  storyBranchLandedExactLookup,
} from "./exactSkippedEquivalent.ts";
import type { GitCall } from "./gitRunner.ts";
import {
  isUnreadJudgment,
  lookupContext,
  workflowOf,
} from "./intentCiComparisonSlots.ts";
import type { LandingReference } from "./landedCiHistoryStore.ts";
import {
  keptRunOf,
  type LandedResolution,
  type PendingResolution,
} from "./landedCiObservation.ts";
import { laterTrunkChain } from "./laterTrunkBuild.ts";
import { observationNow } from "./observationClock.ts";
import {
  finalSlot,
  nearestAncestorBuild,
  type FinalSlot,
} from "./revisionBuildSlot.ts";

// One project's CI as a pass reads it: the Landed rule's lookup over the
// project's own CI read, with each revision's runs listed once in the pass,
// or that the CI could not be read.
type PassRead =
  | { readonly kind: "unread" }
  | {
      readonly kind: "read";
      readonly call: GitCall;
      readonly lookup: RevisionCiLookup;
      readonly workflow: string;
      readonly signal: AbortSignal;
    };

// The lookup with each revision's runs listed once.
function listingOnce(lookup: RevisionCiLookup): RevisionCiLookup {
  const listed = new Map<string, Promise<readonly ListedRun[]>>();
  return {
    ...lookup,
    listRunsAt: (sha) => {
      const known = listed.get(sha);
      if (known !== undefined) return known;
      const runs = lookup.listRunsAt(sha);
      listed.set(sha, runs);
      return runs;
    },
  };
}

// The project's CI read for one pass, made when first asked for, so a pass
// that resolves no landing of the project asks its CI nothing.
export function passRead(
  source: PublishedSource,
  stopped: AbortSignal,
): () => Promise<PassRead> {
  let made: Promise<PassRead> | undefined;
  const make = async (): Promise<PassRead> => {
    const signal = AbortSignal.any([
      stopped,
      AbortSignal.timeout(readWaitLimitMs),
    ]);
    const context = await lookupContext(source, signal, undefined);
    if ("unavailable" in context) return { kind: "unread" };
    const { call, lookupOrGap } = context;
    if (isUnreadJudgment(lookupOrGap)) return { kind: "unread" };
    return {
      kind: "read",
      call,
      lookup: listingOnce(lookupOrGap),
      workflow: workflowOf(call),
      signal,
    };
  };
  return () => {
    made ??= make();
    return made;
  };
}

const unread: PendingResolution = { kind: "pending", waitsFor: "read" };

// The build a pending landing waits on: its run and attempt, or a CI
// adapter's attempt, with its link, as its CI read named them.
function waitingOn(
  waitsFor: PendingResolution["waitsFor"],
  build: Pick<
    RevisionCiBuild,
    "runUrl" | "runId" | "runAttempt" | "adapterAttempt"
  >,
): PendingResolution {
  const run = keptRunOf(build);
  return Object.keys(run).length === 0
    ? { kind: "pending", waitsFor }
    : { kind: "pending", waitsFor, run };
}

// What a slot the Landed rule may still change waits for (`finalSlot`).
function pendingOf(slot: RevisionBuildSlot): PendingResolution {
  if (slot.kind === "running") return waitingOn("build", slot);
  if (slot.kind === "none" && slot.awaitingLaterBuild === true)
    return { kind: "pending", waitsFor: "later-build" };
  return unread;
}

// How long a landing with no run of its own waits for one after the dashboard
// recorded it: GitHub creates a push's run within moments, so one still
// missing an hour later is not coming, as when the workflow does not run on
// the trunk's pushes. A CI proof that could not be read is asked again for as
// long, since GitHub may answer it at the next pass.
const ownRunWaitMs = 60 * 60_000;

// What a landing the Landed rule found no build for still waits for, if
// anything. While the CI proof of the build that would stand for it could
// not be read, it waits to read it again, for `ownRunWaitMs` after it was
// recorded, on the server's observation clock (`./observationClock.ts`);
// after that, the proof is unreadable for good. A skip rests on the nearest
// earlier build, so the landing waits while that build is queued or running.
// With no run of its own at the landed revision and no confirmed skip, it
// waits for a run there until CI moves past it -- a later trunk revision, up
// to the read trunk head and within the Baseline bound, has a run -- or for
// `ownRunWaitMs` after it was recorded. A landing recorded before its push's
// run exists is therefore pending, not a final No build; one CI ran at, built
// past without building, or never ran for within that wait, is final.
async function stillAwaited(
  slot: FinalSlot<RevisionBuildSlot>,
  landing: LandingReference,
  trunkHead: string,
  { call, lookup }: Extract<PassRead, { kind: "read" }>,
): Promise<PendingResolution | undefined> {
  if (slot.kind !== "none") return undefined;
  const { revision, receivedAt } = landing;
  const waited = observationNow() - Date.parse(receivedAt) >= ownRunWaitMs;
  if (slot.unusableProof === "unreadable") return waited ? undefined : unread;
  const status = slot.requestedStatus?.kind;
  if (status !== "no-build" && status !== "skipped") return undefined;
  const earlier = await nearestAncestorBuild(
    revision,
    lookup,
    call,
    baselineAncestorLimit,
  );
  if (earlier?.state === "running") return waitingOn("build", earlier);
  if (status === "skipped") return undefined;
  const hasRun = async (sha: string) =>
    newestRunFor(await lookup.listRunsAt(sha), sha) !== undefined;
  if (await hasRun(revision)) return undefined;
  if (waited) return undefined;
  const later = await laterTrunkChain(
    revision,
    trunkHead,
    call,
    baselineAncestorLimit + 1,
  );
  if (later.length > baselineAncestorLimit) return undefined;
  for (const sha of later) if (await hasRun(sha)) return undefined;
  return { kind: "pending", waitsFor: "run" };
}

// What the Landed rule resolves one landing to now: the landed revision's own
// completed build, a confirmed skip's equivalent build, a cancelled landing's
// later trunk build, or why there is none; or, while that may still change,
// what the landing waits for.
export async function landingResolution(
  source: PublishedSource,
  landing: LandingReference,
  read: () => Promise<PassRead>,
): Promise<LandedResolution> {
  try {
    const ci = await read();
    if (ci.kind === "unread") return unread;
    const { call, lookup, workflow, signal } = ci;
    const trunkHead = `origin/${source.ref}`;
    const slot = await lookupResultBuild(
      landing.revision,
      landing.revision,
      lookup,
      call,
      workflow,
      "No completed CI build was found at the landed revision.",
      storyBranchLandedExactLookup(true, source.repository, signal, trunkHead),
    );
    const final = finalSlot(slot);
    if (final === undefined) return pendingOf(slot);
    return (await stillAwaited(final, landing, trunkHead, ci)) ?? final;
  } catch {
    return unread;
  }
}
