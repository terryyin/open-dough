import { expect } from "vitest";
import { userEvent } from "vitest/browser";
import {
  composeBackgrounds,
  contrastRatio,
  painted,
} from "../../test-support/composedColours.ts";

export const narrowViewport = { width: 420, height: 900 };
export const zoomedViewport = { width: 320, height: 256 };

export function readsWhole(element: Element, container: Element = element) {
  const bounds = container.getBoundingClientRect();
  const range = new Range();
  range.selectNodeContents(element);
  const lines = [...range.getClientRects()];
  return (
    lines.length > 0 &&
    lines.every(
      ({ left, right }) => left >= bounds.left - 1 && right <= bounds.right + 1,
    )
  );
}

export function expectDocumentStill() {
  expect(window.scrollY).toBe(0);
  expect(document.documentElement.scrollWidth).toBe(
    document.documentElement.clientWidth,
  );
}

export function focusedAndVisible(element: Element) {
  expect(document.activeElement).toBe(element);
  expect(element.matches(":focus-visible")).toBe(true);
  const style = getComputedStyle(element);
  expect(style.outlineStyle).not.toBe("none");
  expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
}

export async function tabTo(element: Element) {
  for (let step = 0; step < 40; step += 1) {
    if (document.activeElement === element) return;
    await userEvent.tab();
  }
  throw new Error(`Tab never reached ${element.textContent}.`);
}

function paintedBackground(element: Element | null) {
  const colors: string[] = [];
  for (let at = element; at !== null; at = at.parentElement)
    colors.push(getComputedStyle(at).backgroundColor);
  return composeBackgrounds(colors);
}

export function textContrast(element: Element) {
  expect(
    contrastRatio(getComputedStyle(element).color, paintedBackground(element)),
  ).toBeGreaterThanOrEqual(4.5);
}

export function controlContrast(element: Element) {
  const style = getComputedStyle(element);
  const behind = paintedBackground(element.parentElement);
  const colors = [style.backgroundColor];
  if (parseFloat(style.borderTopWidth) > 0) colors.push(style.borderTopColor);
  const ratios = colors
    .filter(painted)
    .map((color) => contrastRatio(composeBackgrounds([color, behind]), behind));
  expect(Math.max(0, ...ratios)).toBeGreaterThanOrEqual(3);
}

export function decorativeIcon(element: Element) {
  const icons = element.querySelectorAll("svg");
  expect(icons).toHaveLength(1);
  const icon = icons.item(0);
  expect(icon.getAttribute("aria-hidden")).toBe("true");
  expect(icon.classList.contains("lucide")).toBe(true);
}
