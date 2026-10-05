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
  { cwd, env, signal, maxBuffer }: GitCall,
): Promise<GitOutput> {
  const { error, stdout, stderr } = await new Promise<
    GitOutput & { readonly error: ExecException | null }
  >((resolve) => {
    execFile(
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
  });
  if (error) throw new GitFailure(error, { stdout, stderr });
  return { stdout, stderr };
}
