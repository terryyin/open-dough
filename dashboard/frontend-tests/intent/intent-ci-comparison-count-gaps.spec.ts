// Count eligibility reaches overall Counts, entry rows, Summary, file Proof
// and the tree's accessible evidence: a partial or ambiguous Baseline part
// keeps its exact gap reason and claims no case difference, while complete
// test files alone supply the cue. Endpoint and unit rule variants are
// intent-ci-comparison-gaps.spec.ts's and
// intent-summary-story-comparison-gaps.spec.ts's.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  aSpec,
  entry,
  folder,
} from "../../test-support/support/ciComparisonUnitsJourney.ts";
import { cueOf, mountComparison } from "./intent-ci-comparison-page.ts";
import { mountCiScope, scopeReadsOf } from "./intent-ci-scope-page.tsx";

// The decisive case gap belongs to Baseline; complete files remain independent.
function countedEntry(
  aCount: number,
  fileCount: number,
  status?: "missing" | "ambiguous",
) {
  return makeMe.aCiProofEntry
    .at(entry)
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown(
          { path: aSpec, passed: aCount, durationMs: 30_000 },
          { path: `${entry}/root.spec.ts`, passed: 2, durationMs: 10_000 },
        )
        .inParts(status ? 2 : 1, status ? { [status]: [2] } : {})
        .please(),
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown({ path: aSpec, passed: fileCount, durationMs: 7_000 })
        .please(),
    )
    .please();
}

const ambiguousStory = () =>
  makeMe.aComparedStory
    .inSummaryScope()
    .withEntries([
      [countedEntry(3, 1, "ambiguous")],
      [countedEntry(4, 1)],
      [countedEntry(5, 1)],
    ]);
const ambiguous = "part 2 of 2 ambiguous; count difference unavailable";
const caseCounts = `3 test cases (${ambiguous}) → 4 test cases → 5 test cases`;
const partial = { count: "none", countReason: "partial" };

test("partial case observations retain their gap in overall Counts and entry rows while complete files alone supply the cue", async () => {
  const comparison = await mountComparison(
    makeMe.aComparedStory
      .withEntries([
        [countedEntry(3, 1, "missing")],
        [countedEntry(4, 2)],
        [countedEntry(5, 2)],
      ])
      .please(),
  );
  await expect
    .poll(() => comparison.entryRows().map((row) => row[1]))
    .toEqual([
      "5 test cases (part 2 of 2 missing; count difference unavailable) → 6 test cases → 7 test cases",
      "1 → 2 test files (+1)",
    ]);
  expect(comparison.entryRowCues()).toMatchObject([
    partial,
    { count: "more-strong" },
  ]);
  const [overall = ""] = comparison.overallCounts();
  expect(overall).toContain(
    "5 test cases (dashboard/tests: part 2 of 2 missing; count difference unavailable) → 7 test cases",
  );
  expect(overall).toContain("1 → 2 test files (+1)");
  expect(overall).not.toContain("(+2)");
  expect(comparison.overallCountsCues()).toMatchObject([
    { count: "more-strong" },
  ]);
  expect(comparison.entryRows()[0]).toContain("Part 2 missing");
});

test("ambiguous Baseline parts keep count claims out of Summary and the tree's visible and accessible evidence", async () => {
  const facts = ambiguousStory().please();
  const scope = await mountCiScope(facts, scopeReadsOf(facts).source);
  const own = (path: string) =>
    scope.summary.region.getByRole("group", {
      name: `CI proof of ${path}: test cases`,
      exact: true,
    });
  await expect
    .poll(() => scope.summary.figuresOf(`CI proof of ${entry}: test cases`)[0])
    .toBe(`5 test cases (${ambiguous}) → 6 test cases → 7 test cases`);
  expect(cueOf(own(entry).element())).toMatchObject(partial);
  await expect
    .element(own(entry).getByTitle("Partial: part 2 of 2 ambiguous"))
    .toBeVisible();
  await expect
    .element(scope.summary.cell(entry, "folder/", "Counts"))
    .toHaveTextContent(caseCounts);

  const tree = page.getByRole("navigation", { name: "Intent files" });
  const location = tree.getByRole("button", { name: /^dashboard\/tests, / });
  await expect
    .element(location)
    .toHaveAccessibleName(new RegExp(ambiguous.replace(/[()]/g, "\\$&")));
  // The location header holds its name.
  const header = location.element().parentElement;
  expect(header && cueOf(header).count).toBe("none");
  await tree.getByRole("button", { name: "Expand folder" }).click();
  const file = tree.getByRole("button", {
    name: /^Modified dashboard\/tests\/folder\/a\.spec\.ts/,
  });
  await expect
    .element(file)
    .toHaveAccessibleName(new RegExp(caseCounts.replace(/[()]/g, "\\$&")));
  expect(cueOf(file.element()).count).toBe("none");

  await tree.getByRole("button", { name: /^folder\b/ }).click();
  await expect
    .poll(() => scope.summary.figuresOf(`CI proof of ${folder}: test cases`)[0])
    .toBe(caseCounts);
  expect(cueOf(own(folder).element())).toMatchObject(partial);
  expect(
    scope.summary
      .rowsOf(`CI proof of the immediate folders and files of ${folder}`)
      .map((row) => row[2]),
  ).toContain(caseCounts);
});

test("ambiguous Baseline parts keep count claims out of the changed file's Proof", async () => {
  const facts = ambiguousStory().selecting(aSpec, "file").please();
  const scope = await mountCiScope(facts, scopeReadsOf(facts).source);
  const caseRow = scope.proof.region
    .getByRole("table", { name: `CI proof of ${aSpec}`, exact: true })
    .getByRole("row")
    .nth(1);
  await expect
    .element(caseRow.getByRole("cell").first())
    .toHaveTextContent(caseCounts);
  expect(cueOf(caseRow.element())).toMatchObject(partial);
  await expect
    .element(caseRow.getByText("Part 2 ambiguous", { exact: true }))
    .toBeVisible();
});
