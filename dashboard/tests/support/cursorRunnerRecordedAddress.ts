// Manipulation of the runner address recorded in a proof home: writing
// an address outright, turning its recorded build proof stale, and
// leaving it stale while the runner it names is killed.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "./pageTest.ts";
import {
  cursorRunnerAddressFile,
  readCursorRunnerAddress,
  type CursorRunnerAddress,
} from "../../server/hosts/cursor/runnerPaths.ts";
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

export function makeRecordedRunnerProofStale(home: string): void {
  const address = readCursorRunnerAddress(home);
  if (address === undefined) throw new Error("No runner address to tamper.");
  writeFileSync(
    cursorRunnerAddressFile(home),
    JSON.stringify({ ...address, buildId: "stale-build" }),
  );
}

export function tamperRecordedProof(fixture: RunnerProofFixture): void {
  makeRecordedRunnerProofStale(fixture.home);
}
