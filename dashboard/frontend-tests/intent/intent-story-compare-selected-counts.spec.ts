import { expect, test } from "vitest";
import { page, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { CiProofEntry } from "../../src/ciProof.ts";
import {
  activateComparisonControl,
  comparisonRead,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
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

const missingBuild = (explanation: string) =>
  makeMe.aStoryCiComparisonSlot.with({ kind: "none", explanation }).please();

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
  const observedAttempts: (typeof selectedBaseline)[] = [];
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
                  ? missingBuild(missingBaseline)
                  : builds.baseline,
              selection:
                noBuild === "selection"
                  ? missingBuild(missingSelection)
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
        if (proof !== undefined) {
          const { runId, runAttempt, revision } = subject;
          observedAttempts.push({ runId, runAttempt, revision });
        }
        return Promise.resolve(
          makeMe.aCiProof
            .summaryFor(subject, [proof?.[1] ?? entryFor(4)], source.repository)
            .please(),
        );
      },
    },
  });
  const story = intentStoryCompare();
  return { story, file: story.file(`Modified ${filePath}`), observedAttempts };
}

const locationControl = () =>
  intentStoryCompare().sidebar.getByRole("button", {
    name: /^dashboard\/tests, /,
  });

async function openSummary() {
  await activateComparisonControl(locationControl());
  return page.getByRole("table", {
    name: `CI proof of the immediate folders and files of ${entryPath}`,
  });
}

async function openFileProof(
  story: ReturnType<typeof intentStoryCompare>,
  file: Locator,
) {
  await activateComparisonControl(file);
  await story.chooseProof();
  const name = `CI proof of ${filePath}`;
  return page.getByRole("table", { name, exact: true });
}

async function expectComparedProof(table: Locator, counts: RegExp) {
  const column = table.getByRole("columnheader", { name: "Selection" });
  await expect.element(column).toBeVisible();
  await expect.element(table.getByRole("cell", { name: counts })).toBeVisible();
  const labels = page.getByRole("list", { name: /^CI timing comparison of/ });
  const words = () => labels.query()?.textContent;
  const baseline = /Baseline.*6666666.*Run 71 · attempt 2/;
  const selection = /Selection.*2222222.*Run 72 · attempt 3/;
  await comparisonRead(words).toMatch(baseline);
  await comparisonRead(words).toMatch(selection);
}

test("Changes, Summary and file Proof share the captured attempts and restore the default count", async () => {
  const { file, story, observedAttempts } = await openCapturedRun();
  await expect.element(file).toHaveAccessibleName(/4 test cases \(no change\)/);

  await story.chooseLatestLanding();
  const counts = /1 → 9 test cases \(\+8\)/;
  await expect.element(file).toHaveAccessibleName(counts);
  expect(file.element().getAttribute("title")).toMatch(counts);
  await expect.element(locationControl()).toHaveAccessibleName(counts);
  const expected = [selectedBaseline, selectedEnd];
  expect(observedAttempts).toHaveLength(2);
  expect(observedAttempts).toEqual(expect.arrayContaining(expected));

  await expectComparedProof(await openSummary(), counts);
  await expectComparedProof(await openFileProof(story, file), counts);
  expect(observedAttempts).toHaveLength(2);

  await story.choosePurpose();
  await comparisonRead(story.diffName).toContain("a.spec.ts");
  await expect.element(file).toHaveAttribute("aria-pressed", "true");
  await expect.element(story.runChoice(run.key)).toBeChecked();

  await story.choose("Published completion");
  await expect.element(file).toHaveAccessibleName(/4 test cases \(no change\)/);
});

async function expectOneSidedProof(
  table: Locator,
  measured: RegExp,
  missing: string,
) {
  const count = table.getByRole("cell", { name: measured });
  const words = () => count.query()?.textContent ?? "";
  await comparisonRead(words).toContain(missing);
  expect(words()).not.toContain("→");
}

test("The selected count stays visible in Changes, Summary and file Proof when there is no baseline build", async () => {
  const { file, story } = await openCapturedRun({ noBuild: "baseline" });
  await story.chooseLatestLanding();
  await expect.element(file).toHaveAccessibleName(/9 test cases at Selection/);
  const title = file.element().getAttribute("title");
  expect(title).toContain(missingBaseline);
  expect(title).not.toContain("→");
  const measured = /9 test cases at Selection/;
  await expectOneSidedProof(await openSummary(), measured, missingBaseline);
  const proof = await openFileProof(story, file);
  await expectOneSidedProof(proof, measured, missingBaseline);
});

test("The baseline count stays visible in Changes, Summary and file Proof when no build includes the selected work", async () => {
  const { file, story } = await openCapturedRun({ noBuild: "selection" });
  await story.chooseLatestLanding();
  await expect.element(file).toHaveAccessibleName(/1 test case at Baseline/);
  const title = file.element().getAttribute("title");
  expect(title).toContain(missingSelection);
  expect(title).not.toContain("→");
  const measured = /1 test case at Baseline/;
  await expectOneSidedProof(await openSummary(), measured, missingSelection);
  const proof = await openFileProof(story, file);
  await expectOneSidedProof(proof, measured, missingSelection);
});

test("Changes keeps a measured count with its missing-part explanation", async () => {
  const selection = makeMe.aCiProofEntry
    .at(entryPath)
    .withFile(filePath, { passed: 9, durationMs: 900 })
    .inParts(2, { missing: [2] })
    .please();
  const { file, story } = await openCapturedRun({ selection });
  await story.chooseLatestLanding();
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
  await story.chooseLatestLanding();
  await expect
    .element(file)
    .toHaveAccessibleName(
      /1 test file at Baseline.*9 test cases at Selection \(different units\)/,
    );
  expect(file.element().getAttribute("title")).not.toContain("→");
});
