// Reads of a project's Intent locations at a pinned revision for the local
// authenticated read boundary (`./authenticatedRead.ts`): the settings file's
// `intent.locations`, and each location's nested files of its kind
// (`intent=locations`). Each names only a pinned revision and is refused here
// before any `gh` call otherwise. File text of a selected feature is read
// through the existing `file-at` path once that revision's locations contain
// it (`pathContainedInIntentLocations`). Nested listing uses one recursive
// Git trees call per location (`./ghTrees.ts`). The pinned-text memo and
// project setting path are reused (`./pinnedTexts.ts`,
// `./recordsBesideBacklog.ts`). Settings parse and text live in
// `./intentLocationsSettings.ts`.

import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { readingPathAt } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { listedReadParameters } from "./listedRecordsRead.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { isSafeRepositoryPath, type PinnedReader } from "./reachablePaths.ts";
import { agentSettingsTextAt } from "./recordsBesideBacklog.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import {
  isPinnedRevision,
  refused,
  unpinnedRevision,
  type RefusedParameters,
} from "./refusedParameters.ts";
import {
  declaredLocations,
  intentSettingsTextAt,
  type DeclaredLocation,
  type IntentLocation,
  type IntentSettingsProblem,
} from "./intentLocationsSettings.ts";

export type {
  IntentLocation,
  IntentLocationProblem,
  IntentSettingsProblem,
} from "./intentLocationsSettings.ts";

// The one supported Intent source kind and the extension its files use. The
// kind also names the Shiki grammar; there is no other mapping.
export const intentSourceKinds = {
  gherkin: { extension: ".feature" },
} as const;

export type IntentSourceKind = keyof typeof intentSourceKinds;

export type IntentLocationsRead = {
  readonly kind: "intent-locations-at";
  readonly revision: string;
};

const intentRefusal = "An Intent locations read names only a pinned revision.";

// The Intent locations read a request names, undefined when it names none.
export function parseIntentLocationsRead(
  params: URLSearchParams,
): IntentLocationsRead | RefusedParameters | undefined {
  const intent = params.get("intent");
  if (intent === null) return undefined;
  const others = [
    "path",
    "since",
    "committed",
    "file",
    "branch",
    "head",
    ...listedReadParameters.filter((name) => name !== "intent"),
  ];
  if (
    intent !== "locations" ||
    params.getAll("intent").length !== 1 ||
    others.some((name) => params.get(name) !== null)
  ) {
    return refused(intentRefusal);
  }
  const revision = params.get("revision");
  if (!isPinnedRevision(revision)) {
    return unpinnedRevision;
  }
  return { kind: "intent-locations-at", revision };
}

// What an Intent locations read names as being read before any file is.
export function readingIntentLocationsOf({
  revision,
}: IntentLocationsRead): string {
  return readingPathAt(agentSettingsPath, revision);
}

function extensionOf(kind: string): string | undefined {
  return kind in intentSourceKinds
    ? intentSourceKinds[kind as IntentSourceKind].extension
    : undefined;
}

// Whether `path` lies inside one of the declared location folders.
export function pathContainedInLocations(
  path: string,
  locations: readonly { readonly path: string }[],
): boolean {
  if (!isSafeRepositoryPath(path)) return false;
  return locations.some(
    (location) =>
      path === location.path || path.startsWith(`${location.path}/`),
  );
}

// Whether `path` lies inside a configured Intent location of the revision
// the caller's pinned reader already names. Settings text is read through
// that reader so already-read text is not fetched again.
export async function pathContainedInIntentLocations(
  path: string,
  readPinned: PinnedReader,
): Promise<boolean> {
  if (!isSafeRepositoryPath(path)) return false;
  // Admission reuses the shared settings helper: absence and unread both mean
  // no locations contain the path; malformed JSON is also a refusal.
  const settings = await agentSettingsTextAt(readPinned);
  if (settings === null) return false;
  const declared = declaredLocations(settings);
  return (
    declared.kind === "locations" &&
    pathContainedInLocations(path, declared.locations)
  );
}

async function filesUnderLocation(
  pinned: PinnedTexts,
  source: PublishedSource,
  revision: string,
  location: DeclaredLocation,
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<readonly string[]> {
  const extension = extensionOf(location.kind);
  if (extension === undefined) return [];
  naming(readingPathAt(location.path, revision));
  const entries = await pinned.treeLister(
    source,
    revision,
    signal,
  )(location.path);
  return entries.flatMap((entry) => {
    if (entry.type !== "blob" || !entry.path.endsWith(extension)) return [];
    return [`${location.path}/${entry.path}`];
  });
}

function locationAnswer(
  location: DeclaredLocation,
  files: readonly string[],
): IntentLocation {
  const extension = extensionOf(location.kind);
  if (extension === undefined) {
    return {
      path: location.path,
      kind: location.kind,
      files: [],
      problem: "unsupported-kind",
    };
  }
  if (files.length === 0) {
    return {
      path: location.path,
      kind: location.kind,
      files: [],
      problem: "no-features",
    };
  }
  return { path: location.path, kind: location.kind, files };
}

// Performs one Intent locations read: the configured locations and their
// kind's nested files, or not-configured / a settings problem when the
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
    return answered({ revision, locations: null, settingsProblem });
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
    locations.push(
      locationAnswer(
        location,
        await filesUnderLocation(
          pinned,
          source,
          revision,
          location,
          signal,
          naming,
        ),
      ),
    );
  }
  return answered({ revision, locations });
}
