// Open a published Done story with historical sessions in Intent, and for a
// case that counts local history navigation, finish its existing comparison
// reads first.
import type { Page } from "@playwright/test";
import { comparisonReading } from "../intentCiComparisonPage.ts";
import { showColumn } from "../boardPage.ts";
import { parts } from "../dashboardPage.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import { chooseStoryTab } from "./intentStoryPage.ts";
import { expect } from "./preparationPage.ts";

// Selects the published Done story's card and opens its Intent, whose CI
// timing comparison then reads the story's comparison and endpoint proofs.
export async function openDoneStoryIntent(page: Page, address = "/") {
  await page.goto(address);
  await showColumn(page, "Recently done");
  const { recentlyDone, intentChoice, intent } = parts(page);
  const card = recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  // The card also contains historical session headings. Select its own
  // heading, which names the published Done story above those sessions.
  await card.locator(":scope > h3").click();
  await expect(card).toHaveClass(/story-card-selected/);
  await intentChoice.click();
  const panel = intent.getByRole("region", {
    name: "CI timing comparison",
    exact: true,
  });
  return { intent, panel, card };
}

export async function openCollectedHistoryStory(page: Page, address = "/") {
  const { intent, panel, card } = await openDoneStoryIntent(page, address);
  // Finish the enclosing comparison and endpoint Proof reads before counting
  // historical navigation: once the panel has sent them, every read the page
  // sent is answered and led to no further read, and the panel then shows
  // what they answered.
  await expect(panel).toBeVisible();
  await untilPageReadsAnswered(page);
  await expect(panel.locator(".intent-ci-reading")).toHaveCount(0);
  await expect(comparisonReading(panel).entryTable).toBeVisible();
  await chooseStoryTab(intent, "Changed tests");
  return { intent, panel, card };
}
