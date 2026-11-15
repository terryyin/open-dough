// The separate processes that do the dashboard's usage work off its server's
// event loop: deriving the per-task summary (./usageTaskSummaryMain.ts) and
// Refresh (./usageRefreshMain.ts). A process prints its answer, or names its
// failure in one message on stderr, which the server's run rejects with;
// concurrent requests for the same work share one run.
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const runFile = promisify(execFile);

// A process's work on its arguments; what it answers is printed.
export async function usageProcessMain(
  work: (args: readonly string[]) => Promise<string | undefined>,
): Promise<void> {
  try {
    const answer = await work(process.argv.slice(2));
    if (answer !== undefined) process.stdout.write(`${answer}\n`);
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}

// What the process `main` printed for `args`; its failure is `failure`
// followed by the process's own message.
export async function runUsageProcess(
  main: URL,
  args: readonly string[],
  failure: string,
): Promise<string> {
  try {
    const { stdout } = await runFile(process.execPath, [
      fileURLToPath(main),
      ...args,
    ]);
    return stdout;
  } catch (error) {
    const { stderr, message } = error as { stderr?: string; message: string };
    throw new Error(`${failure}: ${stderr?.trim() || message}`, {
      cause: error,
    });
  }
}

// Joins the run of `key` already in progress, or begins one with `start`;
// a settled run is forgotten, so the next request runs again.
export function sharedRuns<T>(): (
  key: string,
  start: () => Promise<T>,
) => Promise<T> {
  const runs = new Map<string, Promise<T>>();
  return (key, start) => {
    const running = runs.get(key);
    if (running !== undefined) return running;
    const next = start().finally(() => {
      runs.delete(key);
    });
    runs.set(key, next);
    return next;
  };
}
