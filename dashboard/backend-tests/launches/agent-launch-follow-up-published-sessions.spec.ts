import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  attempts,
  continued,
  launch,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  doneStoryFiles,
  otherStory,
  recoverStory,
  storyContextOf,
} from "../../test-support/support/followUpStories.ts";
import {
  changeLaunchStore,
  keepLaunchRecords,
} from "../../test-support/support/launchStore.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { publishes } from "../../test-support/support/publishedRepository.ts";
import {
  publishStorySession,
  retainedStorySession,
} from "../../test-support/support/storySessionPublication.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });

test("Start combines selected published and local facts, and Continue keeps that evidence", async ({
  dashboard,
  origin,
}) => {
  const merged = publishStorySession(
    origin,
    recoverStory.identity,
    "matched-first.txt",
    "matched-gap.txt",
    "matched-second.txt",
  );
  const foreign = publishStorySession(
    origin,
    otherStory.identity,
    "other-first.txt",
    "other-gap.txt",
    "other-second.txt",
  );
  const missing = makeMe.aSessionRecord
    .forStory(recoverStory.identity)
    .please();
  const local = {
    sessionId: "matched-here",
    reference: merged.record.sessionId,
    instruction: "Request matching the published record.",
    report: "Report matching the published record.",
  };
  const fallback = {
    sessionId: "missing-here",
    reference: missing.sessionId,
    instruction: "Only the original request is retained here.",
    report: "Only this report was kept here.",
  };
  keepLaunchRecords(dashboard, [
    retainedStorySession(recoverStory, local),
    retainedStorySession(recoverStory, fallback),
  ]);
  const completedAt = "2026-11-08T09:05:00.000Z";
  dashboard.github.serve(
    "terryyin/open-dough",
    publishes({
      revision: foreign.revision,
      files: doneStoryFiles([recoverStory, otherStory], completedAt),
    }),
  );
  const instruction = "Carry these attachments";
  const start = (...sessions: { sessionId: string }[]) =>
    answerOf(
      launch(dashboard, {
        ...request,
        instruction,
        policy: { workspace: "isolated", landing: "review" },
        followUp: makeMe.aFollowUp
          .ofStory(recoverStory, foreign.revision)
          .attachingPublishedSessions(sessions)
          .please(),
      }),
    );

  dashboard.claudeScenario("refused");
  const withPublication = await start(merged.record, foreign.record);
  expect(withPublication).toMatchObject({ kind: "failed", reason: "refused" });
  const [saved] = await attempts(dashboard);
  if (saved === undefined) throw new Error("Expected the accepted attempt");

  dashboard.claudeScenario("launched");
  const retainedOnly = await start(missing);
  expect(retainedOnly.kind).toBe("launched");
  expect(await attempts(dashboard)).toHaveLength(2);
  changeLaunchStore(dashboard, (store) => ({
    ...store,
    "open-dough":
      store["open-dough"]?.filter(
        (record) =>
          !("session" in record) ||
          record.session.sessionId !== local.sessionId,
      ) ?? [],
  }));
  const resumed = await answerOf(continued(dashboard, saved.id));
  expect(resumed.kind).toBe("launched");
  expect(await attempts(dashboard)).toHaveLength(2);

  const [combined, degraded, continuedInput] = dashboard
    .claudeLaunchCalls()
    .map((call) => call.argv.at(-1));
  for (const received of [combined, degraded]) {
    expect(received).toContain(
      storyContextOf(recoverStory, completedAt, "unselected", instruction),
    );
    expect(received?.match(/^<session>$/gm)).toEqual(["<session>"]);
    expect(received).not.toContain(foreign.record.sessionId);
  }
  expect(combined).toContain(`- Published session: ${merged.record.sessionId}`);
  expect(combined).toContain(
    `- Recorded range 1: ${merged.first.base} → ${merged.first.candidate}`,
  );
  expect(combined).toContain(
    `- Recorded range 2: ${merged.second.base} → ${merged.second.candidate}`,
  );
  expect(combined).toContain(local.instruction);
  expect(combined).toContain(local.report);
  expect(combined).not.toContain(fallback.instruction);
  expect(degraded).toContain(fallback.instruction);
  expect(degraded).toContain(fallback.report);
  expect(degraded).not.toContain(missing.sessionId);
  expect(degraded).not.toContain(local.instruction);
  expect(continuedInput).toBe(combined);
});
