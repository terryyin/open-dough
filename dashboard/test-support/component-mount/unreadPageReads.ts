// Page reads a case does not exercise: each one rejects, so a case that
// reaches a read it did not supply fails instead of reaching the real reader.

import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { PageReads } from "../../src/pageReads.tsx";
import type { ReviewSource } from "../../src/reviewSource.ts";
import type { SessionServices } from "../../src/sessionServices.ts";

const unread = (name: string) => () =>
  Promise.reject(new Error(`Unexpected ${name} read`));

const unreadIntentReads: IntentReadSource = {
  readLocations: unread("Intent locations"),
  readFile: unread("Intent file"),
  readCandidates: unread("Intent candidates"),
};

export const unreadCiReads: IntentCiReadSource = {
  readComparison: unread("CI comparison"),
  readProof: unread("CI proof"),
  readStatus: unread("CI status"),
  readKeptStatus: unread("kept CI status"),
  readHistory: unread("CI history"),
};

const unreadReviewReads: ReviewSource = {
  review: unread("review"),
  range: unread("review range"),
  fileDiff: unread("review file diff"),
  fileText: unread("review file text"),
};

const unreadSessionServices: SessionServices = {
  readFinalReport: unread("final report"),
  readHostStatus: unread("host status"),
  openTerminal: () => {
    throw new Error("Unexpected terminal attach");
  },
};

// The page's reads with only SUPPLIED answering; every other read rejects.
export const pageReadsSupplying = (
  supplied: Partial<PageReads>,
): PageReads => ({
  intent: unreadIntentReads,
  ci: unreadCiReads,
  review: unreadReviewReads,
  sessions: unreadSessionServices,
  ...supplied,
});
