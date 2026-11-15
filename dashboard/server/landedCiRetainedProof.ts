// One atomic update's collected evidence: accepted summaries survive late
// readers, final failures survive stale pending reads, eviction is never
// reversed, and a kept measure is written once with that same build.
import type { CiProof } from "../src/ciProof.ts";
import type { CiTimeWithoutRunnerWaits } from "../src/storyCiComparison.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import { buildKeyOf } from "./landedCiObservation.ts";
import {
  compatibleAdapterProof,
  withAdapterIdentity,
} from "./landedCiHistoryIdentity.ts";
import { windowedHistory } from "./landedCiMeasuredBuilds.ts";

export type CollectedBuildEvidence = {
  readonly proof?: CiProof;
  readonly pending?: boolean;
  readonly timeWithoutRunnerWaits?: CiTimeWithoutRunnerWaits;
};

export function historyWithCollectedEvidence(
  original: ProjectHistory,
  buildKey: string,
  evidence: CollectedBuildEvidence,
): ProjectHistory {
  const project = withAdapterIdentity(original);
  const requested = original.builds[buildKey];
  const key =
    requested?.adapterAttempt === undefined ? buildKey : buildKeyOf(requested);
  const build = project.builds[key];
  if (build === undefined) return windowedHistory(project);
  const { proof, pending, timeWithoutRunnerWaits } = evidence;
  let next = build;
  if (
    proof !== undefined &&
    build.proof?.kind !== "summary" &&
    !(build.proofPending === false && proof.kind !== "summary") &&
    compatibleAdapterProof(build, proof)
  ) {
    next = {
      ...next,
      proof,
      ...(pending === undefined ? {} : { proofPending: pending }),
    };
  }
  if (
    timeWithoutRunnerWaits !== undefined &&
    next.timeWithoutRunnerWaits === undefined
  )
    next = { ...next, timeWithoutRunnerWaits };
  if (next === build) return windowedHistory(project);
  return windowedHistory({
    ...project,
    builds: { ...project.builds, [key]: next },
  });
}
