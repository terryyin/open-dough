// Continue recovers exact native first input across a Dashboard restart.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  startDashboardServer,
  sharedDashboardBuild,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import {
  notRefinedStory,
  notRefinedIdentity,
  queuedDashboardRepository,
} from "../../dashboard/test-support/launchJourney.ts";
import { storyCardSessions } from "../../dashboard/test-support/dashboardPage.ts";
import { sessionDetailsControl } from "../../dashboard/test-support/support/sessionEntryDisclosure.ts";
import { shellCommand } from "../../dashboard/src/sessionCapabilities.ts";
import {
  test,
  expect,
  stored,
} from "../../dashboard/test-support/support/codexStart.ts";
import {
  attempts,
  continued,
  launch,
  keptStarts,
  refinementRequest,
  machineSessions,
} from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { reloadUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import { expectInstalledCodexStoryInput } from "./codexLaunchObservation.ts";
import { expectExecutionInput } from "../../dashboard/test-support/support/codexStartAssertions.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

test.use({ originRepository: queuedDashboardRepository().please() });

for (const resumedStatus of ["completed", "unexpectedNativeStatus"]) {
  test(`lost acknowledgment resumes matching history (${resumedStatus}) without creating or resending`, async ({
    page,
    dashboard,
    codexProtocol: protocol,
    machine,
    origin,
  }) => {
    const native = protocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    const { card } = await openInstalledStoryBoard(page, origin);
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
      prebuilt: sharedDashboardBuild,
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
      await reloadUntilRead(page);
      const pending = storyCardSessions(card(notRefinedStory));
      await expect(pending).toContainText("Conversation created in Codex");
      await expect(pending).toContainText("First input acceptance uncertain");
      await expect(
        pending.getByText("First input acceptance uncertain", { exact: true }),
      ).toBeVisible();
      await expect(sessionDetailsControl(pending)).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(pending).not.toContainText("Refinement started in Codex");
      const record = stored(limited.home)[0];
      if (record?.session.host !== "codex")
        throw new Error("Missing saved Codex record.");
      expectInstalledCodexStoryInput(
        limited,
        native,
        record,
        `$dough-story-refinement ${notRefinedIdentity}`,
      );
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
        path.join(origin.project, ".worktrees", "story-c"),
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
      prebuilt: sharedDashboardBuild,
      machine,
      github: dashboard.github,
      codexProtocol: protocol,
    });
    try {
      expect(await machineSessions(restarted)).toHaveLength(1);
      const [uncertain] = await attempts(restarted);
      const response = await continued(restarted, uncertain?.id ?? "");
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
      await reloadUntilRead(page);
      await expect(storyCardSessions(card(notRefinedStory))).toContainText(
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

test("a restarted Dashboard continues a Codex execution with the original Take and input", async ({
  dashboard,
  origin,
  codexProtocol,
  machine,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const workspace = path.join(origin.project, ".worktrees", "story-a");
  const original = (await origin.originGit("rev-parse", "main")).trim();
  const request = makeMe.aLaunchRequest
    .executing({ identity: queuedIdentity, title: "Story A", host: "codex" })
    .withInstruction("Implement the selected slice.")
    .please();
  native.hold = true;
  const pending = launch(dashboard, request);
  await expect.poll(() => native.history.length, { timeout: 30_000 }).toBe(1);
  native.failConnection();
  expect(JSON.parse((await pending).body)).toMatchObject({ kind: "uncertain" });
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  const [profile] = await origin.takenProfiles();
  const [before] = stored(dashboard.home);
  expect(before).toMatchObject({
    start: { workspace, publishedSha: revision },
    firstInput: { state: "uncertain" },
    session: { sessionId: native.threadId, continuation: { workspace } },
  });
  await dashboard.close();
  await expect.poll(() => native.sockets.size).toBe(0);
  native.resumeStatus = "completed";
  const restarted = await startDashboardServer({
    mode: "boundary",
    machine,
    github: dashboard.github,
    codexProtocol: native,
  });
  try {
    const [attempt] = await attempts(restarted);
    const response = await continued(restarted, attempt?.id ?? "");
    expect(JSON.parse(response.body), response.body).toMatchObject({
      kind: "launched",
    });
    const [after] = stored(restarted.home);
    expect(after?.start).toEqual(before?.start);
    expect(after?.session).toEqual(before?.session);
    expectExecutionInput(
      after,
      native,
      workspace,
      original,
      revision,
      profile?.["agent"],
      dashboard,
    );
    expect(
      native.calls.filter(
        ({ method, params }) =>
          method === "thread/start" ||
          method === "thread/resume" ||
          (method === "thread/read" && params["includeTurns"] === true),
      ),
    ).toEqual([
      { method: "thread/start", params: { cwd: workspace } },
      {
        method: "thread/read",
        params: { threadId: native.threadId, includeTurns: true },
      },
      { method: "thread/resume", params: { threadId: native.threadId } },
    ]);
    expect(await origin.takenProfiles()).toEqual([profile]);
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(revision);
    expect(await keptStarts(restarted)).toEqual([]);
    expect(stored(restarted.home)).toHaveLength(1);
    expect(restarted.claudeLaunchCalls()).toEqual([]);
  } finally {
    await restarted.close();
  }
});
