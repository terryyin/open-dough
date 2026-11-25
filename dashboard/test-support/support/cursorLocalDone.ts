// Marking a Cursor session done locally, through the ask-first question
// whose wording claims only a dashboard acknowledgement, never a stop.
import { expect, type Locator, type Page } from "@playwright/test";
import {
  expandStoryCardDoneHistory,
  parts,
  sessionEntriesIn,
} from "../dashboardParts.ts";
import { storyCard } from "../storyCardControls.ts";
import { expectQuestion, markAsDone, markDone } from "./markDone.ts";
import { sessionActions } from "./sessionEntryDisclosure.ts";

export const localWorkingStatement =
  "This session is still working. Marking it done only acknowledges it in this dashboard; it does not stop the session.";

// Answers the local-only ask-first question within `surface`, asked from
// its `control`, and opens the story's Done session entry.
async function answerLocalDone(
  page: Page,
  title: string,
  control: Locator,
  surface: Locator,
): Promise<Locator> {
  await sessionActions(control);
  await markAsDone(control).click();
  await expect(surface).not.toContainText("Marking it done asks it to stop.");
  const question = await expectQuestion(surface, localWorkingStatement);
  await markDone(question);
  return locallyDoneOnTakenStory(page, title);
}

export async function locallyDoneOnTakenStory(page: Page, title: string) {
  const card = storyCard(parts(page).taken, title);
  const history = await expandStoryCardDoneHistory(card);
  const entry = sessionEntriesIn(history);
  await expect(entry).toHaveCount(1);
  return entry;
}

// Marks the entry done through its ask-first question and returns the
// story's Done session entry.
export async function markLocallyDone(
  page: Page,
  title: string,
  entry: Locator,
): Promise<Locator> {
  return answerLocalDone(page, title, entry, entry);
}

// Marks the session done from its open terminal's header Mark as
// done, through the same local-only ask-first question.
export async function markLocallyDoneFromSidePanel(
  page: Page,
  title: string,
  panel: Locator,
): Promise<Locator> {
  return answerLocalDone(page, title, panel.locator("header"), panel);
}
