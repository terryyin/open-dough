// The current-runner guarantee for new Cursor work (see
// ./runnerProcess.ts for start-if-absent): a runner already accepting is
// reused when it proves it runs the current build. Matching build proof
// with a missing or drifted terminal helper is repaired from this
// install when possible so held clients stay up; only absent or
// differing build proof stops and replaces the runner, once under the
// start lock. An accepting process that does not answer the protocol is
// left alone and this answers false, so new work fails as unreachable
// and starts no agent. After a start or replace settles, unfinished
// sessions named by durable last-held evidence are resumed onto the
// accepting runner through Recover's keep path (./runnerRevive.ts).
// Observation and startup never replace or revive.
import { homedir } from "node:os";
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
  acceptingRunnerIsCurrent,
  currentRunnerBuildId,
} from "./runnerCurrentProof.ts";
import { reviveLastHeldCursorSessions } from "./runnerRevive.ts";

const pendingCurrentStarts = new Map<string, Promise<boolean>>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureCurrentCursorRunnerOnce(home: string): Promise<boolean> {
  if (!(await cursorRunnerAccepting(home))) {
    const started = await ensureCursorRunner(home);
    // Revive after the start lock is released (ensureCursorRunner's lock).
    if (started) await reviveLastHeldCursorSessions(home);
    return started;
  }
  let currentBuildId: string;
  try {
    currentBuildId = currentRunnerBuildId();
  } catch {
    return false;
  }
  const current = await acceptingRunnerIsCurrent(home, currentBuildId);
  if (current === null) return false;
  if (current) return true;
  // Stale but answering: replace once. The start lock is held across stop
  // and spawn, so the old runner ends before the new one can publish its
  // address, and a concurrent replacer re-checks under the lock and reuses
  // the replacement instead of replacing again. Revival runs after the
  // lock is released so sequential Recover waits do not hold it.
  const deadline = Date.now() + startWaitMs;
  while (Date.now() < deadline) {
    const locked = await takeStartLock(home);
    if (!locked) {
      const settled = await acceptingRunnerIsCurrent(home, currentBuildId);
      if (settled === true) {
        // Another starter may have replaced; revive is idempotent for
        // sessions the new runner already holds.
        await reviveLastHeldCursorSessions(home);
        return true;
      }
      if (settled === null && !(await cursorRunnerAccepting(home))) {
        // The holder's start may still be publishing; keep waiting.
      }
      await delay(30);
      continue;
    }
    let startedOrReplaced = false;
    let ok = false;
    try {
      if (!(await cursorRunnerAccepting(home))) {
        ok = await spawnRunner(home);
        startedOrReplaced = ok;
      } else {
        const rechecked = await acceptingRunnerIsCurrent(home, currentBuildId);
        if (rechecked === true) {
          ok = true;
        } else if (rechecked === false) {
          await stopCursorRunner(home);
          ok = await spawnRunner(home);
          startedOrReplaced = ok;
        }
      }
    } finally {
      await releaseStartLock(home);
    }
    if (startedOrReplaced) await reviveLastHeldCursorSessions(home);
    return ok;
  }
  const settled = await acceptingRunnerIsCurrent(home, currentBuildId);
  if (settled === true) {
    await reviveLastHeldCursorSessions(home);
    return true;
  }
  return false;
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
