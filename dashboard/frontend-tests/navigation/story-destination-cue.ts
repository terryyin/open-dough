import { expect, onTestFinished, vi } from "vitest";
import type { Locator } from "vitest/browser";
import {
  destinationCueClass,
  destinationCueMs,
} from "../../src/destinationCue.ts";

export const destinationCueAnimationName = "story-card-destination-cue";

const markedCards = () => [
  ...document.querySelectorAll(`.${destinationCueClass}`),
];

export function controlDestinationCueTime() {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout"],
    shouldAdvanceTime: true,
  });
  onTestFinished(() => {
    vi.useRealTimers();
  });
}

export async function showsMovingCue(card: Locator) {
  await expect.element(card).toHaveClass(destinationCueClass);
  expect(markedCards()).toEqual([card.element()]);
  const mark = getComputedStyle(card.element(), "::after");
  expect(mark.content).not.toBe("none");
  expect(mark.boxShadow).not.toBe("none");
  expect(mark.animationName).toBe(destinationCueAnimationName);
}

export async function finishCue(card: Locator) {
  vi.advanceTimersByTime(destinationCueMs);
  await expect.element(card).not.toHaveClass(destinationCueClass);
  expect(markedCards()).toHaveLength(0);
  expect(getComputedStyle(card.element(), "::after").content).toBe("none");
}
