// Shared membership and syntax semantics used by Intent and installed guidance.
export {
  sourceEntriesOf,
  matchingSourceEntry,
  sourceEntryOfRepositoryPath,
  locationSelectsRepositoryPath,
} from "../../src/skills/dough-makeme/scripts/intent-location-selection.mjs";
export type {
  SourceEntry,
  SourceDeclaration,
  LocationSelection,
} from "../../src/skills/dough-makeme/scripts/intent-location-selection.mjs";
