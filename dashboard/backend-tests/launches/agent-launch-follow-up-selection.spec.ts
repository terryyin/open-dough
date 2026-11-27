// Start of a Done story's follow-up sends only the selected kept sessions of
// that story in the first input, and Continue retries the kept request after
// the selected session's record is gone. Published sessions beside local
// ones: agent-launch-follow-up-published-sessions.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  otherStory,
  quietStorySessions,
  storyContextOf,
} from "../../test-support/support/followUpStories.ts";
import {
  forgetLaunchSession,
  keepLaunchRecords,
} from "../../test-support/support/launchStore.ts";
import {
  aDoneStoryStart,
  cataloguedStoryA,
  storyA,
} from "../support/doneStoryStart.ts";

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
const instruction = "Continue the paste recovery.";

test("Start sends only selected sessions of this story, and Continue retains the original selection", async () => {
  const { home, tree, launch, continueAttempt, received, refuseNext } =
    await aDoneStoryStart();
  const doneAt = new Date();
  const [refinement, execution] = quietStorySessions(
    home,
    storyA,
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
  keepLaunchRecords(home, [refinement, execution, foreign]);
  const startWith = (...sessions: LaunchRecord[]) =>
    launch(
      makeMe.aFollowUp
        .ofStory(storyA, tree)
        .attachingSessions(sessions)
        .please(),
      cataloguedStoryA,
      instruction,
    );

  refuseNext();
  await startWith(refinement, foreign, refinement);
  const [saved] = (await keptAttempts()) ?? [];
  expect(saved?.outcome).toMatchObject({ kind: "failed", reason: "refused" });
  const different = await startWith(execution);
  const clear = await startWith();
  expect(different.kind, JSON.stringify(different)).toBe("accepted");
  expect(clear.kind, JSON.stringify(clear)).toBe("accepted");
  expect((await keptAttempts()) ?? []).toHaveLength(3);

  forgetLaunchSession(home, refinement.session.sessionId);
  const resumed = await continueAttempt(saved?.id ?? "");
  expect(resumed.kind, JSON.stringify(resumed)).toBe("accepted");
  const kept = (await keptAttempts()) ?? [];
  expect(kept).toHaveLength(3);
  expect(kept.find(({ id }) => id === saved?.id)?.outcome?.kind).toBe(
    "launched",
  );

  const inputs = received.map(({ input }) => input);
  expect(inputs).toHaveLength(4);
  expect(received[3]?.id).toBe(saved?.id);
  const [initial, changed, noAttachment, continuedInput] = inputs;
  for (const input of inputs) {
    expect(input).toContain(
      storyContextOf(storyA, storyA.completedAt, "unselected", instruction),
    );
    expect(input).not.toContain("A foreign story's request");
    expect(input).not.toContain("A foreign story's report");
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
