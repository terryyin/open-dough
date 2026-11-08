// @ts-check
// The same published queue and recorded preparation for startup proofs in
// both the dashboard and the execution skills.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { splitHref } from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import {
  computeBasis,
  recordStoryState,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { makeMe } from "./makeMe.mjs";
import { direction } from "./product-backlog-fixture.mjs";
import { renderPublishedBacklog } from "./published-backlog.mjs";

/**
 * @param {string} planning
 * @param {string} key
 * @param {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs").renderEntry>[0]} entry
 */
function writeQueuedStory(planning, key, { identity, href, title }) {
  const { path, anchor } = splitHref(href);
  const planPath = `slice-plans/${key}/PLAN.md`;
  const plan = `# ${title} plan\n\nExecute the selected startup story.\n`;
  const seed = `---\nid: SEED-${key}\n---\n\n# Seed ${key}\n\n<a id="${anchor}"></a>\n\n### ${title}\n\n**Identity:** ${identity}\n\nExecute ${key}.\n`;
  const preparation = makeMe.aStoryPreparation
    .with({
      refinement: "refined",
      approach: "planned",
      plan: `../${planPath}`,
      assessment: "ready",
    })
    .please();
  const recorded = recordStoryState(
    seed,
    {
      identity,
      href,
      ...preparation,
      expectedBasis: computeBasis(seed, plan),
    },
    { planSource: plan },
  );
  mkdirSync(join(planning, dirname(path)), { recursive: true });
  mkdirSync(join(planning, dirname(planPath)), { recursive: true });
  writeFileSync(join(planning, path), recorded.source);
  writeFileSync(join(planning, planPath), plan);
}

/** @param {string} project */
export function writeQueuedStories(project) {
  const planning = join(project, ".planning");
  const storyA = makeMe.aBacklogEntry
    .with({ identity: "SEED-A#a", href: "seeds/A.md#a", title: "Story A" })
    .please();
  const storyB = makeMe.aBacklogEntry
    .with({ identity: "SEED-B#b", href: "seeds/B.md#b", title: "Story B" })
    .please();
  writeQueuedStory(planning, "A", storyA);
  writeQueuedStory(planning, "B", storyB);
  writeFileSync(
    join(planning, "PRODUCT-BACKLOG.md"),
    renderPublishedBacklog({ queued: [storyA, storyB], direction }),
  );
}
