// Intent Recent stories journeys (../src/recentStoriesControl.tsx): return
// from Project Intent to the story view, choose another row while Intent
// stays, and select an unavailable Board story with nothing new added.

import { expect, type Locator, type Page } from "@playwright/test";
import {
  storyA,
  storyB,
} from "../../Distribution/tests/support/queued-repository.mjs";
import { parts } from "./dashboardPage.ts";
import {
  backToStory,
  expectIntentModeChosen,
  intentPageFrame,
  openProjectIntent,
  storyIntentFrame,
  storySummary,
} from "./intentModePage.ts";
import {
  chooseRecentStory,
  expectRecentStoriesButton,
  expectRecentStoriesClosed,
  expectRecentStoriesList,
  recentStoriesButton,
  seedRecentStoriesHistory,
  startIsReadable,
} from "./recentStoriesPage.ts";
import { referenceNotice } from "./storyReference.ts";
import { emptyArea, expectSelected } from "./storyCardSelection.ts";
import { selectTakenStoryInIntent } from "./support/frontendIntentVisits.ts";
import type { FrontendServiceState } from "./support/frontendServiceState.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

export const storyAIdentity = storyA.identity;
export const storyBIdentity = storyB.identity;

export async function openTakenStoryInIntent(
  page: Page,
  services: FrontendServiceState,
) {
  await page.setViewportSize({ width: 1280, height: 800 });
  return selectTakenStoryInIntent(page, services);
}

export async function expectIntentPerspective(page: Page) {
  const { intent, intentChoice } = parts(page);
  await expect(intentChoice).toBeChecked();
  await expect(intent).toBeVisible();
  expect(new URL(page.url()).searchParams.get("perspective")).toBe("intent");
}

export async function expectStoryViewShown(intent: Locator, identity: string) {
  await expect(intent).toHaveAttribute("data-selected-story", identity);
  await expect(intentPageFrame(intent)).toHaveAttribute(
    "data-intent-context",
    "story",
  );
  await expect(storySummary(intent)).toBeVisible();
  await expect(backToStory(intent)).toHaveCount(0);
  await expect(storyIntentFrame(intent)).toBeVisible();
}

async function intentStoryStartReadable(intent: Locator): Promise<boolean> {
  const start = storyIntentFrame(intent).locator("[data-intent-home]");
  if ((await start.count()) === 0) return false;
  return startIsReadable(start);
}

export async function expectIntentStoryRevealed(
  page: Page,
  intent: Locator,
  identity: string,
) {
  await expectIntentPerspective(page);
  await expectStoryViewShown(intent, identity);
  await expectRecentStoriesClosed(page);
  await expect.poll(() => intentStoryStartReadable(intent)).toBe(true);
}

// Example 7: Project Intent → button returns to A's story view; second click lists.
export async function returnFromProjectIntentThenList(
  page: Page,
  intent: Locator,
) {
  await openProjectIntent(intent);
  await expectIntentModeChosen(intent, "CI status");
  await recentStoriesButton(page).click();
  await expectIntentStoryRevealed(page, intent, storyAIdentity);
  await expectRecentStoriesList(page, [
    { project: "Open Dough", identity: storyAIdentity, checked: true },
  ]);
}

// Remember A then B in Development, reopen Intent on A, choose B's row.
export async function chooseStoryBWhileInIntent(
  page: Page,
  intent: Locator,
  cardA: Locator,
) {
  const { development, intentChoice, backlog } = parts(page);
  await development.click();
  // A remains selected from Intent; do not toggle it off.
  await expectSelected(cardA, true);
  const cardB = backlog.getByRole("article", {
    name: storyB.title,
    exact: true,
  });
  await emptyArea(cardB).click();
  await expectSelected(cardB, true);
  await emptyArea(cardA).click();
  await expectSelected(cardA, true);
  await intentChoice.click();
  await expectIntentPerspective(page);
  await expectStoryViewShown(intent, storyAIdentity);
  await chooseRecentStory(page, {
    project: "Open Dough",
    identity: storyBIdentity,
  });
  await expectIntentStoryRevealed(page, intent, storyBIdentity);
  await expectRecentStoriesButton(page, {
    selected: storyBIdentity,
    filled: true,
  });
}

// G1: unavailable Board story chosen in Intent — selected, no new notice.
export async function chooseUnavailableInIntent(page: Page, intent: Locator) {
  const gone = "GONE-1#nope";
  await seedRecentStoriesHistory(page, [
    { project: "open-dough", identity: gone },
    { project: "open-dough", identity: storyAIdentity },
  ]);
  await reloadUntilRead(page);
  await parts(page).intentChoice.click();
  await expectIntentPerspective(page);
  await expectRecentStoriesButton(page, {
    selected: undefined,
    filled: false,
  });
  await chooseRecentStory(page, {
    project: "Open Dough",
    identity: gone,
  });
  await expect(intent).toHaveAttribute("data-selected-story", gone);
  await expectRecentStoriesButton(page, {
    selected: gone,
    filled: true,
  });
  // The notice region is always mounted; Intent adds no unavailable message.
  await expect(referenceNotice(page)).not.toContainText("unavailable");
  await expect(referenceNotice(page).locator("p")).toHaveCount(0);
  await expectIntentPerspective(page);
}
