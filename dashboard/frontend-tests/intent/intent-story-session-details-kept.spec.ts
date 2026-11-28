// Story Home keeps the chosen ad hoc session's details ahead of its CI
// evidence after reading a changed file, and shows them while the session's
// comparison is still reading.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import {
  expectSessionDetailsFirst,
  selectedSession,
  selectedSessionText,
} from "./intent-session-details-page.ts";
import { adHocOption } from "./intent-session-review-mount.ts";
import {
  activateComparisonControl,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import {
  doneIdentity,
  doneSource,
  openDoneStoryComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

const record = publishedSessionRecordSchema.parse(
  makeMe.aSessionRecord.forStory(doneIdentity).closedAt(minutesAgo(9)).please(),
);
const title = "Keep the scope";
const instruction = "Keep the scope\nafter reading a file";

type SessionReview = (
  query: Parameters<ReviewSource["review"]>[0],
) => ReturnType<ReviewSource["review"]>;

// The Done story with one ad hoc session retained here and published as
// `record`, its session review read by `review`, chosen as the Review scope.
async function chooseAdHocSession(review: SessionReview) {
  const launch = makeMe.aLaunchRecord
    .adHoc({
      instruction,
      title,
      storyIdentity: doneIdentity,
      source: doneSource.id,
    })
    .reportingThrough({
      origin: "https://dashboard.example",
      reference: record.sessionId,
      command: "node report.mjs",
    })
    .inClaudeSession({ sessionId: "keep-scope" })
    .launchedAt(minutesAgo(30))
    .markedDoneAt(minutesAgo(20))
    .please();
  await openDoneStoryComparison({
    machine: makeMe.aMachineAnswer.observingDone(launch).please(),
    publishedSessions: [record],
    review: (query) =>
      query.published === undefined
        ? Promise.resolve(publishedCompletion())
        : review(query),
  });
  const story = intentStoryCompare();
  await story.chooseScope(adHocOption(title));
  return story;
}

test("reading a changed file and returning Home keeps the chosen session's details ahead of its CI evidence", async () => {
  const story = await chooseAdHocSession(() =>
    Promise.resolve(
      makeMe.aStoryReview.publishedSession().adding("kept-scope.txt").please(),
    ),
  );
  await expect.poll(selectedSessionText).toContain(record.sessionId);

  await story.browseFiles();
  await activateComparisonControl(story.file("Added kept-scope.txt"));
  await expect.element(story.pathReading).toBeVisible();
  await story.goHome();

  await expect.element(selectedSession()).toBeVisible();
  await expect.poll(selectedSessionText).toContain(title);
  await expect.poll(selectedSessionText).toContain(record.sessionId);
  expectSessionDetailsFirst();
});

test("while the chosen session's comparison is still reading, Home already shows its details", async () => {
  const pending: (string | undefined)[] = [];
  // The session's review read never answers, so its comparison stays
  // reading throughout.
  await chooseAdHocSession((query) => {
    pending.push(query.published);
    return new Promise(() => undefined);
  });

  await expect.poll(() => pending).toContain(record.sessionId);
  await expect.poll(selectedSessionText).toContain(title);
  await expect.poll(selectedSessionText).toContain(record.sessionId);
  await expect.poll(selectedSessionText).toContain("after reading a file");
  expectSessionDetailsFirst();
});
