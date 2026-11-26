// This machine's kept starts: the Start record of a workflow's launch
// (`./executionStart.ts`), one file per workflow beside the launch records
// (`./launchRecordStore.ts`): `~/.open-dough/dashboard/<workflow>-starts.json`
// (`execution-starts.json` for execution), resolved through `HOME`, so a
// story's starts of different workflows are kept apart. A file holds each catalog project's starts by project
// id and story identity, one per story. A start is written before its script
// runs (publisher, workspace, branch, model, policy, when), then updated with what the
// script reports: the established start when it published the Take, or the
// SHAs its stop's `recovery` carries. The next launch of the same story
// resumes the kept start with the same publisher, workspace, and branch
// instead of choosing new ones, so the script answers `existing` or
// `resumed`, never a second claim or workspace. The record is removed when
// the session launch succeeds, or when the start could not have published
// anything. Local evidence only, never a story fact. The file is read,
// replaced atomically, and moved aside when unreadable as
// `./machineJsonStore.ts` describes.

import { sessionHostSchema } from "../src/sessionReference.ts";
import { z } from "zod";
import {
  establishedStartSchema,
  establishedPreparationSchema,
  sessionPolicySchema,
  type LaunchRecord,
  type LaunchWorkflow,
} from "../src/agentLaunch.ts";
import {
  launchModelSchema,
  launchSettingSchema,
} from "../src/launchHostOptions.ts";
import {
  changeKept,
  keepIn,
  keptIn,
  removeKept,
  type ProjectStarts,
} from "./keptStarts.ts";
import { readMachineJson, type MachineJsonStore } from "./machineJsonStore.ts";
import { machineDocumentAt } from "./machineHome.ts";

export const startRecordSchema = z.object({
  identity: z.string().min(1),
  host: sessionHostSchema.default("claude"),
  // An execution's; a refinement's preparation has no publisher.
  publisherId: z.string().min(1).optional(),
  workspace: z.string().min(1),
  branch: z.string().min(1),
  model: launchModelSchema.optional(),
  effort: launchSettingSchema.optional(),
  // The policy the start was asked for, absent for the default: a resumed
  // start keeps it, whatever a later launch asks.
  policy: sessionPolicySchema.optional(),
  startedAt: z.iso.datetime(),
  // A stop's `recovery`: what a resume passes back to the script.
  startingRevision: z.string().min(1).optional(),
  candidateSha: z.string().min(1).optional(),
  // The script's accepted result, once it reported one.
  start: establishedStartSchema.optional(),
  preparation: establishedPreparationSchema.optional(),
  // A preparation stop explicitly verified no announcement was accepted.
  preparationUnannounced: z.boolean().optional(),
});

export type StartRecord = z.infer<typeof startRecordSchema>;

const storeSchema = z.record(
  z.string(),
  z.record(z.string(), startRecordSchema),
);

// The workflows whose Start is kept here, and the default of every function
// below: the one workflow whose file existed first.
export type StartsWorkflow = Extract<
  LaunchWorkflow,
  "execution" | "refinement"
>;

function startDocument(
  workflow: StartsWorkflow,
  home?: string,
): MachineJsonStore<ProjectStarts<StartRecord>> {
  return {
    file: machineDocumentAt(`${workflow}-starts.json`, home),
    schema: storeSchema,
    empty: {},
  };
}

type NewStartRecord = Omit<StartRecord, "host"> & {
  readonly host?: StartRecord["host"];
};

export type StartStore = {
  kept(sourceId: string, identity: string): Promise<StartRecord | undefined>;
  keep(sourceId: string, start: NewStartRecord): Promise<void>;
  update(
    sourceId: string,
    identity: string,
    change: Partial<StartRecord>,
  ): Promise<void>;
  remove(sourceId: string, identity: string): Promise<void>;
};

// The machine's kept starts for one workflow, bound to its document.
export function startStore(
  workflow: StartsWorkflow,
  home?: string,
): StartStore {
  const document = startDocument(workflow, home);
  return {
    kept: (sourceId, identity) => keptIn(document, sourceId, identity),
    keep: (sourceId, start) =>
      keepIn(document, sourceId, start.identity, {
        ...start,
        host: start.host ?? "claude",
      }),
    update: (sourceId, identity, change) =>
      changeKept(document, sourceId, identity, (kept) => ({
        ...kept,
        ...change,
      })),
    remove: (sourceId, identity) => removeKept(document, sourceId, identity),
  };
}

// The kept start of one story, or undefined when none is kept (or the file is
// unreadable, which the next write moves aside).
export const keptStart = (
  sourceId: string,
  identity: string,
  workflow: StartsWorkflow = "execution",
): Promise<StartRecord | undefined> =>
  startStore(workflow).kept(sourceId, identity);

// Every project's kept starts, by project id.
export async function keptStartsByProject(
  workflow: StartsWorkflow = "execution",
): Promise<ReadonlyMap<string, readonly StartRecord[]>> {
  const read = await readMachineJson(startDocument(workflow));
  return new Map(
    read.kind === "document"
      ? Object.entries(read.document).map(([id, starts]) => [
          id,
          Object.values(starts),
        ])
      : [],
  );
}

// Removes the story's kept start whose established facts the launched
// session's record holds: once its session is recorded, the start is spent.
export async function removeLaunchedStart(
  sourceId: string,
  record: LaunchRecord,
): Promise<void> {
  const facts = record.start ?? record.preparation;
  if (facts !== undefined && record.request.workflow !== "ad-hoc")
    await startStore(record.request.workflow).remove(sourceId, facts.identity);
}

// The script arguments that resume a kept start's retained claim commit, when
// a stop kept both SHAs and no result has been reported since; none otherwise
// (a rerun then answers `existing`).
export function resumeArguments(kept: StartRecord): string[] {
  return kept.start === undefined &&
    kept.startingRevision !== undefined &&
    kept.candidateSha !== undefined
    ? [
        "--starting-revision",
        kept.startingRevision,
        "--candidate-sha",
        kept.candidateSha,
      ]
    : [];
}
