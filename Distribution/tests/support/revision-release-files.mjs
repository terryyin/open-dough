// @ts-check
// The files a release revision publishes, from the Open Dough working tree's
// payload and the release's deltas, without Git.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  openDoughSource,
  releaseDeclarationFiles,
  shippedPayload,
} from "./releaseTestData.mjs";

/** @typedef {import("./releaseTestData.mjs").Release} Release */

const markedSkill = "Distribution/src/skills/dough-update/SKILL.md";

/**
 * The working-tree paths a release ships: the installer's modules and the
 * declared payload it does not remove.
 * @param {Release} release
 */
function shippedPaths(release) {
  return [
    ...readdirSync(join(openDoughSource, "Distribution/src/install"))
      .filter((module) => /\.(sh|mjs)$/.test(module))
      .map((module) => `Distribution/src/install/${module}`),
    ...shippedPayload(release).map((path) => `Distribution/src/skills/${path}`),
  ];
}

/**
 * The shipped paths among `files` the working tree holds as executable.
 * @param {Readonly<Record<string, string | Buffer>>} files
 * @param {Release} release
 */
export function releaseExecutables(files, release) {
  return shippedPaths(release).filter(
    (path) =>
      Object.hasOwn(files, path) &&
      statSync(join(openDoughSource, path)).mode & 0o111,
  );
}

/**
 * The files after `release` applies to `files`. Shipped paths the files lack
 * are copied from the working tree, so a first release copies the payload
 * once and a later release restores what an earlier one removed. It removes
 * the release's removed payload, writes its added payload, its installer, its
 * `VERSION`, its one changelog entry, and the dough-update skill with the
 * release's payload marker appended.
 * @param {Readonly<Record<string, string | Buffer>>} files
 * @param {Release} release
 * @returns {Record<string, string | Buffer>}
 */
export function releaseFiles(files, release) {
  const { version, marker, removed, added } = release;
  const removedPaths = removed.map((path) => `Distribution/src/skills/${path}`);
  const isRemoved = (/** @type {string} */ path) =>
    removedPaths.some(
      (removedPath) =>
        path === removedPath || path.startsWith(`${removedPath}/`),
    );
  const copied = shippedPaths(release)
    .filter((path) => !Object.hasOwn(files, path))
    .map((path) => [path, readFileSync(join(openDoughSource, path))]);
  return {
    ...Object.fromEntries(
      [...Object.entries(files), ...copied].filter(
        ([path]) => !isRemoved(/** @type {string} */ (path)),
      ),
    ),
    ...Object.fromEntries(
      Object.entries(added).map(([path, content]) => [
        `Distribution/src/skills/${path}`,
        content,
      ]),
    ),
    ...releaseDeclarationFiles(release),
    VERSION: `${version}\n`,
    "CHANGELOG.md": `## ${version} - 2026-09-06\n\n${marker}\n`,
    [markedSkill]: `${readFileSync(join(openDoughSource, markedSkill), "utf8")}\n<!-- open-dough-payload ${marker} -->\n`,
  };
}
