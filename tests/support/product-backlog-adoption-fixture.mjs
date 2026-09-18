// Starting precondition for the identity-adoption tests: a scratch project
// whose active backlog predates recorded identities. Three entries record
// nothing and one carries the older shorthand, a Taken story links to its
// active plan, and one bounded correction has a plan and no seed. The seeds
// and plans are realistic copies of this repository's own shapes.

import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { scratchProject } from "./product-backlog-fixture.mjs";

export const direction = `Enable agents to execute stories in parallel while collaborating through
trunk-based development, with each agent working in its own Git worktree.`;

export const takenLink = "quick/057-script-product-backlog/PLAN.md";
export const correctionLink =
  "quick/032-refuse-managed-hook-command-variants/PLAN.md";
export const seedEight = "seeds/SEED-008-worktree-branch-trunk-sync.md";
export const seedOne = "seeds/SEED-001-install-and-update-open-dough.md";

export const legacyBacklog = `# Product backlog

## Near-future direction

${direction}

## Taken

- [Update the product backlog without hand-editing the shared list](${seedEight}#script-product-backlog-list-updates) ([plan](${takenLink}))

## Backlog list

- [Queue trunk integration for agents on the same machine](${seedEight}#same-machine-merge-queue)
- [Complete hook-registration corrections and deferred Claude Code acceptance](${correctionLink})
- [Skip process retrospectives by default for new installations](${seedOne}#default-skip-process-retrospective) — SEED-001
`;

export const identities = {
  taken: "SEED-008#script-product-backlog-list-updates",
  queue: "SEED-008#same-machine-merge-queue",
  correction: correctionLink,
  retrospective: "SEED-001#default-skip-process-retrospective",
};

// The same four entries, in the same lists and the same order, each now
// recording in full the identity its canonical home carries. The retrospective
// entry started with the older shorthand and keeps the identity that shorthand
// already meant; the correction's link still spells its identity exactly, so
// it records nothing beside it.
export const adoptedBacklog = `# Product backlog

## Near-future direction

${direction}

## Taken

- [Update the product backlog without hand-editing the shared list](${seedEight}#script-product-backlog-list-updates) — ${identities.taken} ([plan](${takenLink}))

## Backlog list

- [Queue trunk integration for agents on the same machine](${seedEight}#same-machine-merge-queue) — ${identities.queue}
- [Complete hook-registration corrections and deferred Claude Code acceptance](${correctionLink})
- [Skip process retrospectives by default for new installations](${seedOne}#default-skip-process-retrospective) — ${identities.retrospective}
`;

export const headings = {
  taken:
    "### 4. Update the product backlog without hand-editing the shared list",
  queue: "### 2. Queue trunk integration for agents on the same machine",
  correction:
    "# Complete hook-registration corrections and deferred Claude Code acceptance",
  retrospective:
    "### 3. Skip process retrospectives by default for new installations",
  plan: "# Safely edit and reconcile the product backlog through scripts",
};

const seedEightSource = `---
id: SEED-008
status: active
planted: 2026-09-08
planted_during: unknown
trigger_when: when evaluating or designing branch/worktree workflows
scope: unknown
---

# SEED-008: Execute stories with continuous trunk integration

## Why This Matters

Developers want agents to work in separate worktrees while sharing small,
verified changes through the team's trunk throughout a story.

## Stories

<a id="same-machine-merge-queue"></a>

${headings.queue}

**Status:** Captured; second backlog priority. Not refined or planned.

**Goal:** Two agents on one machine integrate verified work to the trunk
without discarding each other's commits.

<a id="script-product-backlog-list-updates"></a>

${headings.taken}

**Status:** Refined and planned 2026-09-18; first backlog priority.

**Goal:** An explicit backlog change is applied and validated without model
reasoning, without losing queued or Taken work.

## Ordering and Scope Reduction

Story 2 depends on nothing else here and is the first to drop.
`;

const seedOneSource = `---
id: SEED-001
status: active
planted: 2026-08-02
planted_during: unknown
trigger_when: when a project adopts or updates the shared guidance
scope: unknown
---

# SEED-001: Install and update Open Dough in a project

## Stories

<a id="default-skip-process-retrospective"></a>

${headings.retrospective}

**Status:** Captured; fourth backlog priority. Not refined or planned.

**Goal:** A new installation does not spend a developer's attention on process
retrospectives until that project asks for them.
`;

const takenPlanSource = `${headings.plan}

Status: executing. Created and slice-refined 2026-09-18.

## Source and outcome

Source: [SEED-008, Update the product backlog without hand-editing the shared
list](../../${seedEight}#script-product-backlog-list-updates).

## Ordered slices

### 1. Add an identified item without losing existing work
Type: Behavior
Status: done (2026-09-18)
`;

const correctionPlanSource = `${headings.correction}

## Source and scope

Execution retrospective of Quick 031, recoverable at
\`aa32c106ad5d:.planning/quick/031-register-ci-host-hooks/PLAN.md\`. This is a
bounded correction of an existing promise; it has no seed of its own.

## Ordered slices

### 1. Refuse a conflicting managed hook command variant
Type: Behavior
Status: done (2026-09-09)
`;

export const homes = {
  [seedEight]: seedEightSource,
  [seedOne]: seedOneSource,
  [takenLink]: takenPlanSource,
  [correctionLink]: correctionPlanSource,
};

// A scratch project holding the backlog above and the canonical homes it links
// to. `extra` adds or replaces a canonical home for a single case.
export function legacyProject(t, { backlog = legacyBacklog, extra = {} } = {}) {
  const project = scratchProject(t, backlog);
  const planning = dirname(project.file);
  const write = (relative, contents) => {
    const path = join(planning, relative);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents, "utf8");
  };
  for (const [relative, contents] of Object.entries({ ...homes, ...extra })) {
    write(relative, contents);
  }
  return {
    ...project,
    planning,
    write,
    path: (relative) => join(planning, relative),
    readHome: (relative) => readFileSync(join(planning, relative), "utf8"),
    // Every file this project starts with, for "nothing was recorded" checks.
    snapshot: () => ({
      backlog: project.read(),
      ...Object.fromEntries(
        Object.keys({ ...homes, ...extra }).map((relative) => [
          relative,
          readFileSync(join(planning, relative), "utf8"),
        ]),
      ),
    }),
  };
}

export const adopt = ["adopt", "--all"];

// Establishes that a canonical home gained exactly the named identities, each
// under its own heading, and gained or lost nothing else.
export function recordsOnly(after, before, records) {
  let stripped = after;
  for (const { heading, identity } of records) {
    assert.ok(
      after.includes(`${heading}\n\n**Identity:** ${identity}\n`),
      `"${identity}" was not recorded under "${heading}"`,
    );
    stripped = stripped.replace(`\n\n**Identity:** ${identity}`, "");
  }
  assert.equal(stripped, before, "the canonical home changed in another way");
}
