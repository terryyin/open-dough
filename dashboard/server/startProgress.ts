// The starts running in this server, each with its workflow and phase, kept in
// memory by `AgentLaunches` (`./agentLaunches.ts`): from the moment its script
// begins (`preparing`) until its session launch ends or the start stops
// (`launching` once the script established the start). A start kept in the
// store with no entry here is not running, whatever its record says: the
// server that ran it is gone or it stopped. A story's starts of different
// workflows are separate entries.

import type {
  LaunchWorkflow,
  RunningStart,
  StartPhase,
} from "../src/agentLaunch.ts";

// One workflow's view of the running starts: what its `begin` and launch read
// and write.
export type WorkflowProgress = {
  set(sourceId: string, identity: string, phase: StartPhase): void;
  clear(sourceId: string, identity: string): void;
  running(sourceId: string, identity: string): boolean;
};

export class StartProgress {
  private readonly phases = new Map<string, StartPhase>();

  private static key(
    workflow: LaunchWorkflow,
    sourceId: string,
    identity: string,
  ): string {
    return JSON.stringify([workflow, sourceId, identity]);
  }

  for(workflow: LaunchWorkflow): WorkflowProgress {
    return {
      set: (sourceId, identity, phase) => {
        this.phases.set(StartProgress.key(workflow, sourceId, identity), phase);
      },
      clear: (sourceId, identity) => {
        this.phases.delete(StartProgress.key(workflow, sourceId, identity));
      },
      running: (sourceId, identity) =>
        this.phases.has(StartProgress.key(workflow, sourceId, identity)),
    };
  }

  // The running starts, in the order they began.
  all(): readonly RunningStart[] {
    return [...this.phases].map(([key, phase]) => {
      const [workflow, source, identity] = JSON.parse(key) as [
        LaunchWorkflow,
        string,
        string,
      ];
      return { workflow, source, identity, phase };
    });
  }
}
