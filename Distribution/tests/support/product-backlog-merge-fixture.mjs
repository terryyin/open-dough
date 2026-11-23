// Shared inputs and refusal observation for the reconciliation policy tests.
import assert from "node:assert/strict";
import { mergeBacklogs } from "../../src/skills/dough-product-backlog/scripts/product-backlog-merge.mjs";
import { BacklogError } from "../../src/skills/dough-product-backlog/scripts/product-backlog-refusal.mjs";
import { makeMe } from "./makeMe.mjs";
import {
  addedHome,
  direction,
  run,
  scratchProject,
} from "./product-backlog-fixture.mjs";
import { renderPublishedBacklog } from "./published-backlog.mjs";

export function reportedMergeChanges(outcome) {
  return outcome.changes.join("\n");
}

export function mergeRefusal(ancestor, first, second) {
  let message;
  assert.throws(
    () => mergeBacklogs(ancestor, first, second),
    (error) => {
      assert.ok(error instanceof BacklogError);
      message = error.message;
      return true;
    },
  );
  return message;
}

// Entries named by a single letter, so a list's order reads as its letters and
// the lexical tie-break the Taken rule uses is visible in the expectation
// rather than hidden in a real story title.
export const named = (letter) => `SEED-003#story-${letter.toLowerCase()}`;
export const item = (letter) =>
  `- [Story ${letter}](seeds/SEED-003-ordering.md#story-${letter.toLowerCase()}) — ${named(letter)}`;
export const list = (letters) => [...letters].map(item);

const entriesNamed = (letters) =>
  [...letters].map((letter) =>
    makeMe.aBacklogEntry
      .with({
        identity: named(letter),
        title: `Story ${letter}`,
        href: `seeds/SEED-003-ordering.md#story-${letter.toLowerCase()}`,
      })
      .please(),
  );

export function mergeBacklog({ taken = "", queued }) {
  return renderPublishedBacklog({
    taken: entriesNamed(taken),
    queued: entriesNamed(queued),
    direction,
  });
}

// One branch's version of a backlog, made the way a branch really makes one:
// by running the operations that changed it against its own copy of the
// ancestor. What the branch version holds is the product's own doing, so a
// reconciliation test is never reconciling an assumption about it.
export async function branchFrom(t, ancestor, ...operations) {
  const branch = scratchProject(t, ancestor);
  // Planted unconditionally: a branch that never adds `added` never opens it,
  // and one that does needs its canonical home to already be there.
  addedHome(branch);
  for (const operation of operations) {
    const made = await run(branch, operation);
    assert.equal(made.code, 0, made.stderr);
  }
  return branch.read();
}
