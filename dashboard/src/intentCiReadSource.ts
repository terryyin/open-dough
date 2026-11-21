import { createContext } from "react";
import { readIntentCiComparison } from "./authenticatedIntentCiComparisonRead.ts";
import { readIntentCiHistory } from "./authenticatedIntentCiHistoryRead.ts";
import { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import {
  readIntentCiStatus,
  readKeptIntentCiStatus,
} from "./authenticatedIntentCiStatusRead.ts";

// Uncached CI reads; the Intent CI hooks retain their reading state and abort boundaries.
export type IntentCiReadSource = {
  readonly readStatus: typeof readIntentCiStatus;
  readonly readKeptStatus: typeof readKeptIntentCiStatus;
  readonly readProof: typeof readIntentCiProof;
  readonly readHistory: typeof readIntentCiHistory;
  readonly readComparison: typeof readIntentCiComparison;
};

export const defaultIntentCiReadSource: IntentCiReadSource = {
  readStatus: readIntentCiStatus,
  readKeptStatus: readKeptIntentCiStatus,
  readProof: readIntentCiProof,
  readHistory: readIntentCiHistory,
  readComparison: readIntentCiComparison,
};

export const IntentCiReadSourceOnPage = createContext<IntentCiReadSource>(
  defaultIntentCiReadSource,
);
