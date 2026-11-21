import { createContext } from "react";
import { readIntentCiComparison } from "./authenticatedIntentCiComparisonRead.ts";
import { readIntentCiHistory } from "./authenticatedIntentCiHistoryRead.ts";
import { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import {
  readIntentCiStatus,
  readKeptIntentCiStatus,
} from "./authenticatedIntentCiStatusRead.ts";

// Uncached CI reads. The disposable reading owners keep abort, identity,
// attempt and refresh-round checks; the authenticated readers validate.
export type IntentCiReadSource = {
  readonly readComparison: typeof readIntentCiComparison;
  readonly readProof: typeof readIntentCiProof;
  readonly readStatus: typeof readIntentCiStatus;
  readonly readKeptStatus: typeof readKeptIntentCiStatus;
  readonly readHistory?: typeof readIntentCiHistory | undefined;
};

export const defaultIntentCiReadSource: IntentCiReadSource = {
  readComparison: readIntentCiComparison,
  readProof: readIntentCiProof,
  readStatus: readIntentCiStatus,
  readKeptStatus: readKeptIntentCiStatus,
  readHistory: readIntentCiHistory,
};

export const IntentCiReadSourceOnPage = createContext<IntentCiReadSource>(
  defaultIntentCiReadSource,
);
