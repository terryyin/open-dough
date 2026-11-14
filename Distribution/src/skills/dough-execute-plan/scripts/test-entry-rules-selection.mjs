// Pure selection of the two shared testing conventions. The runtime bundles
// the existing declaration and membership owners; never add another matcher.
import { declaredLocations } from "../../dough-makeme/scripts/intent-location-settings.mjs";
import { locationSelectsRepositoryPath } from "../../dough-makeme/scripts/intent-location-selection.mjs";
import { isSafeRepositoryPath } from "../../dough-makeme/scripts/repository-path.mjs";
export { isSafeRepositoryPath };

function selectedEntries(settings, sourcePaths) {
  for (const path of sourcePaths) {
    if (typeof path !== "string" || !isSafeRepositoryPath(path)) {
      throw new Error(`Expected a project-relative test source path: ${path}`);
    }
  }
  const declared = declaredLocations(settings);
  if (declared.kind === "malformed") {
    return { status: "unresolved", problem: "malformed", entries: [] };
  }
  const locations = declared.kind === "locations" ? declared.locations : [];
  return {
    status: "resolved",
    entries: locations.map((entry) => ({
      ...entry,
      files: [...new Set(sourcePaths)].filter((path) =>
        locationSelectsRepositoryPath(path, entry),
      ),
    })),
  };
}

export function selectTestEntryRules(settings, sourcePaths) {
  const selected = selectedEntries(settings, sourcePaths);
  if (selected.status === "unresolved") {
    return { status: "unresolved", problem: selected.problem, sources: [] };
  }
  return {
    status: "resolved",
    sources: sourcePaths.map((path) => {
      const matching = selected.entries.filter((entry) =>
        entry.files.includes(path),
      );
      return {
        path,
        makeMe: matching.some((location) => location.makeMe === true),
        pageObjects: matching.some((location) => location.pageObjects === true),
      };
    }),
  };
}

// The existing MakeMe command retains its entry-oriented answer through the
// same declaration and membership decision as the two-convention command.
export function selectMakeMeEntries(settings, sourcePaths) {
  const selected = selectedEntries(settings, sourcePaths);
  if (selected.status === "unresolved") return selected;
  const entries = selected.entries
    .filter((entry) => entry.makeMe === true && entry.files.length > 0)
    .map(({ path, files }) => ({ path, files }));
  return {
    status: "resolved",
    entries,
    files: [...new Set(entries.flatMap((entry) => entry.files))],
  };
}
