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

// Once its page time has passed, the cue ends and no card shows it.
export async function expectCueEnds(page: Page, card: Locator) {
  await passPageMs(page, destinationCueMs);
  await expect(card).not.toHaveClass(cued);
  await expect(cuedCards(page)).toHaveCount(0);
  expect((await cueMark(card)).content).toBe("none");
}
