// Publishes the backlogs an agent launch starts from and moves through, on a
// local bare origin, through the production commands: the queued preparation
// trunk (Story A and Story B Ready for execution, Story C queued last and not
// refined), then either an execution start that takes Story A, or the
// story-stages journey below. The browser journey serves the origin's exact Git
// bytes at each revision; nothing here writes display state.

import {
  identityB,
  startCliResult,
} from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import {
  backlogCli,
  createPreparationTrunk,
  createWorkspace,
  exec,
  git,
  identityC,
  lsRemoteSha,
  startPreparation,
} from "../../src/skills/dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";

export const takenStory = "Story A";
export const readyStory = "Story B";
export const notRefinedStory = "Story C";
export const notRefinedIdentity = identityC;

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

type Trunk = Awaited<ReturnType<typeof createPreparationTrunk>>;

async function remoteMain(trunk: Trunk): Promise<string> {
  const sha = await lsRemoteSha(trunk.origin, "refs/heads/main");
  if (sha === undefined) throw new Error("origin has no main");
  return sha;
}

function expectOk(step: string, result: { code: number; receipt: unknown }) {
  if (result.code !== 0) {
    throw new Error(`${step} failed: ${JSON.stringify(result)}`);
  }
}

export type StoryStagesJourney = {
  readonly origin: string;
  readonly cleanup: () => Promise<void>;
  // Remote main after each published step.
  readonly queued: string;
  // A developer announces preparation of Story B.
  readonly preparing: string;
  // An execution start takes Story B.
  readonly taken: string;
  // Story C is completed, leaving the backlog without being taken.
  readonly completed: string;
};

// The origin whose stories move through the stages: queued, then Story B under a
// published preparation assignment, then Story B taken, then Story C
// completed out of the backlog.
export async function publishStoryStagesJourney(): Promise<StoryStagesJourney> {
  const trunk = await createPreparationTrunk();
  try {
    const queued = await remoteMain(trunk);

    const { workspace } = await createWorkspace(trunk, "b-prepare");
    expectOk(
      "start preparation",
      await startPreparation(trunk, workspace, identityB),
    );
    const preparing = await remoteMain(trunk);

    expectOk(
      "take",
      await startCliResult(trunk, "trunk", [], { identity: identityB }),
    );
    const taken = await remoteMain(trunk);

    const { integration } = trunk;
    await git(integration, "pull", "--quiet", "--ff-only", "origin", "main");
    await exec(
      process.execPath,
      [backlogCli, "complete", "--identity", identityC],
      { cwd: integration },
    );
    await git(integration, "add", "--all", ".planning");
    await git(integration, "commit", "--quiet", "-m", "complete story C");
    await git(integration, "push", "--quiet", "origin", "HEAD:main");
    const completed = await remoteMain(trunk);

    return {
      origin: trunk.origin,
      cleanup: trunk.cleanup,
      queued,
      preparing,
      taken,
      completed,
    };
  } catch (error) {
    await trunk.cleanup();
    throw error;
  }
}
