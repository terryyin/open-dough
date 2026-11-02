// Why a configured Intent location (`./authenticatedIntentRead.ts`) shows no
// files: unsupported kind, or no matching files at the path for this revision.

import type { IntentLocation } from "./authenticatedIntentRead.ts";

export function locationExplanation(location: IntentLocation): string {
  if (location.problem === "unsupported-kind") {
    return `Kind ${location.kind} is not yet supported.`;
  }
  if (location.include !== undefined && location.include.length > 0) {
    return `No files matching ${location.include.join(", ")} are published at ${location.path} for this revision.`;
  }
  return `No ${location.kind} files are published at ${location.path} for this revision.`;
}
