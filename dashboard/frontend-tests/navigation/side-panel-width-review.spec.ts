import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  enableSettingsTouch,
  touchAt,
} from "../configuration/system-settings-browser.ts";
import { center } from "./board-reading-page.ts";
import {
  button,
  covering,
  divider,
  drag,
  files,
  focusDivider,
  keyStep,
  measured,
  minimum,
  mountWidthReview,
  narrow,
  panel,
  press,
  sessions,
  sidebar,
  wide,
  widthIs,
  withWidthStorage,
} from "./side-panel-width-view.ts";

test("review keeps its session, chosen file and reads through width and sidebar changes", async () => {
  withWidthStorage();
  const { review, fileDiff } = await mountWidthReview();
  const room = measured();
  const total = room.page.width + room.panel.width;
  const half = Math.round(total / 2);
  const maximum = Math.floor(total - minimum);
  const picked = "Modified unstaged.txt";
  await files.chooseFile(picked);
  await files.expectDiffShows(picked, "+more wide");
  expect(review).toHaveBeenCalled();
  expect(fileDiff).toHaveBeenCalled();
  const before = [review.mock.calls.length, fileDiff.mock.calls.length];
  const heading = panel.getByRole("heading", { level: 2 }).element();
  const retain = async () => {
    expect(panel.getByRole("heading", { level: 2 }).element()).toBe(heading);
    // A narrow panel starts Files closed; the diff shows the kept choice.
    await files.expectDiffShows(picked, "+more wide");
    expect([review.mock.calls.length, fileDiff.mock.calls.length]).toEqual(
      before,
    );
  };

  await drag(160);
  await widthIs(half - 160);
  focusDivider();
  await press("ArrowLeft");
  await widthIs(half - 160 + keyStep);
  await button("Maximize").click();
  await expect.element(divider).not.toBeInTheDocument();
  await sessions.click();
  await expect.element(sidebar).toBeVisible();
  await sessions.click();
  await expect.element(sidebar).not.toBeInTheDocument();
  await retain();
  await button("Restore").click();
  await widthIs(half - 160 + keyStep);

  focusDivider();
  await press("ArrowLeft", 40);
  await widthIs(maximum);
  await sessions.click();
  await expect.element(sidebar).toBeVisible();
  const sidebarBounds = sidebar.element().getBoundingClientRect();
  const beside = total - sidebarBounds.width;
  await widthIs(Math.floor(beside - minimum));
  const split = measured();
  expect(split.page.left).toBeCloseTo(sidebarBounds.right, 0);
  expect(split.page.right).toBeCloseTo(split.panel.left, 0);
  expect(split.page.width + split.panel.width).toBeCloseTo(beside, 0);
  expect(split.page.width).toBeGreaterThanOrEqual(minimum - 0.5);
  await expect
    .element(divider)
    .toHaveAttribute("aria-valuemax", String(Math.floor(beside - minimum)));
  await retain();
  await sessions.click();
  await widthIs(maximum);

  await page.viewport(narrow.width, narrow.height);
  await covering();
  await retain();
  await page.viewport(wide.width, wide.height);
  await widthIs(maximum);
  await retain();

  await sessions.click();
  await widthIs(Math.floor(beside - minimum));
  await drag(2000);
  await widthIs(minimum);
  focusDivider();
  await press("ArrowLeft", 3);
  await widthIs(minimum + 3 * keyStep);
  await sessions.click();
  await expect.element(sidebar).not.toBeInTheDocument();
  await widthIs(minimum + 3 * keyStep);
  await retain();
});

const shownBackdrops = () =>
  [...document.querySelectorAll(".sidebar-drawer-backdrop")].filter(
    (backdrop) => getComputedStyle(backdrop).display !== "none",
  );

test("in a narrow frame, Sessions over the Review Files drawer leaves one drawer that one outside tap dismisses, and docking releases the boundary", async () => {
  await enableSettingsTouch();
  const { review } = await mountWidthReview(narrow);
  await button("Show files").click();
  await expect.element(button("Hide files")).toBeVisible();

  await userEvent.keyboard("{Meta>}b{/Meta}");
  await expect.element(sidebar).toBeVisible();
  await expect.element(button("Show files")).toBeVisible();
  expect(shownBackdrops()).toHaveLength(1);

  const reads = review.mock.calls.length;
  const refresh = center(button("Refresh").element());
  expect(refresh.x).toBeGreaterThan(
    sidebar.element().getBoundingClientRect().right,
  );
  await touchAt(refresh.x, refresh.y);
  await expect.element(sidebar).not.toBeInTheDocument();
  await expect.element(button("Show files")).toBeVisible();
  expect(review.mock.calls.length).toBe(reads);
  expect(shownBackdrops()).toHaveLength(0);

  await button("Show files").click();
  expect(shownBackdrops()).toHaveLength(1);
  await page.viewport(wide.width, wide.height);
  await expect.element(button("Hide files")).toBeVisible();
  await expect.poll(() => shownBackdrops()).toHaveLength(0);
  const filesList = document.getElementById(
    button("Hide files").element().getAttribute("aria-controls") ?? "",
  );
  button("Hide files").element().focus();
  await userEvent.tab();
  expect(filesList?.contains(document.activeElement)).toBe(false);
  expect(document.activeElement).not.toBe(button("Hide files").element());

  // Replacing the panel content releases an open drawer's boundary.
  await page.viewport(narrow.width, narrow.height);
  await button("Show files").click();
  expect(shownBackdrops()).toHaveLength(1);
  // The backdrop takes a pointer on Close; the keyboard replaces the panel.
  button("Close").element().focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(panel).not.toBeInTheDocument();
  expect(shownBackdrops()).toHaveLength(0);
  const before = document.activeElement;
  await userEvent.tab();
  expect(document.activeElement).not.toBe(before);
});
