// @ts-check
import { splitHref } from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import { makeMe } from "./makeMe.mjs";
import { direction } from "./product-backlog-fixture.mjs";

/** @typedef {Parameters<typeof makeMe.aBacklogEntry.with>[0]} BacklogEntry */

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

export function queuedReadyRepository() {
  const queued = [storyA, storyB];
  const readyFiles = queued.flatMap(
    /** @returns {[string, string][]} */
    (entry) => [
      [
        `.planning/${splitHref(entry.href).path}`,
        storySeed(entry, `Execute ${seedKey(entry)}.`),
      ],
      [
        `.planning/${storyPlanPath(entry)}`,
        `# ${entry.title} plan\n\nExecute the selected startup story.\n`,
      ],
    ],
  );
  return makeMe.aRepository.withRevision("base", {
    message: "base trunk commit",
    backlog: { direction, queued },
    files: { "trunk.txt": "base\n", ...Object.fromEntries(readyFiles) },
    storyStates: queued.map(readyStoryState),
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
