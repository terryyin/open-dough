// Revision build slot for a story CI comparison endpoint: the selected
// timed build (or gap) plus the requested revision's own status when that
// revision is not the timed build shown. Proof selection stays in
// `./baseCiRevisionLookup.ts`; status classification stays in
// `./requestedRevisionCiStatus.ts`.
import type { CiProofUnavailableReason } from "../src/ciProof.ts";
import type { RequestedRevisionCiStatus } from "../src/storyCiComparison.ts";
import {
  nearestRevisionBuild,
  type RevisionCiBuild,
} from "./baseCiRevisionNearest.ts";
import type { ComparisonBuildSource } from "./comparisonBuildSource.ts";
import { requestedRevisionCiStatus } from "./requestedRevisionCiStatus.ts";
import type { UnusableBuild } from "./unusableBuild.ts";

export type RevisionBuildSlot =
  | ({
      readonly kind: "build";
      readonly state: "pass" | "failed";
      readonly requestedStatus?: RequestedRevisionCiStatus;
    } & Omit<RevisionCiBuild, "state">)
  | ({
      readonly kind: "running";
      readonly state: "running";
      readonly requestedStatus?: RequestedRevisionCiStatus;
    } & Omit<RevisionCiBuild, "state">)
  | {
      readonly kind: "none";
      readonly explanation: string;
      readonly requestedStatus?: RequestedRevisionCiStatus;
      // A cancelled landing's forward walk stopped at the read trunk head or
      // a running build (`./laterTrunkBuild.ts`): a later build may come.
      readonly awaitingLaterBuild?: true;
      // Story Branch Landed's own build at the landing was cancelled or
      // timed out, and no later trunk build stands for it.
      readonly cancelled?: true;
      // Why the CI proof of the build that would have stood for the landing
      // -- a confirmed skip's equivalent build, or a cancelled landing's
      // nearest later trunk build -- could not be used.
      readonly unusableProof?: CiProofUnavailableReason;
      // GitHub left that build's CI proof read unanswered
      // (`isUnansweredProof`, `./ciProofArtifact.ts`): a later read may
      // still use it.
      readonly proofUnanswered?: true;
      // The build Story Branch Landed named for the landing but could not
      // measure it by (`./unusableBuild.ts`): the build whose CI proof could
      // not be used, or else the landing's own attempt that stopped without
      // a verdict. The CI comparison answers neither it nor why
      // (`asComparisonSlot`).
      readonly unusableBuild?: UnusableBuild;
    }
  | {
      readonly kind: "not-applicable";
      readonly explanation: string;
      readonly requestedStatus?: RequestedRevisionCiStatus;
    }
  | {
      readonly kind: "unavailable";
      readonly explanation: string;
      readonly requestedStatus?: RequestedRevisionCiStatus;
    };

// A slot no later read changes (`finalSlot`).
export type FinalSlot<Slot> = Exclude<
  Slot,
  { readonly kind: "running" | "unavailable" }
>;

// SLOT when no later read changes it; undefined while it is a build still
// running, CI that could not be read, or a cancelled landing whose later
// trunk build may yet come. Only final slots are kept: in a remembered
// done-story comparison answer (`./intentCiComparisonAnswers.ts`), and as a
// landing's final resolution in the landed CI history
// (`./landedCiHistoryStore.ts`), whose collection resolves any other as
// pending (`./landedCiResolution.ts`).
export function finalSlot<
  Slot extends {
    readonly kind: string;
    readonly awaitingLaterBuild?: true | undefined;
  },
>(slot: Slot): FinalSlot<Slot> | undefined {
  if (slot.kind === "running" || slot.kind === "unavailable") return undefined;
  if (slot.kind === "none" && slot.awaitingLaterBuild === true)
    return undefined;
  return slot as FinalSlot<Slot>;
}

function withStatus(
  slot: RevisionBuildSlot,
  status: RequestedRevisionCiStatus | undefined,
): RevisionBuildSlot {
  if (status === undefined) return slot;
  return { ...slot, requestedStatus: status };
}

export function asSlot(
  build: RevisionCiBuild | undefined,
  noneExplanation: string,
  status?: RequestedRevisionCiStatus,
): RevisionBuildSlot {
  if (build === undefined)
    return withStatus({ kind: "none", explanation: noneExplanation }, status);
  const {
    revision,
    subject,
    selection,
    laterWithoutResult,
    laterRunning,
    runUrl,
    runBranch,
    runId,
    runAttempt,
    startedAt,
    completedAt,
    adapterAttempt,
  } = build;
  const identity = {
    revision,
    subject,
    selection,
    laterWithoutResult,
    ...(laterRunning === true ? { laterRunning: true as const } : {}),
    ...(runUrl === undefined ? {} : { runUrl }),
    ...(runBranch === undefined ? {} : { runBranch }),
    ...(runId === undefined ? {} : { runId }),
    ...(runAttempt === undefined ? {} : { runAttempt }),
    ...(startedAt === undefined ? {} : { startedAt }),
    ...(completedAt === undefined ? {} : { completedAt }),
    ...(adapterAttempt === undefined ? {} : { adapterAttempt }),
  };
  if (build.state === "running")
    return withStatus(
      { kind: "running", state: "running", ...identity },
      status,
    );
  return withStatus({ kind: "build", state: build.state, ...identity }, status);
}

// The nearest first-parent ancestor build of `target`, completed or still
// running, within `ancestorLimit` revisions: the build a skip at `target`
// rests on.
export async function nearestAncestorBuild(
  target: string,
  source: ComparisonBuildSource,
  ancestorLimit: number,
): Promise<RevisionCiBuild | undefined> {
  const revisions = await source.history.firstParents(
    target,
    ancestorLimit + 1,
  );
  return nearestRevisionBuild(
    revisions.filter((sha) => sha !== target),
    source.lookup,
  );
}

// Nearest timed first-parent ancestor build used only to confirm a skip or
// name a No-build reason — never as the endpoint's proof source.
export async function nearestAncestorBasisSha(
  target: string,
  source: ComparisonBuildSource,
  ancestorLimit: number,
): Promise<string | undefined> {
  const build = await nearestAncestorBuild(target, source, ancestorLimit);
  return build?.state === "pass" || build?.state === "failed"
    ? build.revision
    : undefined;
}

export async function statusWhenNotExact(
  requestedSha: string,
  build: RevisionCiBuild | undefined,
  source: ComparisonBuildSource,
  ancestorLimit: number,
): Promise<RequestedRevisionCiStatus | undefined> {
  if (build !== undefined && build.revision === requestedSha) return undefined;
  // Skip confirmation uses the nearest timed build, which may be nearer than
  // the selected proof source when the walk passed a build without usable
  // proof.
  const basisSha = await nearestAncestorBasisSha(
    requestedSha,
    source,
    ancestorLimit,
  );
  return requestedRevisionCiStatus(
    requestedSha,
    await source.lookup.listRunsAt(requestedSha),
    basisSha,
    source.history,
    source.workflow,
  );
}
