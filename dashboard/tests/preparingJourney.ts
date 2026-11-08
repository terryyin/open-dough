// Publishes a queued-story preparation journey on a local bare origin through
// the production commands, one published step at a time (preparationSteps),
// plus the preparation-assignment CLI's abandon. Each snapshot is the origin's
// main after one published step; the browser journey serves those exact Git
// bytes. The fixture supplies only the queued trunk and the owned workspaces,
// never a Preparing profile. The journey is read-only once published, so each
// worker builds it once and removes the bare origin at exit.

import { rmSync } from "node:fs";
import {
  identityA,
  identityB,
} from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import {
  abandonPreparation,
  createPreparationTrunk,
  git,
  identityC,
  linkC,
  planStoryC,
  publishAssignment,
  recorder,
  refineStoryC,
} from "../../src/skills/dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  expectOk,
  keep,
  record,
  remoteMain,
  start,
} from "./preparationSteps.ts";

export const storyA = "Story A";
export const storyB = "Story B";
export const storyC = "Story C";

export type PreparingJourney = {
  readonly origin: string;
  readonly cleanup: () => Promise<void>;
  // Remote main after each published step.
  readonly queued: string;
  readonly announced: string;
  readonly refiningAllocation: string;
  readonly refinedLanded: string;
  readonly abandoned: string;
  readonly plannedLanded: string;
  readonly planningAnnounced: string;
  // A later allocation is a supplied history precondition, committed through
  // the shared profile fixture; it does not manufacture the release journey.
  readonly reuseRefiner: () => Promise<string>;
  readonly conflicting: string;
  // Who each start assigned, as its receipt names the developer.
  readonly preparers: {
    readonly refining: string;
    readonly reconsidering: string;
    readonly planning: string;
    readonly conflicting: readonly [string, string];
  };
};

let preparingJourney: Promise<PreparingJourney> | undefined;

async function buildPreparingJourney(): Promise<PreparingJourney> {
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
    const planningAnnounced = await remoteMain(trunk);
    planStoryC(planning.workspace);
    const planned = [
      "--approach",
      "planned",
      "--plan",
      "../slice-plans/C/PLAN.md",
    ];
    await record(planning.workspace, ...planned);
    const { basis } = JSON.parse(
      await recorder(planning.workspace, "read-state", "--link", linkC),
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

    await git(trunk.integration, "config", "user.name", "Later Allocator");
    await publishAssignment(
      trunk,
      makeMe.anAgentProfile
        .preparing({
          name: refining.name,
          identity: identityA,
          host: "cursor",
          model: "later-model",
        })
        .please(),
    );
    const reused = await remoteMain(trunk);
    await git(trunk.origin, "update-ref", "refs/heads/main", conflicting);

    for (const tree of [
      trunk.integration,
      refining.workspace,
      reconsidering.workspace,
      planning.workspace,
      first.workspace,
      second.workspace,
    ]) {
      rmSync(tree, { recursive: true, force: true });
    }
    process.once("exit", () => {
      rmSync(trunk.fixture, { recursive: true, force: true });
    });

    return {
      origin: trunk.origin,
      cleanup: async () => {
        await git(trunk.origin, "update-ref", "refs/heads/main", conflicting);
      },
      queued,
      announced,
      refiningAllocation: refining.publication,
      refinedLanded,
      abandoned,
      plannedLanded,
      planningAnnounced,
      reuseRefiner: () => Promise.resolve(reused),
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

export function publishPreparingJourney(): Promise<PreparingJourney> {
  preparingJourney ??= buildPreparingJourney().catch((error: unknown) => {
    preparingJourney = undefined;
    throw error;
  });
  return preparingJourney;
}
