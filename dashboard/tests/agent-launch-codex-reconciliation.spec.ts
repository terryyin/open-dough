// Protocol evidence decides whether Start may reuse the saved first input.
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import {
  publishLaunchJourney,
  notRefinedIdentity,
  notRefinedStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import {
  launch,
  refinementRequest,
  machineSessions,
} from "./agentLaunchBoundary.ts";
import { test, expect, stored } from "./support/codexLaunch.ts";
const request = {
  ...refinementRequest,
  host: "codex",
  identity: notRefinedIdentity,
  title: notRefinedStory,
  instruction: "Preserve this exact intent.",
};
test.use({ projectFolders: ["open-dough"] });
let journey: LaunchJourney | undefined;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => journey?.cleanup());

test("explicit input refusal allows the saved input once in the resumed same conversation", async ({
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  native.refuseInput = true;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  const initial = stored(dashboard.home)[0];
  expect(initial?.firstInput).toMatchObject({ state: "awaiting" });
  expect(native.history).toEqual([]);
  native.refuseInput = false;
  expect(
    JSON.parse(
      (
        await launch(dashboard, {
          ...request,
          instruction: "Changed retry must not replace the saved intent.",
        })
      ).body,
    ),
  ).toMatchObject({ kind: "launched" });
  const inputs = native.calls.filter((call) => call.method === "turn/start");
  expect(inputs).toHaveLength(2);
  expect(inputs[1]?.params).toEqual(inputs[0]?.params);
  expect(native.history).toHaveLength(1);
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
  expect(
    native.calls
      .filter((call) => call.method === "thread/read")
      .map((call) => call.params),
  ).toEqual([{ threadId: initial?.session.sessionId, includeTurns: true }]);
  expect(
    native.calls
      .filter((call) => call.method === "thread/resume")
      .map((call) => call.params),
  ).toEqual([{ threadId: initial?.session.sessionId }]);
  expect(stored(dashboard.home)[0]).toMatchObject({
    request: { instruction: request.instruction },
    launchedAt: initial?.launchedAt,
    firstInput: { state: "confirmed" },
    session: initial?.session,
  });
});

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
    prebuilt: builtDashboardDir,
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
    prebuilt: builtDashboardDir,
    machine,
    github: dashboard.github,
    codexProtocol: protocol,
  });
  try {
    expect(JSON.parse((await launch(resumed, request)).body)).toMatchObject({
      kind: "uncertain",
    });
    native.failRead = false;
    native.readError = true;
    expect(JSON.parse((await launch(resumed, request)).body)).toMatchObject({
      kind: "uncertain",
    });
    native.readError = false;
    native.history = [];
    expect(JSON.parse((await launch(resumed, request)).body)).toMatchObject({
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
    expect(JSON.parse((await launch(resumed, request)).body)).toMatchObject({
      kind: "uncertain",
    });
    native.cwd += "-moved";
    expect(JSON.parse((await launch(resumed, request)).body)).toMatchObject({
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
      native.calls.filter((call) => call.method === "thread/read"),
    ).toHaveLength(5);
    expect(
      native.calls.filter((call) => call.method === "thread/resume"),
    ).toHaveLength(2);
    await expect.poll(() => native.sockets.size).toBe(0);
  } finally {
    await resumed.close();
  }
});
