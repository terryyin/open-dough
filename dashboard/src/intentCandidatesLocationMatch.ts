// Pure matching of a recorded Test Optimization Candidates location
// reference against the configured Intent files at the same revision.
// Pattern recognition (backticks, Markdown links, path:line, path::name)
// feeds this one rule. Never selects a guessed file: several matches and
// unmatched references select nothing on their own.

import { resolveBesideFile } from "./repositoryPath.ts";

export type IntentConfiguredInventory = {
  /** Every file Intent locations list at the revision. */
  readonly files: readonly string[];
  /** Configured location roots (`IntentLocation.path`). */
  readonly locationRoots: readonly string[];
};

export type MatchedLocationTarget =
  | {
      readonly kind: "file";
      readonly path: string;
      readonly caseTarget?: string;
    }
  | { readonly kind: "several"; readonly paths: readonly string[] }
  | {
      readonly kind: "outside-configured";
      readonly path: string;
      readonly caseTarget?: string;
    }
  | {
      readonly kind: "not-published";
      readonly path: string;
      readonly caseTarget?: string;
    }
  | { readonly kind: "not-a-file-reference" };

const shaPath = /^[0-9a-f]{7,40}:.+/i;
const globChars = /[*?[]/;
const fileExtension = /\.[a-z0-9]{1,15}$/i;

function withCase(
  path: string,
  caseTarget: string | undefined,
): { path: string; caseTarget?: string } {
  return caseTarget === undefined ? { path } : { path, caseTarget };
}

/** Strip an unambiguous `::name` or `:line` case suffix from a recorded path. */
export function splitPathAndCase(recorded: string): {
  readonly path: string;
  readonly caseTarget?: string;
} {
  const double = recorded.indexOf("::");
  if (double >= 0) {
    const path = recorded.slice(0, double);
    const caseTarget = recorded.slice(double + 2);
    if (path.length === 0 || caseTarget.length === 0) {
      return { path: recorded };
    }
    return { path, caseTarget };
  }
  const line = /^(.*):(\d+)$/.exec(recorded);
  if (line?.[1] && line[2]) {
    return { path: line[1], caseTarget: line[2] };
  }
  return { path: recorded };
}

function underConfiguredRoot(
  path: string,
  locationRoots: readonly string[],
): boolean {
  return locationRoots.some(
    (root) => path === root || path.startsWith(`${root}/`),
  );
}

function basenameOf(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash < 0 ? path : path.slice(slash + 1);
}

function looksLikeFilePath(path: string): boolean {
  if (path.length === 0 || path.includes("\\")) return false;
  if (shaPath.test(path) || globChars.test(path)) return false;
  if (path.includes("/")) {
    const base = basenameOf(path);
    return base.length > 0 && base !== "." && base !== "..";
  }
  return fileExtension.test(path);
}

/**
 * Match one recorded reference (backtick body, Markdown link target, or
 * already-resolved path text) against the configured Intent inventory.
 */
export function matchRecordedLocationReference(
  recorded: string,
  recordPath: string,
  inventory: IntentConfiguredInventory,
): MatchedLocationTarget {
  const trimmed = recorded.trim();
  if (trimmed.length === 0) {
    return { kind: "not-a-file-reference" };
  }
  if (shaPath.test(trimmed) || globChars.test(trimmed)) {
    return { kind: "not-a-file-reference" };
  }

  const { path: rawPath, caseTarget } = splitPathAndCase(trimmed);
  let path = rawPath;
  if (path.startsWith("./") || path.startsWith("../")) {
    const resolved = resolveBesideFile(recordPath, path);
    if (resolved === undefined) {
      return { kind: "not-a-file-reference" };
    }
    path = resolved;
  }

  if (!looksLikeFilePath(path)) {
    return { kind: "not-a-file-reference" };
  }

  const { files, locationRoots } = inventory;
  if (path.includes("/")) {
    if (files.includes(path)) {
      return { kind: "file", ...withCase(path, caseTarget) };
    }
    if (underConfiguredRoot(path, locationRoots)) {
      return { kind: "not-published", ...withCase(path, caseTarget) };
    }
    return { kind: "outside-configured", ...withCase(path, caseTarget) };
  }

  const matches = files
    .filter((file) => basenameOf(file) === path)
    .slice()
    .sort();
  if (matches.length === 1) {
    const only = matches[0];
    if (only === undefined) return { kind: "not-a-file-reference" };
    return { kind: "file", ...withCase(only, caseTarget) };
  }
  if (matches.length > 1) {
    return { kind: "several", paths: matches };
  }
  return { kind: "not-published", ...withCase(path, caseTarget) };
}

export function inventoryFromIntentLocations(
  locations: ReadonlyArray<{
    readonly path: string;
    readonly files: readonly string[];
  }>,
): IntentConfiguredInventory {
  const files: string[] = [];
  const locationRoots: string[] = [];
  for (const location of locations) {
    locationRoots.push(location.path);
    for (const file of location.files) {
      files.push(file);
    }
  }
  return { files, locationRoots };
}
