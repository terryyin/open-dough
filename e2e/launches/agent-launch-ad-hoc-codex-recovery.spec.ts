import { makeMe } from "../../tests/support/makeMe.mjs";
// Store/HTTP recovery owns intent and decisions; the fixture only answers native RPC.
// Other read failures and mismatched context:
// ../../dashboard/backend-tests/launches/agent-launch-ad-hoc-codex-recovery-boundary.spec.ts.
import {
  test,
  expect,
  stored,
} from "../../dashboard/tests/support/codexLaunch.ts";
import {
  launch,
  machineSessions,
} from "../../dashboard/tests/agentLaunchBoundary.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../dashboard/tests/support/dashboardServer.ts";
import { openTakenBacklog } from "../../dashboard/tests/launchStoryCardPage.ts";
import {
  parts,
  sessionEntriesIn,
} from "../../dashboard/tests/dashboardPage.ts";
import { reloadUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import { keepLaunchStore } from "../../dashboard/tests/support/launchStore.ts";

const request = makeMe.aLaunchRequest.adHoc({ host: "codex" }).please();
test.use({ projectFolders: ["open-dough"] });

for (const blank of [true, false]) {
  test(`lost ${blank ? "materialization" : "input"} acknowledgment/restart retains original ${blank ? "blank intent" : "predecessor uncertain input"} without resubmission`, async ({
    page,
    dashboard,
    codexProtocol,
    machine,
    github,
    launchJourney,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    await openTakenBacklog(page, launchJourney);
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
      keepLaunchStore(dashboard, { "open-dough": [saved] });
    }
    await reloadUntilRead(page);
    const recent = sessionEntriesIn(parts(page).taken);
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
      prebuilt: sharedDashboardBuild,
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
      await reloadUntilRead(page);
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
