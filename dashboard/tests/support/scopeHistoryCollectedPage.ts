import { comparisonReading } from "../intentCiComparisonPage.ts";
// Open a published Done story with historical sessions, finish its existing
// comparison reads, then let the case count local history navigation.
import type { Page } from "@playwright/test";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { showColumn } from "../boardPage.ts";
import { parts } from "../dashboardPage.ts";
import { chooseStoryTab } from "./intentStoryPage.ts";
import { expect } from "./preparationPage.ts";

export async function openCollectedHistoryStory(page: Page, address = "/") {
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
  // Explicitly finish the enclosing comparison/endpoint Proof reads before
  // counting historical navigation. Their legitimate reads are separate; use
  // the established comparison journey's bounded read readiness contract.
  await expect(panel).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  await expect(panel.locator(".intent-ci-reading")).toHaveCount(0, {
    timeout: readWaitLimitMs + 15_000,
  });
  await expect(comparisonReading(panel).entryTable).toBeVisible({
    timeout: readWaitLimitMs + 15_000,
  });
  await chooseStoryTab(intent, "Changed tests");
  return { intent, panel, card };
}
