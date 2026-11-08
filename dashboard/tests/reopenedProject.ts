// The Open Dough project the reopened-project journey publishes
// (./observation/reopened-project-reads.spec.ts): revision A, whose backlog names a story
// with progress on its recorded story branch and a queued story whose record
// is missing, and revision B, made by one commit that changes the backlog and
// publishes that record.

import { renderPublishedPreparation } from "../../tests/support/story-preparation.mjs";
import { renderSlicePlan } from "../../tests/support/published-plan.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { renderPublishedBacklog } from "../../tests/support/published-backlog.mjs";
import type { PublishedRevision } from "./publishedFiles.ts";
import { addedAt, type MadeCommit } from "./pathHistoryAnswers.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export const repository = "terryyin/open-dough";
export const revisionA = "6a".repeat(20);
export const revisionB = "6b".repeat(20);
export const branch = "story/reopen";
export const branchHead = "6c".repeat(20);
export const opened = new Date("2026-10-06T09:00:00.000Z");
const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);

export const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const seedPath = ".planning/seeds/SEED-261-reopen.md";
// Named by the backlog, but published at no revision.
export const missingSeedPath = ".planning/seeds/SEED-262-missing.md";
export const planPath = ".planning/slice-plans/261-on-branch/PLAN.md";
const profilePath = ".planning/agents/akiho-chan.json";

export const takenTitle = "Progress published on its story branch";
export const queuedTitle = "Queued story whose record is missing";
export const queuedAgainTitle = "Queued story published again";

const backlogNaming = (queued: string) =>
  renderPublishedBacklog({
    taken: [
      makeMe.aBacklogEntry
        .with({
          identity: "SEED-261#on-branch",
          href: "seeds/SEED-261-reopen.md#on-branch",
          title: takenTitle,
        })
        .please(),
    ],
    queued: [
      makeMe.aBacklogEntry
        .with({
          identity: "SEED-262#missing",
          href: "seeds/SEED-262-missing.md#missing",
          title: queued,
        })
        .please(),
    ],
  });

const seed = `# Reopen fixture

<a id="on-branch"></a>

### ${takenTitle}

**Identity:** SEED-261#on-branch
${renderPublishedPreparation(
  makeMe.aStoryPreparation
    .with({
      refinement: "refined",
      approach: "planned",
      plan: "../slice-plans/261-on-branch/PLAN.md",
    })
    .please(),
)}
`;

const missingSeed = `# Missing fixture

<a id="missing"></a>

### ${queuedAgainTitle}

**Identity:** SEED-262#missing
`;

const trunkFiles: Record<string, string> = {
  [backlogPath]: backlogNaming(queuedTitle),
  [seedPath]: seed,
  [planPath]: renderSlicePlan(
    makeMe.aSlicePlan
      .withStatuses([
        "planned",
        "planned",
        "planned",
        "planned",
        "planned",
        "planned",
        "planned",
        "planned",
      ])
      .please(),
    { heading: "Slices" },
  ),
  [profilePath]: renderAgentProfile(
    makeMe.anAgentProfile
      .executing({
        name: "Akiho",
        identity: "SEED-261#on-branch",
        mode: "story-branch",
        branch,
        host: "claude",
      })
      .please(),
  ),
};

export const atA: PublishedRevision = {
  revision: revisionA,
  files: trunkFiles,
  committed: { [planPath]: minutesBefore(3 * 24 * 60) },
  history: { [profilePath]: [addedAt(0x61, minutesBefore(60))] },
};

// The next commit renames the queued story and publishes its record.
export const atB: PublishedRevision = {
  ...atA,
  revision: revisionB,
  files: {
    ...trunkFiles,
    [backlogPath]: backlogNaming(queuedAgainTitle),
    [missingSeedPath]: missingSeed,
  },
};

// The commit B was made by.
export const madeB: MadeCommit = {
  sha: "6d".repeat(20),
  committer: "Fixture Committer",
  files: [
    { filename: backlogPath, status: "modified" },
    { filename: missingSeedPath, status: "added" },
  ],
};

export const onBranch: PublishedRevision = {
  revision: branchHead,
  files: {
    ...trunkFiles,
    [planPath]: renderSlicePlan(
      makeMe.aSlicePlan
        .withStatuses([
          "done",
          "done",
          "done",
          "done",
          "done",
          "done",
          "planned",
          "planned",
        ])
        .please(),
      { heading: "Slices" },
    ),
  },
  committed: { [planPath]: minutesBefore(7) },
};
