// Decides a kept record's next Done state as plain values.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { doneAutomatically } from "../src/completionReport.ts";
import { hasBranchReview } from "./sessionBranchCapture.ts";

export type DoneTransitionOptions = {
  readonly doneProblem?: string | undefined;
  // The Done time the change expects to find; another one refuses it.
  readonly expectedDoneAt?: string | undefined;
  // An automatic Done applies only while the record still allows one.
  readonly automatic?: boolean | undefined;
  // The record the branch capture read; a branch-review record changed since
  // refuses the change.
  readonly candidate?: LaunchRecord | undefined;
};

// Answers `record` marked Done at `doneAt`, or cleared when `doneAt` is
// undefined, its disposition changed at `now`; or `record` itself when the
// change is refused.
export function doneTransition(
  record: LaunchRecord,
  doneAt: string | undefined,
  now: string,
  options: DoneTransitionOptions = {},
): LaunchRecord {
  if (refused(record, options)) return record;
  const next: LaunchRecord = {
    ...record,
    dispositionChangedAt: options.automatic ? record.dispositionChangedAt : now,
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
}

function refused(
  record: LaunchRecord,
  { automatic, expectedDoneAt, candidate }: DoneTransitionOptions,
): boolean {
  if (automatic && !doneAutomatically(record)) return true;
  if (expectedDoneAt !== undefined && record.doneAt !== expectedDoneAt)
    return true;
  return (
    candidate !== undefined &&
    hasBranchReview(record) &&
    (record.doneAt !== candidate.doneAt ||
      record.dispositionChangedAt !== candidate.dispositionChangedAt ||
      record.branchEntry?.committedTip !== candidate.branchEntry?.committedTip)
  );
}
