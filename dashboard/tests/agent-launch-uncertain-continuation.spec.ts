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

startTest.describe(
  "a story start that settled before it knew whether it published",
  () => {
    startTest.use({ startTimeoutMs: 3_000, launchTimeoutMs: 60_000 });

    startTest(
      "blocks a fresh start of its story from any workflow, and is resumed only by its own continuation",
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
          .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
            timeout: 30_000,
          })
          .toBe("uncertain");
        push.release();
        await expect
          .poll(() => runningStarts(dashboard), { timeout: 30_000 })
          .toEqual([]);
        const [uncertain] = await attempts(dashboard);
        expect(uncertain).toMatchObject({
          id,
          publication: { kind: "unknown" },
          owned: false,
        });

        for (const workflow of ["refinement", "execution"])
          expect(
            answerOf(await accept(dashboard, { ...story, workflow })),
          ).toMatchObject(unresolvedStart);
        expect(await attempts(dashboard)).toEqual([uncertain]);
        expect(dashboard.claudeLaunchCalls()).toEqual([]);

        expect(answerOf(await continueAttempt(dashboard, id))).toMatchObject({
          kind: "accepted",
          attempt: { id, acceptedAt: uncertain?.acceptedAt },
        });
        expect(answerOf(await continueAttempt(dashboard, id))).toMatchObject({
          kind: "uncertain",
        });
        expect(await settledOutcome(dashboard, id)).toMatchObject({
          kind: "launched",
        });
        expect(await attempts(dashboard)).toEqual([
          expect.objectContaining({
            id,
            publication: expect.objectContaining({ kind: "published" }),
          }),
        ]);
        expect(await origin.takenProfiles()).toHaveLength(1);
        expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
      },
    );
  },
);
