import { readIntentCandidatesAt } from "./authenticatedIntentCandidatesRead.ts";
import { requestIntentLocationsAt } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";

// Uncached reads. The Intent hooks retain their shared caches and recovery.
export type IntentReadSource = {
  readonly readLocations: typeof requestIntentLocationsAt;
  readonly readFile: typeof readRepositoryFileAt;
  readonly readCandidates: typeof readIntentCandidatesAt;
};

export const authenticatedIntentReads: IntentReadSource = {
  readLocations: requestIntentLocationsAt,
  readFile: readRepositoryFileAt,
  readCandidates: readIntentCandidatesAt,
};
