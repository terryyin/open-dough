// The records the Taken slice clock journey (taken-slice-clock.spec.ts)
// publishes at one revision: Taken stories with counted plans, the agent
// profiles recording their Takes, when each plan was last committed, and
// when each profile was added (its Take), relative to the page's opening
// time.

import { renderSlicePlan } from "../../tests/support/published-plan.mjs";
import { renderStorySection } from "../../tests/support/published-seed.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import type {
  AgentProfile,
  Backlog,
  RevisionFacts,
} from "../../tests/support/repositoryTestData.mjs";
import { describedFiles } from "./describedRevisions.ts";
import { addedAt, type PathHistories } from "./pathHistoryAnswers.ts";

export const repository = "terryyin/open-dough";
const seedPath = ".planning/seeds/SEED-091-clock.md";
export const revision = "c3".repeat(20);
// The page pauses at this run's time: journeys also keep machine sessions,
// whose retention is measured by the server's real clock.
export const opened = new Date();

const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);

export const afterTake = "Slice committed after the Take";
export const justTaken = "Taken after planning days ago";
export const beforeProfiles = "Taken before agent profiles existed";
export const timeUnread = "Plan commit time unavailable";

export const stories = [
  { title: afterTake, anchor: "after-take", agent: "Akiho" },
  { title: justTaken, anchor: "just-taken", agent: "Yuma" },
  { title: beforeProfiles, anchor: "before-profiles", agent: undefined },
  { title: timeUnread, anchor: "time-unread", agent: "Sola" },
] as const;

export const planPath = (anchor: string) =>
  `.planning/slice-plans/091-${anchor}/PLAN.md`;
export const profilePath = (agent: string) =>
  `.planning/agents/${agent.toLowerCase()}-chan.json`;

const entries = stories.map(({ title, anchor }) =>
  makeMe.aBacklogEntry
    .with({
      identity: `SEED-091#${anchor}`,
      href: `seeds/SEED-091-clock.md#${anchor}`,
      title,
    })
    .please(),
);
const seed = `# Slice clock fixture

${entries.map((entry) => renderStorySection(entry)).join("\n")}`;

const plan = renderSlicePlan(
  makeMe.aSlicePlan
    .with({
      slices: [
        makeMe.aPlanSlice
          .with({
            index: 1,
            name: "First slice",
            status: "done",
            proof: "A journey observes slice 1.",
          })
          .please(),
        makeMe.aPlanSlice
          .with({
            index: 2,
            name: "Second slice",
            proof: "A journey observes slice 2.",
          })
          .please(),
      ],
    })
    .please(),
  { heading: "Slices" },
);

// The revision's facts: each story Taken and planned, each Take's profile,
// and, beside them, `queued` stories and `agentProfiles` a journey adds.
export function clockedFacts({
  queued = [],
  agentProfiles = [],
}: {
  readonly queued?: Backlog["queued"];
  readonly agentProfiles?: readonly AgentProfile[];
} = {}): RevisionFacts {
  return {
    backlog: {
      taken: entries,
      queued,
    },
    files: {
      [seedPath]: seed,
      ...Object.fromEntries(
        stories.map(({ anchor }) => [planPath(anchor), plan]),
      ),
    },
    storyStates: stories.map(({ anchor }) => ({
      identity: `SEED-091#${anchor}`,
      href: `seeds/SEED-091-clock.md#${anchor}`,
      ...makeMe.aStoryPreparation
        .plannedIn(`../slice-plans/091-${anchor}/PLAN.md`)
        .please(),
    })),
    agentProfiles: [
      ...stories.flatMap(({ anchor, agent }) =>
        agent === undefined
          ? []
          : [
              makeMe.anAgentProfile
                .executing({
                  name: agent,
                  identity: `SEED-091#${anchor}`,
                  mode: "trunk",
                  branch: "origin/main",
                  host: "claude",
                })
                .please(),
            ],
      ),
      ...agentProfiles,
    ],
  };
}

export const files: Record<string, string> = describedFiles(clockedFacts());

// When each plan was last committed at the revision. The unread story's plan
// is omitted so GitHub's empty commit list answers (established absence).
export const committed: Record<string, Date> = {
  [planPath("after-take")]: minutesBefore(12),
  [planPath("just-taken")]: minutesBefore(2 * 24 * 60),
  [planPath("before-profiles")]: minutesBefore(40),
};

// Each profile's history at the revision: the one commit that added it, the
// Take.
export const takes = {
  Akiho: addedAt(0x51, minutesBefore(30)),
  Yuma: addedAt(0x52, minutesBefore(5)),
  Sola: addedAt(0x53, minutesBefore(20)),
};
export const history: PathHistories = Object.fromEntries(
  Object.entries(takes).map(([agent, take]) => [profilePath(agent), [take]]),
);
