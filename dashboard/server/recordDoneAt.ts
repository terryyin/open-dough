// Owns the durable Done mark and starts evidence capture for a new mark.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { keptWithDoneCapture } from "./doneCapture.ts";
import {
  type DoneTransitionOptions,
  doneTransition,
} from "./doneTransition.ts";
import { changeSessionRecord, keptSession } from "./launchRecordStore.ts";
import {
  type BranchCapture,
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
  options: Omit<DoneTransitionOptions, "candidate"> & {
    // Reads the branch result before the record write; production's
    // Git-only capture by default.
    readonly capture?: BranchCapture;
  } = {},
): Promise<LaunchRecord | undefined> {
  const { capture, ...transition } = options;
  // A write that keeps the Done time it expects finishes that Done.
  const finishing = transition.expectedDoneAt === doneAt;
  const candidate =
    doneAt !== undefined && !finishing
      ? await keptSession(sourceId, session)
      : undefined;
  const marked = await withBranchResultAtDone(
    candidate,
    finishing ? undefined : doneAt,
    (settle) =>
      changeSessionRecord(sourceId, session, (record) => {
        const next = doneTransition(record, doneAt, new Date().toISOString(), {
          ...transition,
          candidate,
        });
        return next === record || doneAt === undefined ? next : settle(next);
      }),
    capture,
  );
  if (doneAt === undefined || marked?.doneAt !== doneAt || finishing)
    return marked;
  return keptWithDoneCapture(sourceId, marked);
}
