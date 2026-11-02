// `file-at` admission of a path by the declared Intent locations
// (`./intentLocationsSettings.ts`, `./performedRead.ts`): a safe repository
// path one location selects by the shared location-selection rule
// (`../src/intentLocationSelection.ts`), the rule listing also uses
// (`./intentLocationsRead.ts`).

import { isSafeRepositoryPath, type PinnedReader } from "./reachablePaths.ts";
import { agentSettingsTextAt } from "./recordsBesideBacklog.ts";
import {
  declaredLocations,
  type DeclaredLocation,
} from "./intentLocationsSettings.ts";
import { locationSelectsRepositoryPath } from "../src/intentLocationSelection.ts";

// Whether `path` is a file a declared location lists (kind + include), not
// merely a path under that location's folder.
export function locationSelectsPath(
  filePath: string,
  location: DeclaredLocation,
): boolean {
  if (!isSafeRepositoryPath(filePath)) return false;
  return locationSelectsRepositoryPath(filePath, location);
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
