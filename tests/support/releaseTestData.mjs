// @ts-check

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

export {};
