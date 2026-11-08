// Shared scratch seed and CLI argument builders for story-state preparation
// proofs. The planted seed starts without a state block; the CLI produces the
// recorded facts under test.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "./makeMe.mjs";
import { recordPreparationArgs } from "./story-preparation.mjs";
import { projectFile, run } from "./product-backlog-fixture.mjs";

export const seedRelative = "seeds/SEED-021-two-stories.md";

export const first = makeMe.aBacklogEntry
  .with({
    identity: "SEED-021#first-story",
    href: `${seedRelative}#first-story`,
    title: "First story",
  })
  .please();

export const second = makeMe.aBacklogEntry
  .with({
    identity: "SEED-021#second-story",
    href: `${seedRelative}#second-story`,
    title: "Second story",
  })
  .please();

export const twoStorySeed = `---
id: SEED-021
---

# Two stories in one seed

Shared scope for both stories.

<a id="first-story"></a>

### First story

**Identity:** ${first.identity}

**Status:** Captured, still free-form.

Goal, scope, and examples for the first story.

<a id="second-story"></a>

### Second story

**Identity:** ${second.identity}

**Status:** Also free-form and must not be inferred.

Goal, scope, and examples for the second story.
`;

export const readerPath = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs",
    import.meta.url,
  ),
);

export function plantSeed(project, source = twoStorySeed) {
  return projectFile(project, seedRelative, source);
}

export function seedBytes(project) {
  return readFileSync(
    join(project.directory, ".planning", seedRelative),
    "utf8",
  );
}

export function backlogBytes(project) {
  return project.read();
}

// Mixed dependency fixtures still name their CLI link. The preparation adapter
// receives the same canonical href as the dashboard and the readiness fixtures.
export function recordArgs({ identity, href, link }, facts) {
  return recordPreparationArgs({ identity, href: href ?? link }, facts);
}

export function readArgs({ href, link }) {
  return ["read-state", "--link", href ?? link];
}

export const correctionRelative = "slice-plans/075-correction/PLAN.md";

export const correction = makeMe.aBacklogEntry
  .with({
    identity: "CORR-075-correction",
    href: correctionRelative,
    title: "Correction plan",
  })
  .please();

export function correctionPlan() {
  return `# Correction plan

**Identity:** ${correction.identity}

Bounded retrospective correction living at its plan path.

### 1. Adjust guidance
Type: Behavior
Status: planned
`;
}

export function planningFile(project, relative) {
  return readFileSync(join(project.directory, ".planning", relative), "utf8");
}

export async function readState(project, story) {
  const result = await run(project, readArgs(story));
  if (result.code !== 0) {
    throw new Error(result.stderr || `read-state exited ${result.code}`);
  }
  return JSON.parse(result.stdout);
}
