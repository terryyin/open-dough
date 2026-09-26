// Shared scratch seed and CLI argument builders for story-state preparation
// proofs. The planted seed starts without a state block; the CLI produces the
// recorded facts under test.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { projectFile, run } from "./product-backlog-fixture.mjs";

export const seedRelative = "seeds/SEED-021-two-stories.md";

export const first = {
  identity: "SEED-021#first-story",
  link: `${seedRelative}#first-story`,
  title: "First story",
};

export const second = {
  identity: "SEED-021#second-story",
  link: `${seedRelative}#second-story`,
  title: "Second story",
};

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

export function recordArgs(story, facts) {
  const args = [
    "record-state",
    "--identity",
    story.identity,
    "--link",
    story.link,
    "--refinement",
    facts.refinement,
    "--approach",
    facts.approach,
  ];
  if (facts.plan !== undefined) {
    args.push("--plan", facts.plan);
  }
  if (facts.assessment !== undefined) {
    args.push("--assessment", facts.assessment);
  }
  if (facts.expectDocument !== undefined) {
    args.push("--expect-document", facts.expectDocument);
  }
  if (facts.expectPlan !== undefined) {
    args.push("--expect-plan", facts.expectPlan);
  }
  for (const reason of facts.reasons ?? []) {
    args.push("--reason", reason);
  }
  return args;
}

export function readArgs(story) {
  return ["read-state", "--link", story.link];
}

export const correctionRelative = "slice-plans/075-correction/PLAN.md";

export const correction = {
  identity: "CORR-075-correction",
  link: correctionRelative,
};

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
