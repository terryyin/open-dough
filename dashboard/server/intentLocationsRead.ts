// Reads of a project's Intent locations at a pinned revision for the local
// authenticated read boundary (`./authenticatedRead.ts`): the settings file's
// `intent.locations`, and each location's nested files of its kind
// (`intent=locations`). Each names only a pinned revision and is refused here
// before any `gh` call otherwise. File text of a selected feature is read
// through the existing `file-at` path once that revision's locations contain
// it (`pathContainedInIntentLocations`). Nested listing uses one recursive
// Git trees call per location (`./ghTrees.ts`). The pinned-text memo and
// project setting path are reused (`./pinnedTexts.ts`,
// `./recordsBesideBacklog.ts`).

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

// The one supported Intent source kind and the extension its files use. The
// kind also names the Shiki grammar later; there is no other mapping.
export const intentSourceKinds = {
  gherkin: { extension: ".feature" },
} as const;

export type IntentSourceKind = keyof typeof intentSourceKinds;

export type IntentLocation = {
  readonly path: string;
  readonly kind: string;
  // Repository paths of files this kind lists under the location, at the
  // revision. Unsupported kinds list none here.
  readonly files: readonly string[];
};

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

type DeclaredLocation = { readonly path: string; readonly kind: string };

// The locations the settings declare, or undefined when Intent is not
// configured (absent settings, absent intent key, or no locations).
function declaredLocations(
  settings: string | null,
): DeclaredLocation[] | undefined {
  if (settings === null) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(settings);
  } catch {
    // Malformed settings are a distinct later failure; fail this read so the
    // meanings stay distinct from absence.
    throw new SyntaxError(`${agentSettingsPath} is not readable JSON`);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return undefined;
  }
  const intent = (parsed as { intent?: unknown }).intent;
  if (intent === undefined) return undefined;
  if (intent === null || typeof intent !== "object" || Array.isArray(intent)) {
    return undefined;
  }
  const locations = (intent as { locations?: unknown }).locations;
  if (!Array.isArray(locations) || locations.length === 0) {
    return undefined;
  }
  const declared: DeclaredLocation[] = [];
  for (const entry of locations) {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      continue;
    }
    const { path, kind } = entry as { path?: unknown; kind?: unknown };
    if (typeof path !== "string" || !isSafeRepositoryPath(path)) continue;
    if (typeof kind !== "string" || kind.length === 0) continue;
    declared.push({ path, kind });
  }
  return declared.length === 0 ? undefined : declared;
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
  const settings = await agentSettingsTextAt(readPinned);
  let declared: DeclaredLocation[] | undefined;
  try {
    declared = declaredLocations(settings);
  } catch {
    return false;
  }
  return declared !== undefined && pathContainedInLocations(path, declared);
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

// Performs one Intent locations read: the configured locations and their
// kind's nested files, or not-configured when the setting is absent.
export async function performIntentLocationsRead(
  pinned: PinnedTexts,
  source: PublishedSource,
  read: IntentLocationsRead,
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<Outcome> {
  const { revision } = read;
  naming(readingPathAt(agentSettingsPath, revision));
  const settings = await agentSettingsTextAt(
    pinned.reader(source, revision, signal),
  );
  const declared = declaredLocations(settings);
  if (declared === undefined) {
    return answered({ revision, locations: null });
  }
  const locations: IntentLocation[] = [];
  for (const location of declared) {
    locations.push({
      path: location.path,
      kind: location.kind,
      files: await filesUnderLocation(
        pinned,
        source,
        revision,
        location,
        signal,
        naming,
      ),
    });
  }
  return answered({ revision, locations });
}
