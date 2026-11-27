// A Done story's published sessions are Intent's review scopes in its
// Review scope dropdown, after Whole story: each once, oldest first, ad hoc follow-ups
// included. A chosen session reads its review by UUID; the case's review
// answers, keyed by `published`, own the Git judgment.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  executionName,
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

  const story = intentStoryCompare();
  await expect.element(story.scope).toHaveTextContent("Whole story");
  expect(await story.scopeNames()).toEqual([
    "Whole story",
    `Refinement — ${closed(firstRefinement)}`,
    executionName(execution),
    `Refinement — ${closed(secondRefinement)}`,
    `Title unavailable — ${closed(followUp)}`,
  ]);
  await expect
    .element(story.scopeOption("Whole story"))
    .toHaveAttribute("aria-selected", "true");
});

test("a chosen session reviews its own changes by its UUID", async () => {
  const { opened, published } = openWithSessions();
  await opened;
  const story = intentStoryCompare();
  await expect.poll(story.summaryText).toContain("Published completion");

  await story.chooseScope(`Refinement — ${closed(secondRefinement)}`);
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
  await story.chooseScope(chosen);
  await expect
    .poll(story.treeText)
    .toContain(`${secondRefinement.sessionId}.txt`);

  await story.chooseScope("Whole story");
  await expect.element(story.scope).toHaveTextContent("Whole story");
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

  const names = await intentStoryCompare().scopeNames();
  expect(names).toContain("Follow up here");
  expect(names.filter((name) => name.startsWith("Title unavailable"))).toEqual(
    [],
  );
});

test("a newly selected story starts at Whole story", async () => {
  const { opened } = openWithSessions();
  const mounted = await opened;
  const story = intentStoryCompare();
  await story.chooseScope(executionName(execution));
  await expect.element(story.scope).toHaveTextContent(executionName(execution));

  await mounted.selectStory(undefined);
  await mounted.selectStory(doneIdentity);
  await expect.element(story.scope).toHaveTextContent("Whole story");
  await expect.poll(story.summaryText).toContain("Published completion");
});
