// Changes returned by the merge policy are printed by the Git driver.
import assert from "node:assert/strict";
import { mergeBacklogs } from "../../src/skills/dough-product-backlog/scripts/product-backlog-merge.mjs";
import { test } from "node:test";
import {
  added,
  addArguments,
  arrangedBacklog,
  backlogOf,
  takenEntry,
  trunkQueue,
} from "./product-backlog-fixture.mjs";
import {
  branchFrom,
  list,
  mergeBacklog,
  named,
  reportedMergeChanges,
} from "./product-backlog-merge-fixture.mjs";

// The report naming one work item and what became of it.
const saidOf = (identity, did) => new RegExp(`${did} "${identity}"`);

test("merge changes name a one-sided reprioritization", async (t) => {
  // The queue is A, B, C, D. One branch gave D the front of it with the real
  // placement command; the other wrote the queue out as the ancestor had it.
  // The published priority is D's new one, so the report has to say so.
  const ancestor = mergeBacklog({ queued: "ABCD" });
  const reprioritized = await branchFrom(t, ancestor, [
    "place",
    "--identity",
    named("D"),
    "--before",
    named("A"),
  ]);

  const merged = mergeBacklogs(ancestor, reprioritized, ancestor);

  assert.equal(merged.source, backlogOf([], list("DABC")));
  const changes = reportedMergeChanges(merged);
  assert.match(changes, saidOf(named("D"), "reprioritized"));
  assert.match(changes, /reprioritized .* in "## Backlog list"/);
  // Only the work whose place among the rest changed is named. A and B and C
  // stand in the order they stood in, one number further down the list.
  for (const letter of "ABC") {
    assert.doesNotMatch(changes, saidOf(named(letter), "reprioritized"));
  }
});

test("merge changes do not read work shifting up behind a removal as a reprioritization", async (t) => {
  // One branch closed A with the real completion command; the other left the
  // queue alone. B and C each end up one place higher, and neither of them was
  // given a different priority by anybody.
  const ancestor = mergeBacklog({ queued: "ABC" });
  const closed = await branchFrom(t, ancestor, [
    "complete",
    "--identity",
    named("A"),
  ]);

  const merged = mergeBacklogs(ancestor, closed, ancestor);

  assert.equal(merged.source, backlogOf([], list("BC")));
  const changes = reportedMergeChanges(merged);
  assert.match(changes, saidOf(named("A"), "removed"));
  assert.doesNotMatch(changes, /reprioritized/);
});

test("merge changes name the work each branch added and changed", async (t) => {
  // One branch claimed the queued trunk story; the other queued new work.
  // Both are the real operations' own doing, and the report has to name both,
  // because a caller accepts or rejects the published result by reading it.
  const claimed = await branchFrom(t, arrangedBacklog, [
    "take",
    "--identity",
    trunkQueue,
    "--no-plan",
  ]);
  const queuedMore = await branchFrom(t, arrangedBacklog, addArguments());

  const merged = mergeBacklogs(arrangedBacklog, claimed, queuedMore);

  const changes = reportedMergeChanges(merged);
  assert.match(changes, saidOf(added.identity, "added"));
  assert.match(changes, /added .* to "## Backlog list"/);
  assert.match(changes, saidOf(trunkQueue, "changed"));
  assert.match(
    changes,
    new RegExp(`changed "${trunkQueue}", now in "## Taken"`),
  );
});

test("merge changes name changed text around the two lists", () => {
  // Neither the text above the lists nor the text below them is written by any
  // backlog operation, and both are carried across whole. A caller whose
  // published file gained a paragraph is told that it did.
  const ancestor = mergeBacklog({ queued: "AB" });
  const opening = "Everything this project has agreed to do next.";
  // The text below the lists begins with a heading of its own, because that is
  // what ends the queue's own section.
  const closing =
    "## How this list is kept\n\nEach entry's canonical home lives under seeds/.";

  const merged = mergeBacklogs(
    ancestor,
    ancestor.replace(
      "# Product backlog\n",
      `# Product backlog\n\n${opening}\n`,
    ),
    `${ancestor}\n${closing}\n`,
  );

  assert.equal(
    merged.source,
    `# Product backlog\n\n${opening}\n${ancestor.slice("# Product backlog\n".length)}\n${closing}\n`,
  );
  const changes = reportedMergeChanges(merged);
  assert.match(changes, /changed the text above the two lists/);
  assert.match(changes, /changed the text below the two lists/);
});

test("merge records no changes when both branches match the ancestor", () => {
  const ancestor = backlogOf([takenEntry], list("AB"));

  const merged = mergeBacklogs(ancestor, ancestor, ancestor);

  assert.equal(merged.source, ancestor);
  assert.deepEqual(merged.changes, []);
});
