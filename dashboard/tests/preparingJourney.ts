// Publishes the preparation history the board and session attribution read
// from Git. Each worker shares the origin and removes it at exit.

import { rmSync } from "node:fs";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { agentIdentity } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  integrationDeveloper as developer,
  materializeRepository,
} from "../../tests/support/repository-fixture.mjs";
import {
  notRefinedIdentity as identityC,
  queuedDashboardRepository,
  readyIdentity as identityB,
  takenIdentity as identityA,
} from "./launchJourney.ts";

export {
  takenStory as storyA,
  readyStory as storyB,
  notRefinedStory as storyC,
} from "./launchJourney.ts";

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
  // The same agent name later appears on another story with different credit.
  readonly reuseRefiner: () => Promise<string>;
  readonly conflicting: string;
  readonly preparers: {
    readonly refining: string;
    readonly reconsidering: string;
    readonly planning: string;
    readonly conflicting: readonly [string, string];
  };
};

let preparingJourney: Promise<PreparingJourney> | undefined;

const preparationAgent: (
  name: string,
) => Omit<ReturnType<typeof agentIdentity>, "name"> & { name: string } =
  agentIdentity;
const refining = preparationAgent("Yui");
const reconsidering = preparationAgent("Akiho");
const planning = preparationAgent("Yuma");
const first = preparationAgent("Sola");
const second = preparationAgent("Yua");
const laterAllocator = { name: "Later Allocator", email: developer.email };
const storyCState = {
  identity: identityC,
  href: "seeds/C.md#c",
  refinement: "refined",
} as const;

const refinedStoryC = `---
id: SEED-C
---

# Seed C

<a id="c"></a>

### Story C

**Identity:** ${identityC}

#### Goal

C is useful.

#### Scope

- One thing.

#### Key examples

1. It works.
`;

const authorOf = ({ agent, email }: ReturnType<typeof agentIdentity>) => ({
  name: agent,
  email,
});

function preparationMessage(action: string, identity: string) {
  return `${action}: ${identity}\n\nPreparation-Identity: ${identity}\nCo-authored-by: ${developer.name} <${developer.email}>`;
}

function announcement(
  facts: Parameters<typeof makeMe.anAgentProfile.preparing>[0] & {
    identity: string;
  },
) {
  return {
    agentProfiles: [makeMe.anAgentProfile.preparing(facts).please()],
    author: authorOf(agentIdentity(facts.name)),
    committer: developer,
    message: preparationMessage("Announce preparation", facts.identity),
  };
}

async function buildPreparingJourney(): Promise<PreparingJourney> {
  const description = queuedDashboardRepository()
    .withRevision(
      "refiningAllocation",
      announcement({
        name: refining.name,
        identity: identityC,
        host: "claude",
        model: "claude-opus-5-5",
      }),
    )
    .withRevision(
      "announced",
      announcement({ name: reconsidering.name, identity: identityB }),
    )
    .withRevision("refinedLanded", {
      files: { ".planning/seeds/C.md": refinedStoryC },
      storyStates: [{ ...storyCState, approach: "unselected" }],
      remove: [`.planning/${refining.path}`],
      author: authorOf(refining),
      committer: developer,
      message: `Keep ${identityC} preparation`,
    })
    .withRevision("abandoned", {
      remove: [`.planning/${reconsidering.path}`],
      author: authorOf(reconsidering),
      committer: developer,
      message: preparationMessage("End preparation", identityB),
    })
    .withRevision(
      "planningAnnounced",
      announcement({ name: planning.name, identity: identityC, host: "codex" }),
    )
    .withRevision("plannedLanded", {
      files: {
        ".planning/slice-plans/C/PLAN.md":
          "# Story C plan\n\n### 1. Do C\n\nType: Behavior\nStatus: planned\n",
      },
      storyStates: [
        {
          ...storyCState,
          approach: "planned",
          plan: "../slice-plans/C/PLAN.md",
          assessment: "ready",
        },
      ],
      remove: [`.planning/${planning.path}`],
      author: authorOf(planning),
      committer: developer,
      message: `Keep ${identityC} preparation`,
    })
    .withRevision(
      "firstConflict",
      announcement({ name: first.name, identity: identityA }),
    )
    .withRevision(
      "conflicting",
      announcement({ name: second.name, identity: identityA }),
    )
    .withRevision("reused", {
      agentProfiles: [
        makeMe.anAgentProfile
          .preparing({
            name: refining.name,
            identity: identityA,
            host: "cursor",
            model: "later-model",
          })
          .please(),
      ],
      author: laterAllocator,
      committer: laterAllocator,
      message: `assign ${refining.name}`,
    })
    .please();

  const trunk = await materializeRepository(description);
  const {
    queued,
    announced,
    refiningAllocation,
    refinedLanded,
    abandoned,
    plannedLanded,
    planningAnnounced,
    conflicting,
    reused,
  } = trunk.revisions;
  const reset = async () => {
    await git(trunk.origin, "update-ref", "refs/heads/main", conflicting);
  };
  try {
    await reset();
    rmSync(trunk.integration, { recursive: true, force: true });
    process.once("exit", () => {
      rmSync(trunk.fixture, { recursive: true, force: true });
    });
    return {
      origin: trunk.origin,
      cleanup: reset,
      queued,
      announced,
      refiningAllocation,
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
