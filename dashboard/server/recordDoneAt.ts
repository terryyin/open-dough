// Owns the durable Done mark and starts evidence capture for a new mark.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { keptWithDoneCapture } from "./doneCapture.ts";
import { prepareDoneStory } from "./doneStoryAtMark.ts";
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

type DoneOptions = Omit<DoneTransitionOptions, "candidate"> & {
  readonly capture?: BranchCapture;
  readonly store?: LaunchRecordStore;
};

// Sets or clears a mark, answering the kept record after the write.
export async function setRecordDoneAt(
  sourceId: string,
  session: SessionReference,
  doneAt: string | undefined,
  options: DoneOptions = {},
): Promise<LaunchRecord | undefined> {
  return (await writeDoneAt(sourceId, session, doneAt, options)).record;
}

// Starting manual Done may reuse an active mark, while still taking over a
// reported native operation or retrying an unconfirmed one.
export function startRecordDone(
  sourceId: string,
  session: SessionReference,
  capture?: BranchCapture,
) {
  return writeDoneAt(sourceId, session, new Date().toISOString(), {
    ...(capture === undefined ? {} : { capture }),
    keepActiveMark: true,
  });
}

async function writeDoneAt(
  sourceId: string,
  session: SessionReference,
  doneAt: string | undefined,
  options: DoneOptions & { readonly keepActiveMark?: boolean },
) {
  const { keepActiveMark, ...requested } = options;
  const { capture, store = machineRecordStore, ...transition } = requested;
  // A write that keeps the Done time it expects finishes that Done.
  const finishing = transition.expectedDoneAt === doneAt;
  const candidate =
    doneAt !== undefined && !finishing
      ? await keptSession(sourceId, session, store)
      : undefined;
  const attachStory = await prepareDoneStory(candidate);
  const markTime = (record: LaunchRecord | undefined) =>
    keepActiveMark && record?.doneStory?.kind === "originating"
      ? (record.doneAt ?? doneAt)
      : doneAt;
  const write = { applied: false };
  const marked = await withBranchResultAtDone(
    candidate,
    finishing ? undefined : markTime(candidate),
    (settle) =>
      changeSessionRecord(
        sourceId,
        session,
        async (record) => {
          const next = doneTransition(
            record,
            markTime(record),
            new Date().toISOString(),
            {
              ...transition,
              candidate,
            },
          );
          if (next === record) return record;
          write.applied = true;
          return doneAt === undefined ? next : settle(attachStory(next));
        },
        undefined,
        store,
      ),
    capture,
  );
  if (
    doneAt === undefined ||
    marked === undefined ||
    finishing ||
    !write.applied
  )
    return { record: marked, applied: write.applied };
  const captured = await keptWithDoneCapture(sourceId, marked, store);
  return {
    record: captured,
    applied:
      captured?.doneAt === marked.doneAt &&
      captured?.dispositionChangedAt === marked.dispositionChangedAt,
  };
}
