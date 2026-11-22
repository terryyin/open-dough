import { readDoneRecordBodiesAt } from "./authenticatedDoneRead.ts";

// The read of what the done records a shown entry needs say
// (`./doneDetails.ts`); the authenticated reader validates.
export type DoneRecordReadSource = {
  readonly readBodies: typeof readDoneRecordBodiesAt;
};

export const authenticatedDoneRecordReads: DoneRecordReadSource = {
  readBodies: readDoneRecordBodiesAt,
};
