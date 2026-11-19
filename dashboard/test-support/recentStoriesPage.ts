// Recent stories in the banner: the bookmark button and its popover list of
// recently selected stories (../src/recentStoriesControl.tsx).

import { expect, type Locator, type Page } from "@playwright/test";
import { parts } from "./dashboardParts.ts";

export function recentStoriesButton(page: Page): Locator {
  return parts(page).recentStories;
}

export function recentStoriesPopover(page: Page): Locator {
  return page.getByRole("dialog", { name: "Recent stories", exact: true });
}

export async function openRecentStories(page: Page): Promise<Locator> {
  await recentStoriesButton(page).click();
  const popover = recentStoriesPopover(page);
  await expect(popover).toBeVisible();
  return popover;
}

export async function expectRecentStoriesClosed(page: Page) {
  await expect(recentStoriesPopover(page)).toHaveCount(0);
}

export async function dismissRecentStoriesWithEscape(page: Page) {
  await page.keyboard.press("Escape");
  await expectRecentStoriesClosed(page);
}

export async function dismissRecentStoriesByBannerClick(page: Page) {
  await parts(page).banner.click({ position: { x: 4, y: 4 } });
  await expectRecentStoriesClosed(page);
}

export async function expectRecentStoriesButton(
  page: Page,
  {
    selected,
    filled,
  }: {
    readonly selected: string | undefined;
    readonly filled: boolean;
  },
) {
  const button = recentStoriesButton(page);
  const name =
    selected === undefined
      ? "Recent stories, no story selected"
      : `Recent stories, ${selected} selected`;
  await expect(button).toHaveAccessibleName(name);
  const icon = button.locator("svg");
  await expect(icon).toHaveCount(1);
  const fill = await icon.getAttribute("fill");
  if (filled) {
    expect(fill, "filled bookmark").toBe("currentColor");
  } else {
    expect(fill === null || fill === "none", "outline bookmark").toBe(true);
  }
}

export async function expectRecentStoriesEmpty(page: Page) {
  const popover = await openRecentStories(page);
  await expect(popover).toContainText("There are no recent stories.");
  await expect(popover.getByRole("option")).toHaveCount(0);
}

export async function expectRecentStoriesList(
  page: Page,
  rows: readonly {
    readonly project: string;
    readonly identity: string;
    readonly checked: boolean;
  }[],
) {
  const popover = await openRecentStories(page);
  const options = popover.getByRole("option");
  await expect(options).toHaveCount(rows.length);
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (row === undefined) continue;
    const option = options.nth(index);
    await expect(option).toContainText(row.project);
    await expect(option).toContainText(row.identity);
    await expect(option).toHaveAttribute(
      "aria-selected",
      row.checked ? "true" : "false",
    );
  }
}
