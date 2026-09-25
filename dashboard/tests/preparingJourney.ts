// Publishes a queued-story preparation journey on a local bare origin through
// the production commands: the preparation-assignment CLI's start, release,
// and abandon, the canonical preparation recorder, and the Dough Land Git
// model for landing. Each snapshot is the origin's main after one published
// step; the browser journey serves those exact Git bytes. The fixture supplies
// only the queued trunk and the owned workspaces, never a Preparing profile.

import {
  identityA,
  identityB,
} from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { landWorktree } from "../../src/skills/dough-story-refinement/scripts/dough-land-test-fixtures.mjs";
import {
  abandonPreparation,
  createPreparationTrunk,
  createWorkspace,
  identityC,
  lsRemoteSha,
  planStoryC,
  recorder,
  refineStoryC,
  releasePreparation,
  startPreparation,
} from "../../src/skills/dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";

export const storyA = "Story A";
export const storyB = "Story B";
export const storyC = "Story C";

type Receipt = { status: string; agent: string };
type Trunk = Awaited<ReturnType<typeof createPreparationTrunk>>;

export type PreparingJourney = {
  readonly origin: string;
  readonly cleanup: () => Promise<void>;
  // Remote main after each published step.
  readonly queued: string;
  readonly announced: string;
  readonly refinedLanded: string;
  readonly abandoned: string;
  readonly plannedLanded: string;
  readonly conflicting: string;
  // Who each start assigned, as its receipt names the developer.
  readonly preparers: {
    readonly refining: string;
    readonly reconsidering: string;
    readonly planning: string;
    readonly conflicting: readonly [string, string];
  };
};

async function remoteMain(trunk: Trunk): Promise<string> {
  const sha = await lsRemoteSha(trunk.origin, "refs/heads/main");
  if (sha === undefined) throw new Error("origin has no main");
  return sha;
}

function expectOk(step: string, result: { code: number; receipt: unknown }) {
  if (result.code !== 0) {
    throw new Error(`${step} failed: ${JSON.stringify(result)}`);
  }
  return result.receipt as Receipt;
}

async function start(
  trunk: Trunk,
  name: string,
  identity: string,
  extra: string[] = [],
) {
  const { workspace, branch } = await createWorkspace(trunk, name);
  const receipt = expectOk(
    `start ${name}`,
    await startPreparation(trunk, workspace, identity, extra),
  );
  if (receipt.status !== "announced") {
    throw new Error(`start ${name}: ${JSON.stringify(receipt)}`);
  }
  return { workspace, branch, agent: receipt.agent };
}

async function keep(
  trunk: Trunk,
  prepared: { workspace: string; branch: string },
  identity: string,
) {
  expectOk("release", await releasePreparation(prepared.workspace, identity));
  const landing = await landWorktree({
    worktree: prepared.workspace,
    branch: prepared.branch,
    defaultCheckout: trunk.integration,
    message: `Keep ${identity} preparation`,
    beforePush: undefined,
  });
  if (landing.stopped !== null) {
    throw new Error(`landing stopped: ${JSON.stringify(landing)}`);
  }
}

const record = (workspace: string, ...facts: string[]) =>
  recorder(
    workspace,
    "record-state",
    "--identity",
    identityC,
    "--link",
    "seeds/C.md#c",
    "--refinement",
    "refined",
    ...facts,
  );

export async function publishPreparingJourney(): Promise<PreparingJourney> {
  const trunk = await createPreparationTrunk();
  try {
    const queued = await remoteMain(trunk);
    // Story C is refined by a developer whose tool and model are recorded;
    // previously ready Story B is reconsidered by one whose are not.
    const refining = await start(trunk, "c-refine", identityC, [
      "--host",
      "claude",
      "--model",
      "claude-opus-5-5",
    ]);
    const reconsidering = await start(trunk, "b-reconsider", identityB);
    const announced = await remoteMain(trunk);

    refineStoryC(refining.workspace);
    await record(refining.workspace, "--approach", "unselected");
    await keep(trunk, refining, identityC);
    const refinedLanded = await remoteMain(trunk);

    expectOk(
      "abandon",
      await abandonPreparation(trunk, reconsidering.workspace, identityB),
    );
    const abandoned = await remoteMain(trunk);

    const planning = await start(trunk, "c-plan", identityC, [
      "--host",
      "codex",
    ]);
    planStoryC(planning.workspace);
    const planned = ["--approach", "planned", "--plan", "../quick/C/PLAN.md"];
    await record(planning.workspace, ...planned);
    const { basis } = JSON.parse(
      await recorder(
        planning.workspace,
        "read-state",
        "--link",
        "seeds/C.md#c",
      ),
    ) as { basis: { document: string; plan: string } };
    await record(
      planning.workspace,
      ...planned,
      "--assessment",
      "ready",
      "--expect-document",
      basis.document,
      "--expect-plan",
      basis.plan,
    );
    await keep(trunk, planning, identityC);
    const plannedLanded = await remoteMain(trunk);

    // Two developers each announce preparation of Story A.
    const first = await start(trunk, "a-first", identityA);
    const second = await start(trunk, "a-second", identityA);
    const conflicting = await remoteMain(trunk);

    return {
      origin: trunk.origin,
      cleanup: trunk.cleanup,
      queued,
      announced,
      refinedLanded,
      abandoned,
      plannedLanded,
      conflicting,
      preparers: {
        refining: refining.agent,
        reconsidering: reconsidering.agent,
        planning: planning.agent,
        conflicting: [first.agent, second.agent],
      },
    };
  } catch (error) {
    await trunk.cleanup();
    throw error;
  }
}
