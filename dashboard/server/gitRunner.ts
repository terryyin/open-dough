// Runs dashboard Git commands with fixed argument arrays. Direct calls
// return stdout and stderr or reject with a GitFailure. Transport calls
// own the process group so cancellation also stops Git's helpers.

import { execFile, type ExecException } from "node:child_process";
import { gitExecutable } from "../../Distribution/src/skills/dough-execute-plan/scripts/git-executable.mjs";
import { ownedProcess } from "./productionProcess.mjs";

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
  call: GitCall,
): Promise<GitOutput> {
  return gitOutput(args, call, false);
}

// A mutation retains ownership until the child really closes, even when
// execFile reports an abort error before that process has exited.
export async function runGitUntilClosed(
  args: readonly string[],
  call: GitCall,
): Promise<GitOutput> {
  return gitOutput(args, call, true);
}

// A bounded remote read owns Git and its transport helpers through cancellation.
export async function readGitTransport(
  args: readonly string[],
  { cwd, env, signal, maxBuffer }: Omit<GitCall, "input">,
): Promise<string> {
  const directory = cwd ?? process.cwd();
  const callEnv = { ...process.env, ...env };
  const executable = await gitExecutable({ cwd: directory, env: callEnv });
  const running = ownedProcess(executable, [...args], {
    cwd: directory,
    env: callEnv,
    ...(signal === undefined ? {} : { signal }),
  });
  const chunks: Buffer[] = [];
  let bytes = 0;
  running.child.stdout.on("data", (chunk: Buffer) => {
    bytes += chunk.length;
    if (bytes > maxBuffer) running.terminate("SIGKILL");
    else chunks.push(chunk);
  });
  const result = await running.exited;
  signal?.throwIfAborted();
  if (result.code !== 0 || bytes > maxBuffer) {
    throw new Error("Git could not read the remote.", {
      cause: running.output(),
    });
  }
  return Buffer.concat(chunks).toString("utf8");
}

// A long fetch drains progress continuously and retains only bounded
// diagnostics. Cancellation ends Git and its transport before returning.
export async function runGitWithProgressUntilClosed(
  args: readonly string[],
  { cwd, env, signal }: Pick<GitCall, "cwd" | "env" | "signal">,
  report: (chunk: string) => void,
): Promise<void> {
  const directory = cwd ?? process.cwd();
  const callEnv = { ...process.env, ...env, LC_ALL: "C" };
  const executable = await gitExecutable({ cwd: directory, env: callEnv });
  const running = ownedProcess(executable, [...args], {
    cwd: directory,
    env: callEnv,
    ...(signal === undefined ? {} : { signal }),
  });
  running.child.stderr.setEncoding("utf8").on("data", report);
  const result = await running.exited;
  signal?.throwIfAborted();
  if (result.code !== 0) {
    const diagnostics = running.output().slice(-4096).replaceAll("\r", "\n");
    const errorLine = diagnostics
      .split("\n")
      .findLast((line) => /^(fatal|error): /.test(line));
    throw new GitFailure(
      Object.assign(new Error("Git could not fetch the published history."), {
        cmd: "git fetch",
      }),
      { stdout: "", stderr: errorLine ?? diagnostics },
    );
  }
}

async function gitOutput(
  args: readonly string[],
  { cwd, env, signal, input, maxBuffer }: GitCall,
  untilClosed: boolean,
): Promise<GitOutput> {
  const callEnv = env === undefined ? undefined : { ...process.env, ...env };
  const executable = await gitExecutable({
    ...(callEnv === undefined ? {} : { env: callEnv }),
    ...(cwd === undefined ? {} : { cwd }),
  });
  const { error, stdout, stderr } = await new Promise<
    GitOutput & { readonly error: ExecException | null }
  >((resolve) => {
    let closed = false;
    let result:
      (GitOutput & { readonly error: ExecException | null }) | undefined;
    const publish = () => {
      if (result !== undefined && (!untilClosed || closed)) resolve(result);
    };
    const child = execFile(
      executable,
      [...args],
      {
        encoding: "utf8",
        maxBuffer,
        ...(cwd === undefined ? {} : { cwd }),
        ...(callEnv === undefined ? {} : { env: callEnv }),
        ...(signal === undefined ? {} : { signal }),
      },
      (error, stdout, stderr) => {
        result = { error, stdout, stderr };
        publish();
      },
    );
    child.once("close", () => {
      closed = true;
      publish();
    });
    if (input !== undefined) {
      // A call that ends without reading its input fails by its own exit.
      child.stdin?.on("error", () => undefined);
      child.stdin?.end(input);
    }
  });
  if (error) throw new GitFailure(error, { stdout, stderr });
  return { stdout, stderr };
}

// Exit 1 is an ordinary negative. An unreadable history or an interrupted
// command still rejects so a caller can retry the check.
export async function checkAncestry(
  ancestor: string,
  descendant: string,
  call: GitCall,
  read = runGit,
): Promise<boolean> {
  try {
    await read(["merge-base", "--is-ancestor", ancestor, descendant], call);
    return true;
  } catch (error) {
    if (gitExitedOne(error)) return false;
    throw error;
  }
}

// Whether `ancestor` is reachable from `descendant`; any failure, including an
// unknown revision, reads as not an ancestor.
export function isAncestor(
  ancestor: string,
  descendant: string,
  call: GitCall,
  read = runGit,
): Promise<boolean> {
  return checkAncestry(ancestor, descendant, call, read).catch(() => false);
}
