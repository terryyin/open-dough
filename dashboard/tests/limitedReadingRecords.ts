// The records the limited-reading journeys (limited-reading-*.spec.ts) publish
// for Open Dough at one revision: a backlog of two stories, one whose record
// the limit withholds, and a planned story whose record is read beside it and
// whose plan is asked only after the limit.

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
  [backlogPath]: `# Product backlog

## Taken

## Backlog list

- [${withheldTitle}](seeds/SEED-264-withheld.md#withheld) — SEED-264#withheld
- [${plannedTitle}](seeds/SEED-264-planned.md#planned) — SEED-264#planned
`,
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
\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/264-planned/PLAN.md"}
\`\`\`

**Goal:** Its plan is asked only once the limit stands.
`,
  [plannedPlan]: `# Plan

## Slices

### 1. First slice
Type: Behavior
Status: planned
Proof: A journey observes slice 1.
`,
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
