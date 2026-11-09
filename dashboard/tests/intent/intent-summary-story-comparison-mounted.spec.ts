// Fast actual scope rendering and navigation; full-app acquisition remains separate.
import {
  test,
  expect,
  mountComparison,
} from "../support/comparisonMountPage.ts";
import {
  serveComparison,
  summaryScopeFacts,
} from "../support/comparisonScopeFacts.ts";
import { expectComparisonScopeRows } from "../intentScopeProofPage.ts";
import { drillComparisonChild } from "../support/selectDoneStoryForSummaryComparison.ts";
import {
  entryComparisonRows,
  folderComparisonRows,
  nestedComparisonRows,
  mergeEditedNestedComparisonRows,
} from "../support/summaryComparisonExpectedRows.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  comparisonLabels,
  expectEvidenceLabels,
  expectObservedNotAttributed,
  expectLabelInFull,
} from "../ciEvidenceLabelsPage.ts";
import {
  expectScopeRowCues,
  summaryEntryComparisonCues,
  summaryFolderComparisonCues,
} from "../support/expectCiComparisonCues.ts";

test("real Summary controls drill through precise endpoint rows into file Proof without another CI read", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  await drillComparisonChild(
    summary,
    "folder/",
    "dashboard/tests/folder",
    folderComparisonRows,
  );
  await drillComparisonChild(
    summary,
    "nested/",
    "dashboard/tests/folder/nested",
    nestedComparisonRows,
  );
  await summary.getByRole("button", { name: "c.spec.ts", exact: true }).click();
  const proof = page.getByRole("table", {
    name: "CI proof of dashboard/tests/folder/nested/c.spec.ts",
  });
  await expect(proof.locator("tbody tr")).toHaveText([
    "dashboard/tests/folder/nested/c.spec.ts1 test case (no change)340 ms+70 ms+70 ms",
  ]);
  expect(comparisonServices.comparisons).toBe(1);
  expect(comparisonServices.proofs).toBe(3);
});

test("Summary labels stay audible in browse mode and entry cues keep their independent count and duration meanings", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectEvidenceLabels(comparisonLabels(summary, facts.identity), [
    "Baseline No build aaaaaaa",
    "Branch bbbbbbb",
    "Landed ccccccc",
  ]);
  await expectObservedNotAttributed(summary);
  await expect(comparisonLabels(summary, facts.identity)).toMatchAriaSnapshot(`
    - list "CI timing comparison of SEED-A#a":
      - listitem:
        - text: Baseline No build
        - code: aaaaaaa
        - text: /, No build at [0-9a-f]{40}:\\sthe workflow at that revision could not be read\\./
      - listitem:
        - text: Branch
        - code: bbbbbbb
      - listitem:
        - text: Landed
        - code: ccccccc
  `);
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  await expectScopeRowCues(
    summary,
    "dashboard/tests",
    summaryEntryComparisonCues,
  );
});

test("folder Summary keeps unchanged and below-threshold cue reasons", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  await mountComparison(page, comparisonServer, {
    ...facts,
    scope: {
      ...facts.scope,
      selection: { path: "dashboard/tests/folder", scope: "folder" },
    },
  });
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests/folder",
    folderComparisonRows,
  );
  await expectScopeRowCues(
    summary,
    "dashboard/tests/folder",
    summaryFolderComparisonCues,
  );
});

test("a nested Summary marks a file changed only by its owning merge while keeping its precise comparison", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  await mountComparison(page, comparisonServer, {
    ...facts,
    scope: {
      ...facts.scope,
      changed: [
        ...facts.scope.changed,
        makeMe.aReviewedFile
          .with({
            kind: "modified",
            path: "dashboard/tests/folder/nested/c.spec.ts",
          })
          .please(),
      ],
      selection: { path: "dashboard/tests/folder/nested", scope: "folder" },
    },
  });
  await expectComparisonScopeRows(
    page.getByRole("region", { name: "Summary", exact: true }),
    "dashboard/tests/folder/nested",
    mergeEditedNestedComparisonRows,
  );
});

test("Summary names a skipped Baseline beside its ancestor and exposes its complete status on hover and to browse reading", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  const skippedAt =
    "Skipped at ddddddd because CI ignores every change since its nearest built ancestor aaaaaaa.";
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      baseline: {
        ...facts.answer.baseline,
        requestedStatus: { kind: "skipped", explanation: skippedAt },
      },
    })
    .please();
  serveComparison(comparisonServices, { ...facts, answer }, facts.entries);
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectLabelInFull(
    comparisonLabels(summary, facts.identity),
    "Baseline Skipped aaaaaaa",
    skippedAt,
  );
});
