// A selected Intent entry's Summary when Intent's CI judgment is previously
// retrieved, not newly verified (../../src/IntentScopeEvidence.tsx,
// ../../src/IntentCiJudgedBranch.tsx, ../intentSummaryCiProofFixtures.ts): after
// a failed refresh the Summary says when its judgment was retrieved and shows
// the failure in the homepage's own words. The Summary's journey:
// ./intent-summary-ci-proof.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { httpErrorAnswer } from "../originAnswers.ts";
import { activateIntentHome } from "../intentCiStatusPage.ts";
import { expectProofRows, proofOf } from "../intentCiProofPage.ts";
import { evidenceLine } from "../intentScopeProofPage.ts";
import {
  allParts,
  ancestorEvidence,
  bothEntriesSummary,
  openIntent,
  openSummary,
} from "../intentSummaryCiProofFixtures.ts";
import { summaryTextZipAnswer } from "../support/ciProofCollected.ts";

test("a Summary qualifies a previously retrieved judgment and its failed refresh as the homepage does", async ({
  page,
}) => {
  const text = bothEntriesSummary(true);
  const { project, ci, intent, home } = await openIntent(page, () =>
    summaryTextZipAnswer(text),
  );
  await expectProofRows(proofOf(home), [
    [
      "dashboard/tests",
      "5 passed, 1 failed and 1 other tests",
      "partial: 1 test without a duration",
      allParts,
    ],
    ["tests", "2 passed checks", "3.0 s", "1 of 1 part present"],
  ]);
  await expect(home.getByRole("status")).toContainText("Checked at");
  const freshSummary = await openSummary(intent, "tests");
  await expect(evidenceLine(freshSummary)).toHaveText(ancestorEvidence);
  await expect(freshSummary.locator(".intent-summary-kept")).toHaveCount(0);
  await expect(freshSummary.getByRole("alert")).toHaveCount(0);

  await activateIntentHome(intent);
  project.serveCi((call) =>
    call.request.kind === "commit-list" && call.request.revision === "main"
      ? httpErrorAnswer(503, "Service Unavailable")
      : ci(call),
  );
  await home.getByRole("button", { name: "Check again" }).click();
  await expect(home.getByRole("alert")).toContainText("503");
  await expect(home.getByRole("button", { name: "Check again" })).toBeEnabled();
  const kept = (await home.getByRole("status").textContent()) ?? "";
  expect(kept).toMatch(/^Previously retrieved at .+\.$/);
  const keptAt = await home.locator("time").getAttribute("datetime");
  const failure = (await home.getByRole("alert").textContent()) ?? "";

  const summary = await openSummary(intent, "tests");
  await expect(summary.locator(".intent-summary-kept")).toHaveText(kept);
  await expect(summary.locator(".intent-summary-kept time")).toHaveAttribute(
    "datetime",
    keptAt ?? "",
  );
  await expect(summary.getByRole("alert")).toHaveText(failure);
  await expect(evidenceLine(summary)).toHaveText(ancestorEvidence);
});
