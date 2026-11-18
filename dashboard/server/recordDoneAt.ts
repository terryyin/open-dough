// Owns the durable Done mark and starts evidence capture for a new mark.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { doneAutomatically } from "../src/completionReport.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { keptWithDoneCapture } from "./doneCapture.ts";
import { changeSessionRecord } from "./launchRecordStore.ts";

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
  } = {},
): Promise<LaunchRecord | undefined> {
  const marked = await changeSessionRecord(sourceId, session, (record) => {
    if (options.automatic && !doneAutomatically(record)) return record;
    if (
      options.expectedDoneAt !== undefined &&
      record.doneAt !== options.expectedDoneAt
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
      : {
          ...next,
          doneAt,
          ...(options.doneProblem === undefined
            ? {}
            : { doneProblem: options.doneProblem }),
        };
  });
  // A write that keeps the Done time it expects finishes that Done.
  const finishing = options.expectedDoneAt === doneAt;
  if (doneAt === undefined || marked?.doneAt !== doneAt || finishing)
    return marked;
  return keptWithDoneCapture(sourceId, marked);
}
