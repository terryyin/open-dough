// The Start a workflow runs before its session, as `AgentLaunches`
// (`./agentLaunches.ts`) uses it: whether a project's installed skill
// establishes it, how it begins, how its formatter hands it to the session,
// and the words of what it says when its formatter cannot be read or its
// session fails after it published. A workflow with no
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

// A story launch's established start or preparation.
type StoryLaunch = EstablishedLaunch<Established>;

// Where a start is, for the words that say so.
type StartWhere = {
  readonly workspace: string;
  readonly branch: string;
};

// Where a running story start is and the policy it runs with, for the words
// that say what was kept.
export type StartPlace = StartWhere & { readonly policy: SessionPolicy };

// What every uncertain start says of itself: it was kept, where it goes on,
// and that it can be resumed there.
const keptGoingOn = ({ workspace, branch }: StartWhere) =>
  `The start was kept and goes on in workspace ${workspace} on branch ${branch}, where it can be resumed.`;

// What a one-shot start of either workflow says in place of its workflow's
// own words: it publishes no assignment, so nothing is Taken or Preparing.
const oneShot = {
  formatFailed: ({ workspace, branch }: StartPlace) =>
    `The one-shot start was established, but the installed skill's formatter could not be read, so no session was started. Nothing was published. Workspace ${workspace} on branch ${branch}.`,
  publishedWithoutSession: ({ workspace }: StoryLaunch) =>
    `No session started; nothing was published. Workspace ${workspace.shown}.`,
};

// What an unattached session's start says (`./unattachedStart.ts`): it has
// no story, so nothing is Taken or Preparing, and it publishes nothing.
export const unattachedStartWords = {
  uncertain: (place: StartWhere) =>
    `The session's start did not finish within the wait; it publishes nothing. ${keptGoingOn(place)}`,
  formatFailed: ({ workspace, branch }: StartWhere) =>
    `The session's place was established, but the installed skill's formatter could not be read, so no session was started. Nothing was published. Workspace ${workspace} on branch ${branch}.`,
  unreadable:
    "The start command gave no result this dashboard could read. A session's start publishes nothing. Nothing was launched.",
  notInstalled: (project: string) =>
    `The installed skills in ${project} do not establish a session with these choices. Nothing was launched.`,
};

const isOneShot = ({ policy }: StartPlace) => policy.tracking === "one-shot";

// The workflow's words, or the one-shot words for a one-shot start.
function withOneShotWords(spec: StartWorkflow): StartWorkflow {
  return {
    ...spec,
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
    noteWorker: (pid: number) => Promise<void>,
  ): Promise<PlannedStart>;
  format(
    project: ProjectFolder,
    established: Established,
    host: StoryLaunchRequest["host"],
  ): Promise<string>;
  // What the launch answers when the formatter could not be read.
  formatFailed(place: StartPlace): string;
  // What a failed session launch adds once the start published.
  publishedWithoutSession({ handoff, workspace }: StoryLaunch): string;
};

// The published assignment's words, shared by native and recording stops.
export function publishedAssignment({ handoff }: StoryLaunch): string {
  const established = handoff.established;
  const agent = assignedAgent(establishedFacts(established));
  return "start" in established
    ? agent === undefined
      ? "Taken"
      : `Taken by ${agent}`
    : agent === undefined
      ? "Preparing"
      : `Preparing as ${agent}`;
}

function publishedWithoutSession(launch: StoryLaunch): string {
  return `${publishedAssignment(launch)}; no session started. Workspace ${launch.workspace.shown}.`;
}

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
  formatFailed: ({ workspace, branch }) =>
    `The story is Taken, but the installed skill's start formatter could not be read, so no session was started. Workspace ${workspace} on branch ${branch}.`,
  publishedWithoutSession,
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
  formatFailed: ({ workspace, branch }) =>
    `The story is Preparing, but the installed skill's formatter could not be read, so no session was started. Workspace ${workspace} on branch ${branch}.`,
  publishedWithoutSession,
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
