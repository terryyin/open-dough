import {
  ciProofReading,
  expectNoProofRows,
  expectProofRows,
} from "../../dashboard/test-support/intentCiProofPage.ts";
import { expectCiAnswer } from "../../dashboard/test-support/intentCiStatusPage.ts";
// Intent shows the retry's verdict and remembered CI proof. An attempt whose
// ID another discovered attempt shares at its revision shows why it is
// ambiguous, without requesting proof.
// Missing proof and recovery: ./intent-ci-proof-adapter.spec.ts.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { expectAttemptAt } from "../../dashboard/test-support/ciEvidenceLabelsPage.ts";
import {
  adapterProject,
  failed,
  openAdapterProof,
  passed,
  testsRow,
  testsSummary,
  verdict,
} from "../../dashboard/test-support/intentCiAdapterProofProject.ts";

import {
  login,
  repository,
} from "../../dashboard/test-support/intentCiStoryRecords.ts";

test("a retried adapter attempt shows the retry's verdict and proof, and Check again keeps that attempt's remembered summary", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  const discover = {
    main: [
      passed("r1", "2", login, "main", { time: "2026-10-01T01:00:00Z" }),
      failed("r1", "1", login, "main", { time: "2026-10-01T00:00:00Z" }),
    ],
  };
  adapter.answer({ discover, proof: testsSummary("2", login) });
  const { panel, proof } = await openAdapterProof(page);

  await expectCiAnswer(panel, verdict);
  await expectAttemptAt(proof, "Attempt 2", "4774f60");
  await expectProofRows(proof, [testsRow]);

  // A later adapter answer for another attempt is ignored: the valid summary
  // for this attempt is immutable and remembered for the process lifetime.
  adapter.answer({ discover, proof: testsSummary("1", login) });
  await panel.getByRole("button", { name: "Check again" }).click();
  await expectProofRows(proof, [testsRow]);
  await expect(ciProofReading(proof).unavailable).toHaveCount(0);
  await expectCiAnswer(panel, verdict);
  const asked = {
    operation: "proof",
    check: { repo: repository, branch: "main" },
    attempt: { runId: "r1", attemptId: "2", sha: login },
  };
  expect(adapter.proofRequests()).toEqual([asked]);
});

test("an adapter attempt whose attemptId another discovered attempt shares at its revision is ambiguous, and no adapter is asked its proof", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  const ambiguous =
    "This attempt is ambiguous at its revision: another discovered attempt is also attempt 1 at 4774f60.";
  const cases: readonly {
    readonly name: string;
    readonly main: readonly unknown[];
  }[] = [
    {
      // Different checks both keep their newest attempt.
      name: "different checks",
      main: [
        passed("r1", "1", login, "main", { check: "unit" }),
        passed("r2", "1", login, "main", { check: "lint" }),
      ],
    },
    {
      // Same check: only the newer run is retained for the verdict, but the
      // earlier run's same attemptId still makes the shown attempt ambiguous.
      name: "same check across runs",
      main: [
        passed("r2", "1", login, "main", {
          check: "unit",
          time: "2026-10-01T01:00:00Z",
        }),
        passed("r1", "1", login, "main", {
          check: "unit",
          time: "2026-10-01T00:00:00Z",
        }),
      ],
    },
  ];

  for (const { name, main } of cases) {
    await test.step(name, async () => {
      adapter.answer({
        discover: { main },
        proof: testsSummary("1", login),
      });
      const { panel, proof } = await openAdapterProof(page);

      await expectCiAnswer(panel, verdict);
      await expectAttemptAt(proof, "Attempt 1", "4774f60");
      await expect(ciProofReading(proof).unavailable).toHaveText([ambiguous]);
      await expectNoProofRows(proof);
      const discovers = adapter.discoverRequests().length;
      await panel.getByRole("button", { name: "Check again" }).click();
      await expect
        .poll(() => adapter.discoverRequests().length)
        .toBeGreaterThan(discovers);
      await expect(ciProofReading(proof).unavailable).toHaveText([ambiguous]);
      await expectCiAnswer(panel, verdict);
      expect(adapter.proofRequests()).toEqual([]);
    });
  }
});
