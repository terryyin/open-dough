// The execution starts running in this server, each with its phase, kept in
// memory by `AgentLaunches` (`./agentLaunches.ts`): from the moment its script
// begins (`preparing`) until its session launch ends or the start stops
// (`launching` once the script established the start). A start kept in the
// store with no entry here is not running, whatever its record says: the
// server that ran it is gone or it stopped.

import type { RunningStart, StartPhase } from "../src/agentLaunch.ts";

export class StartProgress {
  private readonly phases = new Map<string, StartPhase>();

  private static key(sourceId: string, identity: string): string {
    return JSON.stringify([sourceId, identity]);
  }

  set(sourceId: string, identity: string, phase: StartPhase): void {
    this.phases.set(StartProgress.key(sourceId, identity), phase);
  }

  clear(sourceId: string, identity: string): void {
    this.phases.delete(StartProgress.key(sourceId, identity));
  }

  running(sourceId: string, identity: string): boolean {
    return this.phases.has(StartProgress.key(sourceId, identity));
  }

  // The running starts, in the order they began.
  all(): readonly RunningStart[] {
    return [...this.phases].map(([key, phase]) => {
      const [source, identity] = JSON.parse(key) as [string, string];
      return { source, identity, phase };
    });
  }
}
