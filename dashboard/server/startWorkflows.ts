// The Start a workflow runs before its session, as `AgentLaunches`
// (`./agentLaunches.ts`) uses it: whether a project's installed skill
// establishes it, how it begins, how its formatter hands it to the session,
// and the words of what it says when its wait ends uncertain, its formatter
// cannot be read, or its session fails after it published. A workflow with no
// entry here only starts the session. Each entry is the one place its words
// are spelled; the mechanics are its own module (`./executionStart.ts`).

import type {
  EstablishedStart,
  LaunchWorkflow,
  StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { EstablishedLaunch } from "./claudeLaunch.ts";
import {
  beginStart,
  establishesStart,
  formattedStart,
} from "./executionStart.ts";
import type { PlannedStart } from "./startLaunch.ts";
import {
  beginPreparation,
  establishesPreparation,
  formattedPreparation,
} from "./preparationStart.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { WorkflowProgress } from "./startProgress.ts";
import type { StartsWorkflow } from "./startStore.ts";

// Where a running start is, for the words that say what was kept.
export type StartPlace = {
  readonly workspace: string;
  readonly branch: string;
};

export type StartWorkflow = {
  readonly workflow: StartsWorkflow;
  // Whether the project's installed skill can continue from this start.
  establishes(project: ProjectFolder): Promise<boolean>;
  begin(
    source: PublishedSource,
    request: StoryLaunchRequest,
    project: ProjectFolder,
    progress: WorkflowProgress,
  ): Promise<PlannedStart>;
  format(project: ProjectFolder, start: EstablishedStart): Promise<string>;
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
  format: formattedStart,
  uncertain: ({ workspace, branch }) =>
    `The start did not finish within the wait, so the story may or may not be Taken. The start was kept and goes on in workspace ${workspace} on branch ${branch}; pressing Start again resumes it.`,
  formatFailed: ({ workspace, branch }) =>
    `The story is Taken, but the installed skill's start formatter could not be read, so no session was started. Workspace ${workspace} on branch ${branch}.`,
  publishedWithoutSession: ({ handoff, workspace }) => {
    const { agent } = handoff.start;
    return `${agent === undefined ? "Taken" : `Taken by ${agent}`}; no session started. Workspace ${workspace.shown}.`;
  },
};

const refinement: StartWorkflow = {
  workflow: "refinement",
  establishes: establishesPreparation,
  begin: beginPreparation,
  format: formattedPreparation,
  uncertain: ({ workspace, branch }) =>
    `The start did not finish within the wait, so the story may or may not be Preparing. Workspace ${workspace} on branch ${branch}.`,
  formatFailed: ({ workspace, branch }) =>
    `The story is Preparing, but the installed skill's formatter could not be read, so no session was started. Workspace ${workspace} on branch ${branch}.`,
  publishedWithoutSession: ({ handoff, workspace }) => {
    const { agent } = handoff.start;
    return `${agent === undefined ? "Preparing" : `Preparing by ${agent}`}; no session started. Workspace ${workspace.shown}.`;
  },
};

const startWorkflows: Partial<Record<LaunchWorkflow, StartWorkflow>> = {
  execution,
  refinement,
};

// The Start a workflow runs, or undefined for one that only starts the
// session.
export function startOf(workflow: LaunchWorkflow): StartWorkflow | undefined {
  return startWorkflows[workflow];
}
