import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { CiProofEntry } from "../../src/ciProof.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";

const entryPath = "dashboard/tests";
const filePath = `${entryPath}/folder/a.spec.ts`;
const start = "1".repeat(40);
const end = "2".repeat(40);
const run = makeMe.aReviewRun.keyed("capture").comparing(start, end).please();
const selectedBaseline = {
  revision: "6".repeat(40),
  runId: 71,
  runAttempt: 2,
};
const selectedEnd = { revision: end, runId: 72, runAttempt: 3 };
const builds = makeMe.aComparedStory
  .withBaseline(selectedBaseline)
  .withLanded(selectedEnd)
  .please().answer;
const missingBaseline =
  "No completed CI build was found at or before the selected start.";
const missingSelection = "No completed CI build includes the selected changes.";

function entryFor(count: number, unit: "case" | "file" = "case") {
  return makeMe.aCiProofEntry
    .at(entryPath)
    .counting(count, unit)
    .withFile(filePath, { passed: count, durationMs: count * 100 })
    .please();
}

async function openCapturedRun({
  baseline = entryFor(1),
  selection = entryFor(9),
  noBuild,
}: {
  baseline?: CiProofEntry;
  selection?: CiProofEntry;
  noBuild?: "baseline" | "selection";
} = {}) {
  const published = makeMe.aStoryReview
    .published(doneCompletion)
    .modifying(filePath)
    .please();
  await openDoneStoryComparison({
    review: (query) =>
      Promise.resolve(
        query.run === run.key
          ? makeMe.aStoryReview.landed().modifying(filePath).onRun(run).please()
          : { ...published, runs: [run] },
      ),
    ci: {
      readSelectedComparison: (source, identity, range) =>
        Promise.resolve(
          makeMe.aSelectedCiComparison
            .with({
              source: source.id,
              identity,
              range,
              baseline:
                noBuild === "baseline"
                  ? makeMe.aStoryCiComparisonSlot
                      .with({
                        kind: "none",
                        explanation: missingBaseline,
                      })
                      .please()
                  : builds.baseline,
              selection:
                noBuild === "selection"
                  ? makeMe.aStoryCiComparisonSlot
                      .with({
                        kind: "none",
                        explanation: missingSelection,
                      })
                      .please()
                  : builds.landed,
            })
            .please(),
        ),
      readProof: (source, subject) => {
        if ("attemptId" in subject)
          throw new Error("Expected a GitHub attempt");
        const measures = [
          [selectedBaseline, baseline],
          [selectedEnd, selection],
        ] as const;
        const proof = measures.find(
          ([attempt]) =>
            attempt.runId === subject.runId &&
            attempt.runAttempt === subject.runAttempt &&
            attempt.revision === subject.revision,
        );
        return Promise.resolve(
          makeMe.aCiProof
            .summaryFor(subject, [proof?.[1] ?? entryFor(4)], source.repository)
            .please(),
        );
      },
    },
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  return { story, file: story.file(`Modified ${filePath}`) };
}

test("Changes compares the captured attempts and restores the default count", async () => {
  const { file, story } = await openCapturedRun();
  await expect.element(file).toHaveAccessibleName(/4 test cases \(no change\)/);

  await story.choose("Landed runs");
  const counts = /1 → 9 test cases \(\+8\)/;
  await expect.element(file).toHaveAccessibleName(counts);
  expect(file.element().getAttribute("title")).toMatch(counts);
  const tree = page.getByRole("tabpanel", { name: "Changes", exact: true });
  await expect
    .element(tree.getByRole("button", { name: /^dashboard\/tests, / }))
    .toHaveAccessibleName(counts);

  await story.choose("Published completion");
  await expect.element(file).toHaveAccessibleName(/4 test cases \(no change\)/);
});

test("Changes keeps the selected count when there is no baseline build", async () => {
  const { file, story } = await openCapturedRun({ noBuild: "baseline" });
  await story.choose("Landed runs");
  await expect.element(file).toHaveAccessibleName(/9 test cases at Selection/);
  const title = file.element().getAttribute("title");
  expect(title).toContain(missingBaseline);
  expect(title).not.toContain("→");
});

test("Changes keeps the baseline count when no build includes the selected work", async () => {
  const { file, story } = await openCapturedRun({ noBuild: "selection" });
  await story.choose("Landed runs");
  await expect.element(file).toHaveAccessibleName(/1 test case at Baseline/);
  const title = file.element().getAttribute("title");
  expect(title).toContain(missingSelection);
  expect(title).not.toContain("→");
});

test("Changes keeps a measured count with its missing-part explanation", async () => {
  const selection = makeMe.aCiProofEntry
    .at(entryPath)
    .withFile(filePath, { passed: 9, durationMs: 900 })
    .inParts(2, { missing: [2] })
    .please();
  const { file, story } = await openCapturedRun({ selection });
  await story.choose("Landed runs");
  await expect
    .element(file)
    .toHaveAccessibleName(
      /9 test cases \(part 2 of 2 missing; count difference unavailable\) at Selection/,
    );
  expect(file.element().getAttribute("title")).not.toContain("→");
});

test("Changes keeps different declared units apart", async () => {
  const { file, story } = await openCapturedRun({
    baseline: entryFor(1, "file"),
  });
  await story.choose("Landed runs");
  await expect
    .element(file)
    .toHaveAccessibleName(
      /1 test file at Baseline.*9 test cases at Selection \(different units\)/,
    );
  expect(file.element().getAttribute("title")).not.toContain("→");
});
