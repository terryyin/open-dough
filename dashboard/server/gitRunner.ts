// Runs one `git` call for the dashboard server: a fixed argument array --
// never a shell string -- in a checkout, with what it printed. A call that
// exits nonzero, cannot start, is aborted, or prints more than its output
// limit rejects with a `GitFailure` carrying what was printed; each caller
// decides what that failure means to it.

import { execFile, type ExecException } from "node:child_process";

export type GitCall = {
  // The folder git runs in; the server's own folder when absent.
  readonly cwd?: string;
  // Variables added to the server's environment for this call only.
  readonly env?: Readonly<Record<string, string>>;
  readonly signal?: AbortSignal;
  // What the call reads on its standard input, which is otherwise empty.
  readonly input?: string;
  // Bytes each of stdout and stderr may hold before the call is ended.
  readonly maxBuffer: number;
};

export type GitOutput = { readonly stdout: string; readonly stderr: string };

export class GitFailure extends Error {
  readonly stdout: string;
  readonly stderr: string;
  constructor(cause: ExecException, { stdout, stderr }: GitOutput) {
    super(cause.message, { cause });
    this.name = "GitFailure";
    this.stdout = stdout;
    this.stderr = stderr;
  }
}

// Git uses exit 1 for ordinary negative results, including merge conflicts.
export const gitExitedOne = (error: unknown): error is GitFailure =>
  error instanceof GitFailure &&
  error.cause instanceof Error &&
  "code" in error.cause &&
  error.cause.code === 1;

// The last line Git printed about a failure, or its own message.
export function gitProblem(error: unknown): string {
  const said =
    error instanceof GitFailure
      ? error.stderr.trim().split("\n").at(-1)
      : undefined;
  return said !== undefined && said !== ""
    ? said
    : error instanceof Error
      ? error.message
      : String(error);
}

// `execFile`'s own default output limit.
export const defaultGitOutputLimit = 1024 * 1024;

export async function runGit(
  args: readonly string[],
  { cwd, env, signal, input, maxBuffer }: GitCall,
): Promise<GitOutput> {
  const { error, stdout, stderr } = await new Promise<
    GitOutput & { readonly error: ExecException | null }
  >((resolve) => {
    const child = execFile(
      "git",
      [...args],
      {
        encoding: "utf8",
        maxBuffer,
        ...(cwd === undefined ? {} : { cwd }),
        ...(env === undefined ? {} : { env: { ...process.env, ...env } }),
        ...(signal === undefined ? {} : { signal }),
      },
      (error, stdout, stderr) => {
        resolve({ error, stdout, stderr });
      },
    );
    if (input !== undefined) {
      // A call that ends without reading its input fails by its own exit.
      child.stdin?.on("error", () => undefined);
      child.stdin?.end(input);
    }
  });
  if (error) throw new GitFailure(error, { stdout, stderr });
  return { stdout, stderr };
}
