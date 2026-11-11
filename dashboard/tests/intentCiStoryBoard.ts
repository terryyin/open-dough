// The Open Dough board the story CI status journeys publish
// (./intentCiStoryRecords.ts): Taken stories whose agent profiles (spelled by
// the shared profile renderer) record Story Branch Mode branches, Trunk Mode,
// two owners, an unusable name, and a branch no longer published; a queued
// story and one being prepared (a preparation profile names it); and a
// Recently done story. The failing story has a counted plan, so the page
// reads its progress on its branch and its revision check watches that head.

import { renderSlicePlan } from "../../tests/support/published-plan.mjs";
import { renderStorySection } from "../../tests/support/published-seed.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { describedFiles } from "./describedRevisions.ts";

export const failing = {
  title: "Story whose branch fails",
  anchor: "failing",
  branch: "codex/example-story",
};
export const planningOnly = {
  title: "Story with only planning commits",
  anchor: "planning-only",
  branch: "codex/planning-only",
};
export const running = {
  title: "Story whose run is in progress",
  anchor: "running",
  branch: "codex/running-story",
};
export const onTrunk = { title: "Story taken on trunk", anchor: "on-trunk" };
export const twoOwners = { title: "Story named twice", anchor: "two-owners" };
export const unusable = {
  title: "Story on an unusable branch",
  anchor: "unusable",
  branch: "story/café",
};
export const removed = {
  title: "Story whose branch was removed",
  anchor: "removed",
  branch: "codex/removed-branch",
};
export const queued = { title: "Story still queued", anchor: "queued" };
export const preparing = {
  title: "Story being prepared",
  anchor: "preparing",
};
export const done = {
  identity: "SEED-219#done-story",
  title: "Story done earlier",
};

const identity = (anchor: string) => `SEED-219#${anchor}`;
const taken = [
  failing,
  planningOnly,
  running,
  onTrunk,
  twoOwners,
  unusable,
  removed,
];

const profile = (
  agent: string,
  anchor: string,
  mode: "trunk" | "story-branch",
  branch: string,
) =>
  makeMe.anAgentProfile
    .executing({
      name: agent,
      identity: identity(anchor),
      mode,
      branch,
      host: "claude",
    })
    .please();

const entry = ({ title, anchor }: { title: string; anchor: string }) =>
  makeMe.aBacklogEntry
    .with({
      title,
      href: `seeds/SEED-219-story-ci.md#${anchor}`,
      identity: identity(anchor),
    })
    .please();

const failingPlan = `.planning/slice-plans/219-${failing.anchor}/PLAN.md`;
const plan = renderSlicePlan(
  makeMe.aSlicePlan
    .with({
      slices: [
        makeMe.aPlanSlice
          .with({
            index: 1,
            name: "Slice 1",
            proof: "A journey observes slice 1.",
          })
          .please(),
      ],
    })
    .please(),
  { heading: "Slices" },
);

const membership = [...taken, queued, preparing].map(entry);
const seed = `# Story CI fixture

${membership.map((story) => renderStorySection(story)).join("\n")}`;

export const storyBoardFiles: Record<string, string> = describedFiles({
  backlog: {
    taken: membership.slice(0, taken.length),
    queued: membership.slice(taken.length),
  },
  files: {
    ".planning/seeds/SEED-219-story-ci.md": seed,
    [failingPlan]: plan,
  },
  storyStates: [
    {
      identity: identity(failing.anchor),
      href: `seeds/SEED-219-story-ci.md#${failing.anchor}`,
      ...makeMe.aStoryPreparation
        .plannedIn(`../slice-plans/219-${failing.anchor}/PLAN.md`)
        .please(),
    },
  ],
  agentProfiles: [
    profile("Akiho", failing.anchor, "story-branch", failing.branch),
    profile("Yuma", planningOnly.anchor, "story-branch", planningOnly.branch),
    profile("Sola", running.anchor, "story-branch", running.branch),
    profile("Mana", onTrunk.anchor, "trunk", "origin/main"),
    profile("Kirara", twoOwners.anchor, "story-branch", "codex/one"),
    profile("Tsubomi", twoOwners.anchor, "story-branch", "codex/two"),
    profile("Yumi", unusable.anchor, "story-branch", unusable.branch),
    profile("Rio", removed.anchor, "story-branch", removed.branch),
    makeMe.anAgentProfile
      .preparing({
        name: "Aino",
        identity: identity(preparing.anchor),
        host: "claude",
      })
      .please(),
  ],
  doneRecords: [
    makeMe.aDoneRecord
      .with({
        ...done,
        completedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        developer: "Terry Yin",
      })
      .please(),
  ],
});
