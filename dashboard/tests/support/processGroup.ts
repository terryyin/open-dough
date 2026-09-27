// Starts a process as the leader of its own process group, and ends it
// together with every subprocess it launched. ./dashboardServer.ts runs each
// Vite server this way: Vite exits without waiting for the `gh` subprocesses
// it has just told to stop, which may still be writing into that server's
// temporary directory, so the directory can only be removed once the whole
// group is over.

import {
  spawn,
  spawnSync,
  type ChildProcessByStdio,
  type SpawnOptions,
} from "node:child_process";
import type { Readable } from "node:stream";

export type GroupLeader = ChildProcessByStdio<null, Readable, Readable>;

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

// stdout and stderr are piped for the caller to read or drain.
export function spawnGroupLeader(
  command: string,
  args: readonly string[],
  options: Pick<SpawnOptions, "cwd" | "env">,
): GroupLeader {
  return spawn(command, args, {
    ...options,
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
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
          process.kill(-group, "SIGKILL");
        }
      }, 5_000);
    });
  }
  // A negative pid addresses every process in that group.
  while (processAlive(-group)) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}
