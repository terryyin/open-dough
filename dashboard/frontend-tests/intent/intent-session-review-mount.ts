// The mounted Board frame with a Done story whose sessions open Intent's
// review: an execution published from another machine and an ad hoc
// follow-up this machine retained, plus any further published `records`,
// retained `launches` and Done `others`, read through CI as `ci` answers.
// Each review read is recorded by its `published` UUID; a session's review
// answers once `sessionsHeld` settles. `refreshTo` shows a new revision of
// the same work as the page's revision stream does, once the page asks for
// that revision's sessions, and returns `listing`, which answers that list
// with the sessions plus any `further` records; until then it is pending.
import { expect } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import {
  publishedSessionRecordSchema,
  type PublishedSessionRecord,
} from "../../src/publishedSessionRecord.ts";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
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
// published `record`. Its request asks `instruction`, the title unless
// stated; a `composed` prompt is its confirmed first input.
export const adHocFollowUp = (
  title: string,
  record: { readonly sessionId: string },
  launched: number,
  {
    instruction = title,
    composed,
  }: { readonly instruction?: string; readonly composed?: string } = {},
) => {
  const launch = makeMe.aLaunchRecord
    .adHoc({
      instruction,
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
    .markedDoneAt(minutesAgo(launched - 14));
  return (
    composed === undefined
      ? launch
      : launch.withFirstInput({ state: "confirmed", instruction: composed })
  ).please();
};
export const retained = adHocFollowUp("Follow up here", retainedRecord, 20);

// An execution session is named by its close time.
export const executionName = (record: PublishedSessionRecord) =>
  `Execution — ${new Date(record.closedAt).toLocaleString()}`;
export const publishedName = executionName(published);
export const retainedName = "Follow up here";
// An ad hoc option is named by its icon and then its title.
export const adHocOption = (title: string) => `Ad hoc ${title}`;
const fileOf = (sessionId: string) => `${sessionId}.txt`;
export async function mountDoneStory({
  records = [] as readonly (typeof published)[],
  launches = [] as readonly (typeof retained)[],
  others = [] as readonly (typeof source)[],
  ci = undefined as IntentCiReadSource | undefined,
  sessionsHeld = Promise.resolve(),
} = {}) {
  const reads: (string | undefined)[] = [];
  const sessions = [published, retainedRecord, ...records];
  const listings = new Map<string, Promise<PublishedSessionRecord[]>>();
  const listed: string[] = [];
  const review: ReviewSource = {
    fileDiff: unanswered,
    fileText: unanswered,
    review: (query) => {
      reads.push(query.published);
      const { published } = query;
      return published === undefined
        ? Promise.resolve(
            makeMe.aStoryReview
              .published("b".repeat(40))
              .adding("whole-story.txt")
              .adding("whole-story-proof.txt")
              .please(),
          )
        : sessionsHeld.then(() =>
            makeMe.aStoryReview
              .publishedSession()
              .between("3".repeat(40), "4".repeat(40))
              .adding(fileOf(published))
              .please(),
          );
    },
  };
  const { done, doneBodies } = catalogs({ "open-dough": [source, ...others] });
  const sourceCatalog = done["open-dough"];
  if (sourceCatalog === undefined) throw new Error("No source catalog.");
  const work = boardWork([], {
    done: { ...sourceCatalog, revision: "a".repeat(40) },
    publishedSessions: {
      status: "listed",
      revision: "a".repeat(40),
      sessions,
    },
  });
  const frame = await mountBoardFrame(
    work,
    { width: 1600, height: 900 },
    "stories",
    {
      answer: makeMe.aMachineAnswer
        .observingDone(retained, ...launches)
        .please(),
    },
    {
      done: doneBodies,
      review,
      ...(ci === undefined ? {} : { ci }),
      listPublishedSessions: (...[, revision]) => {
        listed.push(revision);
        return listings.get(revision) ?? Promise.resolve(sessions);
      },
    },
  );
  return {
    reads,
    refreshTo: async (revision: string) => {
      let listing: (...further: PublishedSessionRecord[]) => void = () => {};
      listings.set(
        revision,
        new Promise((resolve) => {
          listing = (...further) => {
            resolve([...sessions, ...further]);
          };
        }),
      );
      frame.queueSnapshot({ ...work, revision });
      frame.revisionChanged(revision);
      await expect.poll(() => listed).toContain(revision);
      return listing;
    },
  };
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
