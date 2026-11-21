// Entry rows of the actual comparison (./intent-ci-comparison-page.ts): an
// expired proof explains the missing table, and missing or partial timings
// keep their exact gap rather than a false zero or cue.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountComparison } from "./intent-ci-comparison-page.ts";

test("expired entry proofs keep Branch and Landed wall times and explain absence of the table", async () => {
  const expired = makeMe.aCiProof.unavailable("expired").please();
  const comparison = await mountComparison(
    makeMe.aComparedStory
      .wallTimed()
      .withProofs(expired, expired, expired)
      .please(),
  );
  await expect
    .poll(() => comparison.entryEvidence())
    .toContain("This run's CI proof summary has expired.");
  expect(comparison.wallTimes().slice(1)).toEqual(["3 min 20 s", "4 min"]);
  await expect.element(comparison.entryTable).not.toBeInTheDocument();
});

test("entry rows retain counts, signed whole seconds and independent count and time cues", async () => {
  const comparison = await mountComparison(
    makeMe.aComparedStory.wallTimed().withMixedEntries().please(),
  );
  await expect
    .poll(() => comparison.entryRows())
    .toEqual([
      [
        "dashboard/tests",
        "2,090 → 2,092 test cases (+2)",
        "4 min",
        "+30 s",
        "+1 min",
      ],
      ["tests", "5 test files (no change)", "2 min", "−30 s", "−1 min"],
      ["src/skills", "added → 3 test files", "added", "30 s", "30 s"],
    ]);
  expect(comparison.entryRowCues()).toMatchObject([
    { count: "more-light", duration: "slower-light" },
    { count: "none", countReason: "unchanged", duration: "faster-strong" },
    {
      count: "none",
      countReason: "added",
      duration: "none",
      durationReason: "added",
    },
  ]);
});

test("no duration and an untimed part keep exact accessible gap explanations instead of zero", async () => {
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
  const comparison = await mountComparison(
    makeMe.aComparedStory
      .wallTimed()
      .withMixedEntries()
      .withEntriesAt("baseline", [
        makeMe.aCiProofEntry.at("dashboard/tests").counting(2090).please(),
        partial,
      ])
      .please(),
  );
  await expect
    .poll(() => comparison.entryRows())
    .toEqual([
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
  const baseline = (row: number) =>
    comparison.entryTable
      .getByRole("row")
      .nth(row + 1)
      .getByRole("cell")
      .nth(1);
  await expect
    .element(baseline(0))
    .toHaveAccessibleDescription(
      "Not recorded: this summary has no test execution durations",
    );
  await expect
    .element(baseline(1))
    .toHaveAccessibleDescription("Partial: part 2 of 2 has no duration");
  await expect
    .element(baseline(1))
    .toHaveAttribute("title", "Partial: part 2 of 2 has no duration");
});
