// Uncertain first input retains exact native continuation across restart.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  notRefinedStory,
  notRefinedIdentity,
  type LaunchJourney,
} from "./launchJourney.ts";
import { cardSessions } from "./dashboardPage.ts";
import { shellCommand } from "../src/sessionCapabilities.ts";
import { test, expect, stored } from "./support/codexLaunch.ts";
import {
  launch,
  refinementRequest,
  machineSessions,
} from "./agentLaunchBoundary.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: LaunchJourney | undefined;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => journey?.cleanup());

for (const resumedStatus of ["completed", "unexpectedNativeStatus"]) {
  test(`lost acknowledgment resumes matching history (${resumedStatus}) without creating or resending`, async ({
    page,
    dashboard,
    codexProtocol: protocol,
    machine,
  }) => {
    const native = protocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    if (journey === undefined) throw new Error("Missing published journey.");
    const { card } = await openTakenBacklog(page, journey);
    const pendingRequest = {
      ...refinementRequest,
      host: "codex",
      identity: notRefinedIdentity,
      title: notRefinedStory,
    };
    native.threadId = "native id's opaque";
    native.hold = true;
    const limited = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      github: dashboard.github,
      codexProtocol: protocol,
    });
    try {
      const starting = launch(limited, pendingRequest);
      await expect
        .poll(() => native.history.length, { timeout: 30_000 })
        .toBe(1);
      native.failConnection();
      const response = await starting;
      expect(JSON.parse(response.body)).toMatchObject({ kind: "uncertain" });
      expect(stored(limited.home)[0]).toMatchObject({
        firstInput: { state: "uncertain" },
        session: { sessionId: native.threadId },
      });
      await page.reload();
      const pending = cardSessions(card(notRefinedStory));
      await expect(pending).toContainText("Conversation created in Codex");
      await expect(pending).toContainText("First input acceptance uncertain");
      await expect(pending).not.toContainText("Refinement started in Codex");
      const record = stored(limited.home)[0];
      if (record?.session.host !== "codex")
        throw new Error("Missing saved Codex record.");
      const command = shellCommand(record.session.continuation?.args ?? []);
      execFileSync("/bin/sh", ["-c", command], {
        env: { ...process.env, ...native.env },
        stdio: "pipe",
      });
      expect(
        JSON.parse(
          readFileSync(native.env["FAKE_CODEX_CLI_LOG"] ?? "", "utf8"),
        ),
      ).toEqual([
        "resume",
        "--remote",
        `unix://${native.env["FAKE_CODEX_SOCKET"]}`,
        "--cd",
        path.join(limited.home, "git", "open-dough"),
        "native id's opaque",
      ]);
    } finally {
      await limited.close();
    }
    const acceptedTurn = native.history[0];
    if (acceptedTurn === undefined)
      throw new Error("Native input acceptance missing.");
    acceptedTurn.status = "inProgress";
    native.resumeStatus = resumedStatus;
    expect(native.completeOnResume).toBe(false);
    const restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      github: dashboard.github,
      codexProtocol: protocol,
    });
    try {
      expect(await machineSessions(restarted)).toHaveLength(1);
      const response = await launch(restarted, pendingRequest);
      expect(JSON.parse(response.body)).toMatchObject({ kind: "launched" });
      expect(stored(restarted.home)[0]).toMatchObject({
        firstInput: { state: "confirmed", turnId: "native-turn-id" },
        session: { sessionId: native.threadId },
      });
      expect(
        native.calls
          .filter(
            (call) =>
              call.method === "thread/read" &&
              call.params["includeTurns"] === true,
          )
          .map((call) => call.params),
      ).toEqual([{ threadId: native.threadId, includeTurns: true }]);
      expect(
        native.calls
          .filter((call) => call.method === "thread/resume")
          .map((call) => call.params),
      ).toEqual([{ threadId: native.threadId }]);
      await page.reload();
      await expect(cardSessions(card(notRefinedStory))).toContainText(
        "Refinement started in Codex",
      );
      await expect
        .poll(() => native.sockets.size)
        .toBe(resumedStatus === "completed" ? 0 : 1);
      expect(
        native.calls.filter((call) => call.method === "thread/start"),
      ).toHaveLength(1);
      expect(
        native.calls.filter((call) => call.method === "turn/start"),
      ).toHaveLength(1);
    } finally {
      await restarted.close();
    }
  });
}
