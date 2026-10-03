// The production command starts one Cursor runner outside the preview's
// process group. Replacing the preview, stopping the command, and starting
// it again leave that runner and its cursor-agent client in place.
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { readCursorRunnerAddress } from "../server/hosts/cursor/runnerPaths.ts";
import { stopCursorRunner } from "../server/hosts/cursor/runnerClient.ts";
import { openCursorTerminal } from "./support/cursorTerminal.ts";
import {
  instruction,
  liveRunner,
  processGroup,
  runnersFor,
} from "./support/cursorRunnerJourney.ts";
import { dashboardCommand } from "./support/dashboardCommand.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { installFakeCursor } from "./support/fakeCursor.ts";
import { installFakeClaude } from "./support/fakeClaude.ts";
import { fakeGhEnv, installFakeGh } from "./support/fakeGh.ts";
import { startFakeGitHub } from "./support/fakeGitHub.ts";
import { keptCursor } from "./support/keptCursorTurn.ts";
import { processRunning } from "./support/processGroup.ts";
import { productionActivation } from "./support/productionWatcher.ts";
import { publishedMainFixture } from "./support/publishedMainFixture.ts";

test("the production command starts one Cursor runner and leaves that client up across replacement and a restart", async () => {
  test.setTimeout(900_000);
  const cursor = installFakeCursor({ working: true });
  const fixture = await publishedMainFixture(true);
  const github = await startFakeGitHub();
  const gh = installFakeGh(fixture.root);
  const ghEnv = fakeGhEnv(gh, github.url);
  const claude = installFakeClaude(
    fixture.root,
    { binDir: gh.binDir, path: ghEnv["PATH"] ?? "" },
    { machine: fixture.root, projectFolders: ["open-dough"] },
  );
  const env = {
    ...fixture.env,
    ...ghEnv,
    ...claude.env,
    ...cursor.env,
    PATH: [cursor.binDir, claude.env["PATH"] ?? ""].join(path.delimiter),
  };
  let watcher: ReturnType<typeof dashboardCommand> | undefined;
  const sockets: { close(): void }[] = [];
  try {
    const pinned = await fixture.publish(
      fixture.markerChanges("PINNED MAIN"),
      "Pinned main",
    );
    await fixture.installDevelopment();
    watcher = dashboardCommand(fixture.development, env, "watch:dashboard", [
      "--port",
      "0",
      "--check-interval",
      "500",
    ]);
    const first = await productionActivation(watcher, pinned);
    const runner = await liveRunner(fixture.home);
    const runnerGroup = processGroup(runner.pid);
    const previewGroup = processGroup(first.pid);
    expect(runnerGroup).toBe(runner.pid);
    expect(previewGroup).toBe(first.pid);
    expect(runnerGroup).not.toBe(previewGroup);
    expect(runnersFor(fixture.home)).toBe(1);
    expect(processRunning(first.pid)).toBe(true);

    const launched = await launch(boundary(first.url, fixture.home), {
      source: "open-dough",
      workflow: "ad-hoc",
      host: "cursor",
      instruction,
    });
    const answer = JSON.parse(launched.body) as { kind?: string };
    if (launched.status !== 200 || answer.kind !== "launched") {
      throw new Error(`Expected a launched session, got ${launched.body}`);
    }
    const sessionId = keptCursor(fixture.home).session.sessionId;
    expect(cursor.attaches()).toHaveLength(1);
    const pid = cursor.attaches()[0]?.pid ?? 0;
    expect(processRunning(pid)).toBe(true);
    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);

    const next = await fixture.publish(
      fixture.markerChanges("NEXT MAIN"),
      "Next main",
    );
    const replaced = await productionActivation(watcher, next);
    expect(replaced.pid).not.toBe(first.pid);
    expect(processRunning(pid)).toBe(true);
    expect(processRunning(runner.pid)).toBe(true);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(runner.pid);
    expect(runnersFor(fixture.home)).toBe(1);
    const replacedTerminal = await openCursorTerminal(
      boundary(replaced.url, fixture.home),
      sessionId,
    );
    sockets.push(replacedTerminal.socket);
    await expect
      .poll(() => replacedTerminal.output())
      .toContain("ctrl+c to stop");
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);

    await watcher.stop();
    watcher = undefined;
    await expect.poll(() => processRunning(replaced.pid)).toBe(false);
    expect(processRunning(first.pid)).toBe(false);
    expect(processRunning(runner.pid)).toBe(true);
    expect(processRunning(pid)).toBe(true);

    watcher = dashboardCommand(fixture.development, env, "watch:dashboard", [
      "--port",
      "0",
      "--check-interval",
      "500",
    ]);
    const again = await productionActivation(watcher, next);
    expect(runnersFor(fixture.home)).toBe(1);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(runner.pid);
    expect(processGroup(runner.pid)).toBe(runner.pid);
    expect(processGroup(runner.pid)).not.toBe(processGroup(again.pid));
    const follow = await openCursorTerminal(
      boundary(again.url, fixture.home),
      sessionId,
    );
    sockets.push(follow.socket);
    await expect.poll(() => follow.output()).toContain("ctrl+c to stop");
    follow.send({ input: "after-restart" });
    await expect.poll(() => cursor.input(pid)).toContain("after-restart");
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
    expect(cursor.calls()).toHaveLength(1);
  } finally {
    for (const socket of sockets) socket.close();
    await watcher?.stop();
    await stopCursorRunner(fixture.home);
    cursor.cleanup();
    await github.close();
    fixture.cleanup();
  }
});

function boundary(url: string, home: string): DashboardServer {
  return { baseURL: url, origin: url, home } as DashboardServer;
}
