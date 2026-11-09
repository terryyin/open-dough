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

const cueStates = (targets: Locator) =>
  targets.evaluateAll((nodes) =>
    nodes.map((node) => ({
      count: node.getAttribute("data-ci-count-cue"),
      duration: node.getAttribute("data-ci-duration-cue"),
      countReason: node.getAttribute("data-ci-count-cue-reason"),
      durationReason: node.getAttribute("data-ci-duration-cue-reason"),
    })),
  );

export async function expectCueState(target: Locator, expected: ExpectedCues) {
  await target.waitFor({ state: "attached" });
  await expect.poll(() => cueStates(target)).toMatchObject([expected]);
}

export async function expectEntryRowCues(
  panel: Locator,
  rows: readonly ExpectedCues[],
) {
  const table = panel.getByRole("table", {
    name: "CI entry timing comparison",
  });
  const body = table.locator("tbody").getByRole("row");
  if (rows.length > 0) await body.first().waitFor({ state: "attached" });
  await expect.poll(() => cueStates(body)).toMatchObject([...rows]);
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
  if (rows.length > 0) await body.first().waitFor({ state: "attached" });
  await expect.poll(() => cueStates(body)).toMatchObject([...rows]);
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
