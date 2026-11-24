// This machine's kept unattached starts (`./unattachedStart.ts`), beside the
// workflows' start stores (`./startStore.ts`):
// `~/.open-dough/dashboard/session-starts.json`, resolved through `HOME`. An
// unattached session has no story, so its start is kept by its launch
// attempt, under its project id. It is written before its script runs (host,
// workspace, branch, when), then given the session the script established,
// however long after the launch stopped waiting. Continuing that attempt goes
// on in the same workspace on the same branch instead of choosing new ones.
// It is removed when its script stops, having left nothing to resume, and
// once its session started or a failure left no established session. A
// failed native launch or formatter keeps its established session for retry.
// When retention prunes its settled attempt, its start is removed too; the
// workspace and branch remain available in Git.
// Local evidence only. The file is read,
// replaced atomically, and moved aside when unreadable as
// `./machineJsonStore.ts` describes.

import { z } from "zod";
import {
  establishedSessionSchema,
  type EstablishedSession,
  type LaunchResult,
} from "../src/agentLaunch.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import {
  changeKept,
  keepIn,
  keptIn,
  removeKept,
  type ProjectStarts,
} from "./keptStarts.ts";
import type { MachineJsonStore } from "./machineJsonStore.ts";
import { machineDashboardPath } from "./machineHome.ts";
import { record } from "./startRecording.ts";

const sessionStartSchema = z.object({
  host: sessionHostSchema,
  workspace: z.string().min(1),
  branch: z.string().min(1),
  startedAt: z.iso.datetime(),
  // What the script established, once it reported.
  session: establishedSessionSchema.optional(),
});

export type SessionStart = z.infer<typeof sessionStartSchema>;

const store = (): MachineJsonStore<ProjectStarts<SessionStart>> => ({
  file: machineDashboardPath("session-starts.json"),
  schema: z.record(z.string(), z.record(z.string(), sessionStartSchema)),
  empty: {},
});

// The kept start of one attempt, or undefined when none is kept (or the file
// is unreadable, which the next write moves aside).
export const keptSessionStart = (
  sourceId: string,
  attempt: string,
): Promise<SessionStart | undefined> => keptIn(store(), sourceId, attempt);

// Writes the attempt's start, ahead of its script.
export const keepSessionStart = (
  sourceId: string,
  attempt: string,
  start: SessionStart,
): Promise<void> => keepIn(store(), sourceId, attempt, start);

// Keeps the session the attempt's script established with its start; nothing
// when that start is kept no more.
export const keepEstablishedSession = (
  sourceId: string,
  attempt: string,
  session: EstablishedSession,
): Promise<void> =>
  changeKept(store(), sourceId, attempt, (kept) => ({ ...kept, session }));

// Removes the attempt's kept start, leaving the project's others.
export const removeSessionStart = (
  sourceId: string,
  attempt: string,
): Promise<void> => removeKept(store(), sourceId, attempt);

// Settles the kept start: an uncertain attempt keeps it, as does a failed
// launch with an established session. Return that failed establishment so
// the attempt can retain its continuation evidence and explain where to resume.
export async function settleSessionStart(
  sourceId: string,
  attempt: string,
  result: LaunchResult,
): Promise<SessionStart | undefined> {
  if (result.kind === "uncertain") return undefined;
  if (result.kind === "failed") {
    const kept = await keptSessionStart(sourceId, attempt);
    if (kept?.session !== undefined) return kept;
  }
  await record(() => removeSessionStart(sourceId, attempt));
  return undefined;
}
