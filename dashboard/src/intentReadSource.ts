import { readIntentCandidatesAt } from "./authenticatedIntentCandidatesRead.ts";
import { requestIntentLocationsAt } from "./authenticatedIntentRead.ts";
import {
  readProjectFileAt,
  readProjectTreeAt,
} from "./authenticatedProjectBrowseRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";

// Uncached reads. The Intent hooks retain their shared caches and recovery.
export type IntentReadSource = {
  readonly readLocations: typeof requestIntentLocationsAt;
  readonly readFile: typeof readRepositoryFileAt;
  readonly readCandidates: typeof readIntentCandidatesAt;
  // The whole project's tracked paths and one tracked file's text at a
  // published revision.
  readonly readProjectTree: typeof readProjectTreeAt;
  readonly readProjectFile: typeof readProjectFileAt;
};

export const authenticatedIntentReads: IntentReadSource = {
  readLocations: requestIntentLocationsAt,
  readFile: readRepositoryFileAt,
  readCandidates: readIntentCandidatesAt,
  readProjectTree: readProjectTreeAt,
  readProjectFile: readProjectFileAt,
};
