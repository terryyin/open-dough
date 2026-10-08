// One finished `cursor-agent` run with its captured output, in the
// developer's shell environment (`../../developerShellEnvironment.ts`).
import { execFile, type ExecException } from "node:child_process";
import { developerShellEnvironment } from "../../developerShellEnvironment.ts";

export const cursorAgent = "cursor-agent";

export type CursorRun = {
  readonly error: ExecException | null;
  readonly stdout: string;
  readonly stderr: string;
};

export function execCursor(
  args: readonly string[],
  cwd: string | undefined,
  signal: AbortSignal,
): Promise<CursorRun> {
  return new Promise((resolve) => {
    try {
      const child = execFile(
        cursorAgent,
        [...args],
        {
          ...(cwd === undefined ? {} : { cwd }),
          env: developerShellEnvironment(process.env),
          signal,
          maxBuffer: 8 * 1024 * 1024,
          encoding: "utf8",
        },
        (error, stdout, stderr) => {
          resolve({ error, stdout, stderr });
        },
      );
      child.stdin?.end();
    } catch (error) {
      resolve({
        error: error as ExecException,
        stdout: "",
        stderr: "",
      });
    }
  });
}
