// Review session changes on a Done card, in the mounted Board frame, selects
// the story and opens Intent with that session chosen in Review scope: a
// session published from another machine and one this machine retained.
// The Review scope dropdown names that session, keeps it through a dismissal
// and switches label and comparison together on a choice, also by touch on a
// phone.
// The session's review is read by its UUID; the review answers, keyed by
// `published`, own the Git judgment.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardWork } from "../navigation/board-work.ts";
import {
  portrait,
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";
import {
  catalogs,
  source,
} from "../sessions/recently-done-card-membership-mount-page.ts";
import {
  doneCard,
  heldSessions,
} from "../sessions/recently-done-column-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const published = publishedSessionRecordSchema.parse(
  makeMe.aSessionRecord
    .forExecutionOf(source.identity)
    .closedAt(minutesAgo(30))
    .please(),
);
const retainedRecord = publishedSessionRecordSchema.parse(
  makeMe.aSessionRecord
    .forStory(source.identity)
    .closedAt(minutesAgo(5))
    .please(),
);
const retained = makeMe.aLaunchRecord
  .adHoc({
    instruction: "Follow up here",
    title: "Follow up here",
    storyIdentity: source.identity,
    followUp: makeMe.aFollowUp.ofStory(source, "a".repeat(40)).please(),
  })
  .reportingThrough({
    origin: "https://dashboard.example",
    reference: retainedRecord.sessionId,
    command: "node report.mjs",
  })
  .inClaudeSession({ sessionId: "follow-up-here" })
  .launchedAt(minutesAgo(20))
  .markedDoneAt(minutesAgo(6))
  .please();

const publishedName = `Execution — ${new Date(published.closedAt).toLocaleString()}`;
const retainedName = `Ad hoc — ${new Date(retained.launchedAt).toLocaleString()}`;
const fileOf = (sessionId: string) => `${sessionId}.txt`;

async function mountDoneStory() {
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
        sessions: [published, retainedRecord],
      },
    }),
    { width: 1600, height: 900 },
    "stories",
    { answer: makeMe.aMachineAnswer.observingDone(retained).please() },
    { done: doneBodies, review },
  );
  return reads;
}

const reviewSessionChanges = (entry: ReturnType<typeof doneCard>) =>
  entry.getByRole("button", { name: "Review session changes", exact: true });

// Intent shows the story with `chosen` named by Review scope and its
// comparison, named `compared` and counting `files`: a session's one file,
// the whole story's two.
async function expectIntentAt(
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

const publishedEntry = () =>
  doneCard(source.title).getByRole("article", {
    name: `Published session ${published.sessionId}`,
    exact: true,
  });

const fitsWithin = (element: Element, width: number) => {
  const box = element.getBoundingClientRect();
  return box.left >= 0 && box.right <= width;
};

test("Review session changes on a session published from another machine opens Intent at that session", async () => {
  const reads = await mountDoneStory();
  await reviewSessionChanges(publishedEntry()).click();

  await expectIntentAt(publishedName);
  expect(reads).toContain(published.sessionId);
  expect(reads).not.toContain(retainedRecord.sessionId);
});

test("Review session changes on a session retained here opens Intent at its key", async () => {
  const reads = await mountDoneStory();
  await reviewSessionChanges(heldSessions(source.title).first()).click();

  await expectIntentAt(retainedName);
  expect(reads).toContain(retainedRecord.sessionId);
  expect(reads).not.toContain(published.sessionId);
});

test("Escape keeps the opened session and its comparison; choosing Whole story switches both", async () => {
  await mountDoneStory();
  await reviewSessionChanges(publishedEntry()).click();
  await expectIntentAt(publishedName, "1 changed file");
  const story = intentStoryCompare();

  (story.scope.element() as HTMLElement).focus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(story.scopeList).toBeVisible();
  await userEvent.keyboard("{ArrowUp}{Escape}");
  await expect.element(story.scope).toHaveFocus();
  expect(story.scopeList.query()).toBeNull();
  await expectIntentAt(publishedName, "1 changed file");

  await userEvent.keyboard("{ArrowDown}{Home}{Enter}");
  await expectIntentAt(
    "Whole story",
    "2 changed files",
    "Published completion",
  );
  await expect.element(story.scope).toHaveFocus();
});

test("on a phone width the scope dropdown and its list fit and a tapped session shows its comparison", async () => {
  await useTouchScreen();
  await mountDoneStory();
  await reviewSessionChanges(publishedEntry()).click();
  await page.viewport(portrait.width, portrait.height);
  const story = intentStoryCompare();
  await expectIntentAt(publishedName, "1 changed file");
  expect(fitsWithin(story.scope.element(), portrait.width)).toBe(true);

  await tapWhereShown(story.scope.element());
  const option = story.scopeOption(retainedName);
  await expect.element(option).toBeInViewport({ ratio: 1 });
  expect(fitsWithin(story.scopeList.element(), portrait.width)).toBe(true);
  await tapWhereShown(option.element());

  await expectIntentAt(retainedName, "1 changed file");
  expect(story.scopeList.query()).toBeNull();
  expect(fitsWithin(story.scope.element(), portrait.width)).toBe(true);
});
