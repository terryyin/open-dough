// One atomic update's proof judgment: accepted summaries survive late readers,
// final failures survive stale pending reads, and eviction is never reversed.
import type { CiProof } from "../src/ciProof.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import { buildKeyOf } from "./landedCiObservation.ts";
import {
  compatibleAdapterProof,
  withAdapterIdentity,
} from "./landedCiHistoryIdentity.ts";
import { windowedHistory } from "./landedCiMeasuredBuilds.ts";

export function historyWithProof(
  original: ProjectHistory,
  buildKey: string,
  proof: CiProof,
  pending?: boolean,
): ProjectHistory {
  const project = withAdapterIdentity(original);
  const requested = original.builds[buildKey];
  const key =
    requested?.adapterAttempt === undefined ? buildKey : buildKeyOf(requested);
  const build = project.builds[key];
  if (
    build === undefined ||
    build.proof?.kind === "summary" ||
    (build.proofPending === false && proof.kind !== "summary") ||
    !compatibleAdapterProof(build, proof)
  )
    return windowedHistory(project);
  return windowedHistory({
    ...project,
    builds: {
      ...project.builds,
      [key]: {
        ...build,
        proof,
        ...(pending === undefined ? {} : { proofPending: pending }),
      },
    },
  });
}
