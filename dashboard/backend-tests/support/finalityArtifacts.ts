// Count raw artifact operations while preserving the production reader's
// private unanswered brand and immutable valid-summary memory.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { ciProofArtifactReader } from "../../server/ciProofArtifact.ts";
import { comparisonProject } from "./comparisonRead.ts";
import type { ComparisonBuildSource } from "../../server/comparisonBuildSource.ts";
import type { representedFinalityFacts } from "./finalityComparisonFacts.ts";

export function finalityArtifacts(
  facts: ReturnType<typeof representedFinalityFacts>,
  reads: NonNullable<Parameters<typeof ciProofArtifactReader>[0]>,
) {
  let lists = 0;
  let downloads = 0;
  const reader = ciProofArtifactReader({
    listing(...args) {
      lists += 1;
      return reads.listing(...args);
    },
    archive(...args) {
      downloads += 1;
      return reads.archive(...args);
    },
  });
  const proofReader: ComparisonBuildSource["proofOf"] = (run) =>
    run.runId === 201
      ? reader(comparisonProject.repository, run, new AbortController().signal)
      : Promise.resolve(
          facts.proofs[run.runId] ??
            makeMe.aCiProof.unavailable("none").please(),
        );
  return { proofReader, asked: () => [lists, downloads] };
}
