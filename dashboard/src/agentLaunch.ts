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

// How many days this machine keeps a confirmed launch's record.
export const launchRetentionDays = 30;

// A confirmed launch, kept on this machine for `launchRetentionDays`, with
// when the developer marked its session done (`./doneMark.ts`), if they did:
// local evidence only, never a story fact.
export const launchRecordSchema = z.object({
  request: agentLaunchRequestSchema,
  session: hostSessionSchema,
  launchedAt: z.iso.datetime(),
  doneAt: z.iso.datetime().optional(),
});

export type LaunchRecord = z.infer<typeof launchRecordSchema>;

// A recorded session as the host lists it at the moment of asking, never
// stored: `listed` with the host's `state` and, only while its process runs,
// its `status`; `unlisted` once the host no longer lists it; `unknown` when
// the host's listing could not be read.
export const sessionStateSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("listed"),
    state: z.string(),
    status: z.string().optional(),
  }),
  z.object({ kind: z.literal("unlisted") }),
  z.object({ kind: z.literal("unknown") }),
]);

export type SessionState = z.infer<typeof sessionStateSchema>;

// Whether a session offers Open terminal: for every session the host still
// lists, and while its listing is unknown, since the session may still be
// there.
export function attachOpens(sessionState: SessionState): boolean {
  return sessionState.kind !== "unlisted";
}

// A kept launch record joined with its session's state when it was answered;
// the state itself is never kept.
export const launchWithStateSchema = launchRecordSchema.extend({
  sessionState: sessionStateSchema,
});

export type LaunchWithState = z.infer<typeof launchWithStateSchema>;

// The latest record of one work item's workflow among a project's records,
// oldest first.
export function latestRecordOf(
  records: readonly LaunchWithState[],
  identity: string,
  workflow: LaunchWorkflow,
): LaunchWithState | undefined {
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

// Whether the host lists a session as running: it gives a status only while
// the process runs, so a session listed without one has exited.
export function sessionRuns(sessionState: SessionState): boolean {
  return sessionState.kind === "listed" && sessionState.status !== undefined;
}

// Whether a session may still run: the host lists it as running, or its
// listing could not be read. One no longer listed is gone.
function sessionMayRun(sessionState: SessionState): boolean {
  return sessionState.kind === "unknown" || sessionRuns(sessionState);
}

// Whether a launch still awaits publication in this snapshot: its session may
// still run, and its work item is still queued and does not yet show an
// assignment of its workflow's activity. An execution launch settles once its
// work item is Taken or gone from the backlog; a published preparation
// assignment does not settle it, because the launched agent may ready a story
// before taking it. A refinement launch also settles once its work item shows
// Preparing. Any launch settles once its session has exited or is no longer
// listed, since nothing it started can publish the assignment any more.
export function launchAwaitsPublication(
  record: Pick<LaunchWithState, "request" | "sessionState">,
  work: Pick<PublishedWork, "backlog">,
): boolean {
  const { activity } = launchWorkflows[record.request.workflow];
  return (
    sessionMayRun(record.sessionState) &&
    work.backlog.some(
      (entry) =>
        entry.identity === record.request.identity &&
        !showsAssignment(entry, activity),
    )
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
  // The record kept, with its session as the host listed it when confirming
  // the launch.
  z.object({ kind: z.literal("launched"), record: launchWithStateSchema }),
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

// One project's launch records, as the boundary answers a GET, each joined
// with its session's current state.
export const launchRecordsSchema = z.object({
  records: z.array(launchWithStateSchema),
});
