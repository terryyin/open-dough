import { readIntentCiComparison } from "./authenticatedIntentCiComparisonRead.ts";
import {
  readIntentCiDoneWallTimeHistory,
  readIntentCiHistory,
  readIntentCiScopeHistory,
} from "./authenticatedIntentCiHistoryRead.ts";
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
  readonly readHistory: typeof readIntentCiHistory;
  readonly readDoneWallTimeHistory: typeof readIntentCiDoneWallTimeHistory;
  readonly readScopeHistory: typeof readIntentCiScopeHistory;
};

export const authenticatedIntentCiReads: IntentCiReadSource = {
  readComparison: readIntentCiComparison,
  readProof: readIntentCiProof,
  readStatus: readIntentCiStatus,
  readKeptStatus: readKeptIntentCiStatus,
  readHistory: readIntentCiHistory,
  readDoneWallTimeHistory: readIntentCiDoneWallTimeHistory,
  readScopeHistory: readIntentCiScopeHistory,
};
