// An agent launch: the developer asks the local launch boundary
// (`../server/agentLaunchPlugin.ts`) to start an agent host on one published
// work item, for one workflow. It requests an agent assignment -- the
// published fact Taken and Preparing already derive from -- and origin still
// decides every story fact; a launch record is only this machine's evidence
// that a host session was started. Workflows, request, host session, result,
// and record are spelled once here, with the endpoint and its limits, and no
// Node import, so the browser and the server read the same shapes. Host
// values are the shared profile vocabulary.

import { z } from "zod";
import type { WorkEntry } from "./publishedWork.ts";
import { sessionShown } from "./sessionShown.ts";
import { readyBadge } from "./storyPreparation.ts";
import { agentHosts } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

// What a launch starts, and the one place each workflow is spelled: its
// display name, the verb its dialog uses, the skill it runs, what its card
// says while the launch request is pending, what a project whose installed
// skill establishes a start (a claim and workspace) has its dialog and card
// say instead, and the note its card action carries, if any. The boundary,
// host, and card all read this table.
type LaunchWorkflowSpec = {
  readonly name: string;
  readonly verb: string;
  readonly skill: string;
  readonly pending: string;
  // In a project whose installed skill establishes the workflow's start: the
  // sentence its dialog adds and what its card says while the request is
  // pending.
  readonly establishes: {
    readonly sentence: string;
    readonly pending: string;
    // What the dialog says instead of `sentence` when the start is kept.
    readonly published: string;
  };
  readonly note: (
    entry: Pick<WorkEntry, "preparation" | "preparing">,
  ) => string | undefined;
};

export const launchWorkflows = {
  execution: {
    name: "Execution",
    verb: "execute",
    skill: "dough-execute-plan",
    pending: "Starting execution in Claude Code…",
    establishes: {
      sentence:
        "Start also publishes this story's Take to the project's trunk on origin and creates a workspace under the project folder's .worktrees/; pressing Start authorizes that push.",
      pending: "Preparing execution…",
      published:
        "This story's Take is already published on origin, so Start publishes no second Take.",
    },
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
    pending: "Starting refinement in Claude Code…",
    establishes: {
      sentence:
        "Start also publishes this story's Preparing announcement to the project's trunk on origin and creates a workspace under the project folder's .worktrees/; pressing Start authorizes that push.",
      pending: "Preparing refinement…",
      published:
        "This story's Preparing announcement is already published on origin, so Start publishes no second one.",
    },
    note: ({ preparing }) =>
      preparing?.status === "recorded" ? "Being prepared" : undefined,
  },
} as const satisfies Record<string, LaunchWorkflowSpec>;

export type LaunchWorkflow = keyof typeof launchWorkflows;

// The workflows in the order a card offers them.
export const launchWorkflowNames = Object.keys(launchWorkflows) as [
  LaunchWorkflow,
  ...LaunchWorkflow[],
];

// The phases of a workflow's start the server runs, in order, and the words
// a card says for each: the script that fetches, makes the workspace and
// publishes the Take or Preparing announcement is running (`preparing`), then
// the script established the start and Claude Code is launching the session
// (`launching`). Each is the one entry of `launchWorkflows` that says it,
// spelled once.
export const startPhases = ["preparing", "launching"] as const;

export type StartPhase = (typeof startPhases)[number];

export function startPhaseWords(
  workflow: LaunchWorkflow,
  phase: StartPhase,
): string {
  const spec = launchWorkflows[workflow];
  return phase === "preparing" ? spec.establishes.pending : spec.pending;
}

// The models a launch may ask Claude Code for, and the one place each alias
// is spelled: the alias `--model` takes and its display name, in the order a
// dialog offers them. Default is no `model` at all: Claude Code's own setting
// applies.
export const launchModels = {
  fable: { name: "Fable" },
  opus: { name: "Opus" },
  sonnet: { name: "Sonnet" },
} as const satisfies Record<string, { readonly name: string }>;

export type LaunchModel = keyof typeof launchModels;

export const launchModelAliases = Object.keys(launchModels) as [
  LaunchModel,
  ...LaunchModel[],
];

// The name of the session a project's actions row starts: no story, no skill.
export const adHocName = "Ad hoc";

// The name of a request's kind, as a story workflow or ad hoc.
export function launchKindName(workflow: LaunchWorkflow | "ad-hoc"): string {
  return workflow === "ad-hoc" ? adHocName : launchWorkflows[workflow].name;
}

// What a consumer of a launch record needs of its request, spelled once: the
// title, the work item's identity (none when the request has no card to look
// up), the kind's name, how its session is said to have started, and the
// model it asked for (none for Default).
export function launchSubject(request: RecordedLaunchRequest) {
  const name = launchKindName(request.workflow);
  return {
    title: request.title,
    identity: request.workflow === "ad-hoc" ? undefined : request.identity,
    name,
    startedWords: `${
      request.workflow === "ad-hoc" ? `${name} session` : name
    } started in Claude Code`,
    modelWords:
      request.model === undefined
        ? undefined
        : `Model: ${launchModels[request.model].name} (requested)`,
  };
}

// Where a launch's session runs, for a launch whose start or preparation
// established a workspace: the folder as the page shows a project's,
// `~/git/<project id>`, then the workspace under it
// (`~/git/open-dough/.worktrees/<slug>`), never the machine's home directory.
// Undefined when nothing was established.
export function workspaceWords(
  request: RecordedLaunchRequest,
  established: EstablishedPreparation | undefined,
): string | undefined {
  if (established === undefined) return undefined;
  const marker = "/.worktrees/";
  const at = established.workspace.lastIndexOf(marker);
  return `Workspace ${
    at < 0
      ? established.workspace
      : `~/git/${request.source}${established.workspace.slice(at)}`
  }`;
}

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

// What either kind of request carries beside its subject: the developer's own
// instruction and the model asked for, if any.
const launchOptions = {
  instruction: z.string().max(launchInstructionLimit).optional(),
  model: z.enum(launchModelAliases).optional(),
};

const storyLaunchRequestSchema = z.object({
  source: z.string().min(1).max(launchTextLimit),
  identity: oneLine,
  title: oneLine,
  workflow: z.enum(launchWorkflowNames),
  host: z.enum(agentHosts),
  ...launchOptions,
});

// A session in a project with no story or skill: the request carries no
// title or identity, since the server derives the label
// (`../server/claudeLaunch.ts`), and one naming an identity is refused.
const adHocLaunchRequestSchema = z.strictObject({
  source: z.string().min(1).max(launchTextLimit),
  workflow: z.literal("ad-hoc"),
  host: z.enum(agentHosts),
  ...launchOptions,
});

export const agentLaunchRequestSchema = z.discriminatedUnion("workflow", [
  storyLaunchRequestSchema,
  adHocLaunchRequestSchema,
]);

export type StoryLaunchRequest = z.infer<typeof storyLaunchRequestSchema>;
export type AgentLaunchRequest = z.infer<typeof agentLaunchRequestSchema>;

// What a launch dialog hands its caller: the developer's choices among the
// request's options, as typed, before the request trims and omits them.
export type LaunchChoices = {
  readonly instruction: NonNullable<StoryLaunchRequest["instruction"]>;
  // Absent for Default: Claude Code's own setting applies.
  readonly model?: LaunchModel;
};

// The request a record keeps: an ad hoc one with the label the server
// derived as its title.
const recordedLaunchRequestSchema = z.discriminatedUnion("workflow", [
  storyLaunchRequestSchema,
  adHocLaunchRequestSchema.extend({ title: oneLine }),
]);

export type RecordedLaunchRequest = z.infer<typeof recordedLaunchRequestSchema>;

// The session a host started, as the host itself lists it: `shortId` is what
// the host's own commands (`claude attach <shortId>`) take.
export const hostSessionSchema = z.object({
  host: z.enum(agentHosts),
  sessionId: z.string().min(1),
  shortId: z.string().min(1),
  name: z.string(),
});

export type HostSession = z.infer<typeof hostSessionSchema>;

// How many days this machine keeps a launch's record after its session is
// marked done.
export const launchRetentionDays = 30;

// The start a workflow established before its session
// (`../server/executionStart.ts`): the published claim and the workspace the
// session runs in, as the installed skill's start command reported them, kept
// with the launch record and handed to the session in its instruction.
export const establishedStartSchema = z.object({
  identity: z.string().min(1),
  publisherId: z.string().min(1),
  workspace: z.string().min(1),
  branch: z.string().min(1),
  mode: z.literal("story-branch"),
  remote: z.string().min(1),
  target: z.string().min(1),
  publishedSha: z.string().min(1),
  agent: z.string().min(1).optional(),
  plan: z.string().min(1).optional(),
  startingRevision: z.string().min(1).optional(),
  candidateSha: z.string().min(1).optional(),
});

export type EstablishedStart = z.infer<typeof establishedStartSchema>;

// The preparation a refinement launch established before its session
// (`../server/preparationStart.ts`): the workspace the session runs in and the
// announcement published for it, kept with the launch record. It carries no
// publisher, mode, or plan; `publishedSha` is absent when the workspace
// already held the assignment.
export const establishedPreparationSchema = z.object({
  identity: z.string().min(1),
  workspace: z.string().min(1),
  branch: z.string().min(1),
  remote: z.string().min(1),
  target: z.string().min(1),
  publishedSha: z.string().min(1).optional(),
  agent: z.string().min(1).optional(),
});

export type EstablishedPreparation = z.infer<
  typeof establishedPreparationSchema
>;

// A confirmed launch, kept on this machine until `launchRetentionDays` after
// the developer marked its session done (`./doneMark.ts`), if they ever do,
// with when they did: local evidence only, never a story fact.
export const launchRecordSchema = z.object({
  request: recordedLaunchRequestSchema,
  session: hostSessionSchema,
  // What the launch's start established, for a workflow that has one.
  start: establishedStartSchema.optional(),
  // What a refinement launch's preparation established.
  preparation: establishedPreparationSchema.optional(),
  launchedAt: z.iso.datetime(),
  doneAt: z.iso.datetime().optional(),
});

export type LaunchRecord = z.infer<typeof launchRecordSchema>;

// A recorded session as the host lists it at the moment of asking, never
// stored: `listed` with the host's `state`, only while its process runs its
// `status`, and, when the host reports one, what a blocked session is
// `waitingFor`; `unlisted` once the host no longer lists it; `unknown` when
// the host's listing could not be read.
export const sessionStateSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("listed"),
    state: z.string(),
    status: z.string().optional(),
    waitingFor: z.string().optional(),
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

// Whether a recorded session's record may be deleted: while its listing is
// unknown, or while the host no longer lists it and it is not marked done
// (Session unavailable). A session marked done reads Done, not unavailable.
export function recordDeletable({
  sessionState,
  doneAt,
}: {
  sessionState: SessionState;
  doneAt?: string | undefined;
}): boolean {
  return (
    sessionState.kind === "unknown" ||
    (sessionState.kind === "unlisted" && doneAt === undefined)
  );
}

// A kept launch record joined with its session's state when it was answered;
// the state itself is never kept.
export const launchWithStateSchema = launchRecordSchema.extend({
  sessionState: sessionStateSchema,
});

export type LaunchWithState = z.infer<typeof launchWithStateSchema>;

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

// Why nothing was launched.
export const launchFailureReasons = [
  "folder-not-found",
  "not-installed",
  "folder-not-trusted",
  "refused",
  "unavailable",
  "start-refused",
  "already-starting",
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
  workflow: z.enum(launchWorkflowNames),
  source: z.string().min(1),
  identity: z.string().min(1),
  workspace: z.string().min(1),
  agent: z.string().min(1).optional(),
});

export type KeptStart = z.infer<typeof keptStartSchema>;

// A start running in the boundary's server now: the workflow, the project, the
// story, and the phase it is in. A start kept in the store with no running
// process is a kept start, never a running one.
export const runningStartSchema = z.object({
  workflow: z.enum(launchWorkflowNames),
  source: z.string().min(1),
  identity: z.string().min(1),
  phase: z.enum(startPhases),
});

export type RunningStart = z.infer<typeof runningStartSchema>;

// What a card says beside its Start while this machine keeps the start that
// took or prepared the story and no session was started from it.
export const keptStartNote = "Started here, no session yet";

// The machine's sessions, as the boundary answers a GET: every catalog
// project's launch records, each naming its project and joined with its
// session's current state, whether alerts can be raised, the projects
// whose installed skill establishes a start (the claim and workspace) when
// Start execution is pressed, by project id, the projects whose installed
// skill establishes a preparation when Start refinement is pressed, the starts
// kept without a session, and the starts running now with their phases.
export const launchRecordsSchema = z.object({
  records: z.array(launchWithStateSchema),
  alerts: alertsSchema,
  establishing: z.array(z.string()),
  establishingPreparation: z.array(z.string()),
  keptStarts: z.array(keptStartSchema),
  starts: z.array(runningStartSchema),
});

export type MachineAnswer = z.infer<typeof launchRecordsSchema>;
