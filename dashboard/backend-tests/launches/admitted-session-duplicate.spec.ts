// Real HTTP admission and launch lifetime of independent ad hoc launches with
// the default choices: the installed start publishes their Taken story from an
// owned claim checkout to the bare origin before the borrowed execution
// checkout opens a native session. Only native answers are held.
import {
  accept,
  launch,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import { admittedStory } from "../../test-support/support/isolatedSessionAdmissionProof.ts";
import { settledOutcome } from "../../test-support/acceptedAttempts.ts";
import type { AttemptObservation } from "../../src/agentLaunch.ts";
import type { FakeCodex } from "../../test-support/support/fakeCodex.ts";
import { execFileSync } from "node:child_process";
import { status } from "../../test-support/support/executionCheckoutChanges.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import type { StartOrigin } from "../../test-support/support/startOrigin.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test.use({ serverMode: "boundary" });

const duplicate = {
  kind: "uncertain",
  reason: "unconfirmed",
  explanation:
    "This launch is already being reconciled or submitted. Wait for its result; no duplicate input or conversation was created.",
};
const answerOf = async (pending: ReturnType<typeof launch>) =>
  JSON.parse((await pending).body) as { kind: string; reason?: string };
const callsTo = (native: FakeCodex | undefined, method: string) =>
  native?.calls.filter((call) => call.method === method) ?? [];
const originMain = async (origin: StartOrigin) =>
  (await origin.originGit("rev-parse", "refs/heads/main")).trim();

for (const host of ["claude", "codex"] as const) {
  test.describe(host, () => {
    test.use({ preparationHost: host });
    const nativeStarts = (
      dashboard: { claudeLaunchCalls(): unknown[] },
      native: FakeCodex | undefined,
      method = "thread/start",
    ) =>
      host === "claude"
        ? dashboard.claudeLaunchCalls().length
        : callsTo(native, method).length;

    test("the borrowed checkout opens only after its claim reaches the origin, with HEAD and index intact", async ({
      dashboard,
      origin,
      codexProtocol,
    }) => {
      const native = codexProtocol;
      const request = makeMe.aLaunchRequest
        .adHoc({ host, instruction: "Investigate." })
        .please();
      const git = (...args: string[]) =>
        execFileSync("git", ["-C", origin.project, ...args], {
          encoding: "utf8",
        });
      const checkout = () => [
        git("rev-parse", "HEAD"),
        git("symbolic-ref", "HEAD"),
        git("ls-files", "--stage"),
        status(origin.project),
      ];
      const before = checkout();
      const trunk = await originMain(origin);
      const pushes = origin.holdPushes();
      dashboard.claudeScenario("held");
      if (native !== undefined) native.hold = true;
      // The caller is gone once acceptance answered; the launch goes on.
      const first = JSON.parse((await accept(dashboard, request)).body) as {
        kind: string;
        attempt: AttemptObservation;
      };
      expect(first).toMatchObject({ kind: "accepted" });
      await expect.poll(() => pushes.isHeld(), { timeout: 0 }).toBe(true);
      expect(nativeStarts(dashboard, native)).toBe(0);
      pushes.release();
      await expect
        .poll(() => nativeStarts(dashboard, native, "turn/start"), {
          timeout: 0,
        })
        .toBe(1);
      const story = await admittedStory(origin, "Investigate.");
      expect(story.revision).not.toBe(trunk);
      expect(await answerOf(launch(dashboard, request))).toEqual(duplicate);
      dashboard.releaseHeldClaude();
      native?.release();
      // Startup settlement releases the gate after keeping the launch record.
      expect(await settledOutcome(dashboard, first.attempt.id)).toMatchObject({
        kind: "launched",
        session: { host },
      });
      const [record] = await recordsOf(dashboard, "open-dough");
      expect(record).toMatchObject({
        request: { storyIdentity: story.identity },
        ...(host === "codex" ? { firstInput: { state: "confirmed" } } : {}),
      });
      expect(checkout()).toEqual(before);
      // Native work remains active; only the startup lifetime has settled.
      if (native !== undefined) {
        native.hold = false;
        native.threadId = "second-native-thread";
      }
      expect((await answerOf(launch(dashboard, request))).kind).toBe(
        "launched",
      );
      expect(await recordsOf(dashboard, "open-dough")).toHaveLength(2);
      expect(nativeStarts(dashboard, native)).toBe(2);
    });
  });
}
