import {
  ciProofReading,
  artifactId,
  ciEntryName,
  expectProofRows,
  failedVerdict,
  openFailedRun,
  openCiEntry,
  proofCalls,
  proofTable,
  run,
} from "../intentCiProofPage.ts";
import { expectCiAnswer, judged, runUrl } from "../intentCiStatusPage.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
// The CI proof of the run Intent's CI status tab shows a result of
// (../../src/IntentCiProof.tsx): after the judgment, which reads as it always
// has, Proof names that run once as short labels -- its linked run and attempt,
// revision and CI wall time -- then a table with one row per entry the run's CI
// declared, in its order, read cell by cell under the Entry, Counts, Test
// execution time headers (unit and any timing gap). The summary is
// the collector's own, served as a real zip from the run's artifact download
// through the controlled `gh` (../support/ciProofArtifacts.ts). Each other
// reason no proof can be shown, a running result's ancestor proof and the
// per-attempt memory: ../../../e2e/intent/intent-ci-proof-reasons.spec.ts. Query-shape refusals
// of `parseIntentCiProofRead`:
// ../../../tests/support/dashboard-ci-proof-parse.test.mjs.

import { expect, test } from "../dashboardTest.ts";

import {
  expectAttemptAt,
  expectAttemptLinked,
} from "../ciEvidenceLabelsPage.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import {
  proofSummaryForEntries,
  runArtifactsAnswer,
  summaryZipAnswer,
} from "../support/ciProofArtifacts.ts";
import { parts } from "../dashboardPage.ts";
import {
  intentLocationName,
  intentReadingPane,
} from "../intentPerspectivePage.ts";
import { summaryRegion } from "../intentScopeProofPage.ts";

const notRecorded = "No timings";

test("a failed run with a summary shows Failed as before, then Proof of that run's revision, link and attempt with each entry's counts and timing", async ({
  page,
}) => {
  const summary = proofSummaryForEntries(run, [
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .counting(12, 0, 0)
          .inParts(2)
          .withPresentPart(2, { passed: 7, failed: 1, other: 0, untimed: 0 })
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry.at("tests").counting(5, "file").please(),
    makeMe.aCiProofEntry.at("retired-tests").counting(1, "file").please(),
  ]);
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const { published, panel, proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    async () => {
      await held;
      return summaryZipAnswer(summary);
    },
  );

  await test.step("the verdict is shown while Proof is still being read", async () => {
    await expectCiAnswer(panel, failedVerdict);
    await expect(proof).toContainText("Checking the CI proof of this run…");
    await expect(
      panel.locator(".intent-ci-state ~ .intent-ci-proof"),
    ).toBeVisible();
    release();
  });

  await test.step("Proof names the run once, then one row per declared entry", async () => {
    await expectAttemptAt(proof, "Run 41 · attempt 1", "a1b2c3d");
    await expectAttemptLinked(proof, "Run 41 · attempt 1", runUrl);
    await expectProofRows(proof, [
      ["dashboard/tests", "19 passed and 1 failed test cases", notRecorded],
      ["tests", "5 passed test files", notRecorded],
      ["retired-tests", "1 passed test file", notRecorded],
    ]);
    await expectCiAnswer(panel, failedVerdict);
  });

  await test.step("Proof was read for that run's attempt by its artifact name, then one download", () => {
    expect(proofCalls(published.requests)).toEqual([
      "artifacts of run 41: ci-proof-summary-attempt-1",
      `zip ${String(artifactId)}`,
    ]);
  });

  await test.step("a configured entry opens its directory Summary; historical-only entries have no dead link", async () => {
    await expect(ciEntryName(proof, "retired-tests")).toHaveCount(0);
    await openCiEntry(proof, "dashboard/tests");
    const { intent } = parts(page);
    await expect(
      summaryRegion(intent).locator(".intent-summary-path"),
    ).toHaveText("dashboard/tests");
    await expect(intentLocationName(intent, "dashboard/tests")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(intentReadingPane(intent)).toBeFocused();
  });
});

test("a missing part is shown as a gap and its counts are not counted", async ({
  page,
}) => {
  const evidence = makeMe.aCiProofEvidence
    .inUnit("case")
    .counting(10)
    .inParts(12, { missing: [4] });
  for (const part of [2, 3, 5, 6, 7, 8, 9, 10, 11, 12])
    evidence.withPresentPart(part, { passed: 10, untimed: 0 });
  const summary = proofSummaryForEntries(run, [
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .holding(evidence.please())
      .please(),
  ]);
  const { proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer(summary),
  );
  await expectProofRows(proof, [
    ["dashboard/tests", "110 passed test cases", "Part 4 missing"],
  ]);
  await expect(
    proofTable(proof).getByRole("cell", { name: "Part 4 missing" }),
  ).toHaveAccessibleDescription("Partial: part 4 of 12 missing");
});

test("a CI proof query that omits the attempt is refused before asking GitHub", async ({
  page,
}) => {
  const { published, proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, undefined),
    () => ({ status: 404, contentType: "application/json", body: "{}" }),
  );
  // The page's own proof read has settled before any is counted.
  await expect(ciProofReading(proof).unavailable).toBeVisible();
  const before = published.requests.length;
  const answer = await page.evaluate(async (url) => {
    const response = await fetch(url);
    return {
      status: response.status,
      body: (await response.json()) as unknown,
    };
  }, `${authenticatedReadEndpoint}?source=open-dough&intent=ci-proof&run=41&revision=${judged}`);
  expect(answer.status).toBe(400);
  expect(published.requests.length).toBe(before);
});
