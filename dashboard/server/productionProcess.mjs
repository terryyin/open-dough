// Own the complete process group for production build commands and previews.
import { spawn, spawnSync } from "node:child_process";

/**
 * @typedef {{cwd: string, env?: NodeJS.ProcessEnv, signal?: AbortSignal}} CommandOptions
 * @typedef {{code: number | null, signal: NodeJS.Signals | null}} Exit
 */

/** @param {string} command @param {string[]} args @param {CommandOptions} options */
export function ownedProcess(command, args, options) {
  const { signal, ...spawnOptions } = options;
  signal?.throwIfAborted();
  const child = spawn(command, args, {
    ...spawnOptions,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => {
    output = (output + chunk.toString("utf8")).slice(-65_536);
  });
  child.stderr.on("data", (chunk) => {
    output = (output + chunk.toString("utf8")).slice(-65_536);
  });
  /** @type {Promise<Exit>} */
  const exited = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => {
      resolve({ code, signal });
    });
  });
  // Cancellation may finish a group before the caller reaches its cleanup.
  // Do not signal that retired process-group id again after a forced stop.
  let forceStopped = false;
  /** @param {NodeJS.Signals} signal */
  const terminate = (signal) => {
    if (forceStopped) return;
    signalGroup(child, signal);
    if (signal === "SIGKILL") forceStopped = true;
  };
  const abort = () => terminate("SIGKILL");
  signal?.addEventListener("abort", abort, { once: true });
  const unlisten = () => signal?.removeEventListener("abort", abort);
  void exited.then(unlisten, unlisten);
  // Errors are also awaited below; attach immediately for startup failures.
  void exited.catch(() => undefined);
  return { child, exited, output: () => output, terminate };
}
/** @param {import("node:child_process").ChildProcess} child @param {NodeJS.Signals} signal */
function signalGroup(child, signal) {
  if (child.pid === undefined) return;
  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    // macOS can retain an empty process-group id briefly after npm exits,
    // answering EPERM rather than ESRCH. Suppress only a proven empty group
    // after the owned child ended; a live permission failure still propagates.
    if (error.code === "EPERM" && groupEnded(child)) return;
    if (error.code !== "ESRCH") throw error;
  }
}
/** @param {import("node:child_process").ChildProcess} child */
function groupEnded(child) {
  if (child.exitCode === null && child.signalCode === null) return false;
  const groups = spawnSync("ps", ["-axo", "pgid="], {
    encoding: "utf8",
    timeout: 1_000,
  });
  return (
    groups.status === 0 &&
    !groups.stdout.trim().split(/\s+/).includes(String(child.pid))
  );
}
/** @param {ReturnType<typeof ownedProcess>} process */
export async function stopProcess(process) {
  process.terminate("SIGTERM");
  const timer = setTimeout(() => {
    process.terminate("SIGKILL");
  }, 5_000);
  try {
    await process.exited;
  } finally {
    clearTimeout(timer);
    // npm may exit before its Vite child; the entire owned group must end.
    process.terminate("SIGKILL");
  }
}
/** @param {string} executable @param {string[]} args @param {CommandOptions} options @param {number} [timeoutMs] */
export async function command(executable, args, options, timeoutMs = 60_000) {
  const process = ownedProcess(executable, args, options);
  const timer = setTimeout(() => {
    process.terminate("SIGKILL");
  }, timeoutMs);
  try {
    const result = await process.exited;
    options.signal?.throwIfAborted();
    if (result.code !== 0) {
      throw new Error(
        `${executable} ${args.join(" ")} failed (${result.signal ?? String(result.code)}):\n${process.output()}`,
      );
    }
    return process.output().trim();
  } finally {
    clearTimeout(timer);
  }
}
