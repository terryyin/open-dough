import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { boardReading, storyCard } from "./board-reading-page.ts";
import { readingTop } from "./board-session-view.ts";
import { showsMovingCue } from "./story-destination-cue.ts";

export const recent = page.getByRole("button", { name: /^Recent stories,/ });
export const popover = page.getByRole("dialog", {
  name: "Recent stories",
  exact: true,
});
export const wholeProject = popover.getByRole("button", {
  name: "Whole project",
  exact: true,
});
const history = popover.getByRole("list", {
  name: "Recent stories",
  exact: true,
});
const recentChoices = history.getByRole("button");
export const roster = page.getByRole("region", {
  name: "Agent roster",
  exact: true,
});

export async function activate(control: Locator) {
  await expect.element(control).toBeVisible();
  const element = control.element();
  if (!(element instanceof HTMLElement))
    throw new Error("Expected an HTML control.");
  element.click();
}

export async function selectCard(title: string, selected = true) {
  const card = storyCard(title);
  await activate(card.getByRole("heading", { level: 3 }).first());
  await boardReading.expectStorySelection(card, selected);
}

export async function showsBookmark(identity?: string) {
  const name =
    identity === undefined
      ? "Recent stories, no story selected"
      : `Recent stories, ${identity} selected`;
  await expect.element(recent).toHaveAccessibleName(name);
  showsBookmarkFill(identity !== undefined);
}

export function showsBookmarkFill(filled: boolean) {
  const icons = recent.element().querySelectorAll("svg");
  expect(icons).toHaveLength(1);
  const icon = icons.item(0);
  expect(icon.getAttribute("fill") ?? "none").toBe(
    filled ? "currentColor" : "none",
  );
}

export async function showsEmptyHistory() {
  await expect.element(wholeProject).toHaveAttribute("aria-current", "true");
  await expect.element(history).not.toBeInTheDocument();
}

export async function showsHistory(
  rows: readonly [project: string, identity: string, selected: boolean][],
) {
  await expect.poll(() => recentChoices.elements().length).toBe(rows.length);
  for (const [index, [project, identity, selected]] of rows.entries()) {
    const row = recentChoices.nth(index);
    await expect.element(row.getByText(project, { exact: true })).toBeVisible();
    await expect
      .element(row.getByText(identity, { exact: true }))
      .toBeVisible();
    if (selected) {
      await expect.element(row).toHaveAttribute("aria-current", "true");
    } else {
      await expect.element(row).not.toHaveAttribute("aria-current");
    }
  }
}

export async function dismissWithEscape() {
  await userEvent.keyboard("{Escape}");
  await expect.element(popover).not.toBeInTheDocument();
  await expect.element(recent).toHaveFocus();
}

export const recentChoice = (project: string, identity: string) =>
  recentChoices
    .filter({ has: page.getByText(project, { exact: true }) })
    .filter({ has: page.getByText(identity, { exact: true }) });

export async function chooseRecent(project: string, identity: string) {
  await activate(recentChoice(project, identity));
  await expect.element(popover).not.toBeInTheDocument();
}

export async function showsRevealed(card: Locator) {
  await boardReading.expectStoryHighlight(card);
  await expect.element(card).toHaveFocus();
  await readingTop(card.element());
  await showsMovingCue(card);
}
