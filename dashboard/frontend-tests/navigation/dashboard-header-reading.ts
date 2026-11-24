import { expect } from "vitest";
import { page, type Locator } from "vitest/browser";
import { expectDocumentStill, visibleParts } from "./board-accessibility.ts";
import { fitsViewport } from "./frame-icon-control.ts";

export const banner = page.getByRole("banner");
export const sessions = banner.getByRole("button", {
  name: "Sessions",
  exact: true,
});
export const perspective = banner.getByRole("radiogroup", {
  name: "Perspective",
});
export const recentStories = banner.getByRole("button", {
  name: /^Recent stories,/,
});
export const projectChoices = banner.getByRole("radiogroup", {
  name: "Project",
  exact: true,
});
export const compactProject = banner.getByRole("button", {
  name: "Project",
  exact: true,
});
export const settings = banner.getByRole("button", {
  name: "System settings",
  exact: true,
});

export async function expectBannerRow(project: Locator) {
  await expect.element(project).toBeInViewport({ ratio: 1 });
  const controls = [
    ["Sessions", sessions],
    ["Perspective", perspective],
    ["Recent stories", recentStories],
    ["Project", project],
    ["System settings", settings],
  ] as const;
  const first = sessions.element().getBoundingClientRect();
  const middle = first.top + first.height / 2;
  let previousRight = 0;
  for (const [name, control] of controls) {
    const element = control.element();
    const { left, right, top, height } = element.getBoundingClientRect();
    expect(left, name).toBeGreaterThanOrEqual(previousRight - 0.5);
    expect(top + height / 2, name).toBeCloseTo(middle, 0);
    expect(fitsViewport(element), name).toBe(true);
    previousRight = right;
  }
  const frame = banner.element().getBoundingClientRect();
  expect(frame.top).toBe(0);
  expect(frame.height).toBeLessThan(innerHeight / 2);
}

export function bannerStops() {
  return visibleParts(
    banner.element(),
    "button, input, select, textarea, summary, a[href], [tabindex]",
  );
}

export function expectOnlyBannerControls() {
  expect(banner.getByRole("heading", { level: 1 }).query()).toBeNull();
  expect(
    banner.getByRole("img", { name: "Open Dough", exact: true }).query(),
  ).toBeNull();
  expect(
    banner.getByRole("button", { name: /^(Refresh|Retry)$/ }).query(),
  ).toBeNull();
  expect(banner.element().querySelector("svg.lucide-panel-left")).toBeNull();
}

// Columns paged out of the Board, compact titles and keyboard-only labels
// have other ways to be read. Check the text a reader can see here.
export function expectFrameTextWhole() {
  expectDocumentStill();
  const area = page.getByRole("main").element().closest(".page-column");
  if (area === null) throw new Error("Expected the dashboard's page column.");
  const walker = document.createTreeWalker(area, NodeFilter.SHOW_TEXT);
  for (let text = walker.nextNode(); text; text = walker.nextNode()) {
    const label = text.parentElement;
    if (
      label === null ||
      !text.textContent?.trim() ||
      !label.checkVisibility({ visibilityProperty: true }) ||
      label.closest(".project-title-select, .visually-hidden, .spoken-only")
    )
      continue;
    const bounds = label.getBoundingClientRect();
    const view = label.closest(".board-view")?.getBoundingClientRect();
    if (
      view &&
      (bounds.right <= view.left + 0.5 || bounds.left >= view.right - 0.5)
    )
      continue;
    const range = new Range();
    range.selectNodeContents(text);
    const clipping = getComputedStyle(label).overflowX;
    const clipped = clipping === "hidden" || clipping === "clip";
    const leftEdge = Math.max(0, view?.left ?? 0, clipped ? bounds.left : 0);
    const rightEdge = Math.min(
      innerWidth,
      view?.right ?? innerWidth,
      clipped ? bounds.right : innerWidth,
    );
    for (const { left, right } of range.getClientRects()) {
      expect(left, text.textContent).toBeGreaterThanOrEqual(leftEdge - 1);
      expect(right, text.textContent).toBeLessThanOrEqual(rightEdge + 1);
    }
  }
}
