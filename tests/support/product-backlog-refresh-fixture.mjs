// Starting precondition for the reference-refresh tests: a backlog whose four
// entries carry their identities, and actual canonical homes that record the
// same identities, as they stand once adoption has run. Each test then acts on
// a rename or move that has already been made to those documents.

import assert from "node:assert/strict";
import {
  adoptedBacklog,
  correctionLink,
  headings,
  homes,
  identities,
  legacyProject,
  seedEight,
  seedOne,
  takenLink,
} from "./product-backlog-adoption-fixture.mjs";
import { occurrences } from "./product-backlog-fixture.mjs";

// Where each document has already been renamed or moved to, before any run.
// Nothing here moves a file: the command records a move a human has made.
export const movedSeed = "seeds/SEED-001-install-open-dough.md";
export const movedAnchor = `${movedSeed}#default-skip-process-retrospective`;
export const movedPlan = "quick/061-script-product-backlog/PLAN.md";
export const movedCorrection = "quick/032-refuse-hook-variants/PLAN.md";
export const renamedSeedEight = "seeds/SEED-008-trunk-sync.md";

// The entry lines the starting backlog holds, spelled out so that a test
// naming one does not take the product's own rendering as its expectation.
export const lines = {
  taken:
    "- [Update the product backlog without hand-editing the shared list](seeds/SEED-008-worktree-branch-trunk-sync.md#script-product-backlog-list-updates) — SEED-008 ([plan](quick/057-script-product-backlog/PLAN.md))",
  trunk:
    "- [Queue trunk integration for agents on the same machine](seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue) — SEED-008",
  retrospective:
    "- [Skip process retrospectives by default for new installations](seeds/SEED-001-install-and-update-open-dough.md#default-skip-process-retrospective) — SEED-001",
};

// The whole backlog with exactly one entry line rewritten in place. Every
// other line, the order of both lists, and the direction come across
// untouched, and the one-occurrence check keeps an expectation from silently
// agreeing with a backlog that never changed.
export function backlogWith(before, after) {
  assert.equal(occurrences(adoptedBacklog, before), 1, before);
  return adoptedBacklog.replace(before, after);
}

// A canonical home as it stands after its identity was adopted: the recorded
// line under the heading the work item lives beneath.
export function recording(relative, records) {
  let source = homes[relative];
  for (const [heading, identity] of records) {
    source = source.replace(
      `${heading}\n`,
      `${heading}\n\n**Identity:** ${identity}\n`,
    );
  }
  return source;
}

export const adoptedHomes = {
  [seedEight]: recording(seedEight, [
    [headings.queue, identities.queue],
    [headings.taken, identities.taken],
  ]),
  [seedOne]: recording(seedOne, [
    [headings.retrospective, identities.retrospective],
  ]),
  [takenLink]: recording(takenLink, [[headings.plan, identities.taken]]),
  [correctionLink]: recording(correctionLink, [
    [headings.correction, identities.correction],
  ]),
};

export function adoptedProject(
  t,
  { extra = {}, backlog = adoptedBacklog } = {},
) {
  return legacyProject(t, { backlog, extra: { ...adoptedHomes, ...extra } });
}

// Every canonical home the project holds, for the cases that establish a run
// read the homes and wrote none of them.
export function withoutBacklog(snapshot) {
  return Object.fromEntries(
    Object.entries(snapshot).filter(([name]) => name !== "backlog"),
  );
}

export const refresh = (identity, ...rest) => [
  "refresh",
  "--identity",
  identity,
  ...rest,
];
