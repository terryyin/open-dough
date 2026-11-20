// Owns the durable Done mark and starts evidence capture for a new mark.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { doneAutomatically } from "../src/completionReport.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { keptWithDoneCapture } from "./doneCapture.ts";
import type { runGit } from "./gitRunner.ts";
import { changeSessionRecord, keptSession } from "./launchRecordStore.ts";
import {
  hasBranchReview,
  withBranchResultAtDone,
} from "./sessionBranchCapture.ts";

// Sets one kept session's done time to `doneAt`, marking it done, or clears
// it when `doneAt` is undefined, keeping the session like any unclosed one.
// Answers the changed record, or undefined when no such record is kept any
// more.
export async function setRecordDoneAt(
  sourceId: string,
  session: SessionReference,
  doneAt: string | undefined,
  options: {
    readonly doneProblem?: string;
    readonly expectedDoneAt?: string;
    readonly automatic?: boolean;
    // The branch capture's ancestry read, between its workspace read and
    // the record write.
    readonly readAncestry?: typeof runGit;
  } = {},
): Promise<LaunchRecord | undefined> {
  // A write that keeps the Done time it expects finishes that Done.
  const finishing = options.expectedDoneAt === doneAt;
  const candidate =
    doneAt !== undefined && !finishing
      ? await keptSession(sourceId, session)
      : undefined;
  const marked = await withBranchResultAtDone(
    candidate,
    finishing ? undefined : doneAt,
    (settle) =>
      changeSessionRecord(sourceId, session, (record) => {
        if (options.automatic && !doneAutomatically(record)) return record;
        if (
          options.expectedDoneAt !== undefined &&
          record.doneAt !== options.expectedDoneAt
        ) {
          return record;
        }
        if (
          candidate !== undefined &&
          hasBranchReview(record) &&
          (record.doneAt !== candidate.doneAt ||
            record.dispositionChangedAt !== candidate.dispositionChangedAt ||
            record.branchEntry?.committedTip !==
              candidate.branchEntry?.committedTip)
        ) {
          return record;
        }
        const next: LaunchRecord = {
          ...record,
          dispositionChangedAt: options.automatic
            ? record.dispositionChangedAt
            : new Date().toISOString(),
        };
        delete next.doneAt;
        delete next.doneProblem;
        return doneAt === undefined
          ? next
          : settle({
              ...next,
              doneAt,
              ...(options.doneProblem === undefined
                ? {}
                : { doneProblem: options.doneProblem }),
            });
      }),
    options.readAncestry,
  );
  if (doneAt === undefined || marked?.doneAt !== doneAt || finishing)
    return marked;
  return keptWithDoneCapture(sourceId, marked);
}
