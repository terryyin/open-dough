import { createContext } from "react";
import { requestIntentLocationsAt } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";

// Uncached reads. The Intent hooks retain their shared caches and recovery.
export type IntentReadSource = {
  readonly readLocations: typeof requestIntentLocationsAt;
  readonly readFile: typeof readRepositoryFileAt;
};

export const IntentReadSourceOnPage = createContext<IntentReadSource>({
  readLocations: requestIntentLocationsAt,
  readFile: readRepositoryFileAt,
});
