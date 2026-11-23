import { expect, onTestFinished, test, vi } from "vitest";
import { page, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { destinationCueMs } from "../../src/destinationCue.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { reviewSourceAnswering } from "../review/story-review-panel-page.ts";
import { boardReading, storyCard } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";
import {
  coldStoryUrl,
  mountStoryUrl,
  storyInAddress,
} from "./story-url-frame.ts";

async function showsMovingCue(card: Locator) {
  await expect.element(card).toHaveClass("story-card-destination-cue");
  expect(document.querySelectorAll(".story-card-destination-cue")).toHaveLength(
    1,
  );
  const mark = getComputedStyle(card.element(), "::after");
  expect(mark.content).not.toBe("none");
  expect(mark.boxShadow).not.toBe("none");
  expect(mark.animationName).toBe("story-card-destination-cue");
}

async function finishCue(card: Locator) {
  vi.advanceTimersByTime(destinationCueMs);
  await expect.element(card).not.toHaveClass("story-card-destination-cue");
  expect(document.querySelector(".story-card-destination-cue")).toBeNull();
  expect(getComputedStyle(card.element(), "::after").content).toBe("none");
}

test("Back from Intent and System settings cues the same destination without changing its Highlight or detail", async () => {
  const taken = story("Keep selected review work in view", 807);
  const work = boardWork([], { taken: [taken] });
  const record = makeMe.aLaunchRecord
    .executing(taken)
    .onStoryBranch({
      workspace: "/tmp/story-destination-review",
      branch: "claude/taken",
    })
    .please();
  const answer = makeMe.aMachineAnswer.observingOpen(record).please();
  const { intent } = pageReadsSupplying({});
  const comparison = makeMe.aStoryReview
    .sessionCommits()
    .adding("story.txt")
    .please();
  coldStoryUrl(work.source.id, taken.identity);
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout"],
    shouldAdvanceTime: true,
  });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const frame = await mountStoryUrl(
    { width: 1920, height: 900 },
    {
      intentReads: {
        ...intent,
        readLocations: () => Promise.resolve({ status: "not-configured" }),
      },
      review: reviewSourceAnswering({
        review: () => Promise.resolve(comparison),
      }),
      projectSettings: {
        read: () => Promise.resolve([]),
        add: () =>
          Promise.reject(new Error("The case does not add a project.")),
        setHidden: () =>
          Promise.reject(new Error("The case does not hide a project.")),
        remove: () =>
          Promise.reject(new Error("The case does not remove a project.")),
      },
    },
    work,
    { answer },
  );
  const card = storyCard(taken.title);
  await expect.element(card).toHaveFocus();
  await showsMovingCue(card);
  await boardReading.expectStorySelection(card, false);
  await finishCue(card);
  await card
    .getByRole("button", { name: "Review changes", exact: true })
    .click();
  await expect
    .element(page.getByRole("tab", { name: "Changes", exact: true }))
    .toHaveAttribute("aria-selected", "true");
  history.back();
  await card
    .getByRole("button", { name: "Inspect story", exact: true })
    .click();
  await boardReading.expectStoryHighlight(card);
  const hide = card.getByRole("button", { name: "Hide detail", exact: true });
  const detail = card.getByRole("region", {
    name: `Detail for ${taken.title}`,
  });
  await expect.element(hide).toHaveAttribute("aria-expanded", "true");
  await expect.element(detail).toBeVisible();
  await expect
    .poll(() => {
      const shown = card.element().getBoundingClientRect();
      const room = boardReading.room();
      return (
        Math.min(shown.bottom, room.bottom) - Math.max(shown.top, room.top)
      );
    })
    .toBeGreaterThan(0);

  await page.getByRole("radio", { name: "Intent", exact: true }).click();
  await expect.element(card).not.toBeInTheDocument();
  history.back();
  await expect.element(card).toHaveFocus();
  await showsMovingCue(card);
  await boardReading.expectStoryHighlight(card);
  await expect.element(hide).toHaveAttribute("aria-expanded", "true");
  await expect.element(detail).toBeVisible();
  expect(storyInAddress()).toBe(taken.identity);
  await finishCue(card);
  await boardReading.expectStorySelection(card, true);

  await page
    .getByRole("button", { name: "System settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Back to dashboard" }).click();
  await expect.element(card).toHaveFocus();
  await showsMovingCue(card);
  await boardReading.expectStoryHighlight(card);
  await expect.element(hide).toHaveAttribute("aria-expanded", "true");
  await expect.element(detail).toBeVisible();
  expect(storyInAddress()).toBe(taken.identity);
  await finishCue(card);
  await boardReading.expectStorySelection(card, true);
  frame.expectNoHostAction();
});
