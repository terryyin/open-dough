import type { Page } from "@playwright/test";
import { historyOf, openJudgedCiStatus } from "../intentCiHistoryPage.ts";

// Trunk's judged CI, published, and Project Intent's CI status opened on it.
export async function openCiStatus(page: Page) {
  return historyOf(await openJudgedCiStatus(page));
}
