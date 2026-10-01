// Real HTTP admission and launch lifetime, with only native answers held.
import { test, expect, codexSkill } from "./support/codexLaunch.ts";
import {
  accept,
  launch,
  recordsOf,
  refinementRequest,
} from "./agentLaunchBoundary.ts";
import { installRefinementSkill } from "./launchCardPage.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 30_000 });

const duplicate = {
  kind: "uncertain",
  reason: "unconfirmed",
  explanation:
    "This launch is already being reconciled or submitted. Wait for its result; no duplicate input or conversation was created.",
};
const answerOf = async (pending: ReturnType<typeof launch>) =>
  JSON.parse((await pending).body) as { kind: string; reason?: string };

for (const host of ["claude", "codex"] as const) {
  for (const subject of ["instruction", "blank", "start-less story"] as const) {
    test(`${host}: overlapping ${subject} launch makes one native conversation and input`, async ({
      dashboard,
      codexProtocol,
    }) => {
      const native = codexProtocol;
      if (native === undefined) throw new Error("Missing native fixture.");
      const request =
        subject === "start-less story"
          ? { ...refinementRequest, host }
          : {
              source: "open-dough",
              workflow: "ad-hoc",
              host,
              instruction: subject === "blank" ? "" : "Investigate.",
            };
      dashboard.claudeScenario("held");
      native.hold = true;
      native.holdCreation = subject === "blank";
      const first = launch(dashboard, request);
      await expect
        .poll(() =>
          host === "claude"
            ? dashboard.claudeLaunchCalls().length
            : native.calls.filter(
                (call) =>
                  call.method ===
                  (subject === "blank" ? "thread/start" : "turn/start"),
              ).length,
        )
        .toBe(1);
      expect(await answerOf(launch(dashboard, request))).toEqual(duplicate);
      if (host === "claude")
        expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
      else {
        expect(
          native.calls.filter((call) => call.method === "thread/start"),
        ).toHaveLength(1);
        expect(
          native.calls.filter((call) => call.method === "turn/start"),
        ).toHaveLength(subject === "blank" ? 0 : 1);
      }
      dashboard.releaseHeldClaude();
      native.release();
      expect((await answerOf(first)).kind).toBe("launched");
      expect(await recordsOf(dashboard, "open-dough")).toHaveLength(1);
    });
  }

  test(`${host}: story choice changes cannot bypass an in-flight launch`, async ({
    dashboard,
    codexProtocol,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    if (host === "claude") installRefinementSkill(dashboard.home);
    else codexSkill(dashboard.home, "--explore");
    const request = {
      ...refinementRequest,
      host,
      instruction: "Original intent.",
    };
    dashboard.claudeScenario("held");
    native.hold = true;
    const first = launch(dashboard, request);
    await expect
      .poll(() =>
        host === "claude"
          ? dashboard.claudeLaunchCalls().length
          : native.calls.filter((call) => call.method === "turn/start").length,
      )
      .toBe(1);
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
    expect(records[0]).toMatchObject({ request });
    if (host === "claude") {
      expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
      expect(dashboard.claudeLaunchCalls()[0]?.argv.at(-1)).toContain(
        "Original intent.",
      );
    } else {
      expect(
        native.calls.filter((call) => call.method === "thread/start"),
      ).toHaveLength(1);
      const inputs = native.calls.filter(
        (call) => call.method === "turn/start",
      );
      expect(inputs).toHaveLength(1);
      expect(inputs[0]?.params["input"]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            text: expect.stringContaining("Original intent."),
          }),
        ]),
      );
    }
  });

  test(`${host}: caller detachment keeps the gate and startup completion releases it while the agent works`, async ({
    dashboard,
    codexProtocol,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    const request = {
      source: "open-dough",
      host,
      workflow: "ad-hoc",
      instruction: "Investigate.",
    };
    dashboard.claudeScenario("held");
    native.hold = true;
    // The caller is gone once acceptance answered; the launch goes on.
    const first = await accept(dashboard, request);
    expect(JSON.parse(first.body)).toMatchObject({ kind: "accepted" });
    await expect
      .poll(() =>
        host === "claude"
          ? dashboard.claudeLaunchCalls().length
          : native.calls.filter((call) => call.method === "turn/start").length,
      )
      .toBe(1);
    expect(await answerOf(launch(dashboard, request))).toEqual(duplicate);
    dashboard.releaseHeldClaude();
    native.release();
    await expect
      .poll(async () => (await recordsOf(dashboard, "open-dough"))[0])
      .toMatchObject(
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
      expect(
        native.calls.filter((call) => call.method === "thread/start"),
      ).toHaveLength(2);
      expect(
        native.calls.filter((call) => call.method === "turn/start"),
      ).toHaveLength(2);
    }
  });

  test(`${host}: native refusal releases the in-flight gate for a retry`, async ({
    dashboard,
    codexProtocol,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    const request = {
      source: "open-dough",
      host,
      workflow: "ad-hoc",
      instruction: "Investigate.",
    };
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
    else
      expect(
        native.calls.filter((call) => call.method === "thread/start"),
      ).toHaveLength(2);
  });
}

test("distinct Claude instructions remain independent while both launches are held", async ({
  dashboard,
}) => {
  dashboard.claudeScenario("held");
  const request = {
    source: "open-dough",
    host: "claude",
    workflow: "ad-hoc",
    instruction: "First subject.",
  };
  const first = launch(dashboard, request);
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const second = launch(dashboard, {
    ...request,
    instruction: "Second subject.",
  });
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(2);
  dashboard.releaseHeldClaude();
  expect((await answerOf(first)).kind).toBe("launched");
  expect((await answerOf(second)).kind).toBe("launched");
  expect(await recordsOf(dashboard, "open-dough")).toHaveLength(2);
});
