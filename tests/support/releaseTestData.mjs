// @ts-check
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * A tagged Open Dough release: the revision's `VERSION`, changelog entry and
 * payload marker, and the annotated `v<version>` tag dated `taggedAt`.
 * `withheld` lists managed path prefixes its installer does not declare;
 * `removed` lists payload paths it does not ship; `added` maps each payload
 * path it ships beyond the current payload, and declares first, to its bytes.
 * @typedef {{
 *   version: string,
 *   taggedAt: string,
 *   marker: string,
 *   withheld: readonly string[],
 *   removed: readonly string[],
 *   added: Readonly<Record<string, string>>,
 * }} Release
 */

/**
 * The facts a test states for a release; it withholds, removes and adds
 * nothing unless it says so.
 * @typedef {Omit<Release, "withheld" | "removed" | "added"> & Partial<Pick<Release, "withheld" | "removed" | "added">>} ReleaseFacts
 */

// The Open Dough working tree whose payload a release ships.
export const openDoughSource = fileURLToPath(
  new URL("../../", import.meta.url),
);

const installerPath = join(openDoughSource, "install.sh");
const managedFilesDeclaration = /^managed_files(?:\+)?=\(\n[\s\S]*?^\)\n?/gm;
const payloadInclude =
  /^source "\$\(dirname -- "\$\{BASH_SOURCE\[0\]\}"\)\/src\/install\/[a-z0-9-]+-payload\.sh"\n?/gm;

/** @param {string} prefix @param {string} path */
const withholds = (prefix, path) => path !== "" && path.startsWith(prefix);
/** @param {string} removed @param {string} path */
const removes = (removed, path) => `${path}/`.startsWith(`${removed}/`);

/** The managed payload paths the working tree's install.sh declares. */
export function declaredPayload() {
  return execFileSync(
    "bash",
    [
      "-c",
      'source "$1"; read_managed_files_declaration "$2"',
      "release-payload",
      join(openDoughSource, "src/install/open-dough-payload-declaration.sh"),
      installerPath,
    ],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n");
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
 * The working tree's installer, declaring the release's added paths first and
 * no managed path under a prefix the release withholds.
 * @param {Pick<Release, "withheld" | "added">} release
 */
export function releaseInstaller({ withheld, added }) {
  const declared = [
    ...Object.keys(added),
    ...declaredPayload().filter(
      (path) => !withheld.some((prefix) => withholds(prefix, path)),
    ),
  ];
  let replaced = false;
  return readFileSync(installerPath, "utf8")
    .replace(managedFilesDeclaration, () => {
      if (replaced) return "";
      replaced = true;
      return `managed_files=(\n${declared.map((path) => `  ${path}`).join("\n")}\n)\n`;
    })
    .replace(payloadInclude, "");
}

/**
 * A release whose withheld prefixes and removed paths each cover a declared
 * payload path, and whose added paths are not declared already.
 * @param {ReleaseFacts} facts
 * @returns {Release}
 */
function release({ withheld = [], removed = [], added = {}, ...facts }) {
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
  for (const path of Object.keys(added))
    if (declared.includes(path))
      throw new Error(
        `Release ${facts.version} adds already declared payload at ${path}`,
      );
  return {
    ...facts,
    withheld: [...withheld],
    removed: [...removed],
    added: { ...added },
  };
}

// `makeMe.aRelease`: `.with(facts).please()` gives the release of the facts
// a test states.
export class ReleaseBuilder {
  /** @param {ReleaseFacts} facts */
  with(facts) {
    return {
      /** @returns {Release} */
      please: () => release(facts),
    };
  }
}
