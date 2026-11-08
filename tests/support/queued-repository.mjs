// @ts-check
import { claimCommitMessage } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-ownership.mjs";
import { agentIdentity } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { splitHref } from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import {
  readStoryDependencies,
  updateStoryDependency,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs";
import {
  computeBasis,
  recordStoryState,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { makeMe } from "./makeMe.mjs";
import { direction } from "./product-backlog-fixture.mjs";

/** @typedef {Parameters<typeof makeMe.aBacklogEntry.with>[0]} BacklogEntry */
/** @typedef {ReturnType<ReturnType<typeof makeMe.aSupplierAgreement.with>["please"]>} SupplierAgreement */
/** @typedef {Pick<import("./repositoryTestData.mjs").StoryState, "assessment" | "reasons">} Assessment */

export const storyA = makeMe.aBacklogEntry
  .with({ identity: "SEED-A#a", href: "seeds/A.md#a", title: "Story A" })
  .please();
export const storyB = makeMe.aBacklogEntry
  .with({ identity: "SEED-B#b", href: "seeds/B.md#b", title: "Story B" })
  .please();
export const roughStoryC = makeMe.aBacklogEntry
  .with({ identity: "SEED-C#c", href: "seeds/C.md#c", title: "Story C" })
  .please();

/** @param {BacklogEntry} entry */
const seedId = ({ identity }) => identity.split("#", 1)[0] ?? identity;
/** @param {BacklogEntry} entry */
const seedKey = (entry) => seedId(entry).slice("SEED-".length);

/** @param {BacklogEntry} entry */
export const storyPlanPath = (entry) => `slice-plans/${seedKey(entry)}/PLAN.md`;

/** @param {BacklogEntry} entry */
const storyPlan = (entry) =>
  `# ${entry.title} plan\n\nExecute the selected startup story.\n`;

/** @param {BacklogEntry} entry @param {string} body */
export function storySeed(entry, body) {
  const { identity, title, href } = entry;
  return `---\nid: ${seedId(entry)}\n---\n\n# Seed ${seedKey(entry)}\n\n<a id="${splitHref(href).anchor}"></a>\n\n### ${title}\n\n**Identity:** ${identity}\n\n${body}\n`;
}

/** @param {BacklogEntry} entry */
export function readyStoryState(entry) {
  return {
    identity: entry.identity,
    href: entry.href,
    ...makeMe.aStoryPreparation
      .with({
        refinement: "refined",
        approach: "planned",
        plan: `../${storyPlanPath(entry)}`,
        assessment: "ready",
      })
      .please(),
  };
}

/**
 * The A/B fixture seed with its readiness recorded on its own seed and plan.
 * @param {BacklogEntry} entry
 * @param {Assessment} [assessment]
 * @returns {string}
 */
export function reviewedStorySeed(entry, assessment = {}) {
  const seed = storySeed(entry, `Execute ${seedKey(entry)}.`);
  const planSource = storyPlan(entry);
  const state = { ...readyStoryState(entry), ...assessment };
  return recordStoryState(
    seed,
    { ...state, expectedBasis: computeBasis(seed, planSource) },
    { planSource },
  ).source;
}

/**
 * Encode published agreements, in order, on the previously assessed A/B
 * fixture seed.
 * @param {BacklogEntry} entry
 * @param {readonly SupplierAgreement[]} dependencies
 * @param {Assessment} [assessment]
 * @returns {string}
 */
export function queuedSeedWithDependencies(
  entry,
  dependencies,
  assessment = {},
) {
  return dependencies.reduce(
    (source, dependency) =>
      updateStoryDependency(source, {
        identity: entry.identity,
        href: entry.href,
        dependency,
        expectedBasis: readStoryDependencies(source, entry.href).basis,
      }).source,
    reviewedStorySeed(entry, assessment),
  );
}

/**
 * Encode a published agreement on the previously assessed A/B fixture seed.
 * @param {BacklogEntry} entry
 * @param {SupplierAgreement} dependency
 * @param {Assessment} [assessment]
 */
export function queuedSeedWithDependency(entry, dependency, assessment = {}) {
  return queuedSeedWithDependencies(entry, [dependency], assessment);
}

/** @param {readonly BacklogEntry[]} queued */
export function queuedReadyPlanning(queued) {
  const readyFiles = queued.flatMap(
    /** @returns {[string, string][]} */
    (entry) => [
      [
        `.planning/${splitHref(entry.href).path}`,
        storySeed(entry, `Execute ${seedKey(entry)}.`),
      ],
      [`.planning/${storyPlanPath(entry)}`, storyPlan(entry)],
    ],
  );
  return {
    backlog: { direction, queued },
    files: Object.fromEntries(readyFiles),
    storyStates: queued.map(readyStoryState),
  };
}

/** @param {{ queued?: readonly BacklogEntry[], files?: Readonly<Record<string, string | Buffer>> }} [options] */
export function queuedReadyRepository({
  queued = [storyA, storyB],
  files = {},
} = {}) {
  const planning = queuedReadyPlanning(queued);
  return makeMe.aRepository.withRevision("base", {
    ...planning,
    message: "base trunk commit",
    files: { "trunk.txt": "base\n", ...planning.files, ...files },
  });
}

/** @param {BacklogEntry} roughStory */
export function queuedRepositoryWithRoughStory(roughStory) {
  const key = seedKey(roughStory);
  return queuedReadyRepository().withRevision("queued", {
    message: `queue story ${key}`,
    backlog: { direction, queued: [storyA, storyB, roughStory] },
    files: {
      [`.planning/${splitHref(roughStory.href).path}`]: storySeed(
        roughStory,
        `Rough idea for ${key}.`,
      ),
    },
  });
}

/**
 * The revision an agent's start publishes when it takes `story`: the story
 * Taken with its plan, `queued` left in the Backlog list, and the agent's
 * execution profile, authored by the agent and committed by the developer
 * under the claim message. Trunk Mode unless a story `branch` is named.
 * @param {{ story: BacklogEntry, queued: readonly BacklogEntry[], agent: string, committer: import("./repositoryTestData.mjs").GitPerson, branch?: string, host?: string, publisher?: string }} facts
 */
export function takeRevision({
  story,
  queued,
  agent,
  committer,
  branch,
  host,
  publisher = "publisher-trunk",
}) {
  const { agent: author, email } = agentIdentity(agent);
  const assignment = { name: agent, identity: story.identity, host };
  return {
    message: `${claimCommitMessage(story.identity, publisher)}Co-authored-by: ${committer.name} <${committer.email}>`,
    backlog: {
      direction,
      taken: [
        makeMe.aBacklogEntry
          .with({
            ...story,
            plan: { label: "plan", target: storyPlanPath(story) },
          })
          .please(),
      ],
      queued,
    },
    agentProfiles: [
      (branch === undefined
        ? makeMe.anAgentProfile.executing(assignment)
        : makeMe.anAgentProfile.executing({
            ...assignment,
            mode: "story-branch",
            branch,
          })
      ).please(),
    ],
    author: { name: author, email },
    committer,
  };
}

/** @param {{ agent: string, committer: import("./repositoryTestData.mjs").GitPerson }} facts */
export function queuedRepositoryWithTakenStoryA(facts) {
  return queuedReadyRepository().withRevision(
    "taken",
    takeRevision({ story: storyA, queued: [storyB], ...facts }),
  );
}
