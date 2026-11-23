// Pure selection of the two shared testing conventions. The runtime bundles
// the existing declaration and membership owners; never add another matcher.
import { declaredLocations } from "../../dough-makeme/scripts/intent-location-settings.mjs";
import { locationSelectsRepositoryPath } from "../../dough-makeme/scripts/intent-location-selection.mjs";
import { isSafeRepositoryPath } from "../../dough-makeme/scripts/repository-path.mjs";
export { isSafeRepositoryPath };

export function selectTestEntryRules(settings, sourcePaths) {
  for (const path of sourcePaths) {
    if (typeof path !== "string" || !isSafeRepositoryPath(path)) {
      throw new Error(`Expected a project-relative test source path: ${path}`);
    }
  }
  const declared = declaredLocations(settings);
  if (declared.kind === "malformed") {
    return { status: "unresolved", problem: "malformed", sources: [] };
  }
  const locations = declared.kind === "locations" ? declared.locations : [];
  return {
    status: "resolved",
    sources: sourcePaths.map((path) => {
      const matching = locations.filter((location) =>
        locationSelectsRepositoryPath(path, location),
      );
      return {
        path,
        makeMe: matching.some((location) => location.makeMe === true),
        pageObjects: matching.some((location) => location.pageObjects === true),
      };
    }),
  };
}
