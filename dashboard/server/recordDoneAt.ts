// Owns the durable Done mark and retains any branch delivery evidence.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import {
  type DoneTransitionOptions,
  doneTransition,
} from "./doneTransition.ts";
import {
  changeSessionRecord,
  keptSession,
  machineRecordStore,
  type LaunchRecordStore,
} from "./launchRecordStore.ts";
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
    readonly store?: LaunchRecordStore;
  } = {},
): Promise<LaunchRecord | undefined> {
  const { capture, store = machineRecordStore, ...transition } = options;
  // A write that keeps the Done time it expects finishes that Done.
  const finishing = transition.expectedDoneAt === doneAt;
  const candidate =
    doneAt !== undefined && !finishing
      ? await keptSession(sourceId, session, store)
      : undefined;
  return withBranchResultAtDone(
    candidate,
    finishing ? undefined : doneAt,
    (settle) =>
      changeSessionRecord(
        sourceId,
        session,
        (record) => {
          const next = doneTransition(
            record,
            doneAt,
            new Date().toISOString(),
            {
              ...transition,
              candidate,
            },
          );
          return next === record || doneAt === undefined ? next : settle(next);
        },
        undefined,
        store,
      ),
    capture,
  );
}
