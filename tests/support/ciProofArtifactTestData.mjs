// @ts-check
// One GitHub Actions artifact listed for a run's proof-summary attempt.
import { summaryArtifactName } from "../../src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs";

export class CiProofArtifactBuilder {
  /** @param {{ id: number, runId: number, runAttempt: number, revision?: string, expired?: boolean, size_in_bytes?: number }} facts */
  with({
    id,
    runId,
    runAttempt,
    revision,
    expired = false,
    size_in_bytes = 512,
  }) {
    return {
      please: () => ({
        id,
        name: summaryArtifactName(runAttempt),
        size_in_bytes,
        expired,
        workflow_run: {
          id: runId,
          ...(revision === undefined ? {} : { head_sha: revision }),
        },
      }),
    };
  }
}
