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

export function endDescendantsAtExit(): void {
  if (endingAtExit) return;
  endingAtExit = true;
  process.on("exit", () => {
    const started = descendants(process.pid);
    for (const end of endsAtExit) end();
    for (const pid of started) {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
        // Already gone.
      }
    }
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
  try {
    // A negative pid addresses every process in that group.
    process.kill(-group, "SIGKILL");
  } catch {
    // Already gone.
  }
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

// Whether the process can still run code. On macOS a process that has exited
// but is not yet reaped (orphans are reaped by launchd, late under load) still
// answers `kill(pid, 0)`, although its group no longer counts it; `ps` shows it
// exiting (E) or as a zombie (Z).
export function processRunning(pid: number | undefined): boolean {
  if (!processAlive(pid)) {
    return false;
  }
  const state = spawnSync("ps", ["-o", "stat=", "-p", String(pid)], {
    encoding: "utf8",
  }).stdout.trim();
  return state !== "" && !/[EZ]/.test(state);
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

// SIGTERMs the leader, SIGKILLs the whole group if the leader has not exited
// within 5 seconds, and resolves only once no process of the group remains.
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
  while (processAlive(-group)) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  groupAtExit.get(leader)?.();
}
