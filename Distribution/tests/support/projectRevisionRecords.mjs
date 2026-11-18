// @ts-check
// What one labeled project revision publishes for the authenticated-read
// reuse boundaries. The label is in the titles and prose so one revision's
// blobs cannot stand in for another's. A later revision inherits these
// files and applies only the facts a test states.

import { makeMe } from "./makeMe.mjs";
import { renderStorySection } from "./published-seed.mjs";
import { renderPublishedRevisions } from "./repository-revision-files.mjs";

/** @typedef {import("./repositoryTestData.mjs").RevisionFacts} RevisionFacts */
/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs").renderEntry>[0]} BacklogEntry */

// The renderer names profiles and done records from the facts below.
export const projectRevisionLayout = /** @type {const} */ ({
  sourceId: "open-dough",
  backlog: ".planning/PRODUCT-BACKLOG.md",
  seed: ".planning/seeds/SEED-301-reuse.md",
  otherSeed: ".planning/seeds/SEED-302-other.md",
  newSeed: ".planning/seeds/SEED-303-new.md",
  plan: ".planning/slice-plans/301-reuse/PLAN.md",
  profile: ".planning/agents/akiho-chan.json",
  otherProfile: ".planning/agents/maki-chan.json",
  settings: ".planning/open-dough.json",
  done: ".planning/done/SEED-300_first.json",
  addedDone: ".planning/done/SEED-304_added.json",
  doneCatalog: ".planning/done/.catalog.json",
});

/** @returns {BacklogEntry} */
export function projectNewSeedEntry() {
  return makeMe.aBacklogEntry
    .with({
      identity: "SEED-303#new",
      href: "seeds/SEED-303-new.md#new",
      title: "New",
    })
    .please();
}

/** The seed at `newSeed` named by {@link projectNewSeedEntry}. */
export function projectNewSeedText() {
  return `# New

${renderStorySection(projectNewSeedEntry())}`;
}

/**
 * The backlog `label` publishes: the reused story Taken, the other queued,
 * and `extra` queued after it.
 * @param {string} label
 * @param {BacklogEntry} [extra]
 * @returns {{ taken: BacklogEntry[], queued: BacklogEntry[] }}
 */
export function projectBacklog(label, extra) {
  const reuse = makeMe.aBacklogEntry
    .with({
      identity: "SEED-301#reuse",
      href: "seeds/SEED-301-reuse.md#reuse",
      title: `Reuse ${label}`,
    })
    .please();
  const other = makeMe.aBacklogEntry
    .with({
      identity: "SEED-302#other",
      href: "seeds/SEED-302-other.md#other",
      title: `Other ${label}`,
    })
    .please();
  return {
    taken: [reuse],
    queued: extra === undefined ? [other] : [other, extra],
  };
}

/**
 * A done record `complete` published, titled for `label`.
 * @param {string} identity
 * @param {string} label
 */
export function projectDoneRecord(identity, label) {
  return makeMe.aDoneRecord
    .with({
      identity,
      title: `Finish ${label}`,
      completedAt: "2026-10-01T00:00:00.000Z",
      developer: "Terry Yin",
    })
    .please();
}

/**
 * @template T
 * @param {readonly T[]} values
 * @param {string} place
 * @returns {T}
 */
function first(values, place) {
  const value = values[0];
  if (value === undefined)
    throw new Error(`A project revision has no ${place}.`);
  return value;
}

/** @param {string} label @returns {RevisionFacts} */
function factsFor(label) {
  const backlog = projectBacklog(label);
  const reuse = first(backlog.taken, "taken story");
  const other = first(backlog.queued, "queued story");
  return {
    backlog: {
      taken: [...backlog.taken],
      queued: [...backlog.queued],
    },
    files: {
      [projectRevisionLayout.seed]: `# Reuse fixture ${label}

${renderStorySection(reuse)}`,
      [projectRevisionLayout.otherSeed]: `# Other fixture ${label}

${renderStorySection(other)}`,
      [projectRevisionLayout.plan]: `# Plan ${label}\n`,
      [projectRevisionLayout.settings]: `{"label":"${label}"}\n`,
    },
    storyStates: [
      {
        identity: reuse.identity,
        href: reuse.href,
        ...makeMe.aStoryPreparation
          .plannedIn("../slice-plans/301-reuse/PLAN.md")
          .please(),
      },
    ],
    agentProfiles: [
      makeMe.anAgentProfile
        .executing({
          name: "Akiho",
          identity: reuse.identity,
          mode: "story-branch",
          branch: `story/${label}`,
          host: "claude",
        })
        .please(),
      makeMe.anAgentProfile
        .executing({
          name: "Maki",
          identity: other.identity,
          mode: "trunk",
          host: "claude",
          branch: "main",
        })
        .please(),
    ],
    doneRecords: [projectDoneRecord("SEED-300#first", label)],
  };
}

/**
 * The files `label` publishes, or, when `facts` are given, the files after
 * a later revision changes them with those facts.
 * @param {string} label
 * @param {RevisionFacts | undefined} facts
 * @returns {Readonly<Record<string, string>>}
 */
export function publishedProjectFiles(label, facts) {
  const rendered = renderPublishedRevisions(
    makeMe.aRepository
      .withRevision("A", factsFor(label))
      .withRevision("B", facts ?? {})
      .please(),
  );
  const name = facts === undefined ? "A" : "B";
  return Object.fromEntries(
    Object.entries(rendered[name]).map(([path, content]) => [
      path,
      content.toString(),
    ]),
  );
}

/**
 * The reused story's seed as a revision for `label` publishes it.
 * @param {string} label
 */
export function projectSeedText(label) {
  const text = publishedProjectFiles(label, undefined)[
    projectRevisionLayout.seed
  ];
  if (text === undefined)
    throw new Error(`The revision publishes no ${projectRevisionLayout.seed}`);
  return text;
}
