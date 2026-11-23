import { expect, test } from "vitest";
import { page } from "vitest/browser";
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
    await files.expectSelected(picked);
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
