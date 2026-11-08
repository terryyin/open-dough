// How a configured Intent location (`./authenticatedIntentRead.ts`) names its
// selection, and why it shows no files: unsupported kind, or no matching files
// at the path for this revision. A location declared by source entries is
// named by their patterns alone, with no kind.

import type { IntentLocation } from "./authenticatedIntentRead.ts";

// The patterns a location declares, in declaration order: its include
// patterns, or every source entry's.
export function declaredPatternsOf(
  location: IntentLocation,
): readonly string[] {
  if ("sources" in location) {
    return location.sources.flatMap(({ include }) => include);
  }
  return location.include ?? [];
}

// The kind a location names, or undefined for one declared by source entries.
export function declaredKindOf(location: IntentLocation): string | undefined {
  return "sources" in location ? undefined : location.kind;
}

// The location's selection in words: its kind and patterns, comma separated.
export function selectionPhrase(location: IntentLocation): string {
  const kind = declaredKindOf(location);
  return [
    ...(kind === undefined ? [] : [kind]),
    ...declaredPatternsOf(location),
  ].join(", ");
}

export function locationExplanation(location: IntentLocation): string {
  const patterns = declaredPatternsOf(location);
  if (!("sources" in location)) {
    if (location.problem === "unsupported-kind") {
      return `Kind ${location.kind} is not yet supported.`;
    }
    if (patterns.length === 0) {
      return `No ${location.kind} files are published at ${location.path} for this revision.`;
    }
  }
  return `No files matching ${patterns.join(", ")} are published at ${location.path} for this revision.`;
}
