// An agent launch: the developer asks the local launch boundary
// (`../server/agentLaunchPlugin.ts`) to start an agent host on one published
// work item, for one workflow. It requests an agent assignment -- the
// published fact Taken and Preparing already derive from -- and origin still
// decides every story fact; a launch record is only this machine's evidence
// that a host session was started. Workflows, request, host session, result,
// and record are spelled once here, with the endpoint and its limits, and no
// Node import, so the browser and the server read the same shapes. Host
// values are the shared profile vocabulary.

import { creationViewSchema } from "./launchCreation.ts";
import { hostOperationsSchema } from "./sessionCapabilities.ts";
import { sessionHostSchema } from "./sessionReference.ts";
import { z } from "zod";
import { offeredShapeSchema } from "./commandOptions.ts";
import { sessionPolicySchema } from "./launchRequest.ts";
import { attemptObservationSchema } from "./launchOutcome.ts";
import { sessionShown } from "./sessionShown.ts";
import {
  launchSubject,
  launchWorkflowNames,
  startPhases,
} from "./launchWorkflow.ts";
import { launchModelAliases } from "./hostDescription.ts";
import {
  launchWithStateSchema,
  type LaunchRecord,
  type LaunchWithState,
} from "./launchRecord.ts";
export * from "./launchWorkflow.ts";
export * from "./launchRequest.ts";
export * from "./launchRecord.ts";
export * from "./launchOutcome.ts";

// One project's launch records among the machine's sessions, oldest first,
// or undefined while the machine's sessions are not yet read.
export function projectSessionsOf(
  records: readonly LaunchWithState[] | undefined,
  sourceId: string,
): readonly LaunchWithState[] | undefined {
  return records?.filter((record) => record.request.source === sourceId);
}

// Whether a session is still open: not marked done.
const isOpen = (record: LaunchRecord) => record.doneAt === undefined;

// The sessions a story's card lists, oldest first, in whatever stage origin
// shows the story: every launch record of the project's work item that has
// not been marked done. Identities are unique only within a project. Neither
// the story's stage nor its session's state or age removes one.
export function cardSessionsOf(
  records: readonly LaunchWithState[] | undefined,
  sourceId: string,
  identity: string,
): readonly LaunchWithState[] {
  return (projectSessionsOf(records, sourceId) ?? []).filter(
    (record) =>
      launchSubject(record.request).identity === identity && isOpen(record),
  );
}

// The sessions still open in every project, by the cards' rule, those that
// need the developer first, earliest launch first, then every other one,
// newest launch first, so a state change moves a session between the two
// groups; or undefined while the machine's sessions are not yet read.
export function openSessionsOf(
  records: readonly LaunchWithState[] | undefined,
): readonly LaunchWithState[] | undefined {
  const launchedAt = (record: LaunchRecord) => Date.parse(record.launchedAt);
  const open = records?.filter(isOpen);
  const needs = (record: LaunchWithState) =>
    sessionShown(record).needsAttention;
  return (
    open && [
      ...open.filter(needs).toSorted((a, b) => launchedAt(a) - launchedAt(b)),
      ...open
        .filter((record) => !needs(record))
        .toSorted((a, b) => launchedAt(b) - launchedAt(a)),
    ]
  );
}

// Whether the boundary can raise its macOS notifications
// (`../server/sessionAlerts.ts`): the outcome of the latest `osascript` it
// ran, with one fixed sentence of why not.
export const alertsSchema = z.discriminatedUnion("available", [
  z.object({ available: z.literal(true) }),
  z.object({ available: z.literal(false), reason: z.string().min(1) }),
]);

export type Alerts = z.infer<typeof alertsSchema>;

// A start this machine keeps whose session did not start
// (`../server/startStore.ts`): the workflow, the project, the story, the
// workspace as the page shows a project's folders, and the Agent the start's
// claim names when it reported one.
export const keptStartSchema = z.object({
  host: sessionHostSchema.default("claude"),
  model: z.enum(launchModelAliases).optional(),
  workflow: z.enum(launchWorkflowNames),
  source: z.string().min(1),
  identity: z.string().min(1),
  workspace: z.string().min(1),
  agent: z.string().min(1).optional(),
  // The kept start's policy, absent for the default.
  policy: sessionPolicySchema.optional(),
});

export type KeptStart = z.infer<typeof keptStartSchema>;

// A start running in the boundary's server now: the workflow, the project, the
// story, selected host, and the phase it is in. A start kept in the store
// with no running process is a kept start, never a running one.
export const runningStartSchema = z.object({
  host: sessionHostSchema,
  workflow: z.enum(launchWorkflowNames),
  source: z.string().min(1),
  identity: z.string().min(1),
  phase: z.enum(startPhases),
});

export type RunningStart = z.infer<typeof runningStartSchema>;

// What a card says beside its Start while this machine keeps the start that
// took or prepared the story and no session was started from it.
export const keptStartNote = "Started here, no session yet";

// The options a project's installed skill offers for one workflow's launch,
// read from its definition at each read of the machine's sessions, or why the
// project has no usable definition for it (the boundary's words, which finish
// "the installed <skill> skill in this project").
export const offeredDefinitionSchema = z.union([
  offeredShapeSchema.extend({
    source: z.string().min(1),
    workflow: z.enum(launchWorkflowNames),
    host: sessionHostSchema.default("claude"),
  }),
  z.object({
    source: z.string().min(1),
    workflow: z.enum(launchWorkflowNames),
    host: sessionHostSchema.default("claude"),
    unavailable: z.string().min(1),
  }),
]);

export type OfferedDefinition = z.infer<typeof offeredDefinitionSchema>;

// The machine's sessions, as the boundary answers a GET: every catalog
// project's launch records, each naming its project and joined with its
// session's current state, whether alerts can be raised, the projects
// whose installed skill establishes a start (the claim and workspace) when
// Start execution is pressed, by project id, the projects whose installed
// skill establishes a preparation when Start refinement is pressed, the starts
// kept without a session, the starts running now with their phases, the
// options each project offers, and the launch attempts this machine accepted,
// with whether its kept attempts could be read (when not, an earlier startup
// may be unresolved and nothing tells which).
export const launchRecordsSchema = z.object({
  // Missing or unread capabilities never borrow an operation from another host.
  hostOperations: hostOperationsSchema.default({}),
  attempts: z.array(attemptObservationSchema).default([]),
  attemptsReadable: z.boolean().default(true),
  records: z.array(launchWithStateSchema),
  creations: z.array(creationViewSchema).default([]),
  alerts: alertsSchema,
  establishing: z.array(z.string()),
  establishingPreparation: z.array(z.string()),
  keptStarts: z.array(keptStartSchema),
  starts: z.array(runningStartSchema),
  definitions: z.array(offeredDefinitionSchema),
  establishingHosts: z
    .array(
      z.object({
        source: z.string(),
        workflow: z.enum(launchWorkflowNames),
        host: sessionHostSchema,
      }),
    )
    .default([]),
  // The projects, workflows, and hosts whose installed skills take the shared
  // session policy at their start.
  sessionPolicies: z
    .array(
      z.object({
        source: z.string(),
        workflow: z.enum(launchWorkflowNames),
        host: sessionHostSchema,
      }),
    )
    .default([]),
});

export type MachineAnswer = z.infer<typeof launchRecordsSchema>;
