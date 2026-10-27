// Marking a Cursor session done locally, through the ask-first question
// whose wording claims only a dashboard acknowledgement, never a stop.
import { expect, type Locator, type Page } from "@playwright/test";
import { parts } from "../dashboardPage.ts";
import { expectQuestion, markAsDone, markDone } from "./markDone.ts";

export const localWorkingStatement =
  "This session is still working. Marking it done only acknowledges it in this dashboard; it does not stop the session.";

// Answers the local-only ask-first question within `surface`, asked from
// its `control`, and returns the Recently done entry.
async function answerLocalDone(
  page: Page,
  control: Locator,
  surface: Locator,
): Promise<Locator> {
  await markAsDone(control).click();
  await expect(surface).not.toContainText("Marking it done asks it to stop.");
  const question = await expectQuestion(surface, localWorkingStatement);
  await markDone(question);
  const recent = parts(page).recentlyDone.locator(".session-entry");
  await expect(recent).toHaveCount(1);
  return recent;
}

// Marks the entry done through its ask-first question and returns the
// Recently done entry.
export async function markLocallyDone(
  page: Page,
  entry: Locator,
): Promise<Locator> {
  return answerLocalDone(page, entry, entry);
}

// Marks the session done from its open terminal's header Mark as
// done, through the same local-only ask-first question, and returns the
// Recently done entry.
export async function markLocallyDoneFromPanel(
  page: Page,
  panel: Locator,
): Promise<Locator> {
  return answerLocalDone(page, panel.locator("header"), panel);
}
