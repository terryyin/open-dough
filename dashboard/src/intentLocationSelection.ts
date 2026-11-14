// Shared membership and syntax semantics used by Intent and installed guidance.
export {
  sourceEntriesOf,
  matchingSourceEntry,
  sourceEntryOfRepositoryPath,
  locationSelectsRepositoryPath,
} from "../../Distribution/src/skills/dough-makeme/scripts/intent-location-selection.mjs";
export type {
  SourceEntry,
  SourceDeclaration,
  LocationSelection,
} from "../../Distribution/src/skills/dough-makeme/scripts/intent-location-selection.mjs";
