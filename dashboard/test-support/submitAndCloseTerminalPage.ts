// Command+Enter submit-and-close observations for a focused Side panel
// terminal (`../src/useSubmitAndCloseTerminal.ts`): the chord, confirmation
// unavailable status, and bringing a Claude listing change onto the page.

import { expect, type Locator, type Page } from "@playwright/test";
import { setPageVisibility } from "./autoRefreshJourney.ts";
import { sessionStateOf } from "./dashboardPage.ts";
import { confirmationUnavailable } from "../src/submitAndCloseTerminal.ts";
import { terminalStatus } from "./terminalScreenPage.ts";

export const submitAndCloseKey = "Meta+Enter";

export async function sessionReadsOnPage(
  page: Page,
  entry: Locator,
  reading: string,
) {
  await setPageVisibility(page, "hidden");
  await setPageVisibility(page, "visible");
  await expect(sessionStateOf(entry)).toHaveText(reading);
}

export async function expectConfirmationUnavailable(panel: Locator) {
  await expect(terminalStatus(panel)).toContainText(confirmationUnavailable);
}
