// Shared workflow vocabulary and how a launch request is presented.
import { hostName } from "./sessionCapabilities.ts";
import type { WorkEntry } from "./publishedWork.ts";
import type {
  AgentLaunchRequest,
  RecordedLaunchRequest,
} from "./launchRequest.ts";
import type { EstablishedContext } from "./launchRecord.ts";
import { sessionSummary } from "./sessionPolicyWords.ts";
import { readyBadge } from "./storyPreparation.ts";

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
  // The file of the installed skill's `references/` that defines the options
  // a launch may select, if the workflow has any.
  readonly options: string | undefined;
  // In a project whose installed skill establishes the workflow's start: the
  // sentence its dialog's Command details add, the short effect its dialog
  // keeps beside Start, and what its card says while the request is pending.
  readonly establishes: {
    readonly sentence: string;
    readonly effect: string;
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
    options: undefined,
    establishes: {
      sentence:
        "Start also publishes this story's Take to the project's trunk on origin and creates a workspace under the project folder's .worktrees/; pressing Start authorizes that push.",
      effect:
        "Publishes this story's Take to origin; pressing Start authorizes that push.",
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
    options: "refinement-options.json",
    establishes: {
      sentence:
        "Start also publishes this story's Preparing announcement to the project's trunk on origin and creates a workspace under the project folder's .worktrees/; pressing Start authorizes that push.",
      effect:
        "Publishes this story's Preparing announcement to origin; pressing Start authorizes that push.",
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

// How a startup of the kind is named, such as "execution start".
export function startName(workflow: LaunchWorkflow | "ad-hoc"): string {
  return workflow === "ad-hoc"
    ? "session start"
    : `${launchWorkflows[workflow].name.toLowerCase()} start`;
}

// The story a request is of, by its identity, or undefined for an ad hoc
// session, which has none.
export function storyOf(
  request: AgentLaunchRequest | RecordedLaunchRequest,
): string | undefined {
  return request.workflow === "ad-hoc" ? undefined : request.identity;
}

// What a consumer of a launch record needs of its request, spelled once: the
// title, the work item's identity (none when the request has no card to look
// up), the kind's name, how its session is said to have started, the model it
// asked for (none for Default), the options it selected (none when it
// selected none), spelled as the flags the record kept, and its session
// policy (none for the default).
export function launchSubject(request: RecordedLaunchRequest) {
  const name = launchKindName(request.workflow);
  return {
    title: request.title,
    identity: storyOf(request),
    name,
    startedWords: `${
      request.workflow === "ad-hoc" ? `${name} session` : name
    } started in ${hostName(request.host)}`,
    modelWords:
      request.model === undefined
        ? undefined
        : `Model: ${launchModels[request.model].name} (requested)`,
    optionsWords:
      request.options === undefined || request.options.length === 0
        ? undefined
        : `Options: ${request.options.join(" ")} (requested)`,
    policyWords:
      request.workflow === "ad-hoc" || request.policy === undefined
        ? undefined
        : `Session: ${sessionSummary(request.policy)}`,
  };
}

// Where a launch's session runs, for a launch whose start or preparation
// established a workspace: the folder as the page shows a project's,
// `~/git/<project id>`, then the workspace under it
// (`~/git/open-dough/.worktrees/<slug>`), never the machine's home directory;
// the project's folder itself when the start took the default checkout.
// Undefined when nothing was established.
export function workspaceWords(
  request: RecordedLaunchRequest,
  established: EstablishedContext | undefined,
): string | undefined {
  if (established === undefined) return undefined;
  if ("role" in established && established.role === "default-checkout") {
    return `Workspace ~/git/${request.source} (default main)`;
  }
  const marker = "/.worktrees/";
  const at = established.workspace.lastIndexOf(marker);
  return `Workspace ${
    at < 0
      ? established.workspace
      : `~/git/${request.source}${established.workspace.slice(at)}`
  }`;
}
