// What the page knows of the machine's sessions from its reads of them
// (`./agentLaunches.ts`), besides its launch offers, attempts, and record
// actions.

import type {
  Alerts,
  KeptStart,
  LaunchWithState,
  LaunchWorkflow,
  MachineAnswer,
  RunningStart,
} from "./agentLaunch.ts";

// The machine's sessions and what their latest read said.
export type ReadSessions = {
  readonly rereadOffers: () => void;
  readonly creations: MachineAnswer["creations"];
  readonly hostOperations: MachineAnswer["hostOperations"];
  // Records oldest first per project, with latest observations; unread until supplied.
  readonly records: readonly LaunchWithState[] | undefined;
  // Worktrees local Git found holding a story's claim at the latest read.
  readonly workspaces: MachineAnswer["workspaces"];
  // Whether a read asked after the latest change of the project list has
  // ended, answered or not: until then what is known predates the list.
  readonly sessionsSettled: boolean;
  // Alert capability at the latest read; unread until supplied.
  readonly alerts: Alerts | undefined;
  // Where feedback maintenance stood at the latest read, if this dashboard
  // checks it.
  readonly feedbackMaintenance: MachineAnswer["feedbackMaintenance"];
  // A kept start without a session, if present at the latest read.
  keptStartOf(
    sourceId: string,
    identity: string,
    workflow: LaunchWorkflow,
  ): KeptStart | undefined;
  // The currently running start, with its actual host, whichever page requested it.
  runningStartOf(
    sourceId: string,
    identity: string,
    workflow: LaunchWorkflow,
  ): RunningStart | undefined;
  // Records shown on cards, including this page’s launches before the first read.
  readonly launched: readonly LaunchWithState[];
};
