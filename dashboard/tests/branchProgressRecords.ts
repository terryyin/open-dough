// The records the branch slice progress journeys
// (branch-slice-progress.spec.ts, auto-refresh-branches.spec.ts,
// auto-refresh-unusable-branch.spec.ts) publish, and the plan shapes
// taken-execution-complete.spec.ts also publishes:
// trunk at one revision, with Taken stories, their plans, and the agent
// profiles recording where each is published, and the story branches
// published beside it, each at its own head. Commit times, of plans and of the commits adding each profile
// (its Take), are relative to the page's opening time.

import { renderSlicePlan } from "../../tests/support/published-plan.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import type { RevisionFacts } from "../../tests/support/repositoryTestData.mjs";
import type { PublishedRevision } from "./publishedFiles.ts";
import { addedAt } from "./pathHistoryAnswers.ts";
import { describedRevisions } from "./describedRevisions.ts";

export const repository = "terryyin/open-dough";
const seedPath = ".planning/seeds/SEED-092-branch.md";
export const revision = "d4".repeat(20);
export const opened = new Date("2026-09-24T09:00:00.000Z");

const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);

export const onBranch = "Progress published on its story branch";
export const onTrunk = "Progress published on trunk";
export const beforeProfiles = "Taken before agent profiles existed";
export const twoOwners = "Named by two agent profiles";
export const branchDeleted = "Recorded branch deleted";
export const planMissing = "Plan missing on its branch";
export const planUninterpretable = "Plan uninterpretable on its branch";

type Story = {
  readonly title: string;
  readonly anchor: string;
  // Who took it, in which mode on which branch; none before profiles.
  readonly owners: ReadonlyArray<{
    readonly agent: string;
    readonly mode: "trunk" | "story-branch";
    readonly branch: string;
  }>;
};

export const stories: readonly Story[] = [
  {
    title: onBranch,
    anchor: "on-branch",
    owners: [{ agent: "Akiho", mode: "story-branch", branch: "story/example" }],
  },
  {
    title: onTrunk,
    anchor: "on-trunk",
    owners: [{ agent: "Yuma", mode: "trunk", branch: "origin/main" }],
  },
  { title: beforeProfiles, anchor: "before-profiles", owners: [] },
  {
    title: twoOwners,
    anchor: "two-owners",
    owners: [
      { agent: "Sola", mode: "story-branch", branch: "story/two-owners" },
      { agent: "Mana", mode: "story-branch", branch: "story/two-owners-again" },
    ],
  },
  {
    title: branchDeleted,
    anchor: "branch-deleted",
    owners: [
      { agent: "Kirara", mode: "story-branch", branch: "story/deleted" },
    ],
  },
  {
    title: planMissing,
    anchor: "plan-missing",
    owners: [
      { agent: "Tsubomi", mode: "story-branch", branch: "story/plan-missing" },
    ],
  },
  {
    title: planUninterpretable,
    anchor: "plan-uninterpretable",
    owners: [
      { agent: "Yumi", mode: "story-branch", branch: "story/uninterpretable" },
    ],
  },
];

export const planPath = (anchor: string) =>
  `.planning/slice-plans/092-${anchor}/PLAN.md`;
export const profilePath = (agent: string) =>
  `.planning/agents/${agent.toLowerCase()}-chan.json`;

const seed = `# Branch progress fixture

${stories
  .map(
    ({ title, anchor }) => `<a id="${anchor}"></a>

### ${title}

**Identity:** SEED-092#${anchor}
`,
  )
  .join("\n")}`;

// The plan with `statuses`.
const planOf = (
  statuses: Parameters<typeof makeMe.aSlicePlan.withStatuses>[0],
) =>
  renderSlicePlan(makeMe.aSlicePlan.withStatuses(statuses).please(), {
    heading: "Slices",
  });

// Trunk's facts: each story Taken and planned, each owner's profile. Trunk's
// copy of the branch story's plan is as it was at Take.
const atTrunk = {
  backlog: {
    taken: stories.map(({ title, anchor }) =>
      makeMe.aBacklogEntry
        .with({
          identity: `SEED-092#${anchor}`,
          href: `seeds/SEED-092-branch.md#${anchor}`,
          title,
        })
        .please(),
    ),
  },
  files: {
    [seedPath]: seed,
    ...Object.fromEntries(
      stories.map(({ anchor }) => [
        planPath(anchor),
        planOf(
          anchor === "on-branch"
            ? Array.from({ length: 8 }, () => "planned" as const)
            : ["done", "planned"],
        ),
      ]),
    ),
  },
  storyStates: stories.map(({ anchor }) => ({
    identity: `SEED-092#${anchor}`,
    href: `seeds/SEED-092-branch.md#${anchor}`,
    ...makeMe.aStoryPreparation
      .plannedIn(`../slice-plans/092-${anchor}/PLAN.md`)
      .please(),
  })),
  agentProfiles: stories.flatMap(({ anchor, owners }) =>
    owners.map(({ agent, mode, branch }) =>
      makeMe.anAgentProfile
        .executing({
          name: agent,
          identity: `SEED-092#${anchor}`,
          mode,
          branch,
          host: "claude",
        })
        .please(),
    ),
  ),
} satisfies RevisionFacts;

// A revision at `sha` made from trunk's by `facts`: a branch head, or trunk
// moved.
export const fromTrunk = (sha: string, facts: RevisionFacts) =>
  describedRevisions(
    makeMe.aRepository
      .withRevision("trunk", atTrunk)
      .withRevision("head", facts)
      .please(),
    { trunk: revision, head: sha },
  ).head;

const trunkFiles = fromTrunk(revision, {}).files;

export const trunk: PublishedRevision = {
  revision,
  files: trunkFiles,
  committed: {
    [planPath("on-branch")]: minutesBefore(3 * 24 * 60),
    [planPath("on-trunk")]: minutesBefore(12),
    [planPath("before-profiles")]: minutesBefore(40),
  },
  history: {
    [profilePath("Akiho")]: [addedAt(0x61, minutesBefore(60))],
    [profilePath("Yuma")]: [addedAt(0x62, minutesBefore(30))],
  },
};

export const branchHead = "e5".repeat(20);
// Named for the story taken before profiles, but recorded by nothing.
export const similarlyNamed = "story/taken-before-agent-profiles";

// The published branch heads. `story/deleted` is not among them.
export const branches: Readonly<Record<string, PublishedRevision>> = {
  "story/example": {
    ...fromTrunk(branchHead, {
      files: {
        [planPath("on-branch")]: planOf([
          ...Array.from({ length: 6 }, () => "done" as const),
          "planned",
          "planned",
        ]),
      },
    }),
    committed: { [planPath("on-branch")]: minutesBefore(7) },
  },
  "story/two-owners": { revision: "f1".repeat(20), files: trunkFiles },
  "story/two-owners-again": { revision: "f2".repeat(20), files: trunkFiles },
  "story/plan-missing": fromTrunk("f3".repeat(20), {
    remove: [planPath("plan-missing")],
  }),
  "story/uninterpretable": fromTrunk("f4".repeat(20), {
    files: {
      // A slice status no reader interprets: the bytes the card's gap is about.
      [planPath("plan-uninterpretable")]: `${planOf(["done", "planned"])}
### 3. Slice 3
Type: Behavior
Status: merged into slice 1
Proof: A journey observes slice 3.
`,
    },
  }),
  [similarlyNamed]: fromTrunk("f5".repeat(20), {
    files: { [planPath("before-profiles")]: planOf(["done", "done"]) },
  }),
};
