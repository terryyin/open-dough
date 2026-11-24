import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  attempts,
  continued,
  launch,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  doneStoryFiles,
  otherStory,
  quietStorySessions,
  recoverStory,
  storyContextOf,
} from "../../test-support/support/followUpStories.ts";
import {
  changeLaunchStore,
  keepLaunchRecords,
} from "../../test-support/support/launchStore.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { publishes } from "../../test-support/support/publishedRepository.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });

test("Start resolves only selected sessions from this story and Continue retains the original selection", async ({
  dashboard,
  origin,
}) => {
  const revision = await originMain(origin);
  const completedAt = "2026-11-08T09:05:00.000Z";
  dashboard.github.serve(
    "terryyin/open-dough",
    publishes({
      revision,
      files: doneStoryFiles([recoverStory, otherStory], completedAt),
    }),
  );
  const details = {
    refinement: {
      instruction: "Check the paste toolbar.",
      report: "The toolbar loses a line.",
    },
    execution: {
      instruction: "Check terminal focus.",
      report: "The terminal retains keyboard focus.",
    },
  };
  const doneAt = new Date();
  const [refinement, execution] = quietStorySessions(
    dashboard.home,
    recoverStory,
    doneAt,
    details,
  );
  if (refinement === undefined || execution === undefined)
    throw new Error("Expected both retained sessions");
  const foreign = makeMe.aLaunchRecord
    .executing({ ...otherStory, instruction: "A foreign story's request" })
    .inClaudeSession({ sessionId: "foreign" })
    .completedWith({ message: "A foreign story's report" })
    .markedDoneAt(doneAt.toISOString())
    .please();
  keepLaunchRecords(dashboard, [refinement, execution, foreign]);

  const instruction = "Continue the paste recovery.";
  const startWith = (...sessions: LaunchRecord[]) =>
    launch(dashboard, {
      ...request,
      instruction,
      policy: { workspace: "isolated", landing: "review" },
      followUp: makeMe.aFollowUp
        .ofStory(recoverStory, revision)
        .attachingSessions(sessions)
        .please(),
    });

  dashboard.claudeScenario("refused");
  const declined = await answerOf(startWith(refinement, foreign, refinement));
  expect(declined).toMatchObject({ kind: "failed", reason: "refused" });
  const [saved] = await attempts(dashboard);
  if (saved === undefined) throw new Error("Expected the accepted attempt");

  dashboard.claudeScenario("launched");
  const different = await answerOf(startWith(execution));
  const clear = await answerOf(startWith());
  expect(different.kind).toBe("launched");
  expect(clear.kind).toBe("launched");
  expect(await attempts(dashboard)).toHaveLength(3);

  // Retention can change between a Start and the developer's Continue.
  changeLaunchStore(dashboard, (store) => ({
    ...store,
    "open-dough":
      store["open-dough"]?.filter(
        (record) =>
          !("session" in record) ||
          record.session.sessionId !== refinement.session.sessionId,
      ) ?? [],
  }));
  const resumed = await answerOf(continued(dashboard, saved.id));
  expect(resumed.kind).toBe("launched");
  expect(await attempts(dashboard)).toHaveLength(3);

  const prompts = dashboard.claudeLaunchCalls().map((call) => call.argv.at(-1));
  expect(prompts).toHaveLength(4);
  const [initial, changed, noAttachment, continuedInput] = prompts;
  for (const prompt of prompts) {
    expect(prompt).toContain(
      storyContextOf(recoverStory, completedAt, "unselected", instruction),
    );
    expect(prompt).not.toContain("A foreign story's request");
    expect(prompt).not.toContain("A foreign story's report");
  }
  expect(initial?.match(/^<session>$/gm)).toEqual(["<session>"]);
  expect(initial).toContain(details.refinement.instruction);
  expect(initial).toContain(details.refinement.report);
  expect(initial).not.toContain(details.execution.instruction);
  expect(changed).toContain(details.execution.instruction);
  expect(changed).toContain(details.execution.report);
  expect(changed).not.toContain(details.refinement.instruction);
  expect(noAttachment).not.toContain("<session>");
  expect(noAttachment).not.toContain(details.refinement.instruction);
  expect(noAttachment).not.toContain(details.execution.instruction);
  expect(continuedInput).toBe(initial);
});
