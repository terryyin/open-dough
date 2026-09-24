// The records the branch slice progress journey (branch-slice-progress.spec.ts)
// publishes: trunk at one revision, with Taken stories, their plans, and the
// agent profiles recording where each is published (spelled by the shared
// profile renderer), and the story branches published beside it, each at its
// own head. Commit times are relative to the page's opening time.

import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { PublishedRevision } from "./publishedFiles";

export const repository = "terryyin/open-dough";
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
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
  `.planning/quick/092-${anchor}/PLAN.md`;
export const profilePath = (agent: string) =>
  `.planning/agents/${agent.toLowerCase()}-chan.json`;

// A plan whose slices sit under `## Slices`, the first `done` of them
// recorded done, and the rest planned -- or, given `status`, one more slice
// recording that status.
function plan(total: number, done: number, status?: string): string {
  const slices = Array.from(Array(total).keys(), (at) => {
    const index = at + 1;
    const recorded =
      status !== undefined && index === total
        ? status
        : index <= done
          ? "done"
          : "planned";
    return `### ${String(index)}. Slice ${String(index)}
Type: Behavior
Status: ${recorded}
Proof: A journey observes slice ${String(index)}.
`;
  });
  return `# Plan\n\n## Slices\n\n${slices.join("\n")}`;
}

const backlog = `# Product backlog

## Taken

${stories
  .map(
    ({ title, anchor }) =>
      `- [${title}](seeds/SEED-092-branch.md#${anchor}) — SEED-092#${anchor}`,
  )
  .join("\n")}

## Backlog list
`;

const seed = `# Branch progress fixture

${stories
  .map(
    ({ title, anchor }) => `<a id="${anchor}"></a>

### ${title}

**Identity:** SEED-092#${anchor}
\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/092-${anchor}/PLAN.md"}
\`\`\`
`,
  )
  .join("\n")}`;

const trunkFiles: Record<string, string> = {
  [backlogPath]: backlog,
  [seedPath]: seed,
};
for (const { anchor, owners } of stories) {
  // Trunk's copy of the branch story's plan is as it was at Take.
  trunkFiles[planPath(anchor)] =
    anchor === "on-branch" ? plan(8, 0) : plan(2, 1);
  for (const { agent, mode, branch } of owners) {
    trunkFiles[profilePath(agent)] = renderAgentProfile({
      name: agent,
      identity: `SEED-092#${anchor}`,
      mode,
      branch,
      host: "claude",
      model: undefined,
    });
  }
}

export const trunk: PublishedRevision = {
  revision,
  files: trunkFiles,
  committed: {
    [planPath("on-branch")]: minutesBefore(3 * 24 * 60),
    [profilePath("Akiho")]: minutesBefore(60),
    [planPath("on-trunk")]: minutesBefore(12),
    [profilePath("Yuma")]: minutesBefore(30),
    [planPath("before-profiles")]: minutesBefore(40),
  },
};

export const branchHead = "e5".repeat(20);
// Named for the story taken before profiles, but recorded by nothing.
export const similarlyNamed = "story/taken-before-agent-profiles";

// The published branch heads. `story/deleted` is not among them.
export const branches: Readonly<Record<string, PublishedRevision>> = {
  "story/example": {
    revision: branchHead,
    files: { ...trunkFiles, [planPath("on-branch")]: plan(8, 6) },
    committed: {
      [planPath("on-branch")]: minutesBefore(7),
      [profilePath("Akiho")]: minutesBefore(60),
    },
  },
  "story/two-owners": { revision: "f1".repeat(20), files: trunkFiles },
  "story/two-owners-again": { revision: "f2".repeat(20), files: trunkFiles },
  "story/plan-missing": {
    revision: "f3".repeat(20),
    files: Object.fromEntries(
      Object.entries(trunkFiles).filter(
        ([path]) => path !== planPath("plan-missing"),
      ),
    ),
  },
  "story/uninterpretable": {
    revision: "f4".repeat(20),
    files: {
      ...trunkFiles,
      [planPath("plan-uninterpretable")]: plan(3, 1, "merged into slice 1"),
    },
  },
  [similarlyNamed]: {
    revision: "f5".repeat(20),
    files: { ...trunkFiles, [planPath("before-profiles")]: plan(2, 2) },
  },
};
