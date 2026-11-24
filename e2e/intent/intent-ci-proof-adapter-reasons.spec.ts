import {
  ciProofReading,
  expectNoProofRows,
} from "../../dashboard/test-support/intentCiProofPage.ts";
import { expectCiAnswer } from "../../dashboard/test-support/intentCiStatusPage.ts";
// When another discovered attempt shares the attempt ID at its revision,
// Intent explains the ambiguity and makes no proof request.
// Missing proof and recovery: ./intent-ci-proof-adapter.spec.ts.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { expectAttemptAt } from "../../dashboard/test-support/ciEvidenceLabelsPage.ts";
import {
  adapterProject,
  openAdapterProof,
  passed,
  testsSummary,
  verdict,
} from "../../dashboard/test-support/intentCiAdapterProofProject.ts";

import { login } from "../../dashboard/test-support/intentCiStoryRecords.ts";

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
