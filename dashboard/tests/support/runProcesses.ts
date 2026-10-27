// Every process a run starts carries the run's identity in its environment.
// The global setup (./globalSetup.ts) gives the runner process a fresh
// `runIdVariable` value before any worker starts, and every worker, the
// servers and synthetic hosts a test starts, and the product's own children
// -- detached Cursor runners, Codex and request-owner clients, the production
// watcher's deployments and their previews -- inherit it, as a spawned
// process inherits its parent's environment. The run's teardown then finds
// whatever of its own is still running once its workers have exited, ends
// it, and fails the run naming each process, so a leak is fixed where it
// starts rather than left idling on the machine. Processes of other runs,
// of other checkouts, and this machine's own dashboard carry no such value
// and are never counted or signalled.
//
// Each worker already ends its own descendants and signals the runners it
// knows of when it exits (./processGroup.ts, ./dashboardServer.ts); what
// reaches this sweep is a process those misses: one whose parent was gone
// before the worker exited, such as a runner a killed server had detached,
// or a worker Playwright killed outright.

import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  closeSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { processAlive, signal } from "./processGroup.ts";

export const runIdVariable = "OPEN_DOUGH_DASHBOARD_RUN_ID";

export type RunProcess = {
  readonly pid: number;
  readonly command: string;
  // Elapsed time as `ps` shows it, `[[dd-]hh:]mm:ss`.
  readonly age: string;
};

// Gives this process, and so every process it starts from now on, a new run
// identity, and returns it.
export function identifyRun(): string {
  const runId = randomUUID();
  process.env[runIdVariable] = runId;
  return runId;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Full environments can exceed spawnSync's pipe buffer. A private descriptor
// keeps the whole observation, and a failed read never means no owned process.
function ps(args: readonly string[], disappearingPid?: number): string {
  const directory = mkdtempSync(
    join(tmpdir(), "dough-run-process-observation-"),
  );
  const listing = join(directory, "listing");
  let descriptor: number | undefined;
  try {
    descriptor = openSync(listing, "wx", 0o600);
    const result = spawnSync("ps", [...args], {
      stdio: ["ignore", descriptor, "pipe"],
    });
    if (result.error !== undefined || result.status !== 0) {
      // A process can finish between discovery and its metadata read.
      if (disappearingPid !== undefined && !processAlive(disappearingPid))
        return "";
      const error = result.error as NodeJS.ErrnoException | undefined;
      const reason = error?.code ?? result.signal ?? String(result.status);
      throw new Error(
        `Could not observe dashboard run processes: ps failed (${reason}).`,
      );
    }
    return readFileSync(listing, "utf8");
  } finally {
    try {
      if (descriptor !== undefined) closeSync(descriptor);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
}

function processIsRunning(pid: number): boolean {
  if (!processAlive(pid)) return false;
  const state = ps(["-o", "stat=", "-p", String(pid)], pid).trim();
  return state !== "" && !/[EZ]/.test(state);
}

// A process's own command, without its environment.
function commandOf(pid: number): string {
  return ps(["-ww", "-o", "command=", "-p", String(pid)], pid).trim();
}

function ageOf(pid: number): string {
  return ps(["-o", "etime=", "-p", String(pid)], pid).trim();
}

// The pids of every running process of this user whose environment holds
// `entry`, this process excepted.
function pidsCarrying(entry: string): number[] {
  if (process.platform === "linux") {
    return readdirSync("/proc")
      .filter((name) => /^\d+$/.test(name))
      .map(Number)
      .filter((pid) => {
        try {
          return readFileSync(`/proc/${String(pid)}/environ`, "utf8")
            .split("\0")
            .includes(entry);
        } catch {
          return false;
        }
      });
  }
  // `-E` prints each process's environment after its command, one entry per
  // word; `-ww` keeps the whole line.
  return ps(["-axwwE", "-o", "pid=,command="])
    .split("\n")
    .filter((line) => line.split(" ").includes(entry))
    .map((line) => Number(line.trim().split(" ")[0]));
}

// Every running process started under this run identity, this process (the
// runner, or a test asking about an inner run) excepted.
export function processesOfRun(runId: string): RunProcess[] {
  return pidsCarrying(`${runIdVariable}=${runId}`)
    .filter((pid) => pid !== process.pid && processIsRunning(pid))
    .map((pid) => ({ pid, command: commandOf(pid), age: ageOf(pid) }));
}

// Ends every process still running under this run identity and returns what
// it ended. Processes still finishing their own exit -- a server's group
// killed as its worker exited, a runner whose removed directory it is about
// to notice -- get `settleMs` to disappear first; the rest are SIGTERMed,
// given 5 seconds to exit, and then SIGKILLed. Resolves once none of them is
// running.
export async function endRunProcesses(
  runId: string,
  { settleMs = 5_000 } = {},
): Promise<RunProcess[]> {
  const settled = Date.now() + settleMs;
  let remaining = processesOfRun(runId);
  while (remaining.length > 0 && Date.now() < settled) {
    await delay(100);
    remaining = processesOfRun(runId);
  }
  if (remaining.length === 0) return [];
  const running = () => remaining.some(({ pid }) => processIsRunning(pid));
  for (const { pid } of remaining) signal(pid, "SIGTERM");
  const terminated = Date.now() + 5_000;
  while (running() && Date.now() < terminated) await delay(50);
  for (const { pid } of remaining) signal(pid, "SIGKILL");
  while (running()) await delay(50);
  return remaining;
}

// One line per ended process, for the failure that names them.
export function describeRunProcesses(processes: readonly RunProcess[]): string {
  return processes
    .map(
      ({ pid, command, age }) => `  pid ${String(pid)} (up ${age}): ${command}`,
    )
    .join("\n");
}
