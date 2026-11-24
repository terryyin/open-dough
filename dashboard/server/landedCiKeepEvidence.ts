// Keep collected proof and CI time without runner waits with one retained
// build in one write (`./landedCiRetainedProof.ts`, `./landedCiHistoryStore.ts`).
import { isDeepStrictEqual } from "node:util";
import type { CiProof } from "../src/ciProof.ts";
import {
  historyStore,
  noHistory,
  type ProjectHistory,
} from "./landedCiHistoryStore.ts";
import { leaveMachineJson, replaceMachineJson } from "./machineJsonStore.ts";
import {
  historyWithCollectedEvidence,
  type CollectedBuildEvidence,
} from "./landedCiRetainedProof.ts";

// One project's history rewritten under the shared window and equality leave.
async function updateProjectHistory(
  sourceId: string,
  update: (project: ProjectHistory) => ProjectHistory,
  home?: string,
): Promise<ProjectHistory> {
  let history = noHistory;
  await replaceMachineJson(historyStore(home), (stored) => {
    const original = stored[sourceId] ?? noHistory;
    history = update(original);
    return isDeepStrictEqual(history, original)
      ? leaveMachineJson
      : { ...stored, [sourceId]: history };
  });
  return history;
}

export async function keepLandedCiCollectedEvidence(
  sourceId: string,
  buildKey: string,
  evidence: CollectedBuildEvidence,
  home?: string,
): Promise<ProjectHistory> {
  return updateProjectHistory(
    sourceId,
    (original) => historyWithCollectedEvidence(original, buildKey, evidence),
    home,
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
