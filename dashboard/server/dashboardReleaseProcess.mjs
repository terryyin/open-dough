// Own the complete process group for dashboard release commands and previews.
import { spawn } from "node:child_process";

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
  const abort = () => signalGroup(child, "SIGKILL");
  signal?.addEventListener("abort", abort, { once: true });
  const unlisten = () => signal?.removeEventListener("abort", abort);
  void exited.then(unlisten, unlisten);
  // Errors are also awaited below; attach immediately for startup failures.
  void exited.catch(() => undefined);
  return { child, exited, output: () => output };
}
/** @param {import("node:child_process").ChildProcess} child @param {NodeJS.Signals} signal */
function signalGroup(child, signal) {
  if (child.pid === undefined) return;
  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}
/** @param {ReturnType<typeof ownedProcess>} process */
export async function stopProcess(process) {
  signalGroup(process.child, "SIGTERM");
  const timer = setTimeout(() => {
    signalGroup(process.child, "SIGKILL");
  }, 5_000);
  try {
    await process.exited;
  } finally {
    clearTimeout(timer);
    // npm may exit before its Vite child; the entire owned group must end.
    signalGroup(process.child, "SIGKILL");
  }
}
/** @param {string} executable @param {string[]} args @param {CommandOptions} options @param {number} [timeoutMs] */
export async function command(executable, args, options, timeoutMs = 60_000) {
  const process = ownedProcess(executable, args, options);
  const timer = setTimeout(() => {
    signalGroup(process.child, "SIGKILL");
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
