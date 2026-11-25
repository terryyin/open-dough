// The Open Dough project the reopened-project journey publishes
// (../../e2e/observation/reopened-project-reads.spec.ts): revision A, whose backlog names a story
// with progress on its recorded story branch and a queued story whose record
// is missing, and revision B, made by one commit that changes the backlog and
// publishes that record.

import { renderSlicePlan } from "../../Distribution/tests/support/published-plan.mjs";
import { renderStorySection } from "../../Distribution/tests/support/published-seed.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { addedAt, type MadeCommit } from "./pathHistoryAnswers.ts";
import type { RevisionFacts } from "../../Distribution/tests/support/repositoryTestData.mjs";

export const repository = "terryyin/open-dough";
export const branch = "story/reopen";
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

const takenStory = makeMe.aBacklogEntry
  .with({
    identity: "SEED-261#on-branch",
    href: "seeds/SEED-261-reopen.md#on-branch",
    title: takenTitle,
  })
  .please();
const missingStory = (title: string) =>
  makeMe.aBacklogEntry
    .with({
      identity: "SEED-262#missing",
      href: "seeds/SEED-262-missing.md#missing",
      title,
    })
    .please();

const backlogNaming = (queued: string) => ({
  taken: [takenStory],
  queued: [missingStory(queued)],
});

const seed = `# Reopen fixture

${renderStorySection(takenStory)}`;

const missingSeed = `# Missing fixture

${renderStorySection(missingStory(queuedAgainTitle))}`;

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

// The story branch forks from A, and B renames the queued story and
// publishes its record on trunk.
export const reopenedHistory = makeMe.aRepository
  .withRevision("A", atTrunk)
  .withRevision("head", {
    parents: ["A"],
    tags: ["reopened-story-head"],
    files: { [planPath]: planDone(6) },
  })
  .withRevision("B", {
    parents: ["A"],
    backlog: backlogNaming(queuedAgainTitle),
    files: { [missingSeedPath]: missingSeed },
  })
  .please();

const trunkDetails = {
  committed: { [planPath]: minutesBefore(3 * 24 * 60) },
  history: { [profilePath]: [addedAt(0x61, minutesBefore(60))] },
};
export const reopenedDetails = () => ({
  A: trunkDetails,
  B: trunkDetails,
  head: { committed: { [planPath]: minutesBefore(7) } },
});

export const reopenedChange: Omit<MadeCommit, "sha"> = {
  committer: "Fixture Committer",
  files: [
    { filename: backlogPath, status: "modified" },
    { filename: missingSeedPath, status: "added" },
  ],
};
