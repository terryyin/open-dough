// A chosen session's CI comparison measures its chosen recorded range as the
// selected range, or, without a published record, measures nothing and says
// so; Whole story restores the story's own comparison and its chosen run. The
// case's review answers, keyed by `published` and `run`, own the recorded
// pairs.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import type { CiComparisonRange } from "../../src/selectedCiComparison.ts";
import {
  activateComparisonControl,
  comparisonRead,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  doneIdentity,
  doneSource,
  openDoneStoryComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

const execution = makeMe.aSessionRecord
  .forExecutionOf(doneIdentity)
  .closedAt(new Date(Date.now() - 3_600_000).toISOString())
  .please();
const executionName = `Execution — ${new Date(execution.closedAt).toLocaleString()}`;
const first: CiComparisonRange = { start: "3".repeat(40), end: "4".repeat(40) };
const second: CiComparisonRange = {
  start: "5".repeat(40),
  end: "8".repeat(40),
};
const builds = makeMe.aComparedStory
  .withBaseline({ revision: "3".repeat(40), runId: 81, runAttempt: 1 })
  .withLanded({ revision: "4".repeat(40), runId: 82, runAttempt: 1 })
  .please().answer;
const range = (position: number, { start, end }: CiComparisonRange) =>
  makeMe.aStoryReview
    .publishedSession({ range: { position, of: 2 } })
    .between(start, end)
    .adding(`range-${String(position)}.txt`)
    .please();

const measuring = (asked: CiComparisonRange[]) => ({
  readSelectedComparison: (
    ...[source, identity, selected]: Parameters<
      NonNullable<IntentCiReadSource["readSelectedComparison"]>
    >
  ) => {
    asked.push(selected);
    return Promise.resolve(
      makeMe.aSelectedCiComparison
        .with({
          source: source.id,
          identity,
          range: selected,
          baseline: builds.baseline,
          selection: builds.landed,
        })
        .please(),
    );
  },
});

test("a chosen session's CI comparison measures its chosen range and Whole story restores the story's", async () => {
  const asked: CiComparisonRange[] = [];
  await openDoneStoryComparison({
    publishedSessions: [execution],
    review: (query) =>
      Promise.resolve(
        query.published === undefined
          ? publishedCompletion()
          : query.run === "1"
            ? range(2, second)
            : range(1, first),
      ),
    ci: measuring(asked),
  });
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  await comparisonRead(story.landedEndpoint).not.toBe("");
  const measured = story.landedEndpoint();
  expect(asked).toEqual([]);

  await story.chooseScope(executionName);
  await expect.poll(() => asked.at(-1)).toEqual(first);

  await activateComparisonControl(story.choice("Published range 2 of 2"));
  await expect.poll(() => asked.at(-1)).toEqual(second);
  expect(story.noteIn("CI comparison")).toBeNull();

  await story.chooseScope("Whole story");
  await comparisonRead(story.landedEndpoint).toBe(measured);
  expect(asked).toEqual([first, second]);
});

test("a session without a published record measures nothing and says so; Whole story measures the story again", async () => {
  const launched = makeMe.aLaunchRecord
    .refining({ identity: doneIdentity, title: "Done", source: doneSource.id })
    .reportingThrough({
      origin: "https://dashboard.example",
      reference: "0b7d3c1e-9f2a-4c5b-8d6e-1a2b3c4d5e6f",
      command: "node report.mjs",
    })
    .inClaudeSession({ sessionId: "launched-here" })
    .launchedAt(new Date(Date.now() - 7_200_000).toISOString())
    .markedDoneAt(new Date(Date.now() - 5_400_000).toISOString())
    .please();
  const launchedName = `Refinement — ${new Date(launched.launchedAt).toLocaleString()}`;
  const asked: CiComparisonRange[] = [];
  await openDoneStoryComparison({
    machine: makeMe.aMachineAnswer.observingDone(launched).please(),
    review: () => Promise.resolve(publishedCompletion()),
    ci: measuring(asked),
  });
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  await comparisonRead(story.landedEndpoint).not.toBe("");
  const measured = story.landedEndpoint();

  await story.chooseScope(launchedName);
  await comparisonRead(() => story.viewText("CI comparison")).toContain(
    "This session published no comparison.",
  );
  expect(story.landedEndpoint()).toBe("");
  expect(story.noteIn("CI comparison")).toBeNull();
  expect(story.viewText("CI comparison")).not.toContain("Check again");
  expect(asked).toEqual([]);

  await story.chooseScope("Whole story");
  await comparisonRead(story.landedEndpoint).toBe(measured);
});

test("Whole story keeps the story's chosen landed run after a session visit", async () => {
  const run = makeMe.aReviewRun
    .keyed("capture-run")
    .launchedAt("2026-01-01T10:00:00.000Z")
    .comparing("1".repeat(40), "2".repeat(40))
    .please();
  const published = makeMe.aStoryReview
    .published(doneCompletion)
    .modifying("dashboard/tests/folder/a.spec.ts")
    .please();
  const asked: CiComparisonRange[] = [];
  await openDoneStoryComparison({
    publishedSessions: [execution],
    review: (query) =>
      Promise.resolve(
        query.published !== undefined
          ? range(1, first)
          : query.historical === "true"
            ? { ...published, runs: [run] }
            : query.run === run.key
              ? makeMe.aStoryReview
                  .landed()
                  .modifying("dashboard/tests/folder/a.spec.ts")
                  .onRun(run)
                  .please()
              : published,
      ),
    ci: measuring(asked),
  });
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  await story.chooseRun(run.key);
  await expect.element(story.runChoice(run.key)).toBeChecked();
  const runRange = { start: "1".repeat(40), end: "2".repeat(40) };
  await expect.poll(() => asked.at(-1)).toEqual(runRange);

  await story.chooseScope(executionName);
  await expect.poll(() => asked.at(-1)).toEqual(first);

  await story.chooseScope("Whole story");
  await expect.element(story.runChoice(run.key)).toBeChecked();
  await expect.poll(() => asked.at(-1)).toEqual(runRange);
});
