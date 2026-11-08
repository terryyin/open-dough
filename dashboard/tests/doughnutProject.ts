// Doughnut, the second catalog project, as the project-isolation specs
// publish it: one backlog entry whose recorded identity Open Dough's
// backlogs also use (./projectSelectionProjects.ts). The identity must not
// be merged across projects, and Doughnut's telling of it must never appear
// under Open Dough's label, nor Open Dough's under Doughnut's.

import { describedRevision, publishedFile } from "./describedRevisions.ts";
import { backlogPath } from "./publishedOriginBasics.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

export const doughnutRepository = "nerds-odd-e/doughnut";

// Distinct from every revision Open Dough publishes in these specs,
// ./refreshJourney.ts's included, so a read or check at the wrong project's
// revision cannot pass for the right one.
export const revisionDoughnut = "d4".repeat(20);

export const sharedStoryIdentity = "SEED-777#shared-story";
export const doughnutSharedTitle = "Doughnut's telling of the shared story";
export const doughnutSharedGoal = "Doughnut's goal for the shared story.";

const sharedSeed = ".planning/seeds/SEED-777-shared.md";

// The shared story queued alone, with a readable canonical story that has no
// dependency agreement.
const doughnut = describedRevision(
  makeMe.aRepository
    .withRevision("published", {
      backlog: {
        queued: [
          makeMe.aBacklogEntry
            .with({
              identity: sharedStoryIdentity,
              title: doughnutSharedTitle,
              href: "seeds/SEED-777-shared.md#shared-story",
            })
            .please(),
        ],
      },
      files: {
        [sharedSeed]: `# Shared

<a id="shared-story"></a>

### ${doughnutSharedTitle}

**Identity:** ${sharedStoryIdentity}

**Goal:** ${doughnutSharedGoal}
`,
      },
    })
    .please(),
  revisionDoughnut,
);

export const doughnutBacklog = publishedFile(doughnut, backlogPath);

// Execution journeys must publish this source as well as the backlog before
// they can start the story.
export const doughnutRecords = {
  [sharedSeed]: publishedFile(doughnut, sharedSeed),
};
