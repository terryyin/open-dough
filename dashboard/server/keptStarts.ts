// What this machine's start stores share (`./startStore.ts`,
// `./sessionStartStore.ts`): a document that holds each project's kept starts
// by project id and, within the project, by what keeps the start: a story's
// identity or a launch attempt, one start each. Reading, replacing, and an
// unreadable file are as `./machineJsonStore.ts` describes; a change to a
// start kept no more writes nothing.

import {
  leaveMachineJson,
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
} from "./machineJsonStore.ts";

export type ProjectStarts<Start> = Record<string, Record<string, Start>>;

type StartsStore<Start> = MachineJsonStore<ProjectStarts<Start>>;

// The start kept by `key` in the project, or undefined when none is kept (or
// the file is unreadable, which the next write moves aside).
export async function keptIn<Start>(
  store: StartsStore<Start>,
  sourceId: string,
  key: string,
): Promise<Start | undefined> {
  const read = await readMachineJson(store);
  return read.kind === "document" ? read.document[sourceId]?.[key] : undefined;
}

// Writes the start `key` keeps, replacing any it kept before.
export async function keepIn<Start>(
  store: StartsStore<Start>,
  sourceId: string,
  key: string,
  start: Start,
): Promise<void> {
  await replaceMachineJson(store, (stored) => ({
    ...stored,
    [sourceId]: { ...stored[sourceId], [key]: start },
  }));
}

// Replaces the start `key` keeps with `change` of it; nothing when none is
// kept any more.
export async function changeKept<Start>(
  store: StartsStore<Start>,
  sourceId: string,
  key: string,
  change: (kept: Start) => Start,
): Promise<void> {
  await replaceMachineJson(store, (stored) => {
    const kept = stored[sourceId]?.[key];
    return kept === undefined
      ? leaveMachineJson
      : { ...stored, [sourceId]: { ...stored[sourceId], [key]: change(kept) } };
  });
}

// Removes the start `key` keeps, leaving the project's others.
export async function removeKept<Start>(
  store: StartsStore<Start>,
  sourceId: string,
  key: string,
): Promise<void> {
  await replaceMachineJson(store, (stored) => {
    const starts = stored[sourceId];
    if (starts === undefined || !(key in starts)) return leaveMachineJson;
    const remaining = Object.fromEntries(
      Object.entries(starts).filter(([kept]) => kept !== key),
    );
    return { ...stored, [sourceId]: remaining };
  });
}
