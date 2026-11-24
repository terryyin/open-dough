// The collector's own summary bytes (../../test-support/support/ciProofCollected.ts)
// survive the run artifact's ZIP and `ciProofArtifactReader`
// (../../server/ciProofArtifact.ts): a declared part no runner reported stays
// missing and a result without a duration stays untimed. Listing/download
// counts and attempt memory: ./ci-proof-memory-github*.spec.ts.

import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { ciProofArtifactReader } from "../../server/ciProofArtifact.ts";
import { collectedSummary } from "../../test-support/support/ciProofCollected.ts";
import { zipOf } from "../../test-support/support/ciProofArtifacts.ts";

const repository = "example/project";
const revision = "a".repeat(40);
const run = makeMe.aCiProofRun
  .with({ runId: 1, runAttempt: 1, revision })
  .please();

test("collected summary bytes keep a missing part and an untimed result through the artifact ZIP", async () => {
  const summary = collectedSummary(
    {
      repository,
      runId: run.runId,
      attempt: run.runAttempt,
      revision: run.revision,
    },
    [{ entry: "tests", parts: 2, unit: "case" }],
    [
      {
        entries: ["tests"],
        part: 1,
        of: 2,
        byFile: true,
        unit: "case",
        outcomes: "passed\ttests/a.test.mjs\npassed\ttests/b.test.mjs\n",
        times: "2.5\ttests/a.test.mjs\n",
      },
    ],
  );
  const listing = vi.fn().mockResolvedValue({
    artifacts: [
      makeMe.aCiProofArtifact
        .with({
          id: 41,
          runId: run.runId,
          runAttempt: run.runAttempt,
          revision: run.revision,
        })
        .please(),
    ],
  });
  const archive = vi
    .fn()
    .mockResolvedValue(zipOf("ci-proof-summary.json", summary));
  const reader = ciProofArtifactReader({ listing, archive });

  const proof = await reader(repository, run, new AbortController().signal);

  expect(proof).toMatchObject({
    kind: "summary",
    summary: {
      entries: [
        {
          path: "tests",
          evidence: [
            {
              unit: "case",
              passed: 2,
              untimed: 1,
              parts: [
                { part: 1, status: "present", passed: 2, untimed: 1 },
                { part: 2, status: "missing" },
              ],
            },
          ],
        },
      ],
    },
  });
});
