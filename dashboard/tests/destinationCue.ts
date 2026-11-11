// Shared assertions for the destination cue, the brief mark a reveal puts on
// the card a story reference or direct story URL arrived at. It is separate
// from the selected story's Highlight (./storyCardSelection.ts). A journey
// pauses the page clock before opening the page, so the cue stays until the
// journey lets its page time pass.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { passPageMs } from "./autoRefreshJourney.ts";
import {
  destinationCueClass,
  destinationCueMs,
} from "../src/destinationCue.ts";

const cued = new RegExp(`\\b${destinationCueClass}\\b`);

const cuedCards = (page: Page) => page.locator(`.${destinationCueClass}`);

const cueMark = (card: Locator) =>
  card.evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    return {
      content: style.content,
      animationName: style.animationName,
      boxShadow: style.boxShadow,
    };
  });

// The cue shows on this card and no other, moving as it fades, or, with
// reduced motion, as a static mark.
export async function expectDestinationCue(
  page: Page,
  card: Locator,
  { motion }: { motion: boolean },
) {
  await expect(card).toHaveClass(cued);
  await expect(cuedCards(page)).toHaveCount(1);
  const mark = await cueMark(card);
  expect(mark.content).not.toBe("none");
  expect(mark.boxShadow).not.toBe("none");
  expect(mark.animationName).toBe(
    motion ? "story-card-destination-cue" : "none",
  );
}

// Page time passes, but not as long as a cue shows.
export async function passPartOfCue(page: Page, ms: number) {
  expect(ms).toBeLessThan(destinationCueMs);
  await passPageMs(page, ms);
}

const cueProgress = (card: Locator, holdAt: number | null = null) =>
  card.evaluate(async (element, time) => {
    const animation = element
      .getAnimations({ subtree: true })
      .find(
        (candidate) =>
          candidate instanceof CSSAnimation &&
          candidate.animationName === "story-card-destination-cue",
      );
    if (!animation) throw new Error("Destination cue animation is missing");
    if (time !== null) {
      animation.pause();
      animation.currentTime = time;
      await animation.ready;
    }
    if (typeof animation.currentTime !== "number") {
      throw new Error("Destination cue animation has no numeric time");
    }
    return {
      time: animation.currentTime,
      opacity: Number(getComputedStyle(element, "::after").opacity),
    };
  }, holdAt);

// Page-clock advancement controls the cue's timer, not CSS animation time.
// Hold only the first animation; the repeated reference must restart it.
export async function holdDestinationCueWhileFading(card: Locator, ms: number) {
  const fading = await cueProgress(card, ms);
  expect(fading.time).toBeGreaterThan(0);
  expect(fading.opacity).toBeGreaterThan(0);
  expect(fading.opacity).toBeLessThan(1);
  return fading.time;
}

export async function expectDestinationCueRestarted(
  card: Locator,
  previousTime: number,
) {
  const restarted = await cueProgress(card);
  expect(restarted.time).toBeGreaterThanOrEqual(0);
  expect(restarted.time).toBeLessThan(previousTime);
  expect(restarted.opacity).toBe(1);
}

// Once its page time has passed, the cue ends and no card shows it.
export async function expectCueEnds(page: Page, card: Locator) {
  await passPageMs(page, destinationCueMs);
  await expect(card).not.toHaveClass(cued);
  await expect(cuedCards(page)).toHaveCount(0);
  expect((await cueMark(card)).content).toBe("none");
}
