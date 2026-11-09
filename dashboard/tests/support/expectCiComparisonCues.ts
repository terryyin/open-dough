// Assert Intent CI comparison cue state on overall summary lines, a Summary's
// own figures and table rows (../../src/ciScopeComparisonCuePresentation.ts,
// ../../src/IntentScopeFigures.tsx, ../../src/CiProofTable.tsx).

import { expect, type Locator } from "@playwright/test";
import { scopeFigures, scopeTable } from "../intentScopeProofPage.ts";

export type ExpectedCues = {
  readonly count?: string;
  readonly duration?: string;
  readonly countReason?: string;
  readonly durationReason?: string;
};

export const summaryEntryComparisonCues = [
  { count: "more-light", duration: "slower-strong" },
  {
    count: "none",
    duration: "slower-light",
    countReason: "unchanged",
  },
  {
    count: "none",
    duration: "none",
    countReason: "added",
    durationReason: "added",
  },
  {
    count: "none",
    duration: "none",
    countReason: "removed",
    durationReason: "removed",
  },
  // Renamed from a shell check's test file into a Playwright test case.
  {
    count: "none",
    duration: "none",
    countReason: "units not comparable",
    durationReason: "units not comparable",
  },
  {
    count: "none",
    duration: "none",
    countReason: "unchanged",
    durationReason: "unchanged",
  },
] as const;

export const summaryFolderComparisonCues = [
  {
    count: "none",
    duration: "slower-light",
    countReason: "unchanged",
  },
  {
    count: "none",
    duration: "none",
    countReason: "unchanged",
    durationReason: "below threshold",
  },
  {
    count: "none",
    duration: "slower-light",
    countReason: "unchanged",
  },
] as const;

export async function expectCueState(target: Locator, expected: ExpectedCues) {
  if (expected.count !== undefined) {
    await expect(target).toHaveAttribute("data-ci-count-cue", expected.count);
  }
  if (expected.duration !== undefined) {
    await expect(target).toHaveAttribute(
      "data-ci-duration-cue",
      expected.duration,
    );
  }
  if (expected.countReason !== undefined) {
    await expect(target).toHaveAttribute(
      "data-ci-count-cue-reason",
      expected.countReason,
    );
  }
  if (expected.durationReason !== undefined) {
    await expect(target).toHaveAttribute(
      "data-ci-duration-cue-reason",
      expected.durationReason,
    );
  }
}

export async function expectEntryRowCues(
  panel: Locator,
  rows: readonly ExpectedCues[],
) {
  const table = panel.getByRole("table", {
    name: "CI entry timing comparison",
  });
  const body = table.locator("tbody").getByRole("row");
  await expect(body).toHaveCount(rows.length);
  for (const [at, cues] of rows.entries()) {
    await expectCueState(body.nth(at), cues);
  }
}

// PATH's own figures carry the first of CUES, its table rows the rest.
export async function expectScopeRowCues(
  summary: Locator,
  path: string,
  [own, ...rows]: readonly ExpectedCues[],
) {
  if (own === undefined) throw new Error(`no own cues of ${path}`);
  await expectCueState(scopeFigures(summary, path), own);
  const body = scopeTable(summary, path).locator("tbody").getByRole("row");
  await expect(body).toHaveCount(rows.length);
  for (const [at, cues] of rows.entries()) {
    await expectCueState(body.nth(at), cues);
  }
}

export async function expectProofRowCues(
  proof: Locator,
  path: string,
  cues: ExpectedCues,
) {
  const table = proof.getByRole("table", { name: `CI proof of ${path}` });
  const row = table.locator("tbody").getByRole("row").first();
  await expectCueState(row, cues);
}
