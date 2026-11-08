// The Open Dough project the reopened-project journey publishes
// (./observation/reopened-project-reads.spec.ts): revision A, whose backlog names a story
// with progress on its recorded story branch and a queued story whose record
// is missing, and revision B, made by one commit that changes the backlog and
// publishes that record.

import { renderSlicePlan } from "../../tests/support/published-plan.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import type { PublishedRevision } from "./publishedFiles.ts";
import { addedAt, type MadeCommit } from "./pathHistoryAnswers.ts";
import { describedRevisions } from "./describedRevisions.ts";
import type { RevisionFacts } from "../../tests/support/repositoryTestData.mjs";

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

const backlogNaming = (queued: string) => ({
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
`;

const missingSeed = `# Missing fixture

<a id="missing"></a>

### ${queuedAgainTitle}

**Identity:** SEED-262#missing
`;

// The plan with `done` of its eight slices done.
const planDone = (done: number) =>
  renderSlicePlan(
    makeMe.aSlicePlan
      .withStatuses(
        [...Array(8).keys()].map((index) =>
          index < done ? "done" : "planned",
        ),
      )
      .please(),
    { heading: "Slices" },
  );

// Trunk at A: the Taken story planned, on its story branch.
const atTrunk = {
  backlog: backlogNaming(queuedTitle),
  files: { [seedPath]: seed, [planPath]: planDone(0) },
  storyStates: [
    {
      identity: "SEED-261#on-branch",
      href: "seeds/SEED-261-reopen.md#on-branch",
      ...makeMe.aStoryPreparation
        .plannedIn("../slice-plans/261-on-branch/PLAN.md")
        .please(),
    },
  ],
  agentProfiles: [
    makeMe.anAgentProfile
      .executing({
        name: "Akiho",
        identity: "SEED-261#on-branch",
        mode: "story-branch",
        branch,
        host: "claude",
      })
      .please(),
  ],
} satisfies RevisionFacts;

// B renames the queued story and publishes its record.
const published = describedRevisions(
  makeMe.aRepository
    .withRevision("A", atTrunk)
    .withRevision("B", {
      backlog: backlogNaming(queuedAgainTitle),
      files: { [missingSeedPath]: missingSeed },
    })
    .please(),
  { A: revisionA, B: revisionB },
);

export const atA: PublishedRevision = {
  ...published.A,
  committed: { [planPath]: minutesBefore(3 * 24 * 60) },
  history: { [profilePath]: [addedAt(0x61, minutesBefore(60))] },
};

export const atB: PublishedRevision = { ...atA, ...published.B };

// The commit B was made by.
export const madeB: MadeCommit = {
  sha: "6d".repeat(20),
  committer: "Fixture Committer",
  files: [
    { filename: backlogPath, status: "modified" },
    { filename: missingSeedPath, status: "added" },
  ],
};

// The story branch, from A, records six of the plan's slices done.
export const onBranch: PublishedRevision = {
  ...describedRevisions(
    makeMe.aRepository
      .withRevision("A", atTrunk)
      .withRevision("head", { files: { [planPath]: planDone(6) } })
      .please(),
    { A: revisionA, head: branchHead },
  ).head,
  committed: { [planPath]: minutesBefore(7) },
};
