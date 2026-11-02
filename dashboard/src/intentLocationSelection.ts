// Which files a configured Intent location selects: its kind's extensions,
// narrowed by optional include patterns relative to the location (`*` one
// folder, `**` across folders). One rule for the server's listing
// (`../server/intentLocationsRead.ts`) and `file-at` admission
// (`../server/intentLocationSelection.ts`) and for the story overlay that
// places a story's changed files in Intent (`./intentStoryOverlay.ts`).
// Patterns match as Node's `path.matchesGlob` matches them on POSIX, through
// the same matcher it is built on.

import { minimatch } from "minimatch";

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

const globOptions = {
  nonegate: true,
  nocomment: true,
  windowsPathsNoEscape: true,
  optimizationLevel: 2,
  // Any platform but `win32` matches as POSIX does.
  platform: "linux",
} as const;

// Whether a path relative to a location is one that location lists.
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
    minimatch(relativePath, pattern, globOptions),
  );
}

// A location as its selection is declared: folder, kind, include patterns.
export type LocationSelection = {
  readonly path: string;
  readonly kind: string;
  readonly include?: readonly string[] | undefined;
};

// Whether a repository path lies under the location and is one it lists.
export function locationSelectsRepositoryPath(
  filePath: string,
  location: LocationSelection,
): boolean {
  if (!filePath.startsWith(`${location.path}/`)) return false;
  const relative = filePath.slice(location.path.length + 1);
  return locationSelectsRelativePath(relative, location.kind, location.include);
}
