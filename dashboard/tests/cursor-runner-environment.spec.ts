// A Cursor runner an earlier deployment started outlives that deployment
// (./production-cursor-runner.spec.ts), and its environment may still carry
// the deployment's start-up additions. Its `create-chat` and kept client run
// without them all the same: the runner applies the launch environment rule
// at its own spawns (../server/hosts/cursor/exec.ts, terminal.ts). The runner
// is started here directly with those additions, as a dashboard without the
// rule started it; the fixture `cursor-agent` records each environment.
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import {
  execOnRunner,
  keepCursorClient,
  stopCursorRunner,
} from "../server/hosts/cursor/runnerClient.ts";
import { readCursorRunnerAddress } from "../server/hosts/cursor/runnerPaths.ts";
import { fakeCursorHost, installFakeCursor } from "./support/fakeCursor.ts";
import {
  deploymentLikeStart,
  expectDeveloperShellEnvironment,
} from "./support/launchEnvironment.ts";
import { endGroup, spawnGroupLeader } from "./support/processGroup.ts";
import { repoRoot } from "./support/repositoryRoot.ts";

test("a runner started with a deployment's start-up additions starts cursor-agent without them", async () => {
  test.setTimeout(60_000);
  const cursor = installFakeCursor({ working: true });
  const root = mkdtempSync(path.join(tmpdir(), "dough-runner-environment-"));
  const home = path.join(root, "home");
  const workspace = path.join(root, "workspace");
  mkdirSync(home);
  mkdirSync(workspace);
  const start = deploymentLikeStart(path.join(root, "deployment"));
  start.create();
  const runner = spawnGroupLeader(
    process.execPath,
    [
      "--experimental-transform-types",
      "--no-warnings",
      path.join(repoRoot, "dashboard/server/hosts/cursor/runnerMain.ts"),
    ],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        ...cursor.env,
        ...start.extraEnv,
        NODE_ENV: "production",
        HOME: home,
        PATH: [...start.pathPrefix, cursor.binDir, process.env["PATH"] ?? ""]
          .filter((entry) => entry !== "")
          .join(path.delimiter),
      },
    },
  );
  runner.stdout.resume();
  runner.stderr.resume();
  try {
    await expect
      .poll(() => readCursorRunnerAddress(home)?.pid)
      .toBe(runner.pid);

    const created = await execOnRunner(
      ["create-chat"],
      workspace,
      new AbortController().signal,
      home,
    );
    expect(created).toMatchObject({
      failed: false,
      stdout: `${cursor.sessionId}\n`,
    });
    expect(cursor.calls()).toHaveLength(1);
    expectDeveloperShellEnvironment(cursor.calls()[0]?.env, fakeCursorHost);

    const resume = ["--workspace", workspace, "--resume", cursor.sessionId];
    const kept = await keepCursorClient(
      {
        command: "cursor-agent",
        args: resume,
        cwd: workspace,
        cols: 80,
        rows: 24,
        sourceId: "open-dough",
        session: {
          host: "cursor",
          sessionId: cursor.sessionId,
          name: "environment",
          continuation: { workspace, args: ["cursor-agent", ...resume] },
        },
        instruction: "",
      },
      home,
    );
    expect(kept).toEqual({ kind: "kept" });
    await expect.poll(() => cursor.attaches()).toHaveLength(1);
    expectDeveloperShellEnvironment(cursor.attaches()[0]?.env, fakeCursorHost);
  } finally {
    await stopCursorRunner(home);
    await endGroup(runner);
    cursor.cleanup();
    rmSync(root, { recursive: true, force: true });
  }
});
