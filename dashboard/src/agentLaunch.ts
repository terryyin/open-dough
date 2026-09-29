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
import { readyBadge } from "./storyPreparation.ts";
import { agentHosts } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

// What a launch starts, and the one place each workflow is spelled: its
// display name, the verb its dialog uses, the skill it runs, and the note its
// card action carries, if any. The boundary, host, and card all read this
// table.
type LaunchWorkflowSpec = {
  readonly name: string;
  readonly verb: string;
  readonly skill: string;
  readonly note: (
    entry: Pick<WorkEntry, "preparation" | "preparing">,
  ) => string | undefined;
};

export const launchWorkflows = {
  execution: {
    name: "Execution",
    verb: "execute",
    skill: "dough-execute-plan",
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

// How many days this machine keeps a launch's record after its session is
// marked done.
export const launchRetentionDays = 30;

// A confirmed launch, kept on this machine until `launchRetentionDays` after
// the developer marked its session done (`./doneMark.ts`), if they ever do,
// with when they did: local evidence only, never a story fact.
export const launchRecordSchema = z.object({
  request: agentLaunchRequestSchema,
  session: hostSessionSchema,
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
    (record) => record.request.identity === identity && isOpen(record),
  );
}

// The sessions still open in every project, by the cards' rule, newest
// launch first by launch time alone, so a state change never moves one; or
// undefined while the machine's sessions are not yet read.
export function openSessionsOf(
  records: readonly LaunchWithState[] | undefined,
): readonly LaunchWithState[] | undefined {
  return records
    ?.filter(isOpen)
    .toSorted(
      (newer, older) =>
        Date.parse(older.launchedAt) - Date.parse(newer.launchedAt),
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

// The machine's sessions, as the boundary answers a GET: every catalog
// project's launch records, each naming its project and joined with its
// session's current state.
export const launchRecordsSchema = z.object({
  records: z.array(launchWithStateSchema),
});
