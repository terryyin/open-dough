// Selection of files under a declared Intent location: kind extensions and
// optional include patterns (`./intentLocationsSettings.ts`). Listing and
// `file-at` admission both use this rule (`./intentLocationsRead.ts`,
// `./performedRead.ts`).

import path from "node:path";
import { isSafeRepositoryPath, type PinnedReader } from "./reachablePaths.ts";
import { agentSettingsTextAt } from "./recordsBesideBacklog.ts";
import {
  declaredLocations,
  type DeclaredLocation,
} from "./intentLocationsSettings.ts";

// Supported Intent source kinds and the file extensions each lists. The kind
// also names the Shiki grammar; there is no other mapping (`.tsx` within
// `typescript` is the highlighter's per-extension choice).
export const intentSourceKinds = {
  gherkin: { extensions: [".feature"] },
  typescript: { extensions: [".ts", ".tsx"] },
  javascript: { extensions: [".js", ".mjs", ".cjs"] },
  python: { extensions: [".py"] },
  shell: { extensions: [".sh", ".bash"] },
} as const;

export type IntentSourceKind = keyof typeof intentSourceKinds;

export function extensionsOf(kind: string): readonly string[] | undefined {
  return kind in intentSourceKinds
    ? intentSourceKinds[kind as IntentSourceKind].extensions
    : undefined;
}

// Whether a path relative to a location is one that location lists: its kind's
// extensions, narrowed by optional include patterns (`*` one folder, `**`
// across folders). One function answers listing and `file-at` admission.
export function locationSelectsRelativePath(
  relativePath: string,
  kind: string,
  include: readonly string[] | undefined,
): boolean {
  const extensions = extensionsOf(kind);
  if (extensions === undefined) return false;
  if (!extensions.some((extension) => relativePath.endsWith(extension))) {
    return false;
  }
  if (include === undefined) return true;
  return include.some((pattern) =>
    path.posix.matchesGlob(relativePath, pattern),
  );
}

// Whether `path` is a file a declared location lists (kind + include), not
// merely a path under that location's folder.
export function locationSelectsPath(
  filePath: string,
  location: DeclaredLocation,
): boolean {
  if (!isSafeRepositoryPath(filePath)) return false;
  if (!filePath.startsWith(`${location.path}/`)) return false;
  const relative = filePath.slice(location.path.length + 1);
  return locationSelectsRelativePath(relative, location.kind, location.include);
}

// Whether `path` is selected by one of the declared locations.
export function pathSelectedByLocations(
  filePath: string,
  locations: readonly DeclaredLocation[],
): boolean {
  return locations.some((location) => locationSelectsPath(filePath, location));
}

// Whether `path` is selected by a configured Intent location of the revision
// the caller's pinned reader already names. Settings text is read through
// that reader so already-read text is not fetched again.
export async function pathSelectedByIntentLocations(
  filePath: string,
  readPinned: PinnedReader,
): Promise<boolean> {
  if (!isSafeRepositoryPath(filePath)) return false;
  // Admission reuses the shared settings helper: absence and unread both mean
  // no locations select the path; malformed JSON is also a refusal.
  const settings = await agentSettingsTextAt(readPinned);
  if (settings === null) return false;
  const declared = declaredLocations(settings);
  return (
    declared.kind === "locations" &&
    pathSelectedByLocations(filePath, declared.locations)
  );
}
