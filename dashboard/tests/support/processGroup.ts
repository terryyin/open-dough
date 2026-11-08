// Starts a process as the leader of its own process group, and ends it
// together with every subprocess it launched. ./dashboardServer.ts runs each
// Vite server this way: Vite exits without waiting for the `gh` subprocesses
// it has just told to stop, which may still be writing into that server's
// temporary directory, so the directory can only be removed once the whole
// group is over.
//
// Every process this one started, directly or through others, that is still
// running when it exits is killed then, and so is every group it started
// this way: Playwright ends a worker whose fixture teardown outlasts its
// timeout without running the teardowns still ahead, and abandons a timed-out
// test's own cleanup, and a detached group, such as one the production
// deployment starts (../../server/productionProcess.mjs), would otherwise
// outlive the run. ./pageTest.ts installs this in every worker.

import {
  spawn,
  spawnSync,
  type ChildProcessByStdio,
  type SpawnOptions,
} from "node:child_process";
import { readFileSync } from "node:fs";
import type { Readable } from "node:stream";

export type GroupLeader = ChildProcessByStdio<null, Readable, Readable>;

const endsAtExit = new Set<() => void>();
let endingAtExit = false;

// Every process descended from `root`, read before any of them is killed so
// that none is lost to reparenting.
function descendants(root: number): number[] {
  const children = new Map<number, number[]>();
  const listing = spawnSync("ps", ["-axo", "pid=,ppid="], { encoding: "utf8" });
  for (const line of listing.stdout.split("\n")) {
    const [pid, ppid] = line.trim().split(/\s+/).map(Number);
    if (pid === undefined || ppid === undefined) continue;
    children.set(ppid, [...(children.get(ppid) ?? []), pid]);
  }
  const found: number[] = [];
  const pending = [root];
  for (
    let parent = pending.pop();
    parent !== undefined;
    parent = pending.pop()
  ) {
    for (const child of children.get(parent) ?? []) {
      found.push(child);
      pending.push(child);
    }
  }
  return found;
}

// Sends `name` to `pid`, or to every process of a group when `pid` is the
// group's negative, tolerating one already gone.
export function signal(pid: number, name: NodeJS.Signals): void {
  try {
    process.kill(pid, name);
  } catch {
    // Already gone.
  }
}

export function endDescendantsAtExit(): void {
  if (endingAtExit) return;
  endingAtExit = true;
  process.on("exit", () => {
    const started = descendants(process.pid);
    for (const end of endsAtExit) end();
    for (const pid of started) signal(pid, "SIGKILL");
  });
}

// Runs `end` when this process exits, unless the returned function withdraws
// it first. `end` must be synchronous, as every exit handler is.
export function endAtExit(end: () => void): () => void {
  endsAtExit.add(end);
  return () => {
    endsAtExit.delete(end);
  };
}

function killGroup(group: number): void {
  signal(-group, "SIGKILL");
}

// The pid a fake process recorded in its pid file, read back as a number. A
// pid file the fake has created but not yet written reads empty; that is no
// pid yet, not pid 0.
export function readPid(pidPath: string): number | undefined {
  let pid: number;
  try {
    pid = Number(readFileSync(pidPath, "utf8"));
  } catch {
    return undefined;
  }
  return Number.isInteger(pid) && pid > 0 ? pid : undefined;
}

export function processAlive(pid: number | undefined): boolean {
  if (pid === undefined) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// `ps` state letters that still mean the process can run code. On macOS a
// process that has exited but is not yet reaped (orphans are reaped by
// launchd, late under load) still answers `kill(pid, 0)`, although its group
// no longer counts it; `ps` shows it exiting (E) or as a zombie (Z).
function stateMeansRunning(state: string): boolean {
  return state !== "" && !/[EZ]/.test(state);
}

// Whether the process can still run code.
export function processRunning(pid: number | undefined): boolean {
  if (!processAlive(pid)) {
    return false;
  }
  const state = spawnSync("ps", ["-o", "stat=", "-p", String(pid)], {
    encoding: "utf8",
  }).stdout.trim();
  return stateMeansRunning(state);
}

// SIGTERMs each still-running pid, waits up to `graceMs` for them to exit,
// SIGKILLs any that remain, and resolves only once none of them is still
// running.
export async function endRunningProcesses(
  pids: readonly number[],
  { graceMs = 1_000, pollMs = 20 }: { graceMs?: number; pollMs?: number } = {},
): Promise<void> {
  const running = () => pids.filter((pid) => processRunning(pid));
  for (const pid of running()) signal(pid, "SIGTERM");
  const deadline = Date.now() + graceMs;
  while (running().length > 0 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  for (const pid of running()) signal(pid, "SIGKILL");
  while (running().length > 0) {
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}

// Each running leader's withdrawal of its group's kill at exit.
const groupAtExit = new WeakMap<GroupLeader, () => void>();

// stdout and stderr are piped for the caller to read or drain.
export function spawnGroupLeader(
  command: string,
  args: readonly string[],
  options: Pick<SpawnOptions, "cwd" | "env">,
): GroupLeader {
  const leader = spawn(command, args, {
    ...options,
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  const group = leader.pid;
  if (group !== undefined) {
    groupAtExit.set(
      leader,
      endAtExit(() => {
        killGroup(group);
      }),
    );
  }
  return leader;
}

// Whether any process still runs in `group` (zombies and exiting processes do
// not count). `kill(-group, 0)` stays true for unreaped members and would
// hang teardown after a SIGKILL.
function groupRunning(group: number): boolean {
  const listing = spawnSync("ps", ["-axo", "pid=,pgid=,stat="], {
    encoding: "utf8",
  });
  for (const line of listing.stdout.split("\n")) {
    const [pidText, pgidText, state = ""] = line.trim().split(/\s+/);
    const pid = Number(pidText);
    const pgid = Number(pgidText);
    if (pid > 0 && pgid === group && stateMeansRunning(state)) {
      return true;
    }
  }
  return false;
}

// SIGTERMs the leader, SIGKILLs any group member still running once the
// leader has exited (or within 5 seconds if it has not), and resolves only
// once no process of the group is still running. A leader that exits on
// SIGTERM without ending its children used to leave endGroup waiting forever
// on those orphans — Playwright then timed out fixture teardown.
export async function endGroup(leader: GroupLeader): Promise<void> {
  const group = leader.pid;
  if (group === undefined) {
    return;
  }
  if (leader.exitCode === null && leader.signalCode === null) {
    await new Promise<void>((resolve) => {
      leader.once("exit", () => {
        resolve();
      });
      leader.kill("SIGTERM");
      setTimeout(() => {
        if (leader.exitCode === null && leader.signalCode === null) {
          killGroup(group);
        }
      }, 5_000);
    });
  }
  while (groupRunning(group)) {
    killGroup(group);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  groupAtExit.get(leader)?.();
}
