// Catalogued done records for the shared follow-up source story
// (`./recentlyDoneFollowUpGrouping.ts`): one card, a recent batch that places
// the source beyond the default ten, and an older source outside that window.
// `../../frontend-tests/sessions/follow-up-source-navigation.spec.ts` and the
// Recently done follow-up grouping specs publish through here.

import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  putFrontendDoneRecords,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import { completedAt, sourceStory } from "./recentlyDoneFollowUpGrouping.ts";

export const sourceFileName = doneRecordFileName(sourceStory.identity);

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

export function publishSourceCard(services: FrontendServiceState) {
  putFrontendDoneRecords(services, "open-dough", [
    doneRecord(sourceStory.identity, sourceStory.title, completedAt),
  ]);
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
