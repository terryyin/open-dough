import { expect } from "vitest";
import { userEvent } from "vitest/browser";
import {
  composeBackgrounds,
  contrastRatio,
  painted,
} from "../../test-support/composedColours.ts";

export const narrowViewport = { width: 420, height: 900 };
export const zoomedViewport = { width: 320, height: 256 };

export function visibleParts(area: Element, selector: string) {
  return [...area.querySelectorAll(selector)].filter((part) =>
    part.checkVisibility({ visibilityProperty: true }),
  );
}

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

function showsFocus(element: Element) {
  const style = getComputedStyle(element);
  return (
    element.matches(":focus-visible") &&
    style.outlineStyle !== "none" &&
    parseFloat(style.outlineWidth) >= 2
  );
}

export function focusedAndVisible(element: Element) {
  expect(document.activeElement).toBe(element);
  expect(element.matches(":focus-visible")).toBe(true);
  const style = getComputedStyle(element);
  expect(style.outlineStyle).not.toBe("none");
  expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
}

// Each element that takes focus while `keys` go in one keyboard command, and
// whether it showed its focus as it was reached. Each separate command waits
// for a rendered frame, so a sequence of stops is pressed at once.
export async function focusStops(keys: string) {
  const reached: { element: Element; marked: boolean }[] = [];
  const record = ({ target }: FocusEvent) => {
    if (target instanceof Element)
      reached.push({ element: target, marked: showsFocus(target) });
  };
  document.addEventListener("focusin", record);
  try {
    await userEvent.keyboard(keys);
  } finally {
    document.removeEventListener("focusin", record);
  }
  return reached;
}

// Tab (or Shift+Tab) reaches exactly `stops` in order, each showing its focus.
export async function expectTabOrder(
  stops: readonly Element[],
  { shift = false } = {},
) {
  const keys = "{Tab}".repeat(stops.length);
  const reached = await focusStops(shift ? `{Shift>}${keys}{/Shift}` : keys);
  expect(reached).toHaveLength(stops.length);
  reached.forEach(({ element }, index) => {
    expect(element).toBe(stops[index]);
  });
  expect(reached.filter(({ marked }) => !marked)).toEqual([]);
  focusedAndVisible(stops.at(-1) ?? document.body);
}

export async function tabTo(element: Element) {
  for (let step = 0; step < 40; step += 1) {
    if (document.activeElement === element) return;
    await userEvent.tab();
  }
  throw new Error(`Tab never reached ${element.textContent}.`);
}

export function paintedBackground(element: Element | null) {
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
