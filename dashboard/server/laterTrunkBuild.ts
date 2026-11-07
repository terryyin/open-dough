// Story Branch Landed cancelled-landing path: when a later trunk push
// cancelled the landing's own run, use the nearest later trunk build with
// usable proof. Walks trunk's first-parent history forward from the landing
// (every revision contains it) to the trunk head the comparison read, within
// the Baseline bound. Passes over cancelled builds, revisions without a
// build, and builds without usable proof; stops at a running build. The
// landing's own status stays beside this source (`./baseCiRevisionLookup.ts`).
import {
  nearestRevisionBuild,
  type RevisionCiBuild,
  type RevisionCiLookup,
  type RevisionProofUsable,
} from "./baseCiRevisionNearest.ts";
import type { ListedRun } from "./baseCiNearest.ts";
import {
  baselineAncestorLimit,
  type ExactResultLookup,
} from "./exactSkippedEquivalent.ts";
import { runGit, type GitCall } from "./gitRunner.ts";
import { requestedRevisionCiStatus } from "./requestedRevisionCiStatus.ts";
import { asSlot, type RevisionBuildSlot } from "./revisionBuildSlot.ts";

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

// The nearest later trunk build whose proof is usable, labelled `later` with
// how many later trunk revisions it includes beyond the landing; undefined
// when the walk reaches a running build, the read trunk head, or the bound
// first.
export async function laterTrunkProofBuild(
  landing: string,
  trunkHead: string,
  lookup: RevisionCiLookup,
  call: GitCall,
  proofUsable: RevisionProofUsable,
): Promise<RevisionCiBuild | undefined> {
  const chain = await laterTrunkChain(landing, trunkHead, call);
  for (const [index, sha] of chain.entries()) {
    const build = await nearestRevisionBuild([sha], lookup);
    if (build === undefined) continue;
    if (build.state === "running") return undefined;
    if (!(await proofUsable(build))) continue;
    return { ...build, selection: "later", laterWithoutResult: index + 1 };
  }
  return undefined;
}

// Landed's slot for a cancelled landing (`listed` is the landing's own runs):
// the nearest later trunk build with usable proof, with the landing's own
// Cancelled status beside it; undefined when the walk finds none.
export async function laterTrunkCancelledSlot(
  landing: string,
  listed: readonly ListedRun[],
  lookup: RevisionCiLookup,
  call: GitCall,
  workflow: string,
  exact: ExactResultLookup,
  proofUsable: RevisionProofUsable,
): Promise<RevisionBuildSlot | undefined> {
  const later = await laterTrunkProofBuild(
    landing,
    exact.laterTrunkHead,
    lookup,
    call,
    proofUsable,
  );
  if (later === undefined) return undefined;
  return asSlot(
    later,
    exact.cancelledExplanation,
    await requestedRevisionCiStatus(landing, listed, undefined, call, workflow),
  );
}
