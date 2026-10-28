// `cursor-agent models` prints a header, one `<id> - <name>` line per model,
// and a `Tip:` line. It needs no workspace. Effort variants are projected from
// listed ids into base models with per-model efforts. Some names end with
// U+200B, which `String.prototype.trim` keeps.
import type { LaunchHostOptions } from "../../../src/launchHostOptions.ts";
import { execCursor } from "./exec.ts";
import { projectCursorModels } from "./modelIds.ts";

const modelLine = /^([A-Za-z0-9][\w.-]*) - (.+)$/u;

export async function cursorOptions(
  signal: AbortSignal,
): Promise<LaunchHostOptions> {
  const run = await execCursor(["models"], undefined, signal);
  if (run.error !== null) throw new Error("Cursor did not list its models.");
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
  if (listed.length === 0) throw new Error("Cursor listed no models.");
  return { models: projectCursorModels(listed) };
}
