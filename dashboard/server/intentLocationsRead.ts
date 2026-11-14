// Published Intent locations at a pinned revision: settings and nested files
// through the authenticated read boundary (./authenticatedRead.ts). Settings
// live in ./intentLocationsSettings.ts and file admission in
// ./intentLocationSelection.ts. Recursive listing reuses ./ghTrees.ts through
// ./pinnedTexts.ts.

import { agentSettingsPath } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { readingPathAt } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { parsePinnedIntentRead } from "./intentReadParameters.ts";
import type { ReportedFailure } from "./readFailureMessage.ts";
import type { RefusedParameters } from "./refusedParameters.ts";
import {
  declaredLocations,
  intentSettingsTextAt,
  type DeclaredLocation,
  type IntentLocation,
  type IntentSettingsProblem,
} from "./intentLocationsSettings.ts";
import {
  matchingSourceEntry,
  sourceEntriesOf,
} from "../src/intentLocationSelection.ts";

export type {
  IntentLocation,
  IntentLocationProblem,
  IntentSettingsProblem,
} from "./intentLocationsSettings.ts";

export {
  locationSelectsPath,
  pathSelectedByIntentLocations,
  pathSelectedByLocations,
} from "./intentLocationSelection.ts";

// Intent locations at a revision: null when the project has no configured
// locations or the settings are unusable; otherwise each location and the
// files its kind lists (or that location's problem). `settingsProblem`
// distinguishes malformed and unreadable settings from absence.
export type IntentLocationsAnswer = {
  readonly revision: string;
  readonly locations: null | readonly IntentLocation[];
  readonly settingsProblem?: IntentSettingsProblem;
  readonly recovery?: ReportedFailure["recovery"];
};

export type IntentLocationsRead = {
  readonly kind: "intent-locations-at";
  readonly revision: string;
};

const intentRefusal = "An Intent locations read names only a pinned revision.";

// The Intent locations read a request names, undefined when it names none.
// Other Intent values parse elsewhere; unknown Intent values are refused
// after every Intent parser (`./intentRequestedRead.ts`).
export function parseIntentLocationsRead(
  params: URLSearchParams,
): IntentLocationsRead | RefusedParameters | undefined {
  return parsePinnedIntentRead(
    params,
    "locations",
    "intent-locations-at",
    intentRefusal,
  );
}

// What an Intent locations read names as being read before any file is.
export function readingIntentLocationsOf({
  revision,
}: IntentLocationsRead): string {
  return readingPathAt(agentSettingsPath, revision);
}

async function filesUnderLocation(
  pinned: PinnedTexts,
  source: PublishedSource,
  revision: string,
  location: DeclaredLocation,
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<readonly string[]> {
  const sources = sourceEntriesOf(location);
  if (sources === undefined) return [];
  naming(readingPathAt(location.path, revision));
  const entries = await pinned.treeLister(
    source,
    revision,
    signal,
  )(location.path);
  return entries.flatMap((entry) => {
    if (entry.type !== "blob") return [];
    if (matchingSourceEntry(entry.path, sources) === undefined) return [];
    return [`${location.path}/${entry.path}`];
  });
}

// A location's answer carries its declaration as settings gave it
// (`./intentLocationsSettings.ts`): a kind with any include patterns, or its
// source entries with no kind.
function locationAnswer(
  location: DeclaredLocation,
  files: readonly string[],
): IntentLocation {
  if (sourceEntriesOf(location) === undefined) {
    return { ...location, files: [], problem: "unsupported-kind" };
  }
  if (files.length === 0) {
    return { ...location, files: [], problem: "no-matching-files" };
  }
  return { ...location, files };
}

// Performs one Intent locations read: the configured locations and the
// nested files each selects, or not-configured / a settings problem when the
// setting is absent, malformed, or unreadable.
export async function performIntentLocationsRead(
  pinned: PinnedTexts,
  source: PublishedSource,
  read: IntentLocationsRead,
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<Outcome> {
  const { revision } = read;
  naming(readingPathAt(agentSettingsPath, revision));
  const settings = await intentSettingsTextAt(
    pinned.reader(source, revision, signal),
  );
  if (settings.kind === "absent") {
    return answered({ revision, locations: null });
  }
  if (settings.kind === "unreadable") {
    const settingsProblem: IntentSettingsProblem = "unreadable";
    return answered({
      revision,
      locations: null,
      settingsProblem,
      recovery: settings.recovery,
    });
  }
  const declared = declaredLocations(settings.text);
  if (declared.kind === "malformed") {
    const settingsProblem: IntentSettingsProblem = "malformed";
    return answered({ revision, locations: null, settingsProblem });
  }
  if (declared.kind === "absent") {
    return answered({ revision, locations: null });
  }
  const locations: IntentLocation[] = [];
  for (const location of declared.locations) {
    const files = await filesUnderLocation(
      pinned,
      source,
      revision,
      location,
      signal,
      naming,
    );
    locations.push(locationAnswer(location, files));
  }
  return answered({ revision, locations });
}
