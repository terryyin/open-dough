// A story start that settled while its session or its publication may or may
// not exist (../server/launchAttemptOwner.ts), over raw HTTP: its story stays
// unresolved, so a fresh start of it from any workflow is refused with nothing
// started, and only that attempt's own continuation resumes it, under the same
// attempt identity.

import type { AttemptObservation } from "../src/agentLaunch.ts";
import {
  accept,
  attempts,
  continueAttempt,
  launchRequest,
  refinementRequest,
  runningStarts,
} from "./agentLaunchBoundary.ts";
import { settledOutcome } from "./acceptedAttempts.ts";
import { test as startTest } from "./responsiveStart.ts";
import { test, expect } from "./support/codexLaunch.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

test.use({ projectFolders: ["open-dough"] });

type Answer = {
  kind: string;
  attempt?: AttemptObservation;
};

const answerOf = (response: { body: string }) =>
  JSON.parse(response.body) as Answer;

const unresolvedStart = {
  kind: "failed",
  reason: "already-starting",
  explanation: expect.stringContaining(
    "Recheck or continue it from Startup recovery.",
  ),
};

test.describe("a story start whose launch wait expired", () => {
  test.use({ launchTimeoutMs: 3_000 });

  test("blocks a fresh start of its story from any workflow, and is resumed only by its own continuation", async ({
    dashboard,
  }) => {
    test.setTimeout(60_000);
    dashboard.claudeScenario("hang");
    const accepted = answerOf(await accept(dashboard, refinementRequest));
    const id = accepted.attempt?.id ?? "";
    expect(await settledOutcome(dashboard, id)).toMatchObject({
      kind: "uncertain",
      reason: "timed-out",
    });
    const [uncertain] = await attempts(dashboard);
    expect(uncertain).toMatchObject({ id, publication: { kind: "none" } });

    for (const workflow of ["refinement", "execution"])
      expect(
        answerOf(await accept(dashboard, { ...launchRequest, workflow })),
      ).toMatchObject(unresolvedStart);
    expect(await attempts(dashboard)).toEqual([uncertain]);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);

    dashboard.claudeScenario("launched");
    expect(answerOf(await continueAttempt(dashboard, id))).toMatchObject({
      kind: "accepted",
      attempt: { id, acceptedAt: uncertain?.acceptedAt },
    });
    expect(await settledOutcome(dashboard, id)).toMatchObject({
      kind: "launched",
    });
    expect(answerOf(await continueAttempt(dashboard, id))).toMatchObject({
      kind: "failed",
      reason: "refused",
    });
    expect(dashboard.claudeLaunchCalls()).toHaveLength(2);
  });
});

startTest.describe("a story start that crosses its warning threshold", () => {
  startTest.use({ startTimeoutMs: 3_000, launchTimeoutMs: 60_000 });

  startTest(
    "refuses duplicates and Continue while running, then launches automatically",
    async ({ dashboard, origin }) => {
      startTest.setTimeout(150_000);
      const push = origin.holdPushes();
      const story = {
        ...launchRequest,
        identity: queuedIdentity,
        title: "Story A",
      };
      const id = answerOf(await accept(dashboard, story)).attempt?.id ?? "";
      await expect
        .poll(async () => (await attempts(dashboard))[0]?.slowSince, {
          timeout: 30_000,
        })
        .toBeDefined();
      const [slow] = await attempts(dashboard);
      expect(slow).toMatchObject({
        id,
        owned: true,
        publication: { kind: "unknown" },
      });
      expect(slow?.outcome).toBeUndefined();
      expect(
        answerOf(await accept(dashboard, { ...story, workflow: "refinement" })),
      ).toMatchObject({
        kind: "failed",
        reason: "already-starting",
      });
      expect(answerOf(await accept(dashboard, story))).toMatchObject({
        kind: "failed",
        reason: "already-starting",
      });
      expect(answerOf(await continueAttempt(dashboard, id))).toMatchObject({
        kind: "uncertain",
        explanation: expect.stringContaining("already running"),
      });
      expect(await attempts(dashboard)).toEqual([slow]);
      expect(dashboard.claudeLaunchCalls()).toEqual([]);
      push.release();
      expect(await settledOutcome(dashboard, id)).toMatchObject({
        kind: "launched",
      });
      const [launched] = await attempts(dashboard);
      expect(launched).toMatchObject({
        id,
        acceptedAt: slow?.acceptedAt,
        publication: { kind: "published" },
      });
      expect(launched?.slowSince).toBeUndefined();
      expect(await runningStarts(dashboard)).toEqual([]);
      expect(await origin.takenProfiles()).toHaveLength(1);
      expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
    },
  );
});
