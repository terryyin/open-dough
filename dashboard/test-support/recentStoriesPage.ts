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

// Browser mirror of ../src/pageMovement.ts `startIsReadable` (readingBounds
// start rule) for Recent stories return settle and scroll preconditions.
async function startIsReadable(part: Locator): Promise<boolean> {
  return part.evaluate((element) => {
    const region = element.closest<HTMLElement>(
      ".board-scroll, .roster-scroll",
    );
    const at = element.getBoundingClientRect();
    const box = region?.getBoundingClientRect();
    const padding = getComputedStyle(region ?? document.documentElement);
    const top =
      (box?.top ?? 0) + (Number.parseFloat(padding.scrollPaddingTop) || 0);
    const bottom =
      (box?.bottom ?? innerHeight) -
      (Number.parseFloat(padding.scrollPaddingBottom) || 0);
    const left = box?.left ?? 0;
    const right = box?.right ?? innerWidth;
    const visibleOn = (start: number, end: number, low: number, high: number) =>
      ((start + end) / 2 >= low && (start + end) / 2 <= high) ||
      (start <= low && end >= high);
    return (
      at.top >= top &&
      at.top <= bottom &&
      visibleOn(at.left, at.right, left, right)
    );
  });
}

async function selectedCardStartReadable(page: Page): Promise<boolean> {
  const selected = page.locator(".story-card-selected");
  if ((await selected.count()) === 0) return true;
  return startIsReadable(selected.first());
}

export async function openRecentStories(page: Page): Promise<Locator> {
  const button = recentStoriesButton(page);
  await button.click();
  const popover = recentStoriesPopover(page);
  // When a selected story's start is out of view, the first click returns to
  // it and leaves the popover closed; wait for that settle, then open.
  if ((await popover.count()) === 0) {
    await expect.poll(() => selectedCardStartReadable(page)).toBe(true);
    await button.click();
  }
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

export function recentStoriesRow(
  page: Page,
  {
    project,
    identity,
  }: {
    readonly project: string;
    readonly identity: string;
  },
): Locator {
  return recentStoriesPopover(page)
    .getByRole("option")
    .filter({ hasText: project })
    .filter({ hasText: identity });
}

// Chooses the Recent stories row for that project and story identity, then
// waits until the popover has closed.
export async function chooseRecentStory(
  page: Page,
  row: { readonly project: string; readonly identity: string },
) {
  const popover = recentStoriesPopover(page);
  if ((await popover.count()) === 0) await openRecentStories(page);
  await recentStoriesRow(page, row).click();
  await expectRecentStoriesClosed(page);
}
