// Doughnut, the second catalog project, as the project-isolation specs
// publish it: one backlog entry whose recorded identity Open Dough's
// backlogs also use, following ./project-selection.spec.ts's
// `sharedStoryIdentity` pattern. The identity must not be merged across
// projects, and Doughnut's telling of it must never appear under Open
// Dough's label, nor Open Dough's under Doughnut's.

export const doughnutRepository = "nerds-odd-e/doughnut";

// Distinct from every revision Open Dough publishes in these specs,
// ./refreshJourney.ts's included, so a read or check at the wrong project's
// revision cannot pass for the right one.
export const revisionDoughnut = "d4".repeat(20);

export const sharedStoryIdentity = "SEED-777#shared-story";
export const doughnutSharedTitle = "Doughnut's telling of the shared story";
export const doughnutSharedGoal = "Doughnut's goal for the shared story.";

export const doughnutBacklog = `# Product backlog

## Taken

## Backlog list

- [${doughnutSharedTitle}](seeds/SEED-777-shared.md#shared-story) — ${sharedStoryIdentity}
`;

// A readable canonical story with no dependency agreement. Execution journeys
// must publish this source as well as the backlog before they can start it.
export const doughnutRecords = {
  ".planning/seeds/SEED-777-shared.md": `# Shared

<a id="shared-story"></a>

### ${doughnutSharedTitle}

**Identity:** ${sharedStoryIdentity}

**Goal:** ${doughnutSharedGoal}
`,
};
