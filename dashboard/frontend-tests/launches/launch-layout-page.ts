import { expect } from "vitest";
import { page, type Locator } from "vitest/browser";
import { scaleDevice } from "../../test-support/component-mount/deviceScale.ts";

export const narrowDialog = { width: 320, height: 640 };
export const twiceZoomedDialog = { width: 640, height: 450 };
export const phone = {
  portrait: { width: 390, height: 844 },
  landscape: { width: 844, height: 390 },
  short: { width: 390, height: 300 },
};

export async function resizeLaunchViewport({
  width,
  height,
}: typeof narrowDialog) {
  await page.viewport(width, height);
  await expect.poll(() => [innerWidth, innerHeight]).toEqual([width, height]);
  await new Promise((painted) =>
    requestAnimationFrame(() => requestAnimationFrame(painted)),
  );
}

export async function zoomToTwoHundredPercent() {
  await resizeLaunchViewport(twiceZoomedDialog);
  await scaleDevice(2);
  expect([innerWidth, innerHeight]).toEqual([
    twiceZoomedDialog.width,
    twiceZoomedDialog.height,
  ]);
}

export function box(control: Locator) {
  return control.element().getBoundingClientRect().toJSON() as DOMRectReadOnly;
}

export function noSidewaysScroll(container: Locator) {
  const element = container.element();
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
    innerWidth + 1,
  );
  for (const part of [
    element,
    ...element.querySelectorAll(
      "form, fieldset, details, [role=group], .launch-dialog-body",
    ),
  ])
    expect(
      part.scrollWidth,
      part.getAttribute("class") ?? undefined,
    ).toBeLessThanOrEqual(part.clientWidth + 1);
}

export function controlsAreReachable(container: Locator) {
  for (const control of container
    .element()
    .querySelectorAll<HTMLElement>(
      "button, input:not([type=file]), select, summary, textarea, [role=button]",
    )) {
    if (control.getClientRects().length === 0) continue;
    const target = touchedPart(control);
    const hit = centreHit(target);
    const { left, right, top, bottom } = target.getBoundingClientRect();
    expect(left, target.textContent).toBeGreaterThanOrEqual(-1);
    expect(right, target.textContent).toBeLessThanOrEqual(innerWidth + 1);
    expect(bottom, target.textContent).toBeGreaterThan(0);
    expect(top, target.textContent).toBeLessThan(innerHeight);
    expect(target.contains(hit), target.textContent).toBe(true);
  }
}

function touchedPart(control: HTMLElement) {
  return control instanceof HTMLInputElement &&
    (control.type === "radio" || control.type === "checkbox")
    ? (control.labels?.[0] ?? control)
    : control;
}

function centreHit(target: HTMLElement) {
  target.scrollIntoView({ block: "nearest", inline: "nearest" });
  const { left, top, width, height } = target.getBoundingClientRect();
  return document.elementFromPoint(left + width / 2, top + height / 2);
}

function nameOf(control: HTMLElement) {
  const labelled =
    control.getAttribute("aria-label") ??
    (control as HTMLInputElement).labels?.[0]?.textContent;
  return (labelled ?? control.textContent).trim() || control.tagName;
}

export async function touch(control: Locator) {
  await expect.element(control).toBeVisible();
  const element = control.element() as HTMLElement;
  const target = touchedPart(element);
  expect(
    target.contains(centreHit(target)),
    `touch reaches ${nameOf(element)}`,
  ).toBe(true);
  return target;
}

export async function chooseByTouch(control: Locator, value: string) {
  const select = (await touch(control)) as HTMLSelectElement;
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

export async function insertAtCaret(control: Locator, text: string) {
  (await touch(control)).focus();
  // insertText runs the browser's own editing path at the caret, as typing does.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  document.execCommand("insertText", false, text);
}

export function textFitsViewport(control: Locator) {
  const range = document.createRange();
  range.selectNodeContents(control.element());
  for (const { left, right, top, bottom } of range.getClientRects()) {
    expect(left).toBeGreaterThanOrEqual(-1);
    expect(right).toBeLessThanOrEqual(innerWidth + 1);
    expect(top).toBeGreaterThanOrEqual(-1);
    expect(bottom).toBeLessThanOrEqual(innerHeight + 1);
  }
}

export function splitWords(control: Locator) {
  const walker = document.createTreeWalker(
    control.element(),
    NodeFilter.SHOW_TEXT,
  );
  const split: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    for (const match of (node.textContent ?? "").matchAll(/\p{L}+/gu)) {
      const word = document.createRange();
      word.setStart(node, match.index);
      word.setEnd(node, match.index + match[0].length);
      if (
        new Set(
          Array.from(word.getClientRects(), (rect) => Math.round(rect.top)),
        ).size > 1
      )
        split.push(match[0]);
    }
  }
  return split;
}
