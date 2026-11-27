// Start of a Done story's follow-up joins each selected published session of
// that story with its matching kept record, falls back to a kept record whose
// session was never published, and leaves out another story's session;
// Continue retries the kept request after the matching record is gone.
// Local sessions only: agent-launch-follow-up-selection.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import {
  otherStory,
  storyContextOf,
} from "../../test-support/support/followUpStories.ts";
import {
  forgetLaunchSession,
  keepLaunchRecords,
} from "../../test-support/support/launchStore.ts";
import { retainedStorySession } from "../../test-support/support/storySessionPublication.ts";
import {
  aDoneStoryStart,
  cataloguedStoryA,
  storyA,
} from "../support/doneStoryStart.ts";

const instruction = "Carry these attachments";

test("Start combines selected published and local facts, and Continue keeps that evidence", async () => {
  const start = await aDoneStoryStart();
  const { home, tree, baseline, received, refuseNext, revision } = start;
  const first = { base: revision("shared"), candidate: revision("claim") };
  const second = { base: baseline, candidate: tree };
  const merged = await start.publishSession(storyA.identity, first, second);
  const foreign = await start.publishSession(otherStory.identity, second);
  const missing = makeMe.aSessionRecord.forStory(storyA.identity).please();
  const local = {
    sessionId: "matched-here",
    reference: merged,
    instruction: "Request matching the published record.",
    report: "Report matching the published record.",
  };
  const fallback = {
    sessionId: "missing-here",
    reference: missing.sessionId,
    instruction: "Only the original request is retained here.",
    report: "Only this report was kept here.",
  };
  keepLaunchRecords(home, [
    retainedStorySession(storyA, local),
    retainedStorySession(storyA, fallback),
  ]);
  const startWith = (...sessions: string[]) =>
    start.launch(
      makeMe.aFollowUp
        .ofStory(storyA, tree)
        .attachingPublishedSessions(
          sessions.map((sessionId) => ({ sessionId })),
        )
        .please(),
      cataloguedStoryA,
      instruction,
    );

  refuseNext();
  await startWith(merged, foreign);
  const [saved] = (await keptAttempts()) ?? [];
  expect(saved?.outcome).toMatchObject({ kind: "failed", reason: "refused" });
  const retainedOnly = await startWith(missing.sessionId);
  expect(retainedOnly.kind, JSON.stringify(retainedOnly)).toBe("accepted");
  expect((await keptAttempts()) ?? []).toHaveLength(2);
  forgetLaunchSession(home, local.sessionId);
  const resumed = await start.continueAttempt(saved?.id ?? "");
  expect(resumed.kind, JSON.stringify(resumed)).toBe("accepted");
  expect((await keptAttempts()) ?? []).toHaveLength(2);

  const [combined, degraded, continuedInput] = received.map(
    ({ input }) => input,
  );
  expect(received[2]?.id).toBe(saved?.id);
  for (const input of [combined, degraded]) {
    expect(input).toContain(
      storyContextOf(storyA, storyA.completedAt, "unselected", instruction),
    );
    expect(input?.match(/^<session>$/gm)).toEqual(["<session>"]);
    expect(input).not.toContain(foreign);
  }
  expect(combined).toContain(`- Published session: ${merged}`);
  expect(combined).toContain(
    `- Recorded range 1: ${first.base} → ${first.candidate}`,
  );
  expect(combined).toContain(
    `- Recorded range 2: ${second.base} → ${second.candidate}`,
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
