// Pure selection of the two shared testing conventions. The runtime bundles
// the existing declaration and membership owners; never add another matcher.
import { declaredLocations } from "../../../../dashboard/src/intentLocationsDeclaration.ts";
import { locationSelectsRepositoryPath } from "../../../../dashboard/src/intentLocationSelection.ts";
import { isSafeRepositoryPath } from "../../../../dashboard/src/repositoryPath.ts";

export function selectTestEntryRules(settings, sourcePaths) {
  const declared = declaredLocations(settings);
  if (declared.kind === "malformed") {
    return { status: "unresolved", problem: "malformed", sources: [] };
  }
  const locations = declared.kind === "locations" ? declared.locations : [];
  return {
    status: "resolved",
    sources: sourcePaths.map((path) => {
      if (typeof path !== "string" || !isSafeRepositoryPath(path)) {
        throw new Error(
          `Expected a project-relative test source path: ${path}`,
        );
      }
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
