// Which files a configured Intent location selects, and each file's syntax
// hint. A location is a list of source entries; a path relative to the
// location belongs to the first entry, in declaration order, whose filter and
// patterns match it (`*` one folder, `**` across folders), and that entry's
// hint names the file's syntax. One rule for the server's listing
// (`../server/intentLocationsRead.ts`) and `file-at` admission
// (`../server/intentLocationSelection.ts`), for the story overlay that places
// a story's changed files in Intent (`./intentStoryOverlay.ts`), and for the
// reading pane's syntax (`./IntentBrowser.tsx`).
// Patterns match through the matcher Node's `path.matchesGlob` is built on,
// with POSIX rules and case-sensitively on every platform. Node's own
// `matchesGlob` differs on macOS, where it ignores case in a pattern's
// wildcard parts (`a/*.ts` matches `a/B.TS`).

import { minimatch } from "minimatch";

// Supported Intent source kinds and the file extensions each lists. The kind
// also names the Shiki grammar; there is no other mapping (`.tsx` within
// `typescript` is the highlighter's per-extension choice).
const intentSourceKinds = {
  gherkin: { extensions: [".feature"] },
  typescript: { extensions: [".ts", ".tsx"] },
  javascript: { extensions: [".js", ".mjs", ".cjs"] },
  python: { extensions: [".py"] },
  shell: { extensions: [".sh", ".bash"] },
} as const;

type IntentSourceKind = keyof typeof intentSourceKinds;

function extensionsOf(kind: string): readonly string[] | undefined {
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

// One source entry of a location: the paths it selects and their syntax hint.
export type SourceEntry = {
  // Patterns relative to the location; absent selects any path.
  readonly patterns?: readonly string[];
  // Syntax hint for the files this entry selects; absent means plain text.
  readonly hint?: string;
  // Extensions a path must end with before its patterns are tried; absent
  // admits any extension.
  readonly extensions?: readonly string[];
};

// A location as its selection is declared: folder, kind, include patterns.
export type LocationSelection = {
  readonly path: string;
  readonly kind: string;
  readonly include?: readonly string[] | undefined;
};

// A location's source entries in declaration order, or undefined when its
// declaration names an unsupported kind. A kind declaration is one entry:
// its kind's extensions, its include patterns (or any path), the kind as hint.
export function sourceEntriesOf(
  location: LocationSelection,
): readonly SourceEntry[] | undefined {
  const extensions = extensionsOf(location.kind);
  if (extensions === undefined) return undefined;
  return [
    {
      extensions,
      hint: location.kind,
      ...(location.include === undefined ? {} : { patterns: location.include }),
    },
  ];
}

function entrySelects(entry: SourceEntry, relativePath: string): boolean {
  if (
    entry.extensions !== undefined &&
    !entry.extensions.some((extension) => relativePath.endsWith(extension))
  ) {
    return false;
  }
  if (entry.patterns === undefined) return true;
  return entry.patterns.some((pattern) =>
    minimatch(relativePath, pattern, globOptions),
  );
}

// The first entry, in declaration order, that selects a path relative to
// the location; undefined when none does.
export function matchingSourceEntry(
  relativePath: string,
  entries: readonly SourceEntry[],
): SourceEntry | undefined {
  return entries.find((entry) => entrySelects(entry, relativePath));
}

// The entry that selects a repository path under the location, or undefined
// when the path lies outside it or no entry selects it.
export function sourceEntryOfRepositoryPath(
  filePath: string,
  location: LocationSelection,
): SourceEntry | undefined {
  if (!filePath.startsWith(`${location.path}/`)) return undefined;
  const entries = sourceEntriesOf(location);
  if (entries === undefined) return undefined;
  return matchingSourceEntry(filePath.slice(location.path.length + 1), entries);
}

// Whether a repository path lies under the location and is one it lists.
export function locationSelectsRepositoryPath(
  filePath: string,
  location: LocationSelection,
): boolean {
  return sourceEntryOfRepositoryPath(filePath, location) !== undefined;
}
