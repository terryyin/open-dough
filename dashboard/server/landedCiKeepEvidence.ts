// Keep collected proof and CI time without runner waits with one retained
// build in one write (`./landedCiRetainedProof.ts`, `./landedCiHistoryStore.ts`).
import type { CiProof } from "../src/ciProof.ts";
import {
  updateProjectHistory,
  type ProjectHistory,
} from "./landedCiHistoryStore.ts";
import {
  historyWithCollectedEvidence,
  type CollectedBuildEvidence,
} from "./landedCiRetainedProof.ts";

export async function keepLandedCiCollectedEvidence(
  sourceId: string,
  buildKey: string,
  evidence: CollectedBuildEvidence,
): Promise<ProjectHistory> {
  return updateProjectHistory(sourceId, (original) =>
    historyWithCollectedEvidence(original, buildKey, evidence),
  );
}

export async function keepLandedCiProof(
  sourceId: string,
  buildKey: string,
  proof: CiProof,
  pending?: boolean,
): Promise<ProjectHistory> {
  return keepLandedCiCollectedEvidence(sourceId, buildKey, {
    proof,
    ...(pending === undefined ? {} : { pending }),
  });
}
