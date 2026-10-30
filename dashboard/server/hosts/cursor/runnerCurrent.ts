// The current-runner guarantee for new Cursor work (see
// ./runnerProcess.ts for start-if-absent): a runner already accepting is
// reused when it proves it runs the current build. Matching build proof
// with a missing or drifted terminal helper is repaired from this
// install when possible so held clients stay up; only absent or
// differing build proof stops and replaces the runner, once under the
// start lock. An accepting process that does not answer the protocol is
// left alone and this answers false, so new work fails as unreachable
// and starts no agent. Observation and startup never replace.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { homedir } from "node:os";
import { computeRunnerBuildId, runnerEntryPath } from "./runnerBuild.ts";
import { cursorRunnerSpawnHelper } from "./runnerSpawnHelper.ts";
import {
  acceptingCursorRunnerPort,
  cursorRunnerAccepting,
  ensureCursorRunner,
  releaseStartLock,
  spawnRunner,
  startOncePerHome,
  startWaitMs,
  stopCursorRunner,
  takeStartLock,
} from "./runnerProcess.ts";
import {
  readCursorRunnerAddress,
  writeCursorRunnerAddress,
  type CursorRunnerAddress,
} from "./runnerPaths.ts";
import { cursorRunnerSessionsResult } from "./runnerProtocol.ts";

const pendingCurrentStarts = new Map<string, Promise<boolean>>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type RunnerProofProbe =
  | {
      readonly answered: true;
      readonly buildId: string | undefined;
      readonly spawnHelper: string | undefined;
    }
  | { readonly answered: false };

// Asks the accepting runner, over its own wire protocol, which build it
// runs. A runner that accepts TCP but does not answer the protocol has not
// answered: it is not replaced, and new work fails as unreachable today.
function probeRunnerProof(port: number): Promise<RunnerProofProbe> {
  return new Promise((resolve) => {
    const req = http.request(
      { host: "127.0.0.1", port, path: "/sessions", method: "GET" },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          try {
            const parsed = cursorRunnerSessionsResult.safeParse(
              JSON.parse(Buffer.concat(chunks).toString("utf8")),
            );
            resolve(
              parsed.success
                ? {
                    answered: true,
                    buildId: parsed.data.buildId,
                    spawnHelper: parsed.data.spawnHelper,
                  }
                : { answered: false },
            );
          } catch {
            resolve({ answered: false });
          }
        });
      },
    );
    req.setTimeout(2_000, () => {
      req.destroy(new Error("The Cursor runner did not answer."));
    });
    req.on("error", () => {
      resolve({ answered: false });
    });
    req.end();
  });
}

// True only for an accepting runner whose recorded and wire proof both
// match the build this dashboard would start now, and whose terminal
// helper is ready (or repaired from this install onto the path that
// runner still executes). Null when the accepting process does not
// answer the protocol at all.
async function acceptingRunnerIsCurrent(
  home: string,
  currentBuildId: string,
): Promise<boolean | null> {
  const port = await acceptingCursorRunnerPort(home);
  if (port === undefined) return false;
  const probe = await probeRunnerProof(port);
  if (!probe.answered) return null;
  if (probe.buildId !== currentBuildId) return false;
  const address = readCursorRunnerAddress(home);
  if (address === undefined || address.buildId !== currentBuildId) {
    return false;
  }
  if (spawnHelperReady(address.spawnHelper, probe.spawnHelper)) return true;
  // Same build, helper proof missing or drifted: restore a usable helper
  // for this answering runner instead of stopping it and hanging up every
  // client it still holds.
  return repairSpawnHelperProof(home, address, probe.spawnHelper);
}

// A platform whose node-pty ships no separate helper is current when the
// runner reports none. Where this install has a helper, the runner must
// report a helper file that is still on disk. A dashboard update deletes
// the old install's helper while the old process keeps answering.
function spawnHelperReady(
  recorded: string | undefined,
  reported: string | undefined,
): boolean {
  const installed = cursorRunnerSpawnHelper();
  if (installed === undefined) {
    return recorded === undefined && reported === undefined;
  }
  return (
    recorded !== undefined && recorded === reported && existsSync(recorded)
  );
}

// Puts the helper file back where this same-build runner still executes it
// (the wire path), using this install's helper as the source when the
// retired checkout removed that file, and republishes the recorded address
// so recorded and wire agree. Returns whether helper proof is then ready.
function repairSpawnHelperProof(
  home: string,
  address: CursorRunnerAddress,
  reported: string | undefined,
): boolean {
  const installed = cursorRunnerSpawnHelper();
  if (installed === undefined) {
    return spawnHelperReady(address.spawnHelper, reported);
  }
  if (reported === undefined) return false;
  if (!existsSync(reported)) {
    try {
      mkdirSync(path.dirname(reported), { recursive: true });
      copyFileSync(installed, reported);
    } catch {
      return false;
    }
  }
  if (!existsSync(reported)) return false;
  if (address.spawnHelper !== reported) {
    try {
      writeCursorRunnerAddress(home, { ...address, spawnHelper: reported });
    } catch {
      return false;
    }
  }
  const refreshed = readCursorRunnerAddress(home);
  return spawnHelperReady(refreshed?.spawnHelper, reported);
}

async function ensureCurrentCursorRunnerOnce(home: string): Promise<boolean> {
  if (!(await cursorRunnerAccepting(home))) {
    return ensureCursorRunner(home);
  }
  let currentBuildId: string;
  try {
    currentBuildId = computeRunnerBuildId(runnerEntryPath());
  } catch {
    return false;
  }
  const current = await acceptingRunnerIsCurrent(home, currentBuildId);
  if (current === null) return false;
  if (current) return true;
  // Stale but answering: replace once. The start lock is held across stop
  // and spawn, so the old runner ends before the new one can publish its
  // address, and a concurrent replacer re-checks under the lock and reuses
  // the replacement instead of replacing again.
  const deadline = Date.now() + startWaitMs;
  while (Date.now() < deadline) {
    const locked = await takeStartLock(home);
    if (!locked) {
      const settled = await acceptingRunnerIsCurrent(home, currentBuildId);
      if (settled === true) return true;
      if (settled === null && !(await cursorRunnerAccepting(home))) {
        // The holder's start may still be publishing; keep waiting.
      }
      await delay(30);
      continue;
    }
    try {
      if (!(await cursorRunnerAccepting(home))) {
        return await spawnRunner(home);
      }
      const rechecked = await acceptingRunnerIsCurrent(home, currentBuildId);
      if (rechecked === null) return false;
      if (rechecked) return true;
      await stopCursorRunner(home);
      return await spawnRunner(home);
    } finally {
      await releaseStartLock(home);
    }
  }
  const settled = await acceptingRunnerIsCurrent(home, currentBuildId);
  return settled === true;
}

// Starts the runner for new work, as described in this file's header.
export function ensureCurrentCursorRunner(home = homedir()): Promise<boolean> {
  return startOncePerHome(
    pendingCurrentStarts,
    home,
    ensureCurrentCursorRunnerOnce,
  );
}

// The port of a current runner for new work, after starting or replacing
// as ensureCurrentCursorRunner describes. Undefined when no current
// runner can be reached.
export async function currentCursorRunnerPort(
  home = homedir(),
): Promise<number | undefined> {
  if (!(await ensureCurrentCursorRunner(home))) return undefined;
  return acceptingCursorRunnerPort(home);
}
