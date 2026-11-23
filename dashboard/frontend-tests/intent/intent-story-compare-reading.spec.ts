// While a commit range, a chosen landed run, or Refresh is still reading,
// Intent keeps the last comparison and its Compare group, says it is reading,
// and leaves Refresh focusable but unavailable.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
  openStoryAComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

const unanswered = () => new Promise<never>(() => undefined);
const reading = "Reading the story's changes";

const [first, second] = [
  makeMe.aReviewCommit.numbered(1, "first change").please(),
  makeMe.aReviewCommit.numbered(2, "second change").please(),
];
const snapshot = () =>
  makeMe.aStoryReview
    .modifying("dashboard/tests/a.spec.ts")
    .onCommits(second, first)
    .withUncommittedChanges()
    .please();

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

test("a pending commit range keeps Compare, the pressed choice, and a focusable Refresh", async () => {
  await openStoryAComparison({
    review: () => Promise.resolve(snapshot()),
    range: unanswered,
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  await expect.poll(story.revisions).toContain("uncommitted changes included");

  await story.choose("Commits");
  await expect.poll(story.headerText).toContain(reading);
  await expect
    .element(story.file("Modified dashboard/tests/a.spec.ts"))
    .toBeVisible();
  await expect.element(story.choice("Commits")).toBeChecked();
  await expect.element(story.choice("Commits")).toHaveFocus();
  await expect
    .element(story.refreshButton)
    .toHaveAttribute("aria-disabled", "true");
  story.refreshButton.element().focus();
  await expect.element(story.refreshButton).toHaveFocus();
});

test("a pending Refresh keeps Compare and a second press does not read again", async () => {
  let calls = 0;
  await openStoryAComparison({
    review: () => {
      calls += 1;
      return calls === 1 ? Promise.resolve(snapshot()) : unanswered();
    },
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  await expect.poll(story.revisions).toContain("uncommitted changes included");

  await story.refresh();
  await expect.poll(story.headerText).toContain(reading);
  await expect.poll(story.revisions).toContain("uncommitted changes included");
  await expect.element(story.choice("All changes")).toBeChecked();
  await expect.element(story.refreshButton).toHaveFocus();
  const readingCalls = calls;
  await expect
    .element(story.refreshButton)
    .toHaveAttribute("aria-disabled", "true");
  story.refreshButton.element().focus();
  await expect.element(story.refreshButton).toHaveFocus();
  // aria-disabled leaves the control focusable; the press does not read again.
  const refresh = story.refreshButton.element();
  if (!(refresh instanceof HTMLButtonElement))
    throw new Error("Refresh is not a button");
  refresh.click();
  expect(calls).toBe(readingCalls);
});

test("a pending landed run keeps the Done story's locations and CI endpoint", async () => {
  const { locationRevisions } = await openDoneStoryComparison({
    review: (query) =>
      query.historical === "true"
        ? Promise.resolve({ ...publishedCompletion(), runs: [newer, older] })
        : unanswered(),
  });
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  await expect.poll(story.landedEndpoint).not.toBe("");
  const landedText = story.landedEndpoint();
  await story.chooseTab("Changes");
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));
  const locationText = () =>
    document.querySelector("button.intent-location-name")?.textContent ?? "";
  await expect.poll(locationText).not.toBe("");
  const location = locationText();

  await story.choose("Landed runs");
  await expect.poll(story.headerText).toContain(reading);
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));
  await expect.element(story.choice("Landed runs")).toBeChecked();
  expect(locationText()).toBe(location);
  expect(new Set(locationRevisions)).toEqual(new Set([doneCompletion]));
  await story.chooseTab("CI comparison");
  await expect.poll(story.landedEndpoint).toBe(landedText);
});
