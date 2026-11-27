// A Done story's published sessions are Intent's review scopes under
// Sessions, beside Whole story: each once, oldest first, ad hoc follow-ups
// included. A chosen session reads its review by UUID; the case's review
// answers, keyed by `published`, own the Git judgment.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
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

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString();
const firstRefinement = makeMe.aSessionRecord
  .forRefinementOf(doneIdentity)
  .closedAt(hoursAgo(4))
  .please();
const execution = makeMe.aSessionRecord
  .forExecutionOf(doneIdentity)
  .closedAt(hoursAgo(3))
  .please();
const secondRefinement = makeMe.aSessionRecord
  .forRefinementOf(doneIdentity)
  .closedAt(hoursAgo(2))
  .please();
const followUp = makeMe.aSessionRecord
  .forStory(doneIdentity)
  .closedAt(hoursAgo(1))
  .please();
const recorded = [followUp, secondRefinement, execution, firstRefinement];
const closed = ({ closedAt }: { readonly closedAt: string }) =>
  new Date(closedAt).toLocaleString();
const sessionReviews = new Map(
  recorded.map((record) => [
    record.sessionId,
    makeMe.aStoryReview
      .publishedSession()
      .adding(`${record.sessionId}.txt`)
      .please(),
  ]),
);

const sessions = () => page.getByRole("radiogroup", { name: "Sessions" });
const sessionNames = () =>
  [...sessions().element().querySelectorAll("label")].map((label) =>
    label.textContent.trim(),
  );

const openWithSessions = (
  machine?: Parameters<typeof openDoneStoryComparison>[0]["machine"],
) => {
  const published: string[] = [];
  const opened = openDoneStoryComparison({
    publishedSessions: recorded,
    ...(machine === undefined ? {} : { machine }),
    review: (query) => {
      if (query.published !== undefined) published.push(query.published);
      return Promise.resolve(
        sessionReviews.get(query.published ?? "") ?? publishedCompletion(),
      );
    },
  });
  return { opened, published };
};

test("a Done story lists its published sessions once each, oldest first", async () => {
  const { opened } = openWithSessions();
  await opened;

  await expect.element(sessions()).toBeVisible();
  expect(sessionNames()).toEqual([
    "Whole story",
    `Refinement — ${closed(firstRefinement)}`,
    `Execution — ${closed(execution)}`,
    `Refinement — ${closed(secondRefinement)}`,
    `Ad hoc — ${closed(followUp)}`,
  ]);
  await expect
    .element(intentStoryCompare().choice("Whole story"))
    .toBeChecked();
});

test("a chosen session reviews its own changes by its UUID", async () => {
  const { opened, published } = openWithSessions();
  await opened;
  const story = intentStoryCompare();
  await expect.poll(story.summaryText).toContain("Published completion");

  await activateComparisonControl(
    story.choice(`Refinement — ${closed(secondRefinement)}`),
  );
  await expect
    .poll(story.summaryText)
    .toContain(`Refinement — ${closed(secondRefinement)}`);
  await expect
    .poll(story.treeText)
    .toContain(`${secondRefinement.sessionId}.txt`);
  expect(story.treeText()).not.toContain(`${firstRefinement.sessionId}.txt`);
  expect(published).toEqual([secondRefinement.sessionId]);
});

test("Whole story returns from a session to the story comparison", async () => {
  const { opened } = openWithSessions();
  await opened;
  const story = intentStoryCompare();
  const chosen = `Refinement — ${closed(secondRefinement)}`;
  await activateComparisonControl(story.choice(chosen));
  await expect
    .poll(story.treeText)
    .toContain(`${secondRefinement.sessionId}.txt`);

  await activateComparisonControl(story.choice("Whole story"));
  await expect.poll(story.summaryText).toContain("Published completion");
  await expect.poll(story.treeText).toContain("a.spec.ts");
  expect(story.treeText()).not.toContain(`${secondRefinement.sessionId}.txt`);
});

test("a session also known from a launch here is listed once", async () => {
  const kept = makeMe.aLaunchRecord
    .adHoc({
      instruction: "Follow up here",
      title: "Follow up here",
      storyIdentity: doneIdentity,
      source: doneSource.id,
      followUp: makeMe.aFollowUp
        .ofStory({ identity: doneIdentity }, "a".repeat(40))
        .please(),
    })
    .reportingThrough({
      origin: "https://dashboard.example",
      reference: followUp.sessionId,
      command: "node report.mjs",
    })
    .inClaudeSession({ sessionId: "follow-up-here" })
    .launchedAt(hoursAgo(1.5))
    .markedDoneAt(hoursAgo(1))
    .please();
  const { opened } = openWithSessions(
    makeMe.aMachineAnswer.observingDone(kept).please(),
  );
  await opened;

  await expect.element(sessions()).toBeVisible();
  expect(sessionNames().filter((name) => name.startsWith("Ad hoc"))).toEqual([
    `Ad hoc — ${new Date(kept.launchedAt).toLocaleString()}`,
  ]);
});

test("a newly selected story starts at Whole story", async () => {
  const { opened } = openWithSessions();
  const mounted = await opened;
  const story = intentStoryCompare();
  await activateComparisonControl(
    story.choice(`Execution — ${closed(execution)}`),
  );
  await expect
    .element(story.choice(`Execution — ${closed(execution)}`))
    .toBeChecked();

  await mounted.selectStory(undefined);
  await mounted.selectStory(doneIdentity);
  await expect.element(story.choice("Whole story")).toBeChecked();
  await expect.poll(story.summaryText).toContain("Published completion");
});
