// The prompted `cursor-agent` process. The launch wait must not be given to
// that child: it would kill it, and a client still running is the launched
// session. Output is discarded so a long client is not stopped by a full
// buffer. When the wait aborts while the child is still running, this
// registry keeps that child, keyed by session, until it exits. A later exit
// does not confirm the first input.

import { spawn, type ChildProcess } from "node:child_process";

// Abort can arrive during an await. A direct `signal.aborted` check is
// narrowed for the rest of the function, so read it through this call.
export function aborted(signal: AbortSignal): boolean {
  return signal.aborted;
}

// The child can exit between two reads. A direct `exitCode` check is
// narrowed for the rest of the function, so read it through this call.
function childStillRunning(child: ChildProcess): boolean {
  return child.exitCode === null && child.signalCode === null;
}

type SubmittedPrompt =
  | { readonly kind: "confirmed" }
  | { readonly kind: "unconfirmed" }
  | { readonly kind: "not-installed" }
  | { readonly kind: "running" }
  | { readonly kind: "not-started" };

function fromExit(code: number | null): SubmittedPrompt {
  return code === 0 ? { kind: "confirmed" } : { kind: "unconfirmed" };
}

function fromSpawnError(error: unknown): SubmittedPrompt {
  return (error as NodeJS.ErrnoException).code === "ENOENT"
    ? { kind: "not-installed" }
    : { kind: "unconfirmed" };
}

type RunningPrompt = {
  readonly exited: Promise<void>;
};

const running = new Map<string, RunningPrompt>();

// The promise settles when that session's retained launch child exits.
// Absent means no launch child is running for the session.
export function runningPromptExit(
  sessionId: string,
): Promise<void> | undefined {
  return running.get(sessionId)?.exited;
}

function retainRunningPrompt(sessionId: string, child: ChildProcess): void {
  if (running.has(sessionId)) return;
  if (!childStillRunning(child)) return;
  let resolveExited: () => void = () => {};
  const exited = new Promise<void>((resolve) => {
    resolveExited = resolve;
  });
  const entry: RunningPrompt = { exited };
  running.set(sessionId, entry);
  const onExit = () => {
    if (running.get(sessionId) === entry) running.delete(sessionId);
    resolveExited();
  };
  child.once("exit", onExit);
  if (!childStillRunning(child)) {
    child.off("exit", onExit);
    onExit();
  }
}

// The session record is written before this starts. Resolving `running`
// keeps the child; the exit that follows does not confirm the first input.
export function submitPrompt(
  sessionId: string,
  executable: string,
  args: readonly string[],
  cwd: string,
  signal: AbortSignal,
): Promise<SubmittedPrompt> {
  if (aborted(signal)) return Promise.resolve({ kind: "not-started" });
  return new Promise((resolve) => {
    let settled = false;
    let child: ChildProcess;
    const finish = (result: SubmittedPrompt) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", onAbort);
      resolve(result);
    };
    const onAbort = () => {
      const stillRunning = childStillRunning(child);
      if (stillRunning) retainRunningPrompt(sessionId, child);
      finish(stillRunning ? { kind: "running" } : fromExit(child.exitCode));
    };
    try {
      child = spawn(executable, [...args], { cwd });
    } catch (error) {
      finish(fromSpawnError(error));
      return;
    }
    child.stdin?.on("error", () => {});
    child.stdin?.end();
    child.stdout?.on("error", () => {});
    child.stdout?.resume();
    child.stderr?.on("error", () => {});
    child.stderr?.resume();
    child.once("error", (error) => {
      finish(fromSpawnError(error));
    });
    // A later exit still reaches here. Once the wait has answered `running`,
    // `finish` does not confirm the first input.
    child.once("exit", (code) => {
      finish(fromExit(code));
    });
    if (aborted(signal)) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort);
  });
}
