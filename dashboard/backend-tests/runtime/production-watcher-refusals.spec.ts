// The public watcher refuses invalid input and an occupied production port.
import { once } from "node:events";
import { existsSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { afterAll, afterEach, expect, test } from "vitest";
import { dashboardCommand } from "../../test-support/support/dashboardCommand.ts";
import { productionDeployments } from "../../test-support/support/machineRecordNames.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";
import { waitForWatcherOutput } from "../../test-support/support/watcherEvents.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import {
  productionFailureFixture,
  unpublishedWatcherFixture,
} from "../../test-support/support/productionWatcherFixture.ts";

type Publication = Awaited<ReturnType<typeof productionFailureFixture>>;
let publications: Promise<Publication>[] = [];
let commands: ReturnType<typeof dashboardCommand>[] = [];
let listeners: Server[] = [];
const watching = {
  publication(create: () => Promise<Publication>) {
    const pending = create();
    publications.push(pending);
    return pending;
  },
  command(...args: Parameters<typeof dashboardCommand>) {
    const command = dashboardCommand(...args);
    commands.push(command);
    return command;
  },
  listener(server: Server) {
    listeners.push(server);
    return server;
  },
};

// A case can end while awaiting a command's exit. Retire that command
// before its private HOME and the detached Cursor runner are removed.
afterEach(async () => {
  const pending = { publications, commands, listeners };
  publications = [];
  commands = [];
  listeners = [];
  const created = await Promise.allSettled(pending.publications);
  const stopped = await Promise.allSettled(
    pending.commands.map((c) => c.stop()),
  );
  const closed = await Promise.allSettled(
    pending.listeners.map(
      (listener) =>
        new Promise<void>((resolve, reject) => {
          listener.close((error) => {
            if (error) reject(error);
            else resolve();
          });
        }),
    ),
  );
  const cleaned = await Promise.allSettled(
    created.flatMap((result) =>
      result.status === "fulfilled" ? [result.value.cleanup()] : [],
    ),
  );
  const errors: unknown[] = [];
  for (const result of [...stopped, ...closed, ...created, ...cleaned])
    if (result.status === "rejected") errors.push(result.reason);
  if (errors.length > 0)
    throw new AggregateError(errors, "Watcher resources did not retire");
});

test("npm watcher refuses invalid options and an origin without published main", async () => {
  const fixture = await watching.publication(unpublishedWatcherFixture);
  for (const [args, reason] of [
    [["--port", "43127"], "distinct from development's 43127"],
    [["--port", "65536"], "Production port must be 0–65535"],
    [["--check-interval", "0"], "Check interval must be a positive number"],
  ] as const) {
    const invalid = watching.command(
      fixture.development,
      fixture.env,
      "watch:dashboard",
      [...args],
    );
    expect((await invalid.exited).code).toBe(1);
    expect(invalid.output()).toContain(reason);
    expect(invalid.output()).not.toContain("Preparing production dashboard");
  }
  const watcher = watching.command(
    fixture.development,
    fixture.env,
    "watch:dashboard",
  );
  expect((await watcher.exited).code).toBe(1);
  expect(watcher.output()).toContain("Production dashboard could not run");
  expect(watcher.output()).toContain("has no published main branch");
  expect(watcher.output()).not.toContain("at http://");
}, 30_000);

test("an occupied production port is refused rather than moved", async () => {
  const fixture = await watching.publication(productionFailureFixture);
  async function occupyLoopback() {
    const server = watching.listener(
      createServer((req, response) => {
        req.resume();
        response.end("UNOWNED LISTENER");
      }),
    );
    const listening = once(server, "listening");
    server.listen(0, "127.0.0.1");
    await listening;
    const address = server.address();
    if (address === null || typeof address === "string")
      throw new Error("The test listener did not bind a loopback port");
    return address.port;
  }

  await fixture.publish(fixture.markerChanges("Published"), "Published");
  const firstPort = await occupyLoopback();
  // Keep the first socket reserved if the OS chose the development port.
  const port = firstPort === 43127 ? await occupyLoopback() : firstPort;
  const watcher = watching.command(
    fixture.development,
    fixture.env,
    "watch:dashboard",
    ["--port", String(port)],
  );
  expect((await watcher.exited).code).toBe(1);
  expect(watcher.output()).toContain(`Port ${port} is already in use`);
  expect(watcher.output()).not.toMatch(/Production dashboard \w+ at http:/);
  const response = await fetch(`http://127.0.0.1:${port}`);
  expect(await response.text()).toBe("UNOWNED LISTENER");
  expect(await readdir(productionDeployments(fixture.home))).toEqual([]);
}, 60_000);

let retired: { root: string; watcher: number; runner: number } | undefined;
test("ending a case retires its live watcher and detached Cursor runner before removing HOME", async () => {
  const fixture = await watching.publication(productionFailureFixture);
  await fixture.publish(fixture.markerChanges("Published"), "Published");
  const watcher = watching.command(
    fixture.development,
    fixture.env,
    "watch:dashboard",
    ["--port", "0"],
  );
  await waitForWatcherOutput(watcher, /Production dashboard \w+ at http:/);
  const runner = readCursorRunnerAddress(fixture.home);
  const pid = watcher.child.pid;
  if (runner === undefined || pid === undefined)
    throw new Error("The native watcher and runner did not start");
  expect(processRunning(pid)).toBe(true);
  expect(processRunning(runner.pid)).toBe(true);
  const marker = path.basename(fixture.root);
  const cache = path.join(fixture.development, "node_modules/.vite");
  const sharedMarker = path.join(repoRoot, "node_modules/.vite", marker);
  try {
    await mkdir(cache, { recursive: true });
    await writeFile(path.join(cache, marker), "private watcher cache");
    expect(existsSync(sharedMarker)).toBe(false);
  } finally {
    // A regression must not leave this test's marker in the shared runtime.
    await rm(sharedMarker, { force: true });
  }
  retired = { root: fixture.root, watcher: pid, runner: runner.pid };
}, 120_000);

afterAll(() => {
  if (retired === undefined) return;
  expect(processRunning(retired.watcher)).toBe(false);
  expect(processRunning(retired.runner)).toBe(false);
  expect(existsSync(retired.root)).toBe(false);
});
