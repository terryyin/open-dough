// Store/HTTP recovery owns intent and decisions; the fixture only answers native RPC.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { test, expect, stored } from "./support/codexLaunch.ts";
import { launch, machineSessions } from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { parts } from "./dashboardPage.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";

const request = { source: "open-dough", host: "codex", workflow: "ad-hoc" };
test.use({ projectFolders: ["open-dough"] });
let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

for (const blank of [true, false]) {
  test(`lost ${blank ? "materialization" : "input"} acknowledgment/restart retains original ${blank ? "blank intent" : "predecessor uncertain input"} without resubmission`, async ({
    page,
    dashboard,
    codexProtocol,
    machine,
    github,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    await openTakenBacklog(page, journey);
    const own = blank
      ? request
      : { ...request, instruction: "Keep this exact question." };
    native.hold = !blank;
    if (blank)
      native.beforeRead = (includeTurns) => {
        if (includeTurns) {
          expect(stored(dashboard.home)[0]?.firstInput).toEqual({
            state: "awaiting",
            intent: "blank",
          });
          native.failConnection();
        }
      };
    const starting = launch(dashboard, own);
    if (!blank) {
      await expect.poll(() => native.history.length).toBe(1);
      native.failConnection();
    }
    expect(JSON.parse((await starting).body)).toMatchObject({
      kind: "uncertain",
    });
    const saved = stored(dashboard.home)[0];
    if (saved === undefined) throw new Error("Missing interrupted launch.");
    expect(saved.firstInput).toMatchObject(
      blank ? { state: "awaiting", intent: "blank" } : { state: "uncertain" },
    );
    if (!blank) {
      // A genuine predecessor-shaped record is read through the actual store.
      expect(saved.firstInput).not.toHaveProperty("intent");
      writeFileSync(
        path.join(dashboard.home, ".open-dough/dashboard/agent-launches.json"),
        JSON.stringify({ "open-dough": [saved] }),
      );
    }
    await page.reload();
    const recent = parts(page).recentlyDone.getByRole("article");
    await expect(recent).toContainText(
      blank
        ? "Blank conversation persistence unconfirmed"
        : "First input acceptance uncertain",
    );
    await expect(recent).not.toContainText("First input accepted");
    await dashboard.close();
    delete native.beforeRead;
    native.hold = false;
    if (!blank) {
      const turn = native.history[0];
      if (turn === undefined) throw new Error("Missing accepted native input.");
      turn.status = "completed";
    }
    const restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      github,
      codexProtocol,
      port: Number(new URL(dashboard.baseURL).port),
    });
    try {
      expect(await machineSessions(restarted)).toHaveLength(1);
      expect(JSON.parse((await launch(restarted, own)).body)).toMatchObject({
        kind: "launched",
      });
      const recovered = stored(restarted.home)[0];
      expect(recovered?.session).toEqual(saved.session);
      expect(recovered?.request).toEqual(saved.request);
      expect(recovered?.launchedAt).toBe(saved.launchedAt);
      expect(recovered?.firstInput).toMatchObject(
        blank
          ? { state: "not-requested", intent: "blank" }
          : {
              state: "confirmed",
              turnId: "native-turn-id",
              instruction: "Keep this exact question.",
            },
      );
      expect(
        native.calls.filter((call) => call.method === "thread/start"),
      ).toHaveLength(1);
      expect(
        native.calls.filter((call) => call.method === "turn/start"),
      ).toHaveLength(blank ? 0 : 1);
      expect(
        native.calls.filter((call) => call.method === "thread/resume"),
      ).toEqual(
        blank
          ? []
          : [
              {
                method: "thread/resume",
                params: { threadId: saved.session.sessionId },
              },
            ],
      );
      expect(
        native.calls.filter(
          (call) =>
            call.method === "thread/read" &&
            call.params["includeTurns"] === true,
        ),
      ).toHaveLength(blank ? 2 : 1);
      await page.reload();
      await expect(recent).toContainText(
        blank ? "Opened without an instruction" : "First input accepted",
      );
      await expect(recent).not.toContainText("unconfirmed");
      await expect.poll(() => native.sockets.size).toBe(0);
    } finally {
      await restarted.close();
    }
  });
}

test("other read failures and mismatched context keep blank recovery uncertain; only the known refusal establishes persistence", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  for (const error of [
    { code: -32600, message: "list_turns is not supported yet" },
    { code: -32601, message: "Another unsupported operation" },
    { code: -32000, message: "Native persistence failed" },
    { nonsense: "Unreadable native error" },
  ]) {
    native.blankHistoryError = error;
    expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
      kind: "uncertain",
    });
    expect(stored(dashboard.home)[0]?.firstInput).toEqual({
      state: "awaiting",
      intent: "blank",
    });
  }
  const saved = stored(dashboard.home)[0];
  if (saved === undefined) throw new Error("Missing saved identity.");
  native.blankHistoryError = undefined;
  native.failRead = true;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  native.failRead = false;
  native.readError = true;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  native.readError = false;
  const workspace = native.cwd;
  native.cwd = `${workspace}-wrong`;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  native.cwd = workspace;
  native.threadId = "different-thread";
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  native.threadId = saved.session.sessionId;
  native.blankHistoryError = {
    code: -32601,
    message: "list_turns is not supported yet",
  };
  native.cwd = `${workspace}-wrong`;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  native.cwd = workspace;
  expect(stored(dashboard.home)[0]).toEqual(saved);
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "launched",
  });
  expect(stored(dashboard.home)[0]?.firstInput).toEqual({
    state: "not-requested",
    intent: "blank",
  });
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
  expect(native.calls.filter((call) => call.method === "turn/start")).toEqual(
    [],
  );
  expect(
    native.calls.filter((call) => call.method === "thread/resume"),
  ).toEqual([]);
  expect(native.history).toEqual([]);
  await expect.poll(() => native.sockets.size).toBe(0);
});
