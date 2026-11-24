// The Done story's dashboard/tests Summary and its scope history, read from a
// case's own retained history beside the Done comparison it keeps.
import { expect } from "vitest";
import { page, type Locator } from "vitest/browser";
import type { ScopeHistoryGlance } from "../../src/ciScopeHistory.ts";
import { comparisonIn } from "./intent-ci-scope-page.tsx";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { scopeHistoryIn } from "./intent-scope-history-page.ts";
import { openSummary } from "./intent-summary-proof-page.ts";
import {
  doneEntryComparisonRows,
  doneEntryOwnFigures,
  openDoneStoryComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

// The Done story's Summary for dashboard/tests and its scope history, which
// ANSWER answers for each read of the selected landing; on a phone when PHONE.
export async function openDoneScopeHistory(
  answer: (
    path: string,
    selectedRevision: string,
  ) => ScopeHistoryGlance | Promise<ScopeHistoryGlance>,
  { phone = false } = {},
) {
  await openDoneStoryComparison({
    review: () => Promise.resolve(publishedCompletion()),
    ci: {
      readScopeHistory: (...[, path, endpoint]) =>
        Promise.resolve(answer(path, endpoint.revision)),
    },
  });
  if (phone) await page.viewport(390, 844);
  await intentStoryCompare().chooseTab("Changes");
  const summary = await openSummary("dashboard/tests");
  return { summary, history: scopeHistoryIn(summary) };
}

// The dashboard/tests SUMMARY keeps the Done comparison's rows and own figures.
export function expectDoneEntryComparisonKept(summary: Locator) {
  const comparison = comparisonIn(summary);
  expect(
    comparison.rowsOf(
      "CI proof of the immediate folders and files of dashboard/tests",
    ),
  ).toEqual(doneEntryComparisonRows);
  expect(comparison.figuresOf("CI proof of dashboard/tests")).toEqual(
    doneEntryOwnFigures,
  );
}
