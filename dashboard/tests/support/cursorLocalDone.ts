// Marking a Cursor session done locally, through the ask-first question
// whose wording claims only a dashboard acknowledgement, never a stop.
import { expect, type Locator, type Page } from "@playwright/test";
import { parts } from "../dashboardPage.ts";
import { expectQuestion, markAsDone, markDone } from "./markDone.ts";

export const localWorkingStatement =
  "This session is still working. Marking it done only acknowledges it in this dashboard; it does not stop the session.";

// Marks the entry done through its ask-first question and returns the
// Recently done entry.
export async function markLocallyDone(
  page: Page,
  entry: Locator,
): Promise<Locator> {
  await markAsDone(entry).click();
  await expect(entry).not.toContainText("Marking it done asks it to stop.");
  const question = await expectQuestion(entry, localWorkingStatement);
  await markDone(question);
  const recent = parts(page).recentlyDone.locator(".session-entry");
  await expect(recent).toHaveCount(1);
  return recent;
}
