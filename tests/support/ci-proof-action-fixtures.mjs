// Published workflow/action inputs and their YAML block readers for CI proof checks.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
export const workflow = read(".github/workflows/ci.yml");
export const fragmentsAction = read(
  ".github/actions/ci-proof-fragments/action.yml",
);
export const summaryAction = read(
  ".github/actions/ci-proof-summary/action.yml",
);
export const locations = JSON.parse(
  read(".planning/open-dough.json"),
).intent.locations.map((location) => location.path);

// Each job's lines, by its id under `jobs:`.
export function jobs(text) {
  const result = new Map();
  let current;
  for (const line of text.slice(text.indexOf("\njobs:\n")).split("\n")) {
    const id = /^ {2}([A-Za-z][\w-]*):\s*$/.exec(line);
    if (id) result.set((current = id[1]), []);
    else if (/^ {2}\S/.test(line)) current = undefined;
    else if (current) result.get(current).push(line);
  }
  return result;
}

// A job's steps, each as its lines joined.
export const steps = (lines) =>
  lines
    .join("\n")
    .split(/\n(?= {6}- )/)
    .filter((step) => step.startsWith("      - "));

// A step's `with:` input value.
export const input = (step, name) =>
  new RegExp(`\\n {10}${name}: (.+)`).exec(step)?.[1];

// An action's one `run: |` block, unindented; Actions runs it as `bash -eo pipefail`.
export function runBlock(action) {
  const lines = action.slice(action.indexOf("      run: |\n") + 13).split("\n");
  const end = lines.findIndex((line) => !line.startsWith("        "));
  return lines
    .slice(0, end)
    .map((line) => line.slice(8))
    .join("\n");
}

// Execute the action's actual shell block with a test's explicit CI environment.
export function runAction(action, env) {
  return spawnSync("bash", ["-eo", "pipefail", "-c", runBlock(action)], {
    cwd: fileURLToPath(root),
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}
