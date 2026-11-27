// A chosen session shows what its record holds: each recorded run under the
// session, the shared-checkout warning in the comparison details, or, for a
// session known only from a launch here, that it published no comparison.
// The case's review answers, keyed by `published` and `run`, own the Git
// judgment.
import { expect, test } from "vitest";
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

const execution = makeMe.aSessionRecord
  .forExecutionOf(doneIdentity)
  .closedAt(new Date(Date.now() - 3_600_000).toISOString())
  .please();
const executionName = `Execution — ${new Date(execution.closedAt).toLocaleString()}`;
const range = (position: number, shared?: true) =>
  makeMe.aStoryReview
    .publishedSession({
      range: { position, of: 2 },
      ...(shared === undefined ? {} : { shared }),
    })
    .adding(`range-${String(position)}.txt`)
    .please();

const openWithExecution = (
  machine?: Parameters<typeof openDoneStoryComparison>[0]["machine"],
) => {
  const reads: string[] = [];
  const opened = openDoneStoryComparison({
    publishedSessions: [execution],
    ...(machine === undefined ? {} : { machine }),
    review: (query) => {
      if (query.published === undefined)
        return Promise.resolve(publishedCompletion());
      reads.push(query.published);
      return Promise.resolve(query.run === "1" ? range(2, true) : range(1));
    },
  });
  return { opened, reads };
};

test("a session that recorded two ranges offers both and shows the chosen one", async () => {
  const { opened } = openWithExecution();
  await opened;
  const story = intentStoryCompare();
  await story.chooseScope(executionName);
  await expect.poll(story.treeText).toContain("range-1.txt");
  await expect.element(story.choice("Published range 1 of 2")).toBeChecked();

  await activateComparisonControl(story.choice("Published range 2 of 2"));
  await expect.poll(story.treeText).toContain("range-2.txt");
  expect(story.treeText()).not.toContain("range-1.txt");
  await expect.element(story.scope).toHaveTextContent(executionName);
});

test("a range that shared its checkout warns in the comparison details", async () => {
  const { opened } = openWithExecution();
  await opened;
  const story = intentStoryCompare();
  await story.chooseScope(executionName);
  await expect.poll(story.treeText).toContain("range-1.txt");
  await story.openDetails();
  await expect.poll(story.detailsText).toContain("Published changes");
  expect(story.detailsText()).not.toContain("same checkout");

  await activateComparisonControl(story.choice("Published range 2 of 2"));
  await expect
    .poll(story.detailsText)
    .toContain("Another session was open in the same checkout");
});

test("a session known only from a launch here stays chosen and published no comparison", async () => {
  const launched = makeMe.aLaunchRecord
    .refining({ identity: doneIdentity, title: "Done", source: doneSource.id })
    .reportingThrough({
      origin: "https://dashboard.example",
      reference: "0b7d3c1e-9f2a-4c5b-8d6e-1a2b3c4d5e6f",
      command: "node report.mjs",
    })
    .inClaudeSession({ sessionId: "launched-here" })
    .launchedAt(new Date(Date.now() - 7_200_000).toISOString())
    .markedDoneAt(new Date(Date.now() - 5_400_000).toISOString())
    .please();
  const launchedName = `Refinement — ${new Date(launched.launchedAt).toLocaleString()}`;
  const { opened, reads } = openWithExecution(
    makeMe.aMachineAnswer.observingDone(launched).please(),
  );
  await opened;
  const story = intentStoryCompare();
  await expect.poll(story.summaryText).toContain("Published completion");

  await story.chooseScope(launchedName);
  await story.openDetails();
  await expect
    .poll(story.detailsText)
    .toContain("This session published no comparison.");
  await expect.element(story.scope).toHaveTextContent(launchedName);
  expect(story.summaryText()).not.toContain("Published completion");
  expect(reads).toEqual([]);
});
