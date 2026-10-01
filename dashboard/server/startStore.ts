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
// anything. Local evidence only, never a story fact. The file is read afresh,
// replaced atomically, and moved aside when unreadable as
// `./machineJsonStore.ts` describes.

import { homedir } from "node:os";
import path from "node:path";
import { sessionHostSchema } from "../src/sessionReference.ts";
import { z } from "zod";
import {
  establishedStartSchema,
  establishedPreparationSchema,
  sessionPolicySchema,
  type LaunchWorkflow,
} from "../src/agentLaunch.ts";
import { launchModelAliases } from "../src/hostDescription.ts";
import {
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
} from "./machineJsonStore.ts";

export const startRecordSchema = z.object({
  identity: z.string().min(1),
  host: sessionHostSchema.default("claude"),
  // An execution's; a refinement's preparation has no publisher.
  publisherId: z.string().min(1).optional(),
  workspace: z.string().min(1),
  branch: z.string().min(1),
  model: z.enum(launchModelAliases).optional(),
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

type StoredStarts = z.infer<typeof storeSchema>;

// The workflows whose Start is kept here, and the default of every function
// below: the one workflow whose file existed first.
export type StartsWorkflow = Extract<
  LaunchWorkflow,
  "execution" | "refinement"
>;

function startStore(workflow: StartsWorkflow): MachineJsonStore<StoredStarts> {
  return {
    file: path.join(
      homedir(),
      ".open-dough",
      "dashboard",
      `${workflow}-starts.json`,
    ),
    schema: storeSchema,
    empty: {},
  };
}

// The kept start of one story, or undefined when none is kept (or the file is
// unreadable, which the next write moves aside).
export async function keptStart(
  sourceId: string,
  identity: string,
  workflow: StartsWorkflow = "execution",
): Promise<StartRecord | undefined> {
  const read = await readMachineJson(startStore(workflow));
  return read.kind === "document"
    ? read.document[sourceId]?.[identity]
    : undefined;
}

// Every project's kept starts, by project id.
export async function keptStartsByProject(
  workflow: StartsWorkflow = "execution",
): Promise<ReadonlyMap<string, readonly StartRecord[]>> {
  const read = await readMachineJson(startStore(workflow));
  return new Map(
    read.kind === "document"
      ? Object.entries(read.document).map(([id, starts]) => [
          id,
          Object.values(starts),
        ])
      : [],
  );
}

// Writes a start ahead of its script, replacing any kept start of the story.
export async function keepStart(
  sourceId: string,
  record: Omit<StartRecord, "host"> & { readonly host?: StartRecord["host"] },
  workflow: StartsWorkflow = "execution",
): Promise<void> {
  await replaceMachineJson(startStore(workflow), (stored) => ({
    ...stored,
    [sourceId]: {
      ...stored[sourceId],
      [record.identity]: { ...record, host: record.host ?? "claude" },
    },
  }));
}

// Merges what the script reported into the story's kept start; nothing when
// none is kept any more.
export async function updateStart(
  sourceId: string,
  identity: string,
  change: Partial<StartRecord>,
  workflow: StartsWorkflow = "execution",
): Promise<void> {
  await replaceMachineJson(startStore(workflow), (stored) => {
    const kept = stored[sourceId]?.[identity];
    return kept === undefined
      ? stored
      : {
          ...stored,
          [sourceId]: {
            ...stored[sourceId],
            [identity]: { ...kept, ...change },
          },
        };
  });
}

// Removes the story's kept start, leaving the project's others.
export async function removeStart(
  sourceId: string,
  identity: string,
  workflow: StartsWorkflow = "execution",
): Promise<void> {
  await replaceMachineJson(startStore(workflow), (stored) => {
    const starts = stored[sourceId];
    if (starts === undefined || !(identity in starts)) {
      return stored;
    }
    const remaining = Object.fromEntries(
      Object.entries(starts).filter(([kept]) => kept !== identity),
    );
    return { ...stored, [sourceId]: remaining };
  });
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
