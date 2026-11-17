// Taken follow-up source reference: naming and reveal observations for
// `../../frontend-tests/sessions/follow-up-source-navigation.spec.ts`.

import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { parts } from "../dashboardPage.ts";
import { doneCard } from "../recentlyDoneReviewState.ts";
import { showLatestAction } from "../recentlyDoneColumn.ts";
import { referenceNotice } from "../storyReference.ts";
import {
  openBoard,
  sourceStory,
  storyFollowUp,
} from "./recentlyDoneFollowUpGrouping.ts";
import {
  putFrontendDoneRecords,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

export { sourceStory, storyFollowUp, openBoard };

export const sourceFileName = doneRecordFileName(sourceStory.identity);

export const followUpSourceLink = (entry: Locator, name: string) =>
  entry.getByRole("link", { name, exact: true });

export async function followSource(
  entry: Locator,
  name: string,
  using: "click" | "keyboard" = "click",
) {
  const link = followUpSourceLink(entry, name);
  if (using === "keyboard") {
    await link.focus();
    await link.press("Enter");
  } else {
    await link.click();
  }
}

export const sourceDoneCard = (page: Page, title = sourceStory.title) =>
  doneCard(page, title);

export const sourceNotice = (page: Page) => referenceNotice(page);

export const showLatestTen = (page: Page) =>
  showLatestAction(parts(page).recentlyDone);

function doneRecord(identity: string, title: string, completed: string) {
  return makeMe.aDoneRecord
    .with({
      identity,
      title,
      completedAt: completed,
      developer: "Terry Yin",
      agent: "viktor-chan",
      host: "codex",
    })
    .please();
}

// Recent fillers plus the source, newest first by completion: source at
// `sourceAt` (0-based among the listed cards).
export function publishRecentSourceBatch(
  services: FrontendServiceState,
  {
    sourceAt,
    fillers = 11,
  }: {
    readonly sourceAt: number;
    readonly fillers?: number;
  },
) {
  const now = Date.now();
  const records = Array.from({ length: fillers + 1 }, (...[, position]) => {
    const completed = new Date(now - position * 60_000).toISOString();
    if (position === sourceAt) {
      return doneRecord(sourceStory.identity, sourceStory.title, completed);
    }
    return doneRecord(
      `SEED-390#recent-filler-${position}`,
      `Recent filler ${position}`,
      completed,
    );
  });
  putFrontendDoneRecords(services, "open-dough", records);
}

export function publishOlderSource(
  services: FrontendServiceState,
  {
    olderCompletedAt,
    recentFillers = 10,
  }: {
    readonly olderCompletedAt: string;
    readonly recentFillers?: number;
  },
) {
  const now = Date.now();
  const recent = Array.from({ length: recentFillers }, (...[, index]) =>
    doneRecord(
      `SEED-390#window-filler-${index}`,
      `Window filler ${index}`,
      new Date(now - (index + 1) * 60_000).toISOString(),
    ),
  );
  putFrontendDoneRecords(services, "open-dough", [
    ...recent,
    doneRecord(sourceStory.identity, sourceStory.title, olderCompletedAt),
  ]);
}
