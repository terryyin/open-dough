// `cursor-agent models` prints a header, one `<id> - <name>` line per model,
// and a `Tip:` line. It needs no workspace. Effort variants are projected from
// listed ids into base models with per-model efforts. Some names end with
// U+200B, which `String.prototype.trim` keeps.
import type { ExecException } from "node:child_process";
import type { LaunchHostOptions } from "../../../src/launchHostOptions.ts";
import { execCursor } from "./exec.ts";
import { projectCursorModels } from "./modelIds.ts";

const modelLine = /^([A-Za-z0-9][\w.-]*) - (.+)$/u;

// Only these messages are safe to send to the browser. Native output can
// contain credentials or machine details.
export class CursorModelLookupError extends Error {
  readonly recovery: string | undefined;

  constructor(reason: string, recovery?: string) {
    super(reason);
    this.recovery = recovery;
  }
}

function commandFailure(
  error: ExecException,
  stderr: string,
  signal: AbortSignal,
): CursorModelLookupError {
  if (
    signal.reason instanceof DOMException &&
    signal.reason.name === "TimeoutError"
  )
    return new CursorModelLookupError(
      "Cursor CLI timed out while listing models.",
    );
  if (error.code === "ENOENT")
    return new CursorModelLookupError(
      "Intent could not find cursor-agent on its PATH.",
      "Check the Cursor CLI installation, then retry.",
    );
  if (error.code === "EACCES")
    return new CursorModelLookupError(
      "Intent did not have permission to run cursor-agent.",
      "Check the executable permissions, then retry.",
    );
  if (/^(?:Error:\s*)?Authentication required\b/imu.test(stderr))
    return new CursorModelLookupError(
      "Cursor CLI requires sign-in.",
      "Run cursor-agent login, then retry.",
    );
  const reason =
    typeof error.code === "number"
      ? `Cursor CLI exited with code ${String(error.code)} while listing models.`
      : "Intent could not complete the Cursor CLI model lookup.";
  return new CursorModelLookupError(
    reason,
    "Run cursor-agent models for details, then retry, or use your Cursor setting.",
  );
}

export async function cursorOptions(
  signal: AbortSignal,
): Promise<LaunchHostOptions> {
  const run = await execCursor(["models"], undefined, signal);
  if (run.error !== null) throw commandFailure(run.error, run.stderr, signal);
  const listed: { model: string; name: string }[] = [];
  for (const line of run.stdout.split(/\r?\n/u)) {
    const match = modelLine.exec(line.trim());
    if (match?.[1] === undefined || match[2] === undefined) continue;
    const name = match[2].replace(/[\s\u200B]+$/u, "");
    listed.push({
      model: match[1],
      name: name === "" ? match[1] : name,
    });
  }
  if (listed.length === 0)
    throw new CursorModelLookupError(
      "Cursor CLI returned no recognizable models.",
    );
  return { models: projectCursorModels(listed) };
}
