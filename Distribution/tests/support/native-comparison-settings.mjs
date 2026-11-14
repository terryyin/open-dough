// The requested and observed settings compared across native comparison arms.
// Account-bearing workspace paths stay in the raw record, outside this view.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const expectedSettings = (model, effort) =>
  `model=${model} effort=${effort} sandbox=danger-full-access approval=never`;

export function appliedSettings(record) {
  const settings = record
    .split("\n")
    .flatMap(
      (line) =>
        /^codex-turn-settings: \d+x (.+?) cwd=/.exec(line)?.slice(1) ?? [],
    );
  return [...new Set(settings)].sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const settings = appliedSettings(readFileSync(process.argv[2], "utf8"));
  if (settings.length) process.stdout.write(`${settings.join("\n")}\n`);
}
