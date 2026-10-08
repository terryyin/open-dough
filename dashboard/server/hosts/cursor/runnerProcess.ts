// Starts the one Cursor runner for this machine when it is not already
// accepting connections, and stops it. The runner is its own process group,
// so closing the dashboard server does not signal it. A runner that is
// already accepting is left as it is, including one this process did not
// start. Each home has its own runner. It runs in the developer's shell
// environment (`../../developerShellEnvironment.ts`), as do the
// `cursor-agent` processes it starts (./exec.ts, ./terminal.ts), which apply
// that rule again so a runner an earlier deployment started still starts
// them clean.
import { spawn } from "node:child_process";
import { closeSync, existsSync, openSync } from "node:fs";
import { link, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { developerShellEnvironment } from "../../developerShellEnvironment.ts";
import {
  cursorRunnerAddressFile,
  cursorRunnerDirectory,
  cursorRunnerLockFile,
  readCursorRunnerAddress,
} from "./runnerPaths.ts";

const startWaitMs = 20_000;

const pendingStarts = new Map<string, Promise<boolean>>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function processAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function portAccepting(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port });
    const finish = (accepting: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(accepting);
    };
    socket.setTimeout(300);
    socket.once("connect", () => {
      finish(true);
    });
    socket.once("timeout", () => {
      finish(false);
    });
    socket.once("error", () => {
      finish(false);
    });
  });
}

async function cursorRunnerAccepting(home: string): Promise<boolean> {
  const address = readCursorRunnerAddress(home);
  if (address === undefined) return false;
  return portAccepting(address.port);
}

// One starter wins the lock. A lock whose writer is gone is not a live start.
// The lock appears already naming its holder, so another starter never reads
// it empty and takes a live start for a gone one.
async function takeStartLock(home: string): Promise<boolean> {
  const lock = cursorRunnerLockFile(home);
  await mkdir(path.dirname(lock), { recursive: true });
  const claim = `${lock}.${String(process.pid)}.tmp`;
  await writeFile(claim, String(process.pid), "utf8");
  try {
    await link(claim, lock);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    const holder = Number(await readFile(lock, "utf8").catch(() => ""));
    if (!Number.isInteger(holder) || holder <= 0 || !processAlive(holder)) {
      await rm(lock, { force: true });
    }
    return false;
  } finally {
    await rm(claim, { force: true });
  }
}

async function releaseStartLock(home: string): Promise<void> {
  await rm(cursorRunnerLockFile(home), { force: true });
}

function runnerEntry(): string {
  const fromRoot = path.join(
    process.cwd(),
    "dashboard/server/hosts/cursor/runnerMain.ts",
  );
  if (existsSync(fromRoot)) return fromRoot;
  return fileURLToPath(new URL("./runnerMain.ts", import.meta.url));
}

async function spawnRunner(home: string): Promise<boolean> {
  const directory = cursorRunnerDirectory(home);
  await mkdir(directory, { recursive: true });
  const log = openSync(path.join(directory, "cursor-runner.log"), "a");
  const child = spawn(
    process.execPath,
    ["--experimental-transform-types", "--no-warnings", runnerEntry()],
    {
      detached: true,
      stdio: ["ignore", log, log],
      env: developerShellEnvironment(process.env),
      cwd: process.cwd(),
    },
  );
  child.unref();
  closeSync(log);
  const childState = { exited: false };
  child.once("exit", () => {
    childState.exited = true;
  });
  const deadline = Date.now() + startWaitMs;
  while (Date.now() < deadline) {
    if (childState.exited) return false;
    if (await cursorRunnerAccepting(home)) return true;
    await delay(20);
  }
  return cursorRunnerAccepting(home);
}

async function startIfAbsent(home: string): Promise<boolean> {
  const deadline = Date.now() + startWaitMs;
  while (Date.now() < deadline) {
    if (await cursorRunnerAccepting(home)) return true;
    const locked = await takeStartLock(home);
    if (!locked) {
      await delay(30);
      continue;
    }
    try {
      if (await cursorRunnerAccepting(home)) return true;
      return await spawnRunner(home);
    } finally {
      await releaseStartLock(home);
    }
  }
  return cursorRunnerAccepting(home);
}

// Starts the runner only when nothing is accepting on its address. A second
// caller for the same home, in this process or another, waits for that one
// runner.
export function ensureCursorRunner(home = homedir()): Promise<boolean> {
  const pending = pendingStarts.get(home);
  if (pending !== undefined) return pending;
  const started = startIfAbsent(home)
    .catch(() => false)
    .finally(() => {
      pendingStarts.delete(home);
    });
  pendingStarts.set(home, started);
  return started;
}

// The port of a runner that is already accepting connections. Undefined when
// none is. This does not start a runner.
export async function acceptingCursorRunnerPort(
  home = homedir(),
): Promise<number | undefined> {
  const address = readCursorRunnerAddress(home);
  if (address === undefined) return undefined;
  return (await portAccepting(address.port)) ? address.port : undefined;
}

// The port of this home's runner, after starting it when none is accepting.
// Undefined when that runner cannot be reached.
export async function cursorRunnerPort(
  home = homedir(),
): Promise<number | undefined> {
  if (!(await ensureCursorRunner(home))) return undefined;
  return acceptingCursorRunnerPort(home);
}

// Ends the runner and the processes it holds. A missing runner is already
// stopped.
export async function stopCursorRunner(home = homedir()): Promise<void> {
  const address = readCursorRunnerAddress(home);
  if (address === undefined) return;
  try {
    process.kill(address.pid, "SIGTERM");
  } catch {
    await rm(cursorRunnerAddressFile(home), { force: true });
    return;
  }
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline && processAlive(address.pid)) {
    await delay(20);
  }
  if (processAlive(address.pid)) {
    try {
      process.kill(address.pid, "SIGKILL");
    } catch {
      // Already gone.
    }
  }
}
