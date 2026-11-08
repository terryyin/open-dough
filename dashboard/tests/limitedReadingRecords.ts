// The records the limited-reading journeys (limited-reading-*.spec.ts) publish
// for Open Dough at one revision: a backlog of two stories, one whose record
// the limit withholds, and a planned story whose record is read beside it and
// whose plan is asked only after the limit.

import { renderSlicePlan } from "../../tests/support/published-plan.mjs";
import { renderPublishedPreparation } from "../../tests/support/story-preparation.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { renderPublishedBacklog } from "../../tests/support/published-backlog.mjs";
export const repository = "terryyin/open-dough";
export const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const revision = "6e".repeat(20);
export const opened = new Date("2026-10-07T09:00:00.000Z");

export const withheldTitle = "A story whose record the limit withheld";
export const plannedTitle = "A planned story read beside it";
export const withheldSeed = ".planning/seeds/SEED-264-withheld.md";
export const plannedSeed = ".planning/seeds/SEED-264-planned.md";
export const plannedPlan = ".planning/slice-plans/264-planned/PLAN.md";
export const titles = { taken: [], backlog: [withheldTitle, plannedTitle] };

export const files = {
  [backlogPath]: renderPublishedBacklog({
    queued: [
      makeMe.aBacklogEntry
        .with({
          identity: "SEED-264#withheld",
          href: "seeds/SEED-264-withheld.md#withheld",
          title: withheldTitle,
        })
        .please(),
      makeMe.aBacklogEntry
        .with({
          identity: "SEED-264#planned",
          href: "seeds/SEED-264-planned.md#planned",
          title: plannedTitle,
        })
        .please(),
    ],
  }),
  [withheldSeed]: `# Withheld

<a id="withheld"></a>

### ${withheldTitle}

**Identity:** SEED-264#withheld

**Goal:** Only GitHub's limit keeps this record unread.
`,
  [plannedSeed]: `# Planned

<a id="planned"></a>

### ${plannedTitle}

**Identity:** SEED-264#planned
${renderPublishedPreparation(
  makeMe.aStoryPreparation
    .with({
      refinement: "refined",
      approach: "planned",
      plan: "../slice-plans/264-planned/PLAN.md",
    })
    .please(),
)}

**Goal:** Its plan is asked only once the limit stands.
`,
  [plannedPlan]: renderSlicePlan(
    makeMe.aSlicePlan
      .with({
        slices: [
          makeMe.aPlanSlice
            .with({
              index: 1,
              name: "First slice",
              proof: "A journey observes slice 1.",
            })
            .please(),
        ],
      })
      .please(),
    { heading: "Slices" },
  ),
};

// The same records with a third story whose record GitHub cannot be reached
// for, for the recovery journeys (limit-recovery-*.spec.ts): a gap that
// another failure left, not the limit.
export const unreachableTitle = "A story whose record could not be reached";
export const unreachableSeed = ".planning/seeds/SEED-264-unreachable.md";
export const unreachableGap =
  "The canonical record could not be read for preparation facts.";
export const titlesBesideUnreachable = {
  taken: [],
  backlog: [withheldTitle, plannedTitle, unreachableTitle],
};
export const filesBesideUnreachable = {
  ...files,
  [backlogPath]: `${files[backlogPath]}- [${unreachableTitle}](seeds/SEED-264-unreachable.md#unreachable) — SEED-264#unreachable
`,
  [unreachableSeed]: `# Unreachable

<a id="unreachable"></a>

### ${unreachableTitle}

**Identity:** SEED-264#unreachable
`,
};
