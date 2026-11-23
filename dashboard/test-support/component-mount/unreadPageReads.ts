// Page reads a case does not exercise: each one rejects, so a case that
// reaches a read it did not supply fails instead of reaching the real reader.
// The source highlighter is local and reads nothing, so an unsupplied one
// highlights for real and cases that show source keep their styling.

import type { CiFollowUpReadSource } from "../../src/ciFollowUpReadSource.ts";
import type { DoneRecordReadSource } from "../../src/doneRecordReadSource.ts";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import type { PageReads } from "../../src/pageReads.tsx";
import type { PublishedObservationReadSource } from "../../src/publishedObservationReadSource.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { highlightSourceLines } from "../../src/sourceHighlight.ts";
import type { SessionServices } from "../../src/sessionServices.ts";
import type { StoryNotesReadSource } from "../../src/storyNotesReadSource.ts";
import type { StoryReviewStatesReadSource } from "../../src/storyReviewStatesReadSource.ts";

const unread = (name: string) => () =>
  Promise.reject(new Error(`Unexpected ${name} read`));

const unreadSync = (name: string) => () => {
  throw new Error(`Unexpected ${name}`);
};

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
  readDoneWallTimeHistory: unread("Done wall-time history"),
  readScopeHistory: unread("CI scope history"),
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
  openTerminal: unreadSync("terminal attach"),
};

const unreadDoneRecordReads: DoneRecordReadSource = {
  readBodies: unread("done records"),
};

const unreadStoryNotes: StoryNotesReadSource = unread("story notes");

const unreadCiFollowUp: CiFollowUpReadSource = {
  readCards: unread("CI follow-up"),
  readRetained: unread("retained CI follow-up"),
};

const unreadReviewStates: StoryReviewStatesReadSource = unread(
  "story review states",
);

const unreadObservation: PublishedObservationReadSource = {
  readSnapshot: unread("published snapshot"),
  readDetailFile: unread("published detail file"),
  checkRevision: unread("revision check"),
  subscribeRevision: unreadSync("revision subscription read"),
  readProfiles: unread("published profiles"),
  readProfileAddition: unread("published profile addition"),
  readDoneCatalog: unread("published done catalog"),
  listPublishedSessions: unread("published sessions"),
  readBranchHead: unread("published branch head"),
  readFileOnBranch: unread("published branch file"),
  readCommitTime: unread("published commit time"),
};

const unreadMachine: MachineReadSource = {
  readSessionsSince: unread("machine sessions"),
  requestAcceptance: unread("agent acceptance"),
};

// The page's reads with only SUPPLIED answering; every other read rejects.
export const pageReadsSupplying = (
  supplied: Partial<PageReads>,
): PageReads => ({
  intent: unreadIntentReads,
  ci: unreadCiReads,
  review: unreadReviewReads,
  sessions: unreadSessionServices,
  done: unreadDoneRecordReads,
  storyNotes: unreadStoryNotes,
  ciFollowUp: unreadCiFollowUp,
  reviewStates: unreadReviewStates,
  observation: unreadObservation,
  machine: unreadMachine,
  highlight: highlightSourceLines,
  ...supplied,
});
