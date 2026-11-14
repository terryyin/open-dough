// @ts-check
// The one native supervision input list lives in native-run-supervise.sh.
// Identity proofs and harness materializers read it here instead of restating
// the paths.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const listFile = (sourceRoot) =>
  join(sourceRoot, "Distribution/tests/support/native-run-supervise.sh");

/**
 * Repository-relative paths from `native_run_supervision_inputs`.
 * @param {string} sourceRoot
 * @returns {string[]}
 */
export function nativeSupervisionInputs(sourceRoot) {
  const text = readFileSync(listFile(sourceRoot), "utf8");
  const match = /^native_run_supervision_inputs=\(\n([\s\S]*?)^\)\s*$/m.exec(
    text,
  );
  if (!match)
    throw new Error(
      `${listFile(sourceRoot)}: missing native_run_supervision_inputs=(...)`,
    );
  const inputs = match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (inputs.length === 0)
    throw new Error(
      `${listFile(sourceRoot)}: native_run_supervision_inputs is empty`,
    );
  return inputs;
}

/** True when pathspec already materializes rel (exact or as a parent tree). */
export function pathCovers(pathspec, rel) {
  return rel === pathspec || rel.startsWith(`${pathspec}/`);
}

/**
 * Top-level roots of supervision inputs not covered by `present` pathspecs.
 * @param {string} sourceRoot
 * @param {readonly string[]} present
 * @returns {string[]}
 */
export function uncoveredSupervisionRoots(sourceRoot, present) {
  /** @type {string[]} */
  const roots = [];
  for (const input of nativeSupervisionInputs(sourceRoot)) {
    if (present.some((pathspec) => pathCovers(pathspec, input))) continue;
    const root = input.split("/")[0];
    if (!roots.includes(root)) roots.push(root);
  }
  return roots;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const sourceRoot =
    process.argv[2] ??
    join(dirname(fileURLToPath(import.meta.url)), "../../..");
  for (const input of nativeSupervisionInputs(sourceRoot)) console.log(input);
}
