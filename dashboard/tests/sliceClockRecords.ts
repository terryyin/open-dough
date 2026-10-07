// The records the Taken slice clock journey (taken-slice-clock.spec.ts)
// publishes at one revision: Taken stories with counted plans, the agent
// profiles recording their Takes (spelled by the shared profile renderer),
// when each plan was last committed, and when each profile was added (its
// Take), relative to the page's opening time.

import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { addedAt, type PathHistories } from "./pathHistoryAnswers.ts";

export const repository = "terryyin/open-dough";
export const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const seedPath = ".planning/seeds/SEED-091-clock.md";
export const revision = "c3".repeat(20);
export const opened = new Date("2026-09-23T09:00:00.000Z");

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

const backlog = `# Product backlog

## Taken

${stories
  .map(
    ({ title, anchor }) =>
      `- [${title}](seeds/SEED-091-clock.md#${anchor}) — SEED-091#${anchor}`,
  )
  .join("\n")}

## Backlog list
`;

const seed = `# Slice clock fixture

${stories
  .map(
    ({ title, anchor }) => `<a id="${anchor}"></a>

### ${title}

**Identity:** SEED-091#${anchor}
\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/091-${anchor}/PLAN.md"}
\`\`\`
`,
  )
  .join("\n")}`;

const plan = `# Plan

## Slices

### 1. First slice
Type: Behavior
Status: done
Proof: A journey observes slice 1.

### 2. Second slice
Type: Behavior
Status: planned
Proof: A journey observes slice 2.
`;

export const files: Record<string, string> = {
  [backlogPath]: backlog,
  [seedPath]: seed,
};
for (const { anchor } of stories) {
  files[planPath(anchor)] = plan;
}
for (const { anchor, agent } of stories) {
  if (agent !== undefined) {
    files[profilePath(agent)] = renderAgentProfile({
      name: agent,
      identity: `SEED-091#${anchor}`,
      mode: "trunk",
      branch: "origin/main",
      host: "claude",
      model: undefined,
    });
  }
}

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
