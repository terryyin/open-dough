// Publishes the backlog an agent launch starts from, on a local bare origin,
// through the production commands: the queued preparation trunk (Story A and
// Story B Ready for execution, Story C queued last and not refined), then an
// execution start that takes Story A. The browser journey serves the origin's
// exact Git bytes at that revision; nothing here writes display state.

import { startCliResult } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import {
  createPreparationTrunk,
  lsRemoteSha,
} from "../../src/skills/dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";

export const takenStory = "Story A";
export const readyStory = "Story B";
export const notRefinedStory = "Story C";
export const notRefinedIdentity = "SEED-C#c";

export type LaunchJourney = {
  readonly origin: string;
  readonly cleanup: () => Promise<void>;
  // Remote main once Story A is taken.
  readonly taken: string;
};

export async function publishLaunchJourney(): Promise<LaunchJourney> {
  const trunk = await createPreparationTrunk();
  try {
    const execution = (await startCliResult(trunk, "trunk")) as {
      code: number;
      receipt: unknown;
    };
    if (execution.code !== 0) {
      throw new Error(`take failed: ${JSON.stringify(execution.receipt)}`);
    }
    const taken = await lsRemoteSha(trunk.origin, "refs/heads/main");
    if (taken === undefined) throw new Error("origin has no main");
    return { origin: trunk.origin, cleanup: trunk.cleanup, taken };
  } catch (error) {
    await trunk.cleanup();
    throw error;
  }
}
