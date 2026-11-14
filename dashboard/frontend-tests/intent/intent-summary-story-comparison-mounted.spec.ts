// Actual scope projections; live navigation and full-app acquisition stay separate.
import { test, expect } from "../../tests/support/pageTest.ts";
import { renderComparison } from "../../tests/support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../../tests/support/comparisonRenderFacts.ts";
import { summaryScopeFacts } from "../../tests/support/comparisonScopeFacts.ts";
import { expectComparisonScopeRows } from "../../tests/intentScopeProofPage.ts";
import {
  entryComparisonRows,
  folderComparisonRows,
  nestedComparisonRows,
  mergeEditedNestedComparisonRows,
} from "../../tests/support/summaryComparisonExpectedRows.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  comparisonLabels,
  expectEvidenceLabels,
  expectObservedNotAttributed,
  expectLabelInFull,
} from "../../tests/ciEvidenceLabelsPage.ts";
import {
  expectScopeRowCues,
  summaryEntryComparisonCues,
  summaryFolderComparisonCues,
} from "../../tests/support/expectCiComparisonCues.ts";

test("nested Summary renders precise endpoint rows for unchanged c.spec.ts", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: {
      ...facts.scope,
      selection: { path: "dashboard/tests/folder/nested", scope: "folder" },
    },
  });
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    "dashboard/tests/folder/nested",
  );
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests/folder/nested",
    nestedComparisonRows,
  );
});

test("file Proof renders precise endpoint rows for unchanged c.spec.ts", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: {
      ...facts.scope,
      selection: {
        path: "dashboard/tests/folder/nested/c.spec.ts",
        scope: "file",
      },
    },
  });
  const proof = page.getByRole("table", {
    name: "CI proof of dashboard/tests/folder/nested/c.spec.ts",
  });
  await expect(proof.locator("tbody tr")).toHaveText([
    "dashboard/tests/folder/nested/c.spec.ts1 test case (no change)340 ms+70 ms+70 ms",
  ]);
});

test("Summary labels stay audible in browse mode and entry cues keep their independent count and duration meanings", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, rendered);
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
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: {
      ...facts.scope,
      selection: { path: "dashboard/tests/folder", scope: "folder" },
    },
  });
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    "dashboard/tests/folder",
  );
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
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
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
  comparisonRenderer,
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
  const rendered = comparisonRenderFacts({ ...facts, answer }, facts.entries);
  await renderComparison(page, comparisonRenderer, rendered);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectLabelInFull(
    comparisonLabels(summary, facts.identity),
    "Baseline Skipped aaaaaaa",
    skippedAt,
  );
});
