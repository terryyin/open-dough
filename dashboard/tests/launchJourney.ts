// The launch and story-columns tests serve the published files at each
// revision of these real Git histories. The launch fixture in pageTest.ts
// and the story-columns journey each share their read-only origin per worker.

import { rmSync } from "node:fs";
import { agentIdentity } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { direction } from "../../tests/support/product-backlog-fixture.mjs";
import {
  queuedRepositoryWithRoughStory,
  roughStoryC as storyC,
  storyA,
  storyB,
  storyPlanPath,
} from "../../tests/support/queued-repository.mjs";
import {
  integrationDeveloper,
  materializeRepository,
} from "../../tests/support/repository-fixture.mjs";

export const takenStory = storyA.title;
export const readyStory = storyB.title;
export const notRefinedStory = storyC.title;
export const takenIdentity = storyA.identity;
export const readyIdentity = storyB.identity;
export const notRefinedIdentity = storyC.identity;

export function queuedDashboardRepository(titleC = notRefinedStory) {
  return queuedRepositoryWithRoughStory(
    makeMe.aBacklogEntry.with({ ...storyC, title: titleC }).please(),
  );
}

function agentAuthor(name: string) {
  const { agent, email } = agentIdentity(name);
  return { name: agent, email };
}

const developerCredit = `Co-authored-by: ${integrationDeveloper.name} <${integrationDeveloper.email}>`;

function takeMessage(identity: string) {
  return `Take queued work: ${identity}\n\nClaim-Identity: ${identity}\nClaim-Publisher: publisher-trunk\n${developerCredit}`;
}

const storyAWithPlan = {
  ...storyA,
  plan: { label: "plan", target: storyPlanPath(storyA) },
};
const storyBWithPlan = {
  ...storyB,
  plan: { label: "plan", target: storyPlanPath(storyB) },
};

export type LaunchJourney = {
  readonly origin: string;
  readonly cleanup: () => Promise<void>;
  readonly taken: string;
};

export async function publishLaunchJourney(): Promise<LaunchJourney> {
  const { origin, cleanup, trunkSha } = await materializeRepository(
    queuedDashboardRepository()
      .withRevision("taken", {
        message: takeMessage(takenIdentity),
        author: agentAuthor("Yui"),
        committer: integrationDeveloper,
        backlog: {
          direction,
          taken: [storyAWithPlan],
          queued: [storyB, storyC],
        },
        agentProfiles: [
          makeMe.anAgentProfile
            .executing({
              name: "Yui",
              identity: takenIdentity,
              mode: "trunk",
              branch: "origin/main",
            })
            .please(),
        ],
      })
      .please(),
  );
  return { origin, cleanup, taken: trunkSha };
}

export type StoryColumnsJourney = {
  readonly origin: string;
  readonly cleanup: () => Promise<void>;
  readonly queued: string;
  readonly preparing: string;
  readonly taken: string;
  readonly completed: string;
};

function storyColumnsRepository(completedAt: string) {
  return queuedDashboardRepository()
    .withRevision("preparing", {
      message: `Announce preparation: ${readyIdentity}\n\nPreparation-Identity: ${readyIdentity}\n${developerCredit}`,
      author: agentAuthor("Yui"),
      committer: integrationDeveloper,
      agentProfiles: [
        makeMe.anAgentProfile
          .preparing({ name: "Yui", identity: readyIdentity })
          .please(),
      ],
    })
    .withRevision("taken", {
      message: takeMessage(readyIdentity),
      author: agentAuthor("Akiho"),
      committer: integrationDeveloper,
      backlog: { direction, taken: [storyBWithPlan], queued: [storyA, storyC] },
      agentProfiles: [
        makeMe.anAgentProfile
          .executing({
            name: "Akiho",
            identity: readyIdentity,
            mode: "trunk",
            branch: "origin/main",
          })
          .please(),
      ],
    })
    .withRevision("completed", {
      message: "complete story C",
      backlog: { direction, taken: [storyBWithPlan], queued: [storyA] },
      doneRecords: [
        {
          ...makeMe.aDoneRecord
            .completed({
              identity: notRefinedIdentity,
              title: notRefinedStory,
              completedAt,
            })
            .please(),
          developer: integrationDeveloper.name,
        },
      ],
    })
    .please();
}

async function buildStoryColumnsJourney(): Promise<StoryColumnsJourney> {
  const completedAt =
    process.env.DOUGH_BACKLOG_COMPLETION_TIME ?? new Date().toISOString();
  const { origin, integration, fixture, revisions } =
    await materializeRepository(storyColumnsRepository(completedAt));
  rmSync(integration, { recursive: true, force: true });
  process.once("exit", () => {
    rmSync(fixture, { recursive: true, force: true });
  });
  // All consumers in this worker borrow the same origin until it exits.
  return {
    origin,
    cleanup: () => Promise.resolve(),
    queued: revisions.queued,
    preparing: revisions.preparing,
    taken: revisions.taken,
    completed: revisions.completed,
  };
}

let storyColumnsJourney: Promise<StoryColumnsJourney> | undefined;

export function publishStoryColumnsJourney(): Promise<StoryColumnsJourney> {
  storyColumnsJourney ??= buildStoryColumnsJourney().catch((error: unknown) => {
    storyColumnsJourney = undefined;
    throw error;
  });
  return storyColumnsJourney;
}
