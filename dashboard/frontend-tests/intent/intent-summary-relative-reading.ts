import { expect } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { relativeOf } from "./intent-ci-comparison-page.ts";
import { comparisonIn } from "./intent-ci-scope-page.tsx";
import { ciReadingText } from "./intent-attempt-proof-page.ts";

export async function expectTimingWords(figure: Locator, words: string) {
  await expect
    .poll(() => ciReadingText(figure.query()?.textContent))
    .toBe(words);
}

export async function expectTimingMark(
  figure: Locator,
  direction: "slower" | "none",
  reach: number,
) {
  await expect
    .poll(() => figure.query()?.querySelectorAll(".intent-ci-time-mark").length)
    .toBe(1);
  const { mark } = relativeOf(figure.element());
  if (mark === null) {
    throw new Error("No timing mark");
  }
  expect(mark.direction).toBe(direction);
  expect(Math.abs(mark.zeroOffset)).toBeLessThanOrEqual(1);
  expect(Math.abs(mark.barStartOffset)).toBeLessThanOrEqual(1);
  expect(mark.reach).toBeCloseTo(reach, 1);
  return mark;
}

export async function togglePercent(region: Locator, on: boolean) {
  const checkbox = comparisonIn(region).showPercent;
  await userEvent.click(checkbox);
  if (on) {
    await expect.element(checkbox).toBeChecked();
  } else {
    await expect.element(checkbox).not.toBeChecked();
  }
}

export function expectNoRelativeTiming(scope: Locator) {
  expect(
    scope
      .element()
      .querySelectorAll(".intent-ci-time-mark, .intent-ci-time-percent"),
  ).toHaveLength(0);
}
