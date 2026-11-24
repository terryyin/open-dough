import { expect } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { contrastRatio } from "../../test-support/composedColours.ts";
import {
  decorativeIcon,
  focusedAndVisible,
  paintedBackground,
} from "./board-accessibility.ts";

export function fitsViewport(element: Element) {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  return (
    left >= -1 &&
    top >= -1 &&
    right <= innerWidth + 1 &&
    bottom <= innerHeight + 1
  );
}

export async function expectIconControl(
  control: Locator,
  name: string,
  tooltip: string,
) {
  await expect.element(control).toHaveAccessibleName(name);
  const button = control.element();
  if (!(button instanceof HTMLButtonElement) || button.parentElement === null)
    throw new Error(`Expected the ${name} frame control.`);
  const tip = button.parentElement.querySelector(".frame-tooltip > span");
  if (!tip) throw new Error(`Expected a tooltip for ${name}.`);
  expect(tip.textContent).toBe(tooltip);
  expect(tip.parentElement?.getAttribute("aria-hidden")).toBe("true");

  const mark = button.querySelector("img.product-mark");
  const icon = mark ?? button.querySelector("svg");
  if (!icon) throw new Error(`Expected the ${name} icon.`);
  if (mark) {
    expect(mark.getAttribute("alt")).toBe("");
    expect(mark.getAttribute("aria-hidden")).toBe("true");
    expect(mark.getAttribute("src")).toBe("/icon-64.png");
  } else {
    decorativeIcon(button);
  }
  const { width, height } = icon.getBoundingClientRect();
  const iconSize = mark ? 32 : 20;
  expect(width).toBeCloseTo(iconSize, 0);
  expect(height).toBeCloseTo(iconSize, 0);
  const frameSize =
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--control-size",
      ),
    ) * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const frame = button.getBoundingClientRect();
  expect(frame.width).toBeCloseTo(frameSize, 0);
  expect(frame.height).toBeCloseTo(frameSize, 0);

  await userEvent.unhover(button);
  button.blur();
  expect(tip.checkVisibility()).toBe(false);
  if (!mark)
    expect(
      contrastRatio(getComputedStyle(icon).color, paintedBackground(icon)),
    ).toBeGreaterThanOrEqual(3);
  await control.hover();
  await expect
    .poll(() => tip.checkVisibility() && fitsViewport(tip))
    .toBe(true);
  await userEvent.unhover(button);
  await expect.poll(() => tip.checkVisibility()).toBe(false);

  button.focus();
  await userEvent.tab({ shift: true });
  await userEvent.tab();
  focusedAndVisible(button);
  expect(tip.checkVisibility() && fitsViewport(tip)).toBe(true);
  expect(
    contrastRatio(
      getComputedStyle(button).outlineColor,
      paintedBackground(button.parentElement),
    ),
  ).toBeGreaterThanOrEqual(3);
}
