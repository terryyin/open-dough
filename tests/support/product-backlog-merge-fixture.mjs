// Shared starting precondition for the reconciliation tests: the three supplied
// versions of one backlog written as ordinary files beside the destination, and
// the arguments naming them.
//
// The tool being run here is not Git-aware. The three versions are ordinary
// files, which is the boundary the later Git slices will supply from index
// stages.
import assert from "node:assert/strict";
import {
  projectFile,
  run,
  scratchProject,
} from "./product-backlog-fixture.mjs";

// Where one of the three versions is named from, so that everything reading
// them names the same files as the helper that wrote them.
export const versionPath = (name) => `.planning/versions/${name}.md`;

// Supplies only the starting precondition: the three versions as files beside
// the destination, and the arguments naming them. The destination's own
// content is supplied separately, because a merge never reads it as input.
export function versions(project, ancestor, one, other) {
  const written = { ancestor, one, other };
  for (const [name, source] of Object.entries(written)) {
    projectFile(project, `versions/${name}.md`, source);
  }
  return [
    "merge",
    "--ancestor",
    versionPath("ancestor"),
    "--branch",
    versionPath("one"),
    "--branch",
    versionPath("other"),
  ];
}

// Entries named by a single letter, so a list's order reads as its letters and
// the lexical tie-break the Taken rule uses is visible in the expectation
// rather than hidden in a real story title.
export const named = (letter) => `SEED-003#story-${letter.toLowerCase()}`;
export const item = (letter) =>
  `- [Story ${letter}](seeds/SEED-003-ordering.md#story-${letter.toLowerCase()}) — ${named(letter)}`;
export const list = (letters) => [...letters].map(item);

// One branch's version of a backlog, made the way a branch really makes one:
// by running the operations that changed it against its own copy of the
// ancestor. What the branch version holds is the product's own doing, so a
// reconciliation test is never reconciling an assumption about it.
export async function branchFrom(t, ancestor, ...operations) {
  const branch = scratchProject(t, ancestor);
  for (const operation of operations) {
    const made = await run(branch, operation);
    assert.equal(made.code, 0, made.stderr);
  }
  return branch.read();
}
