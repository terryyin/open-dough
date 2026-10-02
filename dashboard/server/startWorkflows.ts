// The Start a workflow runs before its session, as `AgentLaunches`
// (`./agentLaunches.ts`) uses it: whether a project's installed skill
// establishes it, how it begins, how its formatter hands it to the session,
// and the words of what it says when its wait ends uncertain, its formatter
// cannot be read, or its session fails after it published. A workflow with no
// entry here only starts the session. Each entry is the one place its words
// are spelled; the mechanics are its own module (`./executionStart.ts`).

import {
  assignedAgent,
  isEstablishedOneShot,
  type LaunchWorkflow,
  type SessionPolicy,
  type StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { EstablishedLaunch } from "./hostLaunch.ts";
import {
  beginStart,
  establishesStart,
  formattedStart,
} from "./executionStart.ts";
import {
  establishedFacts,
  type Established,
  type PlannedStart,
} from "./startLaunch.ts";
import {
  beginPreparation,
  establishesPreparation,
  formattedPreparation,
} from "./preparationStart.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { WorkflowProgress } from "./startProgress.ts";
import type { StartsWorkflow } from "./startStore.ts";

// Where a running start is and the policy it runs with, for the words that
// say what was kept.
export type StartPlace = {
  readonly workspace: string;
  readonly branch: string;
  readonly policy: SessionPolicy;
};

// What every uncertain start says of itself: it was kept, where it goes on,
// and that it can be resumed there.
const keptGoingOn = ({ workspace, branch }: StartPlace) =>
  `The start was kept and goes on in workspace ${workspace} on branch ${branch}, where it can be resumed.`;

// What a one-shot start of either workflow says in place of its workflow's
// own words: it publishes no assignment, so nothing is Taken or Preparing.
const oneShot = {
  uncertain: (place: StartPlace) =>
    `The start did not finish within the wait; a one-shot start publishes nothing. ${keptGoingOn(place)}`,
  formatFailed: ({ workspace, branch }: StartPlace) =>
    `The one-shot start was established, but the installed skill's formatter could not be read, so no session was started. Nothing was published. Workspace ${workspace} on branch ${branch}.`,
  publishedWithoutSession: ({ workspace }: EstablishedLaunch) =>
    `No session started; nothing was published. Workspace ${workspace.shown}.`,
};

const isOneShot = ({ policy }: StartPlace) => policy.tracking === "one-shot";

// The workflow's words, or the one-shot words for a one-shot start.
function withOneShotWords(spec: StartWorkflow): StartWorkflow {
  return {
    ...spec,
    uncertain: (place) =>
      isOneShot(place) ? oneShot.uncertain(place) : spec.uncertain(place),
    formatFailed: (place) =>
      isOneShot(place) ? oneShot.formatFailed(place) : spec.formatFailed(place),
    publishedWithoutSession: (launch) =>
      isEstablishedOneShot(establishedFacts(launch.handoff.established))
        ? oneShot.publishedWithoutSession(launch)
        : spec.publishedWithoutSession(launch),
  };
}

export type StartWorkflow = {
  readonly workflow: StartsWorkflow;
  // Whether the project's installed skill can continue from this start.
  establishes(
    project: ProjectFolder,
    host: StoryLaunchRequest["host"],
  ): Promise<boolean>;
  begin(
    source: PublishedSource,
    request: StoryLaunchRequest,
    project: ProjectFolder,
    progress: WorkflowProgress,
  ): Promise<PlannedStart>;
  format(
    project: ProjectFolder,
    established: Established,
    host: StoryLaunchRequest["host"],
  ): Promise<string>;
  // What the launch answers when the wait ends before the start does.
  uncertain(place: StartPlace): string;
  // What the launch answers when the formatter could not be read.
  formatFailed(place: StartPlace): string;
  // What a failed session launch adds once the start published.
  publishedWithoutSession({ handoff, workspace }: EstablishedLaunch): string;
};

const execution: StartWorkflow = {
  workflow: "execution",
  establishes: establishesStart,
  begin: beginStart,
  format: (project, established, host) => {
    if (!("start" in established)) {
      throw new Error("An execution establishes a start.");
    }
    return formattedStart(project, established.start, host);
  },
  uncertain: (place) =>
    `The start did not finish within the wait, so the story may or may not be Taken. ${keptGoingOn(place)}`,
  formatFailed: ({ workspace, branch }) =>
    `The story is Taken, but the installed skill's start formatter could not be read, so no session was started. Workspace ${workspace} on branch ${branch}.`,
  publishedWithoutSession: ({ handoff, workspace }) => {
    const agent = assignedAgent(establishedFacts(handoff.established));
    return `${agent === undefined ? "Taken" : `Taken by ${agent}`}; no session started. Workspace ${workspace.shown}.`;
  },
};

const refinement: StartWorkflow = {
  workflow: "refinement",
  establishes: establishesPreparation,
  begin: beginPreparation,
  format: (project, established, host) => {
    if (!("preparation" in established)) {
      throw new Error("A refinement establishes a preparation.");
    }
    return formattedPreparation(project, established.preparation, host);
  },
  uncertain: (place) =>
    `The start did not finish within the wait, so the story may or may not be Preparing. ${keptGoingOn(place)}`,
  formatFailed: ({ workspace, branch }) =>
    `The story is Preparing, but the installed skill's formatter could not be read, so no session was started. Workspace ${workspace} on branch ${branch}.`,
  publishedWithoutSession: ({ handoff, workspace }) => {
    const agent = assignedAgent(establishedFacts(handoff.established));
    return `${agent === undefined ? "Preparing" : `Preparing as ${agent}`}; no session started. Workspace ${workspace.shown}.`;
  },
};

const startWorkflows: Partial<Record<LaunchWorkflow, StartWorkflow>> = {
  execution: withOneShotWords(execution),
  refinement: withOneShotWords(refinement),
};

// The Start a workflow runs, or undefined for one that only starts the
// session.
export function startOf(workflow: LaunchWorkflow): StartWorkflow | undefined {
  return startWorkflows[workflow];
}
