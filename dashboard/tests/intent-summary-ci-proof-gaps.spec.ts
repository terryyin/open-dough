// A selected Intent entry's or folder's Summary when CI's evidence is
// missing, partial or absent (../src/IntentScopeProof.tsx,
// ../src/ciScopeProof.ts, ./intentSummaryCiProofFixtures.ts): a missing
// shard and a shard without a file breakdown keep the entry's totals and
// leave every child partial, an entry-only summary labels the child
// breakdown unavailable, and a run without a summary keeps the children for
// drilling down, saying why as the homepage does. Complete evidence:
// ./intent-summary-ci-proof.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { proofOf, run } from "./intentCiProofPage.ts";
import { childName, expectScopeRows } from "./intentScopeProofPage.ts";
import {
  bothEntriesSummary,
  openIntent,
  openSummary,
} from "./intentSummaryCiProofFixtures.ts";
import { runArtifactsAnswer } from "./support/ciProofArtifacts.ts";
import {
  collectedSummary,
  playwrightRecord,
  summaryTextZipAnswer,
} from "./support/ciProofCollected.ts";

test.setTimeout(90_000);

const missing = "part 3 of 3 missing";
const noBreakdown = "part 2 of 3 has no file breakdown";
const mixedParts = `2 of 3 parts present; ${missing}; ${noBreakdown}`;

test("a missing shard and a shard without a file breakdown keep the entry's totals and leave every child partial", async ({
  page,
}) => {
  const text = collectedSummary(
    run,
    [["dashboard/tests", 3]],
    [
      {
        entries: ["dashboard/tests"],
        part: 1,
        of: 3,
        byFile: true,
        record: playwrightRecord([
          ["dashboard/tests/folder/a.spec.ts", "expected", [300]],
        ]),
      },
      {
        entries: ["dashboard/tests"],
        part: 2,
        of: 3,
        byFile: false,
        record: playwrightRecord([
          ["dashboard/tests/folder/b.spec.ts", "expected", [100]],
        ]),
      },
    ],
  );
  const { intent } = await openIntent(page, () => summaryTextZipAnswer(text));
  const summary = await openSummary(intent, "dashboard/tests");
  await expectScopeRows(summary, "dashboard/tests", [
    [
      "dashboard/tests",
      "2 passed tests",
      `partial: ${missing}`,
      `2 of 3 parts present; ${missing}`,
    ],
    [
      "folder/",
      "1 passed tests",
      `partial: ${missing} and ${noBreakdown}`,
      mixedParts,
    ],
    ["added.spec.ts", "no CI result", "no CI result", mixedParts],
    ["root.spec.ts", "no CI result", "no CI result", mixedParts],
  ]);
  await expect(summary.locator(".intent-summary-outside")).toHaveText(
    "The figures of dashboard/tests include what no folder or file row shows: part 2 of 3, which published no file breakdown.",
  );
});

test("an entry-only summary keeps entry totals and labels the child breakdown unavailable", async ({
  page,
}) => {
  const text = bothEntriesSummary(false);
  expect(text).not.toContain('"files"');
  const { intent } = await openIntent(page, () => summaryTextZipAnswer(text));
  const summary = await openSummary(intent, "tests");
  await expect(summary.locator(".intent-summary-breakdown-absent")).toHaveText(
    "Child breakdown unavailable: this CI proof summary does not break tests down by file.",
  );
  await expectScopeRows(summary, "tests", [
    ["tests", "2 passed checks", "3.0 s", "1 of 1 part present"],
    [
      "root.sh",
      "no file breakdown",
      "no file breakdown",
      "1 of 1 part present; part 1 of 1 has no file breakdown",
    ],
  ]);
  await childName(summary, "root.sh").click();
  await expect(intent.getByLabel("tests/root.sh source")).toBeVisible();
});

test("a run without a CI proof summary keeps the Summary's children for drilling down and says why, as the homepage does", async ({
  page,
}) => {
  const { intent, home } = await openIntent(
    page,
    () => summaryTextZipAnswer("{}"),
    () => runArtifactsAnswer(run, undefined),
  );
  await expect(proofOf(home)).toContainText(
    "This run published no CI proof summary.",
  );
  const summary = await openSummary(intent, "dashboard/tests");
  await expect(summary.locator(".intent-summary-evidence-absent")).toHaveText(
    "This run published no CI proof summary.",
  );
  const none = "no CI proof";
  await expectScopeRows(summary, "dashboard/tests", [
    ["dashboard/tests", none, none, none],
    ["folder/", none, none, none],
    ["added.spec.ts", none, none, none],
    ["root.spec.ts", none, none, none],
  ]);
  await childName(summary, "folder/").click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    "dashboard/tests/folder",
  );
});
