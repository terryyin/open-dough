// Done owns what a session's record keeps at Done: the mark itself and, for
// a Default main session, the commits it made in its checkout
// (`./sessionCommitsCapture.ts`).
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { doneAutomatically } from "../src/completionReport.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { changeSessionRecord } from "./launchRecordStore.ts";
import {
  captureSessionCommits,
  defaultMainStart,
} from "./sessionCommitsCapture.ts";

// A new Done reads the session's commits anew, once, replacing an earlier
// capture: when a set Done time is written, or, for a reported Done, whose
// time its report wrote, when its native continuation starts. A failed read
// keeps Done and leaves no capture; a Done cleared or changed meanwhile keeps
// what it has.
export async function keptWithSessionCommits(
  sourceId: string,
  marked: LaunchRecord,
): Promise<LaunchRecord> {
  const start = defaultMainStart(marked);
  if (start === undefined) return marked;
  const captured = await captureSessionCommits(marked, start).catch(
    () => undefined,
  );
  return (
    (await changeSessionRecord(sourceId, marked.session, (record) => {
      if (record.doneAt !== marked.doneAt) return record;
      const next: LaunchRecord = { ...record };
      delete next.sessionCommits;
      return captured === undefined
        ? next
        : { ...next, sessionCommits: captured };
    })) ?? marked
  );
}

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
  return keptWithSessionCommits(sourceId, marked);
}
