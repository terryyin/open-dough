// A Done story whose worktree is retired chooses in Intent's Compare, through
// Review changes' own selection, between its published completion and one of
// its captured landed runs. Its Intent locations follow the
// selected result. The case's review answers own the Git judgment.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

const oid = (digit: string) => digit.repeat(40);
const older = makeMe.aReviewRun
  .keyed("capture-older-run")
  .launchedAt("2026-01-01T10:00:00.000Z")
  .comparing(oid("1"), oid("2"))
  .please();
const newer = makeMe.aReviewRun
  .keyed("capture-newer-run")
  .launchedAt("2026-01-02T12:00:00.000Z")
  .comparing(oid("3"), oid("4"))
  .please();
const runs = [newer, older];
// How Intent names a run's launch.
const launched = (run: typeof older) =>
  new Date(run.launchedAt ?? "").toLocaleString();
const landedOn = (run: typeof older, name: string) =>
  makeMe.aStoryReview.landed().adding(`${name}.txt`).onRun(run, runs).please();
const landedRuns: Readonly<Record<string, StoryReview>> = {
  [older.key]: landedOn(older, "older"),
  [newer.key]: landedOn(newer, "newer"),
};

const openDoneWithCapturedRuns = () =>
  openDoneStoryComparison({
    review: (query) =>
      Promise.resolve(
        query.historical === "true"
          ? { ...publishedCompletion(), runs }
          : (landedRuns[query.run ?? ""] ?? publishedCompletion()),
      ),
  });

test("a Done story chooses each captured result and returns to Published completion", async () => {
  const { locationRevisions, outsideCalls } = await openDoneWithCapturedRuns();
  const story = intentStoryCompare();
  await story.browseFiles();

  // It opens on Published completion, naming the completion revision,
  // without a run choice.
  await expect.element(story.choice("Published completion")).toBeChecked();
  await expect.element(story.choice("All changes")).not.toBeInTheDocument();
  await expect.element(story.choice("Commits")).not.toBeInTheDocument();
  await expect.element(story.landingChoices.first()).toBeVisible();
  await expect.element(story.collapsedControl).not.toBeInTheDocument();
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));

  // Landed runs and the older run list its changes and name its tree.
  await story.chooseLatestLanding();
  await expect.element(story.runChoice(newer.key)).toBeChecked();
  await story.browseFiles();
  await expect.poll(story.treeText).toContain("newer.txt");
  await story.chooseRun(older.key);
  await expect.element(story.runChoice(older.key)).toBeChecked();
  await expect.poll(story.treeText).toContain("older.txt");
  await expect.poll(story.revisions).toContain(oid("2").slice(0, 7));

  // Each run reads locations from its accepted result.
  expect(new Set(locationRevisions)).toEqual(
    new Set([doneCompletion, oid("4"), oid("2")]),
  );

  // Published completion again returns to it.
  await story.choose("Published completion");
  await expect.element(story.landingChoices.first()).toBeVisible();
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));
  expect(outsideCalls()).toEqual([]);
});

test("Intent names the launch, destination and captured revisions of the landed run being compared", async () => {
  await openDoneWithCapturedRuns();
  const story = intentStoryCompare();
  await story.browseFiles();
  await story.chooseLatestLanding();
  await story.chooseRun(older.key);
  await story.openDetails();

  await expect
    .element(
      story.header.getByRole("heading", { name: "Landed run", exact: true }),
    )
    .toBeVisible();
  await expect
    .poll(story.revisions)
    .toMatch(/Refinement launched .*, delivered to origin\/main\./);
  await expect
    .element(story.header.getByText(launched(older), { exact: true }))
    .toBeVisible();
  await expect
    .poll(story.revisions)
    .toContain(`From ${oid("1")} to ${oid("2")}.`);
});

test("Landed runs lists the captured runs as read, newest first, and the keyboard moves to the older run's changes", async () => {
  await openDoneWithCapturedRuns();
  const story = intentStoryCompare();
  await story.chooseLatestLanding();
  await expect.element(story.runChoice(newer.key)).toBeChecked();
  const listed = story.landingChoices
    .elements()
    .filter((element) => element instanceof HTMLInputElement);
  expect(listed.map((option) => option.value)).toEqual(
    runs.map((run) => run.key),
  );
  runs.forEach((run, at) => {
    expect(listed[at]?.parentElement?.textContent).toContain(launched(run));
  });

  await userEvent.click(story.runChoice(newer.key));
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(story.runChoice(older.key)).toBeChecked();
  await story.browseFiles();
  await expect.poll(story.treeText).toContain("older.txt");
});

test("a newer default run moves an unchosen run but not a chosen one while the old run is still listed", async () => {
  let landedDefault = landedOn(older, "older");
  let defaultsAsked = 0;
  const { outsideCalls } = await openDoneStoryComparison({
    review: (query) => {
      if (query.historical !== "true")
        return Promise.resolve(landedRuns[query.run ?? ""] ?? landedDefault);
      defaultsAsked += 1;
      return Promise.resolve(landedDefault);
    },
  });
  // Each default answer's landed tree is its own, so only the run chosen is
  // observed here.
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.element(story.runChoice(older.key)).toBeChecked();

  // A later default naming the newer run moves Intent to it when no run was
  // chosen.
  landedDefault = landedOn(newer, "newer");
  await story.refresh();
  await expect.element(story.runChoice(newer.key)).toBeChecked();

  // After choosing the older run, a newer default keeps it.
  await story.chooseRun(older.key);
  await expect.element(story.runChoice(older.key)).toBeChecked();
  const asked = defaultsAsked;
  await story.refresh();
  await expect.poll(() => defaultsAsked).toBeGreaterThan(asked);
  await expect.element(story.runChoice(older.key)).toBeChecked();
  expect(outsideCalls()).toEqual([]);
});
