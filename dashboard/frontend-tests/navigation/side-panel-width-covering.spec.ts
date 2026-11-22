import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { focusedAndVisible, readsWhole } from "./board-accessibility.ts";
import {
  banner,
  button,
  covering,
  divider,
  drag,
  measured,
  minimum,
  mountWidthReview,
  narrow,
  openReview,
  panel,
  sessions,
  sidebar,
  wide,
  widthIs,
  withWidthStorage,
} from "./side-panel-width-view.ts";

test("a narrow window covers the page and widening restores width and Maximize choice", async () => {
  withWidthStorage();
  await mountWidthReview();
  const start = measured();
  const chosen = Math.floor(start.page.width + start.panel.width - minimum);
  await drag(-2000);
  await widthIs(chosen);
  await page.viewport(narrow.width, narrow.height);
  await covering();
  expect(measured().panel.width).toBeCloseTo(
    document.documentElement.clientWidth,
    0,
  );
  expect(measured().panel.height).toBeCloseTo(innerHeight, 0);
  await sessions.click();
  await expect.element(sidebar).toBeVisible();
  await sessions.click();
  await expect.element(sidebar).not.toBeInTheDocument();

  expect(document.documentElement.scrollWidth).toBe(
    document.documentElement.clientWidth,
  );
  const heading = panel.getByRole("heading", { level: 2 }).element();
  const bounds = heading.getBoundingClientRect();
  expect(bounds.top).toBeGreaterThanOrEqual(0);
  expect(bounds.bottom).toBeLessThanOrEqual(innerHeight);
  expect(readsWhole(heading, panel.element())).toBe(true);
  for (const control of panel.getByRole("button").elements()) {
    control.scrollIntoView({ block: "nearest", inline: "nearest" });
    const { top, bottom, left, right } = control.getBoundingClientRect();
    expect(top).toBeGreaterThanOrEqual(0);
    expect(bottom).toBeLessThanOrEqual(innerHeight);
    expect(left).toBeGreaterThanOrEqual(0);
    expect(right).toBeLessThanOrEqual(document.documentElement.clientWidth);
  }
  const close = button("Close").element();
  if (!(close instanceof HTMLElement))
    throw new Error("The Close control cannot be focused.");
  close.focus();
  await userEvent.tab({ shift: true });
  await userEvent.tab();
  focusedAndVisible(close);

  await page.viewport(wide.width, wide.height);
  await widthIs(chosen);
  await expect.element(button("Maximize")).toBeVisible();
  await expect.element(banner).toBeVisible();
  await button("Close").click();
  await expect.element(panel).not.toBeInTheDocument();
  await openReview();
  await widthIs(chosen);

  await button("Maximize").click();
  await expect.element(button("Restore")).toBeVisible();
  await page.viewport(narrow.width, narrow.height);
  await covering();
  await page.viewport(wide.width, wide.height);
  await expect.element(button("Restore")).toBeVisible();
  await expect.element(button("Maximize")).not.toBeInTheDocument();
  await expect.element(divider).not.toBeInTheDocument();
  await expect.element(banner).not.toBeInTheDocument();
  await button("Restore").click();
  await widthIs(chosen);
  await expect.element(button("Maximize")).toBeVisible();
  await expect.element(banner).toBeVisible();
});

test("the open sidebar leaves too little room and the panel fills the remaining column", async () => {
  withWidthStorage();
  await mountWidthReview();
  await sessions.click();
  await expect.element(sidebar).toBeVisible();
  await page.viewport(880, 900);
  await covering();
  const side = sidebar.element().getBoundingClientRect();
  const shown = measured().panel;
  expect(shown.left).toBeCloseTo(side.right, 0);
  expect(shown.width).toBeCloseTo(
    document.documentElement.clientWidth - side.right,
    0,
  );
  expect(shown.height).toBeCloseTo(innerHeight, 0);
  await button("Close").click();
  await expect.element(banner).toBeVisible();
});
