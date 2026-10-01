// A second start of a story this server is already starting is refused before
// any second start runs (../server/agentLaunches.ts), over raw HTTP
// against the real installed `execution-start.mjs` and a real bare origin
// (./support/startOrigin.ts): the second launch is answered "uncertain" with
// reason "unconfirmed", and origin holds one claim, the project one
// workspace, and the synthetic `claude` at most one call. One case holds the
// first start on origin's `pre-receive` hook so the two overlap
// deterministically; the other sends the pair at once. A story Taken by
// another agent stays ./agent-launch-start-refusal.spec.ts's refusal.

import { readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  alreadySubmitted,
  launch,
  launchRequest,
  recordsOf,
  runningStarts,
} from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type StartOrigin,
} from "./support/startOrigin.ts";

const request = {
  ...launchRequest,
  identity: queuedIdentity,
  title: queuedTitle,
};

type Answer = { kind: string; reason?: string; explanation?: string };

test.describe("a second start of the same story", () => {
  let origin: StartOrigin;
  let server: DashboardServer;

  test.beforeEach(async () => {
    origin = await startOrigin();
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
    });
  });

  test.afterEach(async () => {
    await server.close();
    origin.cleanup();
  });

  const answerOf = async (
    pending: ReturnType<typeof launch>,
  ): Promise<Answer> => JSON.parse((await pending).body) as Answer;

  function workspaces(): string[] {
    return readdirSync(path.join(origin.project, ".worktrees"));
  }

  test("is refused while the first is held, with no second claim or workspace", async () => {
    test.setTimeout(90_000);
    const push = origin.holdPushes();
    server.claudeScenario("launched");

    const first = launch(server, request);
    await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
    expect(await runningStarts(server)).toEqual([
      {
        workflow: "execution",
        source: "open-dough",
        identity: queuedIdentity,
        phase: "preparing",
      },
    ]);

    const second = await answerOf(launch(server, request));
    expect(second).toEqual(alreadySubmitted);
    expect(server.claudeCalls()).toEqual([]);
    expect(workspaces()).toHaveLength(1);

    push.release();
    expect((await answerOf(first)).kind).toBe("launched");
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(workspaces()).toHaveLength(1);
    expect(await recordsOf(server, "open-dough")).toHaveLength(1);
    expect(await runningStarts(server)).toEqual([]);
  });

  test("two launches sent at once make one claim, one workspace, one session", async () => {
    test.setTimeout(90_000);
    server.claudeScenario("launched");
    const answers = await Promise.all([
      answerOf(launch(server, request)),
      answerOf(launch(server, request)),
    ]);
    expect(answers.map((answer) => answer.kind).sort()).toEqual([
      "launched",
      "uncertain",
    ]);
    expect(answers.find((answer) => answer.kind === "uncertain")).toEqual(
      alreadySubmitted,
    );
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(workspaces()).toHaveLength(1);
    expect(await recordsOf(server, "open-dough")).toHaveLength(1);
    expect(await runningStarts(server)).toEqual([]);
  });
});
