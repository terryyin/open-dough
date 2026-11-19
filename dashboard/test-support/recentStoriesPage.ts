// Recent stories in the banner: the bookmark button and its popover list of
// recently selected stories (../src/recentStoriesControl.tsx).

import { expect, type Locator, type Page } from "@playwright/test";
import { expectRoute } from "./agentRosterRecords.ts";
import { parts, rosterParts } from "./dashboardParts.ts";
import { expectDestinationCue } from "./destinationCue.ts";
import { expectProjectChoice, projectTab } from "./projectChoice.ts";
import { expectReadingTop } from "./readingPlace.ts";
import { recentStoriesKey, type RecentStory } from "../src/recentStories.ts";
import { emptyArea, expectSelected } from "./storyCardSelection.ts";
import { storyCard } from "./storyCardControls.ts";

export function recentStoriesButton(page: Page): Locator {
  return parts(page).recentStories;
}

export function recentStoriesPopover(page: Page): Locator {
  return page.getByRole("dialog", { name: "Recent stories", exact: true });
}

// Browser mirror of ../src/pageMovement.ts `startIsReadable` (readingBounds
// start rule) for Recent stories return settle and scroll preconditions.
export async function cardStartIsReadable(card: Locator): Promise<boolean> {
  return card.evaluate((element) => {
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
  return cardStartIsReadable(selected.first());
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

// Writes the Recent stories disposable-storage history for journeys that need
// an entry the Board cannot select (for example a gone identity).
export async function seedRecentStoriesHistory(
  page: Page,
  history: readonly RecentStory[],
) {
  await page.evaluate(
    ({ key, entries }) => {
      localStorage.setItem(key, JSON.stringify(entries));
    },
    { key: recentStoriesKey, entries: [...history] },
  );
}

// Shows Development's Roster for `projectId` without clearing the Selected
// story (client history, not a full navigation).
export async function showRosterKeepingSelection(
  page: Page,
  projectId: string,
) {
  await page.evaluate((id) => {
    window.history.pushState(null, "", `/?project=${id}&view=roster`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, projectId);
  await expect(rosterParts(page).roster).toBeVisible();
  expectRoute(page, { project: projectId, view: "roster" });
}

export async function selectStoryOnProject(
  page: Page,
  projectLabel: string,
  card: Locator,
) {
  await projectTab(page, projectLabel).check();
  await expectProjectChoice(page, projectLabel);
  await emptyArea(card).click();
  await expectSelected(card, true);
}

export async function expectColumnsForProject(
  page: Page,
  project: { readonly id: string; readonly label: string },
) {
  await expect(rosterParts(page).roster).toHaveCount(0);
  await expectProjectChoice(page, project.label);
  expectRoute(page, { project: project.id, view: null });
}

// Selected, focused, at the reading top, and destination-cued — the
// Development reveal a Recent stories choose shares with a story reference.
export async function expectStoryRevealedInDevelopment(
  page: Page,
  card: Locator,
) {
  await expectSelected(card, true);
  await expect(card).toBeFocused();
  await expectReadingTop(card);
  await expectDestinationCue(page, card, { motion: true });
}

// Selects each story in order by its Backlog card's empty area.
export async function selectStoriesInTurn(
  page: Page,
  titles: readonly string[],
) {
  const { backlog } = parts(page);
  for (const title of titles) {
    await emptyArea(storyCard(backlog, title)).click();
  }
}
