// Story Branch Landed cancelled-landing path: when a later trunk push
// cancelled the landing's own run, use the nearest later trunk build with
// usable proof. Walks trunk's first-parent history forward from the landing
// (every revision contains it) to the trunk head the comparison read, within
// the Baseline bound. Passes over cancelled builds, revisions without a
// build, and builds without usable proof; stops at a running build. The
// landing's own status stays beside this source (`./baseCiRevisionLookup.ts`).
import {
  nearestRevisionBuild,
  proofRunOf,
  type RevisionCiBuild,
  type RevisionCiLookup,
} from "./baseCiRevisionNearest.ts";
import type { ListedRun } from "./baseCiNearest.ts";
import {
  baselineAncestorLimit,
  type ExactResultLookup,
} from "./exactSkippedEquivalent.ts";
import { runGit, type GitCall } from "./gitRunner.ts";
import { requestedRevisionCiStatus } from "./requestedRevisionCiStatus.ts";
import { asSlot, type RevisionBuildSlot } from "./revisionBuildSlot.ts";
import { shortSha } from "../src/baseCiWording.ts";
import type { CiProofUnavailableReason } from "../src/ciProof.ts";
import { laterBuildUnavailableLine } from "../src/ciProofAbsenceWording.ts";

// Trunk's first-parent revisions after `landing` up to `trunkHead`, nearest
// first, capped at the Baseline bound.
export async function laterTrunkChain(
  landing: string,
  trunkHead: string,
  call: GitCall,
  limit: number = baselineAncestorLimit,
): Promise<string[]> {
  const { stdout } = await runGit(
    [
      "rev-list",
      "--first-parent",
      "--reverse",
      "--ancestry-path",
      `${landing}..${trunkHead}`,
    ],
    call,
  );
  return stdout.trim().split("\n").filter(Boolean).slice(0, limit);
}

// Why a build's proof cannot be used, under the proof usability rule
// (`readCiProofArtifact`); undefined when its summary is usable.
export type RevisionProofAbsence = (
  build: RevisionCiBuild,
) => Promise<CiProofUnavailableReason | undefined>;

// The nearest later build whose proof could not be used, and why.
export type LaterProofUnavailable = {
  readonly build: RevisionCiBuild;
  readonly reason: CiProofUnavailableReason;
};

// Where the forward walk ended: the nearest later build with usable proof
// (`found`), a running build (`running`), or the end of the walk at the read
// trunk head or the Baseline bound (`ended`), naming the nearest later build
// whose proof was unavailable and why when it passed one.
export type LaterTrunkProofWalk =
  | { readonly kind: "found"; readonly build: RevisionCiBuild }
  | { readonly kind: "running"; readonly build: RevisionCiBuild }
  | {
      readonly kind: "ended";
      readonly at: "head" | "bound";
      readonly unavailable?: LaterProofUnavailable;
    };

// The nearest later trunk build whose proof is usable, labelled `later` with
// how many later trunk revisions it includes beyond the landing, or where
// and why the walk stopped without one.
export async function laterTrunkProofBuild(
  landing: string,
  trunkHead: string,
  lookup: RevisionCiLookup,
  call: GitCall,
  proofAbsence: RevisionProofAbsence,
  limit: number = baselineAncestorLimit,
): Promise<LaterTrunkProofWalk> {
  const read = await laterTrunkChain(landing, trunkHead, call, limit + 1);
  const chain = read.slice(0, limit);
  let unavailable: LaterProofUnavailable | undefined;
  for (const [index, sha] of chain.entries()) {
    const build = await nearestRevisionBuild([sha], lookup);
    if (build === undefined) continue;
    if (build.state === "running") return { kind: "running", build };
    const reason = await proofAbsence(build);
    if (reason !== undefined) {
      unavailable ??= { build, reason };
      continue;
    }
    return {
      kind: "found",
      build: { ...build, selection: "later", laterWithoutResult: index + 1 },
    };
  }
  return {
    kind: "ended",
    at: read.length > limit ? "bound" : "head",
    ...(unavailable === undefined ? {} : { unavailable }),
  };
}

// A later build named by revision, with its run and attempt when known.
function runWords(build: RevisionCiBuild): string {
  const run = proofRunOf(build);
  return run === undefined
    ? shortSha(build.revision)
    : `${shortSha(build.revision)} (run ${String(run.runId)} #${String(run.runAttempt)})`;
}

// Why the walk found no later proof, after the landing's cancelled
// explanation.
function noLaterProofWords(
  walk: Exclude<LaterTrunkProofWalk, { kind: "found" }>,
): string {
  if (walk.kind === "running")
    return `A later trunk build at ${runWords(walk.build)} is still running, so no later trunk build has finished yet.`;
  if (walk.unavailable !== undefined)
    return laterBuildUnavailableLine(
      runWords(walk.unavailable.build),
      walk.unavailable.reason,
    );
  return walk.at === "head"
    ? "No later trunk build has finished yet."
    : `No later trunk build finished within ${String(baselineAncestorLimit)} later trunk revisions.`;
}

// Landed's slot for a cancelled landing (`listed` is the landing's own runs):
// the nearest later trunk build with usable proof, with the landing's own
// Cancelled status beside it; otherwise the cancelled explanation and why no
// later proof is in reach, awaiting a later build when the walk stopped at
// the read trunk head or a running build.
export async function laterTrunkCancelledSlot(
  landing: string,
  listed: readonly ListedRun[],
  lookup: RevisionCiLookup,
  call: GitCall,
  workflow: string,
  exact: ExactResultLookup,
  proofAbsence: RevisionProofAbsence,
): Promise<RevisionBuildSlot> {
  const walk = await laterTrunkProofBuild(
    landing,
    exact.laterTrunkHead,
    lookup,
    call,
    proofAbsence,
  );
  if (walk.kind === "found")
    return asSlot(
      walk.build,
      exact.cancelledExplanation,
      await requestedRevisionCiStatus(
        landing,
        listed,
        undefined,
        call,
        workflow,
      ),
    );
  return {
    kind: "none",
    explanation: `${exact.cancelledExplanation} ${noLaterProofWords(walk)}`,
    ...(walk.kind === "running" || walk.at === "head"
      ? { awaitingLaterBuild: true as const }
      : {}),
  };
}
