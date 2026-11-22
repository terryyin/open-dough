// The published observation's reads (`./publishedObservation.ts`): the
// selected project's published snapshot and membership, a file at a revision
// for preparation detail (`./preparationEnrichment.ts`), and the scheduled
// revision check (`./revisionCheckSchedule.ts`). The authenticated
// implementation binds the local boundary.

import {
  readPublishedSnapshot,
  readRepositoryFileAt,
} from "./authenticatedRead.ts";
import { checkPublishedRevision } from "./revisionCheckRead.ts";

export type PublishedObservationReadSource = {
  readonly readSnapshot: typeof readPublishedSnapshot;
  readonly readDetailFile: typeof readRepositoryFileAt;
  readonly checkRevision: typeof checkPublishedRevision;
};

export const authenticatedPublishedObservationReads: PublishedObservationReadSource =
  {
    readSnapshot: readPublishedSnapshot,
    readDetailFile: readRepositoryFileAt,
    checkRevision: checkPublishedRevision,
  };
