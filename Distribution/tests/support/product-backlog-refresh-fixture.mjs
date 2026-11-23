// A backlog and its canonical homes share the same recorded identities.
// The reference-refresh tests arrange the document changes before calling the CLI.

import assert from "node:assert/strict";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { makeMe } from "./makeMe.mjs";
import {
  backlogOf,
  direction,
  occurrences,
  projectFile,
  queued,
  queuedBacklogEntries,
  scratchProject,
  takenBacklogEntry,
  takenEntry,
} from "./product-backlog-fixture.mjs";
import { renderPublishedBacklog } from "./published-backlog.mjs";
import { renderStorySection, renderStorySeed } from "./published-seed.mjs";

export const takenLink = takenBacklogEntry.plan.target;
export const correctionLink =
  "slice-plans/032-refuse-managed-hook-command-variants/PLAN.md";
export const seedEight = "seeds/SEED-008-worktree-branch-trunk-sync.md";
export const seedOne = "seeds/SEED-001-install-and-update-open-dough.md";

const [trunkQueue, retrospective] = queuedBacklogEntries;
const correction = makeMe.aBacklogEntry
  .with({
    identity: correctionLink,
    title:
      "Complete hook-registration corrections and deferred Claude Code acceptance",
    href: correctionLink,
  })
  .please();

export const identities = {
  taken: takenBacklogEntry.identity,
  queue: trunkQueue.identity,
  correction: correction.identity,
  retrospective: retrospective.identity,
};

// Where each document has already been renamed or moved to, before any run.
// Nothing here moves a file: the command records a move a human has made.
export const movedSeed = "seeds/SEED-001-install-open-dough.md";
export const movedAnchor = `${movedSeed}#default-skip-process-retrospective`;
export const movedPlan = "slice-plans/061-script-product-backlog/PLAN.md";
export const movedCorrection = "slice-plans/032-refuse-hook-variants/PLAN.md";
export const renamedSeedEight = "seeds/SEED-008-trunk-sync.md";
// A move after which the link spells none of the identity: the file name no
// longer holds the seed token and the story sits under a new anchor.
export const unspelledSeed = "seeds/install-open-dough.md";
export const unspelledStory = `${unspelledSeed}#skip-process-retrospectives`;

export const lines = {
  taken: takenEntry,
  trunk: queued[0],
  retrospective: queued[1],
  correction:
    "- [Complete hook-registration corrections and deferred Claude Code acceptance](slice-plans/032-refuse-managed-hook-command-variants/PLAN.md)",
};

export const expectedBacklog = backlogOf(
  [lines.taken],
  [lines.trunk, lines.correction, lines.retrospective],
);

export const arrangedBacklog = renderPublishedBacklog({
  taken: [takenBacklogEntry],
  queued: [trunkQueue, correction, retrospective],
  direction,
});

// Builds an independent byte expectation with exactly one entry line changed.
export function backlogWith(before, after) {
  assert.equal(occurrences(expectedBacklog, before), 1, before);
  return expectedBacklog.replace(before, after);
}

export const homes = {
  [seedEight]: `${renderStorySeed(
    trunkQueue,
    "Integrate verified work without discarding changes.",
  )}\n${renderStorySection(takenBacklogEntry, {
    body: "Apply an explicit backlog change.",
  })}`,
  [seedOne]: renderStorySeed(
    retrospective,
    "Run process retrospectives when requested.",
  ),
  [takenLink]: `# Safely edit and reconcile the product backlog through scripts

**Identity:** ${identities.taken}

## Slices

### 1. Add an identified item without losing existing work
Type: Behavior
Status: done
`,
  [correctionLink]: `# ${correction.title}

**Identity:** ${identities.correction}

## Slices

### 1. Refuse a conflicting managed hook command variant
Type: Behavior
Status: done
`,
};

export function refreshProject(
  t,
  { extra = {}, backlog = arrangedBacklog } = {},
) {
  const project = scratchProject(t, backlog);
  const documents = { ...homes, ...extra };
  for (const [relative, body] of Object.entries(documents)) {
    projectFile(project, relative, body);
  }
  const path = (relative) => join(dirname(project.file), relative);
  const readHome = (relative) => readFileSync(path(relative), "utf8");

  return {
    ...project,
    path,
    write: (relative, contents) =>
      writeFileSync(path(relative), contents, "utf8"),
    readHome,
    snapshot: () => ({
      backlog: project.read(),
      ...Object.fromEntries(
        Object.keys(documents).map((relative) => [
          relative,
          readHome(relative),
        ]),
      ),
    }),
  };
}

// Models a document that already lives at its new path before refresh runs.
export function afterMove(t, from, to, home = homes[from]) {
  const project = refreshProject(t, { extra: { [to]: home } });
  rmSync(project.path(from));
  return project;
}

// Every canonical home the project holds, for the cases that establish a run
// read the homes and wrote none of them.
export function withoutBacklog(snapshot) {
  return Object.fromEntries(
    Object.entries(snapshot).filter(([name]) => name !== "backlog"),
  );
}

// The same backlog with one entry line moved to the head of the queue, for the
// cases that address relocated work by its recorded identity afterwards and
// establish that everything else survived the move.
export function queuedFirst(source, line) {
  const queue = "## Backlog list\n\n";
  assert.equal(occurrences(source, `${line}\n`), 1, line);
  return source.replace(`${line}\n`, "").replace(queue, `${queue}${line}\n`);
}

export const refresh = (identity, ...rest) => [
  "refresh",
  "--identity",
  identity,
  ...rest,
];
