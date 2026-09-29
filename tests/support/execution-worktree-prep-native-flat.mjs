// A preparation observation as `key: <json>` lines, one per top-level field,
// so the shared counterexample helper can compare observations field by field.
//   node execution-worktree-prep-native-flat.mjs OBSERVATION.json
// prints the flattened form of a JSON observation.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function flattenObservation(observation) {
  return Object.entries(observation)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}\n`)
    .join("");
}

export function unflattenObservation(text) {
  const observation = {};
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const separator = line.indexOf(": ");
    if (separator === -1) throw new Error(`not a flattened field: ${line}`);
    observation[line.slice(0, separator)] = JSON.parse(
      line.slice(separator + 2),
    );
  }
  return observation;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.stdout.write(
    flattenObservation(JSON.parse(readFileSync(process.argv[2], "utf8"))),
  );
}
