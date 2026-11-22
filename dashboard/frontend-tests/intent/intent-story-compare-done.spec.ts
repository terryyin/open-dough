// A Done story whose worktree is retired chooses in Intent's Compare, through
// Review changes' own selection, between its published completion and one of
// its captured landed runs. Its Intent locations and the CI comparison's
// landed endpoint stay on the story's landed result whatever is chosen. The
// case's review answers own the Git judgment.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  doneOutsideKinds,
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
const landedOn = (run: typeof older, name: string) =>
  makeMe.aStoryReview.landed().adding(`${name}.txt`).onRun(run, runs).please();
const landedRuns: Readonly<Record<string, StoryReview>> = {
  [older.key]: landedOn(older, "older"),
  [newer.key]: landedOn(newer, "newer"),
};

test("a Done story opens on its published completion, chooses a captured landed run and returns, while its locations and landed CI endpoint stay put", async () => {
  const { locationRevisions, outsideKinds } = await openDoneStoryComparison({
    review: (query) =>
      Promise.resolve(
        query.historical === "true"
          ? { ...publishedCompletion(), runs }
          : (landedRuns[query.run ?? ""] ?? publishedCompletion()),
      ),
  });
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  await expect.poll(story.landedEndpoint).not.toBe("");
  const landedText = story.landedEndpoint();
  await story.chooseTab("Changes");

  // It opens on Published completion, naming the completion revision,
  // without a run choice.
  await expect.element(story.choice("Published completion")).toBeChecked();
  await expect.element(story.choice("All changes")).not.toBeInTheDocument();
  await expect.element(story.choice("Commits")).not.toBeInTheDocument();
  await expect.element(story.run).not.toBeInTheDocument();
  await expect.element(story.collapsedControl).not.toBeInTheDocument();
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));

  // Landed runs and the older run list its changes and name its tree.
  await story.choose("Landed runs");
  await expect.element(story.run).toHaveValue(newer.key);
  await expect.poll(story.outside).toContain("newer.txt");
  await story.chooseRun(older.key);
  await expect.element(story.run).toHaveValue(older.key);
  await expect.poll(story.outside).toContain("older.txt");
  await expect.poll(story.revisions).toContain(oid("2").slice(0, 7));

  // Its locations and the CI comparison's landed endpoint stay at the landed
  // result.
  expect(new Set(locationRevisions)).toEqual(new Set([doneCompletion]));
  await story.chooseTab("CI comparison");
  await expect.poll(story.landedEndpoint).toBe(landedText);
  await story.chooseTab("Changes");

  // Published completion again returns to it.
  await story.choose("Published completion");
  await expect.element(story.run).not.toBeInTheDocument();
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));
  expect(outsideKinds()).toEqual(doneOutsideKinds);
});

test("a newer default run moves an unchosen run but not a chosen one while the old run is still listed", async () => {
  let landedDefault = landedOn(older, "older");
  let defaultsAsked = 0;
  const { outsideKinds } = await openDoneStoryComparison({
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
  await story.chooseTab("Changes");
  await expect.element(story.choice("Landed runs")).toBeChecked();
  await expect.element(story.run).toHaveValue(older.key);

  // A later default naming the newer run moves Intent to it when no run was
  // chosen.
  landedDefault = landedOn(newer, "newer");
  await story.refresh();
  await expect.element(story.run).toHaveValue(newer.key);

  // After choosing the older run, a newer default keeps it.
  await story.chooseRun(older.key);
  await expect.element(story.run).toHaveValue(older.key);
  const asked = defaultsAsked;
  await story.refresh();
  await expect.poll(() => defaultsAsked).toBeGreaterThan(asked);
  await expect.element(story.run).toHaveValue(older.key);
  expect(outsideKinds()).toEqual(doneOutsideKinds);
});
