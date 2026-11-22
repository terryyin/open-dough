// Controlled published-source answers for whole-app Intent reading checks.
// The caller supplies selected files; selection judgment belongs to Backend.
import type { CatalogPublication } from "../catalogProjectRecords.ts";
import type { IntentLocation } from "../../server/intentLocationsRead.ts";
import type { IntentSettings } from "../../../Distribution/tests/support/intentLocationTestData.mjs";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { putFrontendPublished } from "./frontendServiceState.ts";

export function putFrontendIntentSources(
  services: FrontendServiceState,
  project: CatalogPublication,
  locations: readonly IntentLocation[],
  files: Readonly<Record<string, string>>,
): void {
  Object.assign(services, {
    projects: [project],
    locations: { revision: project.revision, locations },
  });
  putFrontendPublished(services, {
    revision: project.revision,
    backlog: project.files[".planning/PRODUCT-BACKLOG.md"] ?? "",
    files: { ...project.files, ...files },
  });
}

// Each declared location answered with the given paths under its folder.
export const locationsSelectingUnder = (
  settings: IntentSettings,
  paths: readonly string[],
): IntentLocation[] =>
  settings.intent.locations.map((location) => ({
    ...location,
    files: paths.filter((path) => path.startsWith(`${location.path}/`)),
  }));
