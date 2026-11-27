// Intent's Review scope names an ad hoc session by its retained title after
// an "Ad hoc" icon: on a phone the open list shows long titles in full, and
// a tapped title closes to its own label and comparison even when another
// title opens with the same words. An ad hoc session published from another
// machine with no retained launch reads "Title unavailable" with its close
// time and still selects its own comparison.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import {
  portrait,
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";
import { source } from "../sessions/recently-done-card-membership-mount-page.ts";
import {
  adHocFollowUp,
  adHocOption,
  expectIntentAt,
  fitsWithin,
  mountDoneStory,
  publishedEntry,
  publishedName,
  retainedRecord,
  reviewSessionChanges,
} from "./intent-session-review-mount.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

// Long retained titles, two sharing their opening words, and an ad hoc
// session published from another machine with no retained launch.
const sharedOpening =
  "Tighten the review scope dropdown so a phone reader can tell";
const longTitles = [
  `${sharedOpening} which follow-up changed the published comparison`,
  `${sharedOpening} the retained title apart from its close time`,
];
const longRecords = [4, 3].map((closed) =>
  publishedSessionRecordSchema.parse(
    makeMe.aSessionRecord
      .forStory(source.identity)
      .closedAt(minutesAgo(closed))
      .please(),
  ),
);
const longFollowUps = longTitles.map((title, index) =>
  adHocFollowUp(title, longRecords[index] ?? retainedRecord, 18 - index),
);
const untitled = publishedSessionRecordSchema.parse(
  makeMe.aSessionRecord
    .forStory(source.identity)
    .closedAt(minutesAgo(40))
    .please(),
);
const untitledName = `Title unavailable — ${new Date(untitled.closedAt).toLocaleString()}`;

test("on a phone width long ad hoc titles read in full and a tapped one shows its own title and comparison", async () => {
  await useTouchScreen();
  const reads = await mountDoneStory({
    records: longRecords,
    launches: longFollowUps,
  });
  await reviewSessionChanges(publishedEntry()).click();
  await page.viewport(portrait.width, portrait.height);
  const story = intentStoryCompare();
  await expectIntentAt(publishedName, "1 changed file");

  await tapWhereShown(story.scope.element());
  const [first, second] = longTitles;
  const [firstRecord, secondRecord] = longRecords;
  if (
    first === undefined ||
    second === undefined ||
    firstRecord === undefined ||
    secondRecord === undefined
  )
    throw new Error("No long titles.");
  for (const title of longTitles) {
    await expect
      .element(story.scopeOption(adHocOption(title)))
      .toHaveTextContent(title);
  }
  const option = story.scopeOption(adHocOption(second));
  await expect.element(option).toBeInViewport({ ratio: 1 });
  expect(fitsWithin(story.scopeList.element(), portrait.width)).toBe(true);
  await tapWhereShown(option.element());

  await expectIntentAt(second, "1 changed file");
  expect(reads).toContain(secondRecord.sessionId);
  expect(reads).not.toContain(firstRecord.sessionId);
  await expect.element(story.scope).not.toHaveTextContent(first);
  expect(fitsWithin(story.scope.element(), portrait.width)).toBe(true);
});

test("an ad hoc session with no retained launch shows Title unavailable and its close time, and selecting it shows its comparison", async () => {
  const reads = await mountDoneStory({ records: [untitled] });
  await reviewSessionChanges(publishedEntry()).click();
  const story = intentStoryCompare();
  await expectIntentAt(publishedName, "1 changed file");

  await story.chooseScope(adHocOption(untitledName));

  await expectIntentAt(untitledName, "1 changed file");
  expect(reads).toContain(untitled.sessionId);
});
