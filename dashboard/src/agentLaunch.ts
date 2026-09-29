// An agent launch: the developer asks the local launch boundary
// (`../server/agentLaunchPlugin.ts`) to start an agent host on one published
// work item, for one workflow. It requests an agent assignment -- the
// published fact Taken and Preparing already derive from -- and origin still
// decides every story fact; a launch record is only this machine's evidence
// that a host session was started. Workflows, request, host session, result,
// and record are spelled once here, with the endpoint and its limits, and no
// Node import, so the browser and the server read the same shapes. Host and
// activity values are the shared profile vocabulary.

import { z } from "zod";
import type { PublishedWork, WorkEntry } from "./publishedWork.ts";
import { readyBadge } from "./storyPreparation.ts";
import {
  agentActivities,
  agentHosts,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

type AgentActivity = (typeof agentActivities)[number];

// What a launch starts, and the one place each workflow is spelled: its
// display name, the verb its dialog uses, the skill it runs, the published
// activity whose assignment it asks for, and the note its card action carries,
// if any. The boundary, host, settlement, and card all read this table.
type LaunchWorkflowSpec = {
  readonly name: string;
  readonly verb: string;
  readonly skill: string;
  readonly activity: AgentActivity;
  readonly note: (
    entry: Pick<WorkEntry, "preparation" | "preparing">,
  ) => string | undefined;
};

export const launchWorkflows = {
  execution: {
    name: "Execution",
    verb: "execute",
    skill: "dough-execute-plan",
    activity: "execution",
    // Nothing while readiness is still being read.
    note: ({ preparation }) =>
      preparation?.status !== "loading" &&
      (preparation === undefined || readyBadge(preparation) === undefined)
        ? "Not marked Ready for execution"
        : undefined,
  },
  refinement: {
    name: "Refinement",
    verb: "refine",
    skill: "dough-story-refinement",
    activity: "preparation",
    // A refinement launched now settles at once, as the story already shows
    // the assignment it asks for.
    note: (entry) =>
      showsAssignment(entry, "preparation") ? "Being prepared" : undefined,
  },
} as const satisfies Record<string, LaunchWorkflowSpec>;

export type LaunchWorkflow = keyof typeof launchWorkflows;

// The workflows in the order a card offers them.
export const launchWorkflowNames = Object.keys(launchWorkflows) as [
  LaunchWorkflow,
  ...LaunchWorkflow[],
];

export const agentLaunchEndpoint = "/__agent-launch";

// A work item's identity and title each fit on one line of this length; a
// developer instruction may span lines up to its own bound.
export const launchTextLimit = 200;
export const launchInstructionLimit = 4_000;

const oneLine = z
  .string()
  .min(1)
  .max(launchTextLimit)
  .regex(/^[^\r\n]*$/);

export const agentLaunchRequestSchema = z.object({
  source: z.string().min(1).max(launchTextLimit),
  identity: oneLine,
  title: oneLine,
  workflow: z.enum(launchWorkflowNames),
  host: z.enum(agentHosts),
  instruction: z.string().max(launchInstructionLimit).optional(),
});

export type AgentLaunchRequest = z.infer<typeof agentLaunchRequestSchema>;

// The session a host started, as the host itself lists it: `shortId` is what
// the host's own commands (`claude attach <shortId>`) take.
export const hostSessionSchema = z.object({
  host: z.enum(agentHosts),
  sessionId: z.string().min(1),
  shortId: z.string().min(1),
  name: z.string(),
});

export type HostSession = z.infer<typeof hostSessionSchema>;

// A confirmed launch, kept only by the running server.
export const launchRecordSchema = z.object({
  request: agentLaunchRequestSchema,
  session: hostSessionSchema,
  launchedAt: z.iso.datetime(),
});

export type LaunchRecord = z.infer<typeof launchRecordSchema>;

// The latest record of one work item's workflow among a project's records,
// oldest first.
export function latestRecordOf(
  records: readonly LaunchRecord[],
  identity: string,
  workflow: LaunchWorkflow,
): LaunchRecord | undefined {
  return records.findLast(
    (record) =>
      record.request.identity === identity &&
      record.request.workflow === workflow,
  );
}

// Whether a queued entry shows a published assignment of the activity: a
// preparation assignment shows as Preparing, and an execution assignment moves
// the entry to Taken, so no queued entry shows one.
function showsAssignment(
  entry: Pick<WorkEntry, "preparing">,
  activity: AgentActivity,
): boolean {
  return activity === "preparation" && entry.preparing?.status === "recorded";
}

// Whether a launch still awaits publication in this snapshot: its work item
// is still queued and does not yet show an assignment of its workflow's
// activity. An execution launch settles once its work item is Taken or gone
// from the backlog; a published preparation assignment does not settle it,
// because the launched agent may ready a story before taking it. A refinement
// launch also settles once its work item shows Preparing.
export function launchAwaitsPublication(
  record: LaunchRecord,
  work: Pick<PublishedWork, "backlog">,
): boolean {
  const { activity } = launchWorkflows[record.request.workflow];
  return work.backlog.some(
    (entry) =>
      entry.identity === record.request.identity &&
      !showsAssignment(entry, activity),
  );
}

// Why nothing was launched.
export const launchFailureReasons = [
  "folder-not-found",
  "not-installed",
  "folder-not-trusted",
  "refused",
  "unavailable",
] as const;

// Why a launch may or may not have started a session: the launch wait
// expired, or the host exited without a session this boundary could confirm.
export const launchUncertaintyReasons = ["timed-out", "unconfirmed"] as const;

export const launchResultSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("launched"), record: launchRecordSchema }),
  z.object({
    kind: z.literal("failed"),
    reason: z.enum(launchFailureReasons),
    explanation: z.string().min(1),
  }),
  z.object({
    kind: z.literal("uncertain"),
    reason: z.enum(launchUncertaintyReasons),
    explanation: z.string().min(1),
  }),
]);

export type LaunchResult = z.infer<typeof launchResultSchema>;

// One project's launch records, as the boundary answers a GET.
export const launchRecordsSchema = z.object({
  records: z.array(launchRecordSchema),
});
