// Reconciliation combines compatible work-item changes and preserves closures.
import assert from "node:assert/strict";
import { mergeBacklogs } from "../../src/skills/dough-product-backlog/scripts/product-backlog-merge.mjs";
import { test } from "node:test";
import {
  added,
  addedLine,
  arrangedBacklog,
  backlogOf,
  direction,
  occurrences,
  queued,
  queuedBacklogEntries,
  takenBacklogEntry,
  takenEntry,
} from "./product-backlog-fixture.mjs";
import { reportedMergeChanges } from "./product-backlog-merge-fixture.mjs";
import { renderPublishedBacklog } from "./published-backlog.mjs";

const [trunk, retrospective, review] = queued;
const [trunkWork, retrospectiveWork, reviewWork] = queuedBacklogEntries;
const afterClaim = renderPublishedBacklog({
  taken: [takenBacklogEntry, trunkWork],
  queued: [retrospectiveWork, reviewWork],
  direction,
});
const afterClosure = renderPublishedBacklog({
  taken: [takenBacklogEntry],
  queued: [trunkWork, retrospectiveWork],
  direction,
});

test("merge items keeps both branches' closures", () => {
  // Two items are taken; each branch closes one of them and leaves the other
  // exactly as the ancestor wrote it.
  const merged = mergeBacklogs(
    afterClaim,
    renderPublishedBacklog({
      taken: [trunkWork],
      queued: [retrospectiveWork, reviewWork],
      direction,
    }),
    renderPublishedBacklog({
      taken: [takenBacklogEntry],
      queued: [retrospectiveWork, reviewWork],
      direction,
    }),
  );

  // Neither branch's untouched entry brought the other branch's removal back:
  // "## Taken" ends empty, keeping its heading, and the queue is untouched.
  assert.equal(merged.source, backlogOf([], [retrospective, review]));
  const changes = reportedMergeChanges(merged);
  assert.match(
    changes,
    /removed "SEED-008#script-product-backlog-list-updates" from "## Taken"/,
  );
  assert.match(
    changes,
    /removed "SEED-008#same-machine-merge-queue" from "## Taken"/,
  );
});

test("merge items combines a claim on one branch with a closure on the other", () => {
  const merged = mergeBacklogs(
    arrangedBacklog,
    // One branch took the trunk-integration story.
    afterClaim,
    // The other closed the architecture story it had nothing to do with.
    afterClosure,
  );

  assert.equal(merged.source, backlogOf([takenEntry, trunk], [retrospective]));
  // The claim is listed once, in "## Taken" only.
  assert.equal(occurrences(merged.source, trunk), 1);
  assert.equal(occurrences(merged.source, review), 0);
});

test("merge items gives the same result whichever branch is named first", () => {
  const forwards = mergeBacklogs(arrangedBacklog, afterClaim, afterClosure);
  const result = forwards.source;

  const backwards = mergeBacklogs(arrangedBacklog, afterClosure, afterClaim);
  assert.equal(backwards.source, result);
});

test("merge items applies an identical change on both branches once", () => {
  // Both branches closed the architecture story and queued the same new work.
  const both = renderPublishedBacklog({
    taken: [takenBacklogEntry],
    queued: [trunkWork, retrospectiveWork, added],
    direction,
  });

  const merged = mergeBacklogs(arrangedBacklog, both, both);

  assert.equal(
    merged.source,
    backlogOf([takenEntry], [trunk, retrospective, addedLine]),
  );
  assert.equal(occurrences(merged.source, addedLine), 1);
  assert.equal(occurrences(merged.source, review), 0);
});

test("merge items reads one work item through its canonical home", () => {
  // The ancestor entry carries no identity yet, so its identity is its link.
  // One branch adopts an identity for it; the other renames it. Both are
  // talking about one work item, and the merged entry carries both changes.
  const home =
    "seeds/SEED-002-release-the-guidance.md#publish-the-release-notes";
  const before = `- [Publish the release notes](${home})`;
  const adopted = `- [Publish the release notes](${home}) — SEED-002`;
  const renamed = `- [Publish the release notes with the tag](${home})`;
  const ancestor = backlogOf([takenEntry], [before, retrospective]);

  const merged = mergeBacklogs(
    ancestor,
    backlogOf([takenEntry], [adopted, retrospective]),
    backlogOf([takenEntry], [renamed, retrospective]),
  );

  assert.equal(
    merged.source,
    backlogOf(
      [takenEntry],
      [
        `- [Publish the release notes with the tag](${home}) — SEED-002#publish-the-release-notes`,
        retrospective,
      ],
    ),
  );
  assert.equal(occurrences(merged.source, home), 1);
});
