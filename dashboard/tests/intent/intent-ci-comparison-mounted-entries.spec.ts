// The actual comparison renders prepared canonical proof answers.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  test,
  expect,
  mountComparison,
} from "../support/comparisonMountPage.ts";
import { serveComparison } from "../support/comparisonScopeFacts.ts";
import {
  mixedEntryFacts,
  wallComparedFacts,
} from "../support/mountedComparisonFacts.ts";
import {
  expectCiComparisonEntryRows,
  comparedStoryEntryRows,
  comparedStoryEntryCues,
} from "../support/expectCiComparisonEntryRows.ts";
import { expectEntryRowCues } from "../support/expectCiComparisonCues.ts";

test("expired entry proofs keep Branch and Landed wall times and explain absence of the table", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = wallComparedFacts();
  Object.assign(comparisonServices, {
    comparison: () => ({ json: facts.answer }),
    proof: (params: URLSearchParams) => ({
      json: {
        ...facts.proof(Number(params.get("run"))),
        proof: makeMe.aCiProof.unavailable("expired").please(),
      },
    }),
  });
  const panel = await mountComparison(page, comparisonServer, facts);
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "3 min 20 s",
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "4 min",
  );
  await expect(panel.locator(".intent-ci-comparison-entries")).toContainText(
    "This run's CI proof summary has expired.",
  );
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toHaveCount(0);
});

test("entry rows retain counts, signed whole seconds and independent count and time cues", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = wallComparedFacts();
  serveComparison(comparisonServices, facts, mixedEntryFacts());
  const panel = await mountComparison(page, comparisonServer, facts);
  await expectCiComparisonEntryRows(panel, comparedStoryEntryRows);
  await expectEntryRowCues(panel, comparedStoryEntryCues);
});

test("no duration and an untimed part keep exact accessible gap explanations instead of zero", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = wallComparedFacts();
  const entries = mixedEntryFacts();
  const partial = makeMe.aCiProofEntry
    .at("tests")
    .holding({
      ...makeMe.aCiProofEvidence
        .inUnit("file")
        .counting(5)
        .timed(100_000)
        .please(),
      parts: [
        {
          part: 1,
          status: "present",
          passed: 3,
          failed: 0,
          other: 0,
          durationMs: 100_000,
        },
        { part: 2, status: "present", passed: 2, failed: 0, other: 0 },
      ],
    })
    .please();
  entries[0] = [
    makeMe.aCiProofEntry.at("dashboard/tests").counting(2090).please(),
    partial,
  ];
  serveComparison(comparisonServices, facts, entries);
  const panel = await mountComparison(page, comparisonServer, facts);
  await expectCiComparisonEntryRows(panel, [
    [
      "dashboard/tests",
      "2,090 → 2,092 test cases (+2)",
      "No timings",
      "4 min 30 s",
      "5 min",
    ],
    [
      "tests",
      "5 test files (no change)",
      "Part 2 untimed",
      "1 min 30 s",
      "1 min",
    ],
    ["src/skills", "added → 3 test files", "added", "30 s", "30 s"],
  ]);
  const cells = panel
    .getByRole("table", { name: "CI entry timing comparison" })
    .locator("tbody tr");
  await expect(
    cells.nth(0).getByRole("cell").nth(1),
  ).toHaveAccessibleDescription(
    "Not recorded: this summary has no test execution durations",
  );
  const untimed = cells.nth(1).getByRole("cell").nth(1);
  await expect(untimed).toHaveAccessibleDescription(
    "Partial: part 2 of 2 has no duration",
  );
  await expect(untimed).toHaveAttribute(
    "title",
    "Partial: part 2 of 2 has no duration",
  );
});
