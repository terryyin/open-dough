// Intent coverage keeps whole-story evidence while CI comparison follows
// a captured run's recorded revisions. A choice without that pair keeps the
// whole-story comparison and note.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import {
  activateComparisonControl,
  comparisonRead,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  doneIdentity,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";
import {
  childName,
  openSummary,
  showsSummaryPath,
} from "./intent-summary-proof-page.ts";

async function openProof(
  story: ReturnType<typeof intentStoryCompare>,
  file: ReturnType<typeof story.file>,
) {
  await activateComparisonControl(file);
  await story.chooseProof();
}

const landing = "dashboard/tests/folder/a.spec.ts";
const start = "1".repeat(40);
const end = "2".repeat(40);
const baselineRevision = "6".repeat(40);
const run = makeMe.aReviewRun
  .keyed("capture-run")
  .launchedAt("2026-01-01T10:00:00.000Z")
  .comparing(start, end)
  .please();
const legacy = makeMe.aReviewRun.keyed("legacy-run").please();

const openDoneWithRuns = (
  ci: Partial<IntentCiReadSource>,
  runs = [run, legacy],
) => {
  const published = makeMe.aStoryReview
    .published(doneCompletion)
    .modifying(landing)
    .please();
  return openDoneStoryComparison({
    ci,
    review: (query) =>
      Promise.resolve(
        query.historical === "true"
          ? { ...published, runs }
          : query.run === run.key || query.run === legacy.key
            ? makeMe.aStoryReview
                .landed()
                .modifying(landing)
                .onRun(query.run === run.key ? run : legacy, runs)
                .please()
            : published,
      ),
  });
};

test("a Done story's CI comparison switches to the captured run's measured builds and restores Published completion", async () => {
  const builds = makeMe.aComparedStory
    .withBaseline({
      revision: baselineRevision,
      runId: 71,
      runAttempt: 2,
      selection: "ancestor",
      laterWithoutResult: 1,
    })
    .withLanded({
      revision: end,
      runId: 72,
      runAttempt: 3,
      laterRunning: true,
    })
    .please().answer;
  const asked: unknown[] = [];
  const { outsideCalls } = await openDoneWithRuns({
    readSelectedComparison: (source, identity, range) => {
      asked.push({ identity, range });
      return Promise.resolve(
        makeMe.aSelectedCiComparison
          .with({
            source: source.id,
            identity,
            range,
            baseline: builds.baseline,
            selection: builds.landed,
          })
          .please(),
      );
    },
  });
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  await comparisonRead(story.landedEndpoint).not.toBe("");
  const measured = story.landedEndpoint();

  await story.chooseLatestLanding();
  const endpoints = page.getByRole("table", {
    name: "Baseline and selection CI builds with timing",
  });
  const baseline = endpoints.getByRole("row").filter({
    has: page.getByRole("rowheader", { name: "Baseline", exact: true }),
  });
  const selection = endpoints.getByRole("row").filter({
    has: page.getByRole("rowheader", { name: "Selection", exact: true }),
  });
  await comparisonRead(() => baseline.query()?.textContent ?? "").toMatch(
    /6666666.*ancestor.*Run 71 · attempt 2/,
  );
  await comparisonRead(() => selection.query()?.textContent ?? "").toMatch(
    /2222222.*exact revision.*later attempt is still running.*Run 72 · attempt 3/,
  );
  expect(asked).toEqual([{ identity: doneIdentity, range: { start, end } }]);
  expect(story.noteIn("CI comparison")).toBeNull();
  await story.chooseTab("Intent coverage");
  await comparisonRead(() => story.noteBuild("Intent coverage")).toBe(
    doneCompletion.slice(0, 7),
  );

  const file = story.file(`Modified ${landing}`);
  await openProof(story, file);
  await comparisonRead(() => story.viewText("Proof")).toMatch(
    /Baseline.*6666666.*Run 71 · attempt 2.*Selection.*2222222.*Run 72 · attempt 3/s,
  );
  await story.goHome();
  await expect.element(story.runChoice(run.key)).toBeChecked();
  await comparisonRead(() => baseline.query()?.textContent ?? "").toMatch(
    /6666666.*Run 71 · attempt 2/,
  );
  await comparisonRead(() => selection.query()?.textContent ?? "").toMatch(
    /2222222.*Run 72 · attempt 3/,
  );
  expect(asked).toEqual([{ identity: doneIdentity, range: { start, end } }]);
  await story.choose("Published completion");
  await story.chooseTab("CI comparison");
  await comparisonRead(story.landedEndpoint).toBe(measured);
  expect(outsideCalls()).toEqual([]);
});

test("a captured run without recorded revisions keeps the whole-story CI comparison", async () => {
  let requested = false;
  await openDoneWithRuns(
    {
      readSelectedComparison: () => {
        requested = true;
        return Promise.reject(new Error("This run has no captured pair."));
      },
    },
    [legacy],
  );
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  await comparisonRead(story.landedEndpoint).not.toBe("");
  const measured = story.landedEndpoint();

  await story.chooseLatestLanding();
  await expect.element(story.runChoice(legacy.key)).toBeChecked();
  await comparisonRead(story.revisions).toContain("From");
  await comparisonRead(() => story.noteBuild("CI comparison")).toBe(
    doneCompletion.slice(0, 7),
  );
  expect(story.landedEndpoint()).toBe(measured);
  expect(requested).toBe(false);
  await openProof(story, story.file(`Modified ${landing}`));
  await comparisonRead(() => story.noteBuild("Proof")).toBe(
    doneCompletion.slice(0, 7),
  );
  await story.goHome();
  await expect.element(story.runChoice(legacy.key)).toBeChecked();
  await comparisonRead(() => story.noteBuild("CI comparison")).toBe(
    doneCompletion.slice(0, 7),
  );
  await story.chooseTab("Intent coverage");
  await comparisonRead(() => story.noteBuild("Intent coverage")).toBe(
    doneCompletion.slice(0, 7),
  );
  await story.browseFiles();
  const summary = await openSummary("dashboard/tests");
  await userEvent.click(childName(summary, "folder/"));
  await showsSummaryPath(summary, "dashboard/tests/folder");
  const summaryNote = page
    .getByRole("note")
    .filter({ hasText: "Describes the whole story" });
  await expect
    .element(summaryNote.getByText(doneCompletion.slice(0, 7), { exact: true }))
    .toBeVisible();
  expect(requested).toBe(false);
});
