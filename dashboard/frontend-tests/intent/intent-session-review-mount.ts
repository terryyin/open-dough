// The mounted Board frame with a Done story whose sessions open Intent's
// review: an execution published from another machine and an ad hoc
// follow-up this machine retained, plus any further published `records` and
// retained `launches`. Each review read is recorded by its `published` UUID.
import { expect } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardWork } from "../navigation/board-work.ts";
import {
  catalogs,
  source,
} from "../sessions/recently-done-card-membership-mount-page.ts";
import { doneCard } from "../sessions/recently-done-column-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

export const published = publishedSessionRecordSchema.parse(
  makeMe.aSessionRecord
    .forExecutionOf(source.identity)
    .closedAt(minutesAgo(30))
    .please(),
);
export const retainedRecord = publishedSessionRecordSchema.parse(
  makeMe.aSessionRecord
    .forStory(source.identity)
    .closedAt(minutesAgo(5))
    .please(),
);
// An ad hoc follow-up this machine retained under `title`, reporting as the
// published `record`.
export const adHocFollowUp = (
  title: string,
  record: { readonly sessionId: string },
  launched: number,
) =>
  makeMe.aLaunchRecord
    .adHoc({
      instruction: title,
      title,
      storyIdentity: source.identity,
      followUp: makeMe.aFollowUp.ofStory(source, "a".repeat(40)).please(),
    })
    .reportingThrough({
      origin: "https://dashboard.example",
      reference: record.sessionId,
      command: "node report.mjs",
    })
    .inClaudeSession({ sessionId: `follow-up-${String(launched)}` })
    .launchedAt(minutesAgo(launched))
    .markedDoneAt(minutesAgo(launched - 14))
    .please();
export const retained = adHocFollowUp("Follow up here", retainedRecord, 20);

export const publishedName = `Execution — ${new Date(published.closedAt).toLocaleString()}`;
export const retainedName = "Follow up here";
// An ad hoc option is named by its icon and then its title.
export const adHocOption = (title: string) => `Ad hoc ${title}`;
const fileOf = (sessionId: string) => `${sessionId}.txt`;
export async function mountDoneStory({
  records = [] as readonly (typeof published)[],
  launches = [] as readonly (typeof retained)[],
} = {}) {
  const reads: (string | undefined)[] = [];
  const review: ReviewSource = {
    fileDiff: unanswered,
    fileText: unanswered,
    review: (query) => {
      reads.push(query.published);
      return Promise.resolve(
        query.published === undefined
          ? makeMe.aStoryReview
              .published("b".repeat(40))
              .adding("whole-story.txt")
              .adding("whole-story-proof.txt")
              .please()
          : makeMe.aStoryReview
              .publishedSession()
              .adding(fileOf(query.published))
              .please(),
      );
    },
  };
  const { done, doneBodies } = catalogs({ "open-dough": [source] });
  const sourceCatalog = done["open-dough"];
  if (sourceCatalog === undefined) throw new Error("No source catalog.");
  await mountBoardFrame(
    boardWork([], {
      done: { ...sourceCatalog, revision: "a".repeat(40) },
      publishedSessions: {
        status: "listed",
        revision: "a".repeat(40),
        sessions: [published, retainedRecord, ...records],
      },
    }),
    { width: 1600, height: 900 },
    "stories",
    {
      answer: makeMe.aMachineAnswer
        .observingDone(retained, ...launches)
        .please(),
    },
    { done: doneBodies, review },
  );
  return reads;
}

export const reviewSessionChanges = (entry: ReturnType<typeof doneCard>) =>
  entry.getByRole("button", { name: "Review session changes", exact: true });

// Intent shows the story with `chosen` named by Review scope and its
// comparison, named `compared` and counting `files`: a session's one file,
// the whole story's two.
export async function expectIntentAt(
  chosen: string,
  files?: string,
  compared = chosen,
) {
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", source.identity);
  const story = intentStoryCompare();
  await expect.element(story.scope).toHaveTextContent(chosen);
  await expect.poll(story.summaryText).toContain(compared);
  if (files !== undefined)
    await expect.poll(story.summaryText).toContain(` — ${files}`);
}

export const publishedEntry = () =>
  doneCard(source.title).getByRole("article", {
    name: `Published session ${published.sessionId}`,
    exact: true,
  });

export const fitsWithin = (element: Element, width: number) => {
  const box = element.getBoundingClientRect();
  return box.left >= 0 && box.right <= width;
};
