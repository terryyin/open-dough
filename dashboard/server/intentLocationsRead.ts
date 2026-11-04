// Reads of a project's Intent locations at a pinned revision for the local
// authenticated read boundary (`./authenticatedRead.ts`): the settings file's
// `intent.locations`, and each location's nested files of its kind
// (`intent=locations`). Each names only a pinned revision and is refused here
// before any `gh` call otherwise. File text of a selected source file is read
// through the existing `file-at` path once that revision's locations select
// it (`pathSelectedByIntentLocations`). Nested listing uses one recursive
// Git trees call per location (`./ghTrees.ts`). The pinned-text memo and
// project setting path are reused (`./pinnedTexts.ts`,
// `./recordsBesideBacklog.ts`). Settings parse and text live in
// `./intentLocationsSettings.ts`; selection in
// `../src/intentLocationSelection.ts`, admission in
// `./intentLocationSelection.ts`;
// declared proof of a location whose kind Intent reads proof for
// (`../src/proofKinds.ts`) in `./intentProofRead.ts`.

import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { readingPathAt } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { parsePinnedIntentRead } from "./intentReadParameters.ts";
import type { RefusedParameters } from "./refusedParameters.ts";
import {
  declaredLocations,
  intentSettingsTextAt,
  type DeclaredLocation,
  type IntentLocation,
  type IntentLocationProof,
  type IntentSettingsProblem,
} from "./intentLocationsSettings.ts";
import { locationProofAt, type ListedFile } from "./intentProofRead.ts";
import { proofKindOf } from "../src/proofKinds.ts";
import {
  extensionsOf,
  locationSelectsRelativePath,
} from "../src/intentLocationSelection.ts";

export type {
  IntentLocation,
  IntentLocationProblem,
  IntentLocationProof,
  IntentSettingsProblem,
} from "./intentLocationsSettings.ts";

export {
  locationSelectsPath,
  pathSelectedByIntentLocations,
  pathSelectedByLocations,
} from "./intentLocationSelection.ts";

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
): Promise<readonly ListedFile[]> {
  if (extensionsOf(location.kind) === undefined) return [];
  naming(readingPathAt(location.path, revision));
  const entries = await pinned.treeLister(
    source,
    revision,
    signal,
  )(location.path);
  return entries.flatMap((entry) => {
    if (entry.type !== "blob") return [];
    if (
      !locationSelectsRelativePath(entry.path, location.kind, location.include)
    ) {
      return [];
    }
    return [{ path: `${location.path}/${entry.path}`, sha: entry.sha }];
  });
}

function locationFields(
  location: DeclaredLocation,
): Pick<
  IntentLocation,
  | "path"
  | "kind"
  | "include"
  | "runner"
  | "proofGeneration"
  | "proofGenerationProblem"
> {
  return {
    path: location.path,
    kind: location.kind,
    ...(location.include === undefined ? {} : { include: location.include }),
    ...(location.runner === undefined ? {} : { runner: location.runner }),
    ...(location.proofGeneration === undefined
      ? {}
      : { proofGeneration: location.proofGeneration }),
    ...(location.proofGenerationProblem === undefined
      ? {}
      : { proofGenerationProblem: location.proofGenerationProblem }),
  };
}

function locationAnswer(
  location: DeclaredLocation,
  files: readonly ListedFile[],
  proof: IntentLocationProof | undefined,
): IntentLocation {
  const fields = locationFields(location);
  if (extensionsOf(location.kind) === undefined) {
    return { ...fields, files: [], problem: "unsupported-kind" };
  }
  if (files.length === 0) {
    return { ...fields, files: [], problem: "no-matching-files" };
  }
  const paths = files.map((file) => file.path);
  return proof === undefined
    ? { ...fields, files: paths }
    : { ...fields, files: paths, proof };
}

// Proof is read for a location of a proof kind that declares a proof
// directory and lists files.
function proofOfLocation(
  pinned: PinnedTexts,
  source: PublishedSource,
  revision: string,
  location: DeclaredLocation,
  files: readonly ListedFile[],
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<IntentLocationProof> | undefined {
  const proofKind = proofKindOf(location.kind, location.runner);
  if (
    location.proof === undefined ||
    proofKind === undefined ||
    files.length === 0
  ) {
    return undefined;
  }
  return locationProofAt(
    proofKind,
    pinned,
    source,
    revision,
    location.proof,
    files,
    signal,
    naming,
  );
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
    const files = await filesUnderLocation(
      pinned,
      source,
      revision,
      location,
      signal,
      naming,
    );
    locations.push(
      locationAnswer(
        location,
        files,
        await proofOfLocation(
          pinned,
          source,
          revision,
          location,
          files,
          signal,
          naming,
        ),
      ),
    );
  }
  return answered({ revision, locations });
}
