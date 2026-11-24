// Select a Recently done card and open its Intent without waiting for its
// evidence reads. Callers own the readiness of the view they consume.

import type { Page } from "@playwright/test";
import { showColumn } from "../boardPage.ts";
import { parts } from "../dashboardPage.ts";
import { expect } from "../dashboardTest.ts";
import { emptyArea, expectSelected } from "../storyCardSelection.ts";
import { openUntilRead } from "../pageRequestNotes.ts";

export async function selectDoneStoryInIntent(
  page: Page,
  title = "Story A",
  beforeIntent?: () => Promise<void>,
  address = "/",
) {
  await openUntilRead(page, address);
  await showColumn(page, "Recently done");
  const { recentlyDone, intentChoice, intent } = parts(page);
  const card = recentlyDone.getByRole("article", { name: title, exact: true });
  await emptyArea(card).click();
  await expectSelected(card, true);
  if (beforeIntent !== undefined) await beforeIntent();
  await intentChoice.click();
  await expect(intent).toBeVisible();
  const panel = intent.getByRole("region", {
    name: "CI timing comparison",
    exact: true,
  });
  return { intent, panel, card };
}
