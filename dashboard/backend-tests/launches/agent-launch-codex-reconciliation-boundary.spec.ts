// Continuing an uncertain Codex start never resends its saved first input on
// history that is unreadable, missing, empty, unrelated or from another
// workspace. The synthetic Codex app server records the protocol. Input
// refusal and resumed conversations on the page:
// ../../../e2e/launches/agent-launch-codex-reconciliation.spec.ts.
import {
  startDashboardServer,
  sharedDashboardBuild,
} from "../../tests/support/dashboardServer.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../tests/launchJourney.ts";
import {
  attempts,
  continued,
  launch,
  machineSessions,
} from "../../tests/agentLaunchBoundary.ts";
import { test, expect, stored } from "../../tests/support/codexLaunch.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
const request = makeMe.aLaunchRequest
  .refining({
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  })
  .withInstruction("Preserve this exact intent.")
  .please();
test.use({ projectFolders: ["open-dough"] });

test("unreadable, missing, empty, unrelated and wrong-workspace history never authorize an uncertain resend", async ({
  dashboard,
  codexProtocol: protocol,
  machine,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  native.hold = true;
  const limited = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine,
    github: dashboard.github,
    codexProtocol: protocol,
  });
  try {
    const starting = launch(limited, request);
    await expect.poll(() => native.history.length, { timeout: 30_000 }).toBe(1);
    native.failConnection();
    expect(JSON.parse((await starting).body)).toMatchObject({
      kind: "uncertain",
    });
  } finally {
    await limited.close();
  }
  expect(native.history).toHaveLength(1);
  const initial = stored(dashboard.home)[0];
  expect(initial).toMatchObject({
    firstInput: { state: "uncertain" },
    session: { sessionId: native.threadId },
  });
  native.failRead = true;
  const resumed = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine,
    github: dashboard.github,
    codexProtocol: protocol,
  });
  try {
    const [uncertain] = await attempts(resumed);
    const resume = async () =>
      JSON.parse(
        (await continued(resumed, uncertain?.id ?? "")).body,
      ) as unknown;
    expect(await resume()).toMatchObject({
      kind: "uncertain",
    });
    native.failRead = false;
    native.readError = true;
    expect(await resume()).toMatchObject({
      kind: "uncertain",
    });
    native.readError = false;
    native.history = [];
    expect(await resume()).toMatchObject({
      kind: "uncertain",
    });
    native.history = [
      {
        id: "later-turn",
        items: [
          {
            type: "userMessage",
            content: [
              { type: "text", text: "An unrelated later instruction." },
            ],
          },
        ],
      },
    ];
    expect(await resume()).toMatchObject({
      kind: "uncertain",
    });
    native.cwd += "-moved";
    expect(await resume()).toMatchObject({
      kind: "uncertain",
    });
    expect(stored(resumed.home)[0]).toEqual(initial);
    expect(await machineSessions(resumed)).toHaveLength(1);
    expect(
      native.calls.filter((call) => call.method === "thread/start"),
    ).toHaveLength(1);
    expect(
      native.calls.filter((call) => call.method === "turn/start"),
    ).toHaveLength(1);
    expect(
      native.calls.filter(
        (call) =>
          call.method === "thread/read" && call.params["includeTurns"] === true,
      ),
    ).toHaveLength(5);
    expect(
      native.calls.filter((call) => call.method === "thread/resume"),
    ).toHaveLength(2);
    await expect.poll(() => native.sockets.size).toBe(0);
  } finally {
    await resumed.close();
  }
});
