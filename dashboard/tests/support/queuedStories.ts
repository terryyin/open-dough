// The two queued, refined and planned stories a start fixture's project
// publishes (`./startOrigin.ts`): Story A and Story B, each with its seed,
// plan and recorded readiness, queued in the product backlog.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { backlogOf } from "../../../tests/support/product-backlog-fixture.mjs";
import {
  computeBasis,
  recordStoryState,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";

export const queuedIdentity = "SEED-A#a";
export const queuedTitle = "Prepare the queued start";
export const otherQueuedIdentity = "SEED-B#b";

function writeStory(
  project: string,
  key: string,
  identity: string,
  name: string,
): void {
  const plan = `# ${name} plan\n\nExecute the selected startup story.\n`;
  const seed = `---\nid: SEED-${key}\n---\n\n# Seed ${key}\n\n<a id="${key.toLowerCase()}"></a>\n\n### ${name}\n\n**Identity:** ${identity}\n\nExecute ${key}.\n`;
  const recorded = recordStoryState(
    seed,
    {
      href: `seeds/${key}.md#${key.toLowerCase()}`,
      identity,
      refinement: "refined",
      approach: "planned",
      plan: `../slice-plans/${key}/PLAN.md`,
      assessment: "ready",
      reasons: [],
      expectedBasis: computeBasis(seed, plan),
    },
    { planSource: plan },
  ) as { source: string };
  mkdirSync(path.join(project, ".planning/seeds"), { recursive: true });
  mkdirSync(path.join(project, `.planning/slice-plans/${key}`), {
    recursive: true,
  });
  writeFileSync(
    path.join(project, `.planning/seeds/${key}.md`),
    recorded.source,
  );
  writeFileSync(
    path.join(project, `.planning/slice-plans/${key}/PLAN.md`),
    plan,
  );
}

export function writeQueuedStories(project: string): void {
  writeStory(project, "A", queuedIdentity, "Story A");
  writeStory(project, "B", otherQueuedIdentity, "Story B");
  writeFileSync(
    path.join(project, ".planning/PRODUCT-BACKLOG.md"),
    backlogOf(
      [],
      [
        `- [Story A](seeds/A.md#a) — ${queuedIdentity}`,
        `- [Story B](seeds/B.md#b) — ${otherQueuedIdentity}`,
      ],
    ),
  );
}
