// Manipulation of the runner address recorded in a proof home: writing
// an address outright, turning its recorded build or helper proof stale,
// publishing a retired-checkout helper for wire proof, and leaving the
// address stale while the runner it names is killed.
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import type net from "node:net";
import path from "node:path";
import { expect } from "./pageTest.ts";
import {
  cursorRunnerAddressFile,
  readCursorRunnerAddress,
  type CursorRunnerAddress,
} from "../../server/hosts/cursor/runnerPaths.ts";
import {
  cursorRunnerSpawnHelper,
  cursorRunnerSpawnHelperProofVariable,
} from "../../server/hosts/cursor/runnerSpawnHelper.ts";
import { processRunning } from "./processGroup.ts";
import type { RunnerProofFixture } from "./cursorRunnerProof.ts";

export function writeRunnerAddress(
  fixture: RunnerProofFixture,
  address: unknown,
): void {
  mkdirSync(path.dirname(cursorRunnerAddressFile(fixture.home)), {
    recursive: true,
  });
  writeFileSync(cursorRunnerAddressFile(fixture.home), JSON.stringify(address));
}

function patchRecordedAddress(
  home: string,
  patch: Partial<CursorRunnerAddress>,
): void {
  const address = readCursorRunnerAddress(home);
  if (address === undefined) throw new Error("No runner address to tamper.");
  writeFileSync(
    cursorRunnerAddressFile(home),
    JSON.stringify({ ...address, ...patch }),
  );
}

// Production retirement deletes the checkout that held the live runner's
// helper. Publish a copy under the fixture as the wire proof path so the
// real install helper stays available as repair's copy source.
export function publishRetiredCheckoutHelper(
  fixture: RunnerProofFixture,
): string {
  const installed = cursorRunnerSpawnHelper();
  if (installed === undefined) {
    throw new Error(
      "this install's node-pty ships no separate terminal helper",
    );
  }
  const retired = path.join(
    fixture.root,
    "retired-checkout",
    "prebuilds",
    "spawn-helper",
  );
  mkdirSync(path.dirname(retired), { recursive: true });
  copyFileSync(installed, retired);
  process.env[cursorRunnerSpawnHelperProofVariable] = retired;
  return retired;
}

export function clearRetiredCheckoutHelperProof(): void {
  Reflect.deleteProperty(process.env, cursorRunnerSpawnHelperProofVariable);
}

// The machine-restart shape: the runner is gone (killed as power loss
// would, with no shutdown that could tidy up) but its address file is
// left behind, naming a dead pid and a freed port. Returns that stale
// address; the file is not touched.
export async function killCursorRunnerLeavingAddress(
  home: string,
): Promise<CursorRunnerAddress> {
  const stale = readCursorRunnerAddress(home);
  if (stale === undefined) throw new Error("No runner address to leave stale.");
  process.kill(stale.pid, "SIGKILL");
  await expect.poll(() => processRunning(stale.pid)).toBe(false);
  expect(readCursorRunnerAddress(home)).toEqual(stale);
  return stale;
}

// Process death does not reserve its old port for this test: another socket
// may occupy it before the unrelated listener can bind. Observe acquisition
// of that exact port, with the normal bounded poll, before exercising ensure.
export async function listenOnReleasedRunnerPort(
  server: net.Server,
  port: number,
): Promise<void> {
  await expect
    .poll(
      () =>
        new Promise<boolean>((resolve, reject) => {
          const failed = (error: NodeJS.ErrnoException) => {
            server.off("listening", listening);
            if (error.code === "EADDRINUSE") resolve(false);
            else reject(error);
          };
          const listening = () => {
            server.off("error", failed);
            resolve(true);
          };
          server.once("error", failed);
          server.once("listening", listening);
          server.listen(port, "127.0.0.1");
        }),
    )
    .toBe(true);
}

export function makeRecordedRunnerProofStale(home: string): void {
  patchRecordedAddress(home, { buildId: "stale-build" });
}

// Same-build helper drift: recorded spawnHelper names a path that is not
// on disk (as after a retired deployment checkout), while the answering
// runner's wire proof and buildId stay current.
export function makeRecordedHelperProofMissing(
  home: string,
  missingHelper: string,
): void {
  patchRecordedAddress(home, { spawnHelper: missingHelper });
}

export function tamperRecordedProof(fixture: RunnerProofFixture): void {
  makeRecordedRunnerProofStale(fixture.home);
}
