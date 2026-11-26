// A story start that settled while its session or its publication may or may
// not exist (../../server/launchAttemptOwner.ts), over raw HTTP: its story stays
// unresolved, so a fresh start of it from any workflow is refused with nothing
// started, and only that attempt's own continuation resumes it, under the same
// attempt identity.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";
import type { AttemptObservation } from "../../src/agentLaunch.ts";
import {
  accept,
  attempts,
  continueAttempt,
  launchRequest,
  runningStarts,
} from "../../test-support/agentLaunchBoundary.ts";
import { settledOutcome } from "../../test-support/acceptedAttempts.ts";
import { test as startTest } from "../../test-support/support/startOriginTest.ts";
import { test, expect } from "../../test-support/support/codexLaunch.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";

// No page: the local boundaries alone answer these requests.
test.use({
  serverMode: "boundary",
  projectFolders: ["open-dough"],
});

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

  test("blocks a fresh start of its story from any workflow, and is resumed only by its own continuation at its recorded effort", async ({
    dashboard,
  }) => {
    dashboard.claudeScenario("hang");
    const request = makeMe.aLaunchRequest
      .refining(storyA)
      .withPolicy({
        tracking: "one-shot",
        workspace: "isolated",
        landing: "review",
      })
      .withEffort("max")
      .please();
    const accepted = answerOf(await accept(dashboard, request));
    const id = accepted.attempt?.id ?? "";
    expect(await settledOutcome(dashboard, id)).toMatchObject({
      kind: "uncertain",
      reason: "timed-out",
    });
    const [uncertain] = await attempts(dashboard);
    expect(uncertain).toMatchObject({
      id,
      running: false,
      publication: { kind: "none" },
    });
    expect(uncertain?.worker).toBeUndefined();
    expect(uncertain?.slowSince).toBeUndefined();

    for (const workflow of ["refinement", "execution"])
      expect(
        answerOf(await accept(dashboard, { ...request, workflow })),
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
    expect(dashboard.claudeLaunches().map(({ effort }) => effort)).toEqual([
      "max",
      "max",
    ]);
  });
});

startTest.describe("a story start that crosses its warning threshold", () => {
  startTest.use({ startTimeoutMs: 3_000, launchTimeoutMs: 60_000 });

  startTest(
    "refuses duplicates and Continue while running, then launches automatically",
    async ({ dashboard, origin }) => {
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
      // Recording the warning can change its timestamp and observation count.
      expect(await attempts(dashboard)).toEqual([
        {
          ...slow,
          slowSince: expect.any(String),
          changes: expect.any(Number) as unknown,
        },
      ]);
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
