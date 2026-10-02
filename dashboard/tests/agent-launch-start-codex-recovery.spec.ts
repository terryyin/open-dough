// Lost first-input acknowledgment must recover the already published execution
// and native conversation across a server restart, without another input/claim,
// when its attempt is continued.
import { readdirSync } from "node:fs";
import path from "node:path";
import {
  attempts,
  continued,
  launch,
  launchRequest,
  keptStarts,
} from "./agentLaunchBoundary.ts";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import { test, expect, stored } from "./support/codexStart.ts";
import { expectExecutionInput } from "./support/codexStartAssertions.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

test("execution recovery retains its claim, workspace, handoff and first input when the native acknowledgment is lost", async ({
  dashboard,
  origin,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const original = (await origin.originGit("rev-parse", "main")).trim();
  const request = {
    ...launchRequest,
    host: "codex",
    identity: queuedIdentity,
    title: "Story A",
    instruction: "Implement the selected slice.",
  };
  native.hold = true;
  const pending = launch(dashboard, request);
  await expect.poll(() => native.history.length, { timeout: 30_000 }).toBe(1);
  const workspace = path.join(origin.project, ".worktrees", "story-a");
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  const [profile] = await origin.takenProfiles();
  expect(profile).toMatchObject({
    host: "codex",
    identity: queuedIdentity,
    branch: "codex/story-a",
  });
  const [before] = stored(dashboard.home);
  expect(before).toMatchObject({
    start: { workspace, publishedSha: revision },
    firstInput: { state: "uncertain" },
    session: { sessionId: native.threadId, continuation: { workspace } },
  });
  native.failConnection();
  const uncertain = await pending;
  expect(JSON.parse(uncertain.body)).toMatchObject({ kind: "uncertain" });
  await dashboard.close();
  await expect.poll(() => native.sockets.size).toBe(0);
  native.resumeStatus = "completed";
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    github: dashboard.github,
    codexProtocol,
    launchTimeoutMs: 30_000,
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
    );
    expect(
      native.calls.filter((call) => call.method === "thread/start"),
    ).toEqual([{ method: "thread/start", params: { cwd: workspace } }]);
    expect(
      native.calls.filter((call) => call.method === "thread/resume"),
    ).toEqual([
      { method: "thread/resume", params: { threadId: native.threadId } },
    ]);
    expect(
      native.calls.filter(
        (call) =>
          call.method === "thread/read" && call.params["includeTurns"] === true,
      ),
    ).toEqual([
      {
        method: "thread/read",
        params: { threadId: native.threadId, includeTurns: true },
      },
    ]);
    expect(await origin.takenProfiles()).toEqual([profile]);
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(revision);
    expect(readdirSync(path.join(origin.project, ".worktrees"))).toEqual([
      "story-a",
    ]);
    expect(await keptStarts(restarted)).toEqual([]);
    expect(stored(restarted.home)).toHaveLength(1);
    expect(native.history).toHaveLength(1);
    expect(restarted.claudeLaunchCalls()).toEqual([]);
  } finally {
    await restarted.close();
  }
});
