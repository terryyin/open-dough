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

const snapshot = () =>
  makeMe.aStoryReview.modifying("dashboard/tests/a.spec.ts").please();

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

test("a pending Refresh keeps Compare and a second press does not read again", async () => {
  let calls = 0;
  await openStoryAComparison({
    review: () => {
      calls += 1;
      return calls === 1 ? Promise.resolve(snapshot()) : unanswered();
    },
  });
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.poll(story.revisions).toContain("Published story branch");

  await story.refresh();
  await expect.poll(story.headerText).toContain(reading);
  await expect.poll(story.revisions).toContain("Published story branch");
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
  await story.browseFiles();
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));
  const locationText = () =>
    document.querySelector("button.intent-location-name")?.textContent ?? "";
  await expect.poll(locationText).not.toBe("");
  const location = locationText();

  await story.chooseLatestLanding();
  await expect.poll(story.headerText).toContain(reading);
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));
  expect(locationText()).toBe(location);
  expect(new Set(locationRevisions)).toEqual(new Set([doneCompletion]));
  await story.chooseTab("CI comparison");
  await expect.poll(story.landedEndpoint).toBe(landedText);
});
