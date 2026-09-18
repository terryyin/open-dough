// What a reconciliation says it did, observed as the real command's own
// standard output. The report is what a caller reads before accepting a
// published result, so it is checked against the same run's bytes: everything
// a merge decided has to be named, and the claim that neither branch changed
// anything has to be reserved for the runs where that is true.
//
// These read the report for its meaning — the identity named and the kind of
// change named — rather than for a whole line, so the wording can improve
// without a test standing in its way.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  added,
  addArguments,
  backlog,
  backlogOf,
  run,
  scratchProject,
  takenEntry,
  trunkQueue,
} from "./product-backlog-fixture.mjs";
import {
  branchFrom,
  item,
  list,
  named,
  versions,
} from "./product-backlog-merge-fixture.mjs";

// The claim a report is entitled to make only when the three versions really
// do say the same thing: that neither branch changed the ancestor at all.
const claimedNoChange = /neither changed/;

// The report naming one work item and what became of it.
const saidOf = (identity, did) => new RegExp(`${did} "${identity}"`);

test("merge report names a one-sided reprioritization instead of claiming nothing changed", async (t) => {
  // The queue is A, B, C, D. One branch gave D the front of it with the real
  // placement command; the other wrote the queue out as the ancestor had it.
  // The published priority is D's new one, so the report has to say so.
  const ancestor = backlogOf([], list("ABCD"));
  const project = scratchProject(t, ancestor);
  const reprioritized = await branchFrom(t, ancestor, [
    "place",
    "--identity",
    named("D"),
    "--before",
    named("A"),
  ]);

  const merged = await run(
    project,
    versions(project, ancestor, reprioritized, ancestor),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([], list("DABC")));
  assert.doesNotMatch(merged.stdout, claimedNoChange);
  assert.match(merged.stdout, saidOf(named("D"), "reprioritized"));
  assert.match(merged.stdout, /reprioritized .* in "## Backlog list"/);
  // Only the work whose place among the rest changed is named. A and B and C
  // stand in the order they stood in, one number further down the list.
  for (const letter of "ABC") {
    assert.doesNotMatch(merged.stdout, saidOf(named(letter), "reprioritized"));
  }
});

test("merge report does not read work shifting up behind a removal as a reprioritization", async (t) => {
  // One branch closed A with the real completion command; the other left the
  // queue alone. B and C each end up one place higher, and neither of them was
  // given a different priority by anybody.
  const ancestor = backlogOf([], list("ABC"));
  const project = scratchProject(t, ancestor);
  const closed = await branchFrom(t, ancestor, [
    "complete",
    "--identity",
    named("A"),
  ]);

  const merged = await run(
    project,
    versions(project, ancestor, closed, ancestor),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([], list("BC")));
  assert.match(merged.stdout, saidOf(named("A"), "removed"));
  assert.doesNotMatch(merged.stdout, /reprioritized/);
  assert.doesNotMatch(merged.stdout, claimedNoChange);
});

test("merge report names the work each branch added and changed", async (t) => {
  // One branch claimed the queued trunk story; the other queued new work.
  // Both are the real operations' own doing, and the report has to name both,
  // because a caller accepts or rejects the published result by reading it.
  const project = scratchProject(t, backlog);
  const claimed = await branchFrom(t, backlog, [
    "take",
    "--identity",
    trunkQueue,
    "--no-plan",
  ]);
  const queuedMore = await branchFrom(t, backlog, addArguments());

  const merged = await run(
    project,
    versions(project, backlog, claimed, queuedMore),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.match(merged.stdout, saidOf(added.identity, "added"));
  assert.match(merged.stdout, /added .* to "## Backlog list"/);
  assert.match(merged.stdout, saidOf(trunkQueue, "changed"));
  assert.match(
    merged.stdout,
    new RegExp(`changed "${trunkQueue}", now in "## Taken"`),
  );
  assert.doesNotMatch(merged.stdout, claimedNoChange);
});

test("merge report names changed text around the two lists", async (t) => {
  // Neither the text above the lists nor the text below them is written by any
  // backlog operation, and both are carried across whole. A caller whose
  // published file gained a paragraph is told that it did.
  const ancestor = backlogOf([], list("AB"));
  const project = scratchProject(t, ancestor);
  const opening = "Everything this project has agreed to do next.";
  // The text below the lists begins with a heading of its own, because that is
  // what ends the queue's own section.
  const closing =
    "## How this list is kept\n\nEach entry's canonical home lives under seeds/.";

  const merged = await run(
    project,
    versions(
      project,
      ancestor,
      ancestor.replace(
        "# Product backlog\n",
        `# Product backlog\n\n${opening}\n`,
      ),
      `${ancestor}\n${closing}\n`,
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(
    project.read(),
    `# Product backlog\n\n${opening}\n${ancestor.slice("# Product backlog\n".length)}\n${closing}\n`,
  );
  assert.doesNotMatch(merged.stdout, claimedNoChange);
  assert.match(merged.stdout, /changed the text above the two lists/);
  assert.match(merged.stdout, /changed the text below the two lists/);
});

test("merge report says neither branch changed the ancestor only when neither did", async (t) => {
  // The one run entitled to the no-change claim: three versions that say the
  // same thing. It still names how much it carried across.
  const ancestor = backlogOf([takenEntry], list("AB"));
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(project, ancestor, ancestor, ancestor),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), ancestor);
  assert.match(merged.stdout, claimedNoChange);
  assert.match(merged.stdout, /3 entries/);
  assert.doesNotMatch(merged.stdout, /reprioritized|added|removed/);
  assert.doesNotMatch(merged.stdout, new RegExp(item("A")));
});
