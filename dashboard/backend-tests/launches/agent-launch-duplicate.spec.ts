// Real HTTP admission and launch lifetime, with only native answers held.
import { rmSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";
import { test, expect } from "../../test-support/support/codexLaunch.ts";
import {
  accept,
  launch,
  recordsOf,
  openDoughFolder,
} from "../../test-support/agentLaunchBoundary.ts";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { settledOutcome } from "../../test-support/acceptedAttempts.ts";
import type { AttemptObservation } from "../../src/agentLaunch.ts";
import type { FakeCodex } from "../../test-support/support/fakeCodex.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";

test.use({
  serverMode: "boundary",
  projectFolders: ["open-dough"],
  launchTimeoutMs: 30_000,
});

const duplicate = {
  kind: "uncertain",
  reason: "unconfirmed",
  explanation:
    "This launch is already being reconciled or submitted. Wait for its result; no duplicate input or conversation was created.",
};
const answerOf = async (pending: ReturnType<typeof launch>) =>
  JSON.parse((await pending).body) as { kind: string; reason?: string };
const callsTo = (native: FakeCodex, method: string) =>
  native.calls.filter((call) => call.method === method);

function awaitingNativeCall(
  host: "claude" | "codex",
  dashboard: DashboardServer,
  native: FakeCodex,
  codexCommand = "turn/start",
) {
  const count = () =>
    host === "claude"
      ? dashboard.claudeLaunchCalls().length
      : callsTo(native, codexCommand).length;
  return expect.poll(count, { timeout: 0 }).toBe(1);
}

for (const host of ["claude", "codex"] as const) {
  for (const subject of ["instruction", "blank", "start-less story"] as const) {
    test(`${host}: overlapping ${subject} launch makes one native conversation and input`, async ({
      dashboard,
      codexProtocol,
    }) => {
      const native = codexProtocol;
      if (native === undefined) throw new Error("Missing native fixture.");
      if (subject === "start-less story") {
        const path = openDoughFolder(dashboard);
        const skill = "dough-story-refinement";
        const project = { path, shown: path };
        const scripts = installedSkillPath(host, project, skill, "scripts");
        rmSync(`${scripts}/preparation-assignment.mjs`);
      }
      const request =
        subject === "start-less story"
          ? makeMe.aLaunchRequest.refining({ ...storyA, host }).please()
          : makeMe.aLaunchRequest
              .adHoc({
                host,
                instruction: subject === "blank" ? "" : "Investigate.",
              })
              .please();
      dashboard.claudeScenario("held");
      native.hold = true;
      native.holdCreation = subject === "blank";
      const first = launch(dashboard, request);
      const command = subject === "blank" ? "thread/start" : "turn/start";
      await awaitingNativeCall(host, dashboard, native, command);
      expect(await answerOf(launch(dashboard, request))).toEqual(duplicate);
      if (host === "claude")
        expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
      else {
        expect(callsTo(native, "thread/start")).toHaveLength(1);
        expect(callsTo(native, "turn/start")).toHaveLength(
          subject === "blank" ? 0 : 1,
        );
      }
      dashboard.releaseHeldClaude();
      native.release();
      expect((await answerOf(first)).kind).toBe("launched");
      const records = await recordsOf(dashboard, "open-dough");
      expect(records).toHaveLength(1);
      expect(records[0]).not.toHaveProperty("preparation");
    });
  }

  test(`${host}: story choice changes cannot bypass an in-flight launch`, async ({
    dashboard,
    codexProtocol,
  }) => {
    const native = codexProtocol;
    const instruction = "Original intent.";
    if (native === undefined) throw new Error("Missing native fixture.");
    const request = makeMe.aLaunchRequest
      .refining({ ...storyA, host })
      .withInstruction(instruction)
      .please();
    dashboard.claudeScenario("held");
    native.hold = true;
    const first = launch(dashboard, request);
    await awaitingNativeCall(host, dashboard, native);
    expect(
      await answerOf(
        launch(dashboard, {
          ...request,
          title: "Changed title",
          instruction: "Changed intent.",
          options: ["--explore"],
          ...(host === "claude" ? { model: "opus" } : {}),
        }),
      ),
    ).toEqual(duplicate);
    dashboard.releaseHeldClaude();
    native.release();
    expect((await answerOf(first)).kind).toBe("launched");
    const records = await recordsOf(dashboard, "open-dough");
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      request,
      preparation: { identity: storyA.identity },
    });
    if (host === "claude") {
      expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
      expect(dashboard.claudeLaunches()[0]?.instruction).toContain(instruction);
    } else {
      expect(callsTo(native, "thread/start")).toHaveLength(1);
      const inputs = callsTo(native, "turn/start");
      expect(inputs).toHaveLength(1);
      expect(inputs[0]?.params["input"]).toContainEqual(
        expect.objectContaining({ text: expect.stringContaining(instruction) }),
      );
    }
  });

  test(`${host}: caller detachment keeps the gate and startup completion releases it while the agent works`, async ({
    dashboard,
    codexProtocol,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    const request = makeMe.aLaunchRequest
      .adHoc({ host, instruction: "Investigate." })
      .please();
    dashboard.claudeScenario("held");
    native.hold = true;
    // The caller is gone once acceptance answered; the launch goes on.
    const first = JSON.parse((await accept(dashboard, request)).body) as {
      kind: string;
      attempt: AttemptObservation;
    };
    expect(first).toMatchObject({ kind: "accepted" });
    await awaitingNativeCall(host, dashboard, native);
    expect(await answerOf(launch(dashboard, request))).toEqual(duplicate);
    dashboard.releaseHeldClaude();
    native.release();
    // Startup settlement releases the gate after keeping the launch record.
    expect(await settledOutcome(dashboard, first.attempt.id)).toMatchObject({
      kind: "launched",
      session: { host },
    });
    expect((await recordsOf(dashboard, "open-dough"))[0]).toMatchObject(
      host === "codex"
        ? { firstInput: { state: "confirmed" } }
        : { session: { host } },
    );
    // Native work remains active; only the startup lifetime has settled.
    if (host === "claude")
      expect(dashboard.claudeListing()[0]).toMatchObject({ state: "working" });
    else {
      expect(native.sockets.size).toBeGreaterThan(0);
      native.hold = false;
      native.threadId = "second-native-thread";
    }
    expect((await answerOf(launch(dashboard, request))).kind).toBe("launched");
    expect(await recordsOf(dashboard, "open-dough")).toHaveLength(2);
    if (host === "claude")
      expect(dashboard.claudeLaunchCalls()).toHaveLength(2);
    else {
      expect(callsTo(native, "thread/start")).toHaveLength(2);
      expect(callsTo(native, "turn/start")).toHaveLength(2);
    }
  });

  test(`${host}: native refusal releases the in-flight gate for a retry`, async ({
    dashboard,
    codexProtocol,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    const request = makeMe.aLaunchRequest
      .adHoc({ host, instruction: "Investigate." })
      .please();
    dashboard.claudeScenario("refused");
    native.refuseCreation = true;
    expect(await answerOf(launch(dashboard, request))).toMatchObject({
      kind: "failed",
      reason: "refused",
    });
    dashboard.claudeScenario("launched");
    native.refuseCreation = false;
    expect((await answerOf(launch(dashboard, request))).kind).toBe("launched");
    expect(await recordsOf(dashboard, "open-dough")).toHaveLength(1);
    if (host === "claude")
      expect(dashboard.claudeLaunchCalls()).toHaveLength(2);
    else expect(callsTo(native, "thread/start")).toHaveLength(2);
  });
}

test("distinct Claude instructions remain independent while both launches are held", async ({
  dashboard,
}) => {
  dashboard.claudeScenario("held");
  const request = makeMe.aLaunchRequest
    .adHoc({ instruction: "First subject." })
    .please();
  const first = launch(dashboard, request);
  await expect
    .poll(() => dashboard.claudeLaunchCalls(), { timeout: 0 })
    .toHaveLength(1);
  const second = launch(dashboard, {
    ...request,
    instruction: "Second subject.",
  });
  await expect
    .poll(() => dashboard.claudeLaunchCalls(), { timeout: 0 })
    .toHaveLength(2);
  dashboard.releaseHeldClaude();
  expect((await answerOf(first)).kind).toBe("launched");
  expect((await answerOf(second)).kind).toBe("launched");
  expect(await recordsOf(dashboard, "open-dough")).toHaveLength(2);
});
