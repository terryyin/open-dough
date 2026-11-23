// @ts-check
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * A tagged list-era Open Dough release: the revision's `VERSION`, changelog
 * entry and payload marker, and the annotated `v<version>` tag dated
 * `taggedAt`. Its installer declares its payload as a list, in the historical
 * `grouped` layout (an inline array plus a data-only append fragment) or as one
 * `inline` array. `withheld` lists managed path prefixes its source tree holds
 * but its list does not declare; `removed` lists payload paths its source tree
 * omits; `added` maps each payload path it ships beyond the current payload,
 * and declares first, to its bytes.
 * @typedef {{
 *   version: string,
 *   taggedAt: string,
 *   marker: string,
 *   declaration: "grouped" | "inline",
 *   withheld: readonly string[],
 *   removed: readonly string[],
 *   added: Readonly<Record<string, string>>,
 * }} Release
 */

/**
 * The facts a test states for a release; it declares a grouped list and
 * withholds, removes and adds nothing unless it says so.
 * @typedef {Omit<Release, "declaration" | "withheld" | "removed" | "added"> & Partial<Pick<Release, "declaration" | "withheld" | "removed" | "added">>} ReleaseFacts
 */

// The Open Dough working tree whose payload a release ships.
export const openDoughSource = fileURLToPath(
  new URL("../../../", import.meta.url),
);

/** @param {string} prefix @param {string} path */
const withholds = (prefix, path) => path !== "" && path.startsWith(prefix);
/** @param {string} removed @param {string} path */
const removes = (removed, path) => `${path}/`.startsWith(`${removed}/`);

/**
 * The managed payload paths a source tree's install.sh declares, read through
 * that tree's own declaration reader; the working tree's by default.
 * @param {string} [root]
 */
export function declaredPayload(root = openDoughSource) {
  return execFileSync(
    "bash",
    [
      "-c",
      'source "$1"; read_managed_files_declaration "$2"',
      "release-payload",
      join(root, "Distribution/src/install/open-dough-payload-declaration.sh"),
      join(root, "install.sh"),
    ],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n");
}

/**
 * The declared payload paths, under `Distribution/src/skills/`, a release ships.
 * @param {Pick<Release, "removed">} release
 */
export function shippedPayload({ removed }) {
  return declaredPayload().filter(
    (path) => !removed.some((removedPath) => removes(removedPath, path)),
  );
}

// The historical list-era launcher: its declaration as data, then the
// working tree's install entry, so the tag's installer runs the real install.
const historicalFragment = "src/install/open-dough-execution-payload.sh";
const includes = (/** @type {string} */ path) =>
  `source "$(dirname -- "\${BASH_SOURCE[0]}")/${path}"`;
/** @param {string} opening @param {readonly string[]} paths */
const listing = (opening, paths) =>
  [opening, ...paths.map((path) => `  ${path}`), ")"].join("\n");

/**
 * The release's list-era declaration files: its installer's list declares the
 * added paths first and no path under a prefix the release withholds. A
 * grouped declaration appends its second half from a data-only fragment.
 * @param {Pick<Release, "declaration" | "withheld" | "added">} release
 */
export function releaseDeclarationFiles({ declaration, withheld, added }) {
  const declared = [
    ...Object.keys(added),
    ...declaredPayload().filter(
      (path) => !withheld.some((prefix) => withholds(prefix, path)),
    ),
  ];
  const split =
    declaration === "grouped"
      ? Math.ceil(declared.length / 2)
      : declared.length;
  const appended = declared.slice(split);
  return {
    "install.sh": [
      "#!/usr/bin/env bash",
      "# shellcheck disable=SC1091,SC2034",
      listing("managed_files=(", declared.slice(0, split)),
      ...(appended.length ? [includes(historicalFragment)] : []),
      includes("Distribution/src/install/open-dough-install-entry.sh"),
      "",
    ].join("\n"),
    ...(appended.length && {
      [historicalFragment]: [
        "#!/usr/bin/env bash",
        "# shellcheck disable=SC2034",
        listing("managed_files+=(", appended),
        "",
      ].join("\n"),
    }),
  };
}

/**
 * A release whose withheld prefixes and removed paths each cover a declared
 * payload path, and whose added paths are not declared already.
 * @param {ReleaseFacts} facts
 * @returns {Release}
 */
function release({
  declaration = "grouped",
  withheld = [],
  removed = [],
  added = {},
  ...facts
}) {
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
    declaration,
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
