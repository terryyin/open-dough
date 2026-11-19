// Concurrent comparison renderers must not share Vite's default optimizer
// cache, and compiling comparison markup must not mount the dashboard's local
// boundaries, which would reach this machine's runner and dashboard home.
import { existsSync } from "node:fs";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { createComparisonRenderer } from "../../test-support/support/comparisonRendering.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import {
  cursorRunnerAddressFile,
  writeCursorRunnerAddress,
} from "../../server/hosts/cursor/runnerPaths.ts";
import { machineDashboardDirectory } from "../../server/machineHome.ts";
import { expect, test } from "../../test-support/support/pageTest.ts";

const sharedDefaultCache = path.join(repoRoot, "dashboard/node_modules/.vite");

test("comparison renderers keep private Vite optimizer caches outside the shared default", async () => {
  const [first, second] = await Promise.all([
    createComparisonRenderer(),
    createComparisonRenderer(),
  ]);
  try {
    for (const renderer of [first, second]) {
      expect(renderer.viteCacheDir.startsWith(tmpdir())).toBe(true);
      expect(path.resolve(renderer.viteCacheDir)).not.toBe(
        path.resolve(sharedDefaultCache),
      );
      expect(existsSync(renderer.viteCacheDir)).toBe(true);
    }
    expect(path.resolve(first.viteCacheDir)).not.toBe(
      path.resolve(second.viteCacheDir),
    );
  } finally {
    await Promise.all([first.close(), second.close()]);
  }
  expect(existsSync(first.viteCacheDir)).toBe(false);
  expect(existsSync(second.viteCacheDir)).toBe(false);
});

test("a comparison renderer leaves the runner and the machine home alone", async () => {
  const home = await mkdtemp(path.join(tmpdir(), "dough-comparison-home-"));
  const requests: string[] = [];
  const runner = createServer((request, response) => {
    requests.push(`${request.method ?? ""} ${request.url ?? ""}`);
    response.end("{}");
  });
  await new Promise<void>((listening) =>
    runner.listen(0, "127.0.0.1", listening),
  );
  const { port } = runner.address() as AddressInfo;
  writeCursorRunnerAddress(home, { port, pid: process.pid });
  const developerHome = process.env["HOME"];
  process.env["HOME"] = home;
  try {
    const renderer = await createComparisonRenderer();
    await renderer.close();
    expect(requests).toEqual([]);
    expect(await readdir(machineDashboardDirectory(home))).toEqual([
      path.basename(cursorRunnerAddressFile(home)),
    ]);
  } finally {
    if (developerHome === undefined) delete process.env["HOME"];
    else process.env["HOME"] = developerHome;
    await new Promise((closed) => runner.close(closed));
    await rm(home, { recursive: true, force: true });
  }
});
