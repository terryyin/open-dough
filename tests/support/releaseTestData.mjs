// @ts-check
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * A tagged Open Dough release: the revision's `VERSION`, changelog entry and
 * payload marker, and the annotated `v<version>` tag dated `taggedAt`.
 * `withheld` lists managed path prefixes its installer does not declare;
 * `removed` lists payload paths it does not ship.
 * @typedef {{
 *   version: string,
 *   taggedAt: string,
 *   marker: string,
 *   withheld: readonly string[],
 *   removed: readonly string[],
 * }} Release
 */

/**
 * The facts a test states for a release; it withholds and removes nothing
 * unless it says so.
 * @typedef {Omit<Release, "withheld" | "removed"> & Partial<Pick<Release, "withheld" | "removed">>} ReleaseFacts
 */

// The Open Dough working tree whose payload a release ships.
export const openDoughSource = fileURLToPath(
  new URL("../../", import.meta.url),
);

const installerPath = join(openDoughSource, "install.sh");
const managedFilesDeclaration = /^managed_files=\(\n([\s\S]*?)^\)/m;

/** @param {string} prefix @param {string} path */
const withholds = (prefix, path) => path !== "" && path.startsWith(prefix);
/** @param {string} removed @param {string} path */
const removes = (removed, path) => `${path}/`.startsWith(`${removed}/`);

/** The managed payload paths the working tree's install.sh declares. */
function declaredPayload() {
  const declaration = managedFilesDeclaration.exec(
    readFileSync(installerPath, "utf8"),
  );
  if (!declaration) throw new Error("install.sh declares no managed_files");
  return /** @type {string} */ (declaration[1]).split(/\s+/).filter(Boolean);
}

/**
 * The declared payload paths, under `src/skills/`, a release ships.
 * @param {Pick<Release, "removed">} release
 */
export function shippedPayload({ removed }) {
  return declaredPayload().filter(
    (path) => !removed.some((removedPath) => removes(removedPath, path)),
  );
}

/**
 * The working tree's installer, declaring no managed path under a prefix the
 * release withholds.
 * @param {Pick<Release, "withheld">} release
 */
export function releaseInstaller({ withheld }) {
  return readFileSync(installerPath, "utf8").replace(
    managedFilesDeclaration,
    (declaration) => {
      const [opening, ...entries] = declaration.split("\n");
      const kept = entries.filter(
        (line) => !withheld.some((prefix) => withholds(prefix, line.trim())),
      );
      return [opening, ...kept].join("\n");
    },
  );
}

/**
 * A release whose withheld prefixes and removed paths each cover a declared
 * payload path.
 * @param {ReleaseFacts} facts
 * @returns {Release}
 */
export function release({ withheld = [], removed = [], ...facts }) {
  const declared = declaredPayload();
  for (const prefix of withheld)
    if (!declared.some((path) => withholds(prefix, path)))
      throw new Error(
        `Release ${facts.version} withholds nothing declared under ${prefix}`,
      );
  for (const removedPath of removed)
    if (!declared.some((path) => removes(removedPath, path)))
      throw new Error(
        `Release ${facts.version} removes no payload at ${removedPath}`,
      );
  return { ...facts, withheld: [...withheld], removed: [...removed] };
}
