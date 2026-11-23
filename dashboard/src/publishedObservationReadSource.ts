// The published observation's reads (`./publishedObservation.ts`): the
// selected project's published snapshot and membership, a file at a revision
// for preparation detail (`./preparationEnrichment.ts`), the scheduled
// revision check (`./revisionCheckSchedule.ts`), the typed revision-stream
// subscription (`./revisionStreamSchedule.ts`), the detail groups that
// enrich one membership snapshot (`./publishedWorkDetails.ts`): profiles,
// profile-addition history, published sessions, and the Done catalog, and the
// branch head, branch-file, and commit-time reads that place Taken progress
// and clocks (`./progressSource.ts`, `./sliceClockStart.ts`). The
// authenticated implementation binds the local boundary.

import {
  readBranchHeadAt,
  readFileOnBranch,
} from "./authenticatedBranchRead.ts";
import {
  readAgentProfilesAt,
  readProfileAdditionAt,
} from "./authenticatedProfileRead.ts";
import { readDoneCatalogAt } from "./authenticatedDoneRead.ts";
import {
  readLastCommitTimeAt,
  readPublishedSnapshot,
  readRepositoryFileAt,
} from "./authenticatedRead.ts";
import { boundaryPublishedSessions } from "./publishedSessions.ts";
import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  checkPublishedRevision,
  subscribePublishedRevision,
} from "./revisionCheckRead.ts";

export type PublishedObservationReadSource = {
  readonly readSnapshot: typeof readPublishedSnapshot;
  readonly readDetailFile: typeof readRepositoryFileAt;
  readonly checkRevision: typeof checkPublishedRevision;
  readonly subscribeRevision: typeof subscribePublishedRevision;
  readonly readProfiles: typeof readAgentProfilesAt;
  readonly readProfileAddition: typeof readProfileAdditionAt;
  readonly readDoneCatalog: typeof readDoneCatalogAt;
  readonly listPublishedSessions: (
    source: PublishedSource,
    revision: string,
    signal: AbortSignal,
  ) => Promise<readonly PublishedSessionRecord[]>;
  readonly readBranchHead: typeof readBranchHeadAt;
  readonly readFileOnBranch: typeof readFileOnBranch;
  readonly readCommitTime: typeof readLastCommitTimeAt;
};

export const authenticatedPublishedObservationReads: PublishedObservationReadSource =
  {
    readSnapshot: readPublishedSnapshot,
    readDetailFile: readRepositoryFileAt,
    checkRevision: checkPublishedRevision,
    subscribeRevision: subscribePublishedRevision,
    readProfiles: readAgentProfilesAt,
    readProfileAddition: readProfileAdditionAt,
    readDoneCatalog: readDoneCatalogAt,
    listPublishedSessions: (source, revision, signal) =>
      boundaryPublishedSessions(source)(revision, signal),
    readBranchHead: readBranchHeadAt,
    readFileOnBranch,
    readCommitTime: readLastCommitTimeAt,
  };
