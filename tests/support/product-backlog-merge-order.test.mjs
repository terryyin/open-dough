// The order the two lists end up in when the three supplied versions determine
// it: each branch's own placement decision survives, an untouched order is not
// read as an instruction to restore anything, and an entry that moved is listed
// exactly once. Where the versions do not determine a position the run is
// handed back, which `product-backlog-merge-order-refusals.test.mjs` establishes.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  backlogOf,
  occurrences,
  run,
  scratchProject,
} from "./product-backlog-fixture.mjs";
import {
  branchFrom,
  item,
  list,
  named,
  versions,
} from "./product-backlog-merge-fixture.mjs";

test("merge order places each branch's addition where that branch put it", async (t) => {
  // The queue both branches started from is A, B, C. One queued X between A
  // and B; the other queued Y between B and C. Both placements are explicit
  // priority decisions, and both survive.
  const ancestor = backlogOf([], list("ABC"));
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("AXBC")),
      backlogOf([], list("ABYC")),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([], list("AXBYC")));
});

test("merge order keeps a reprioritization the other branch left alone", async (t) => {
  // One branch moved C to the front of the queue. The other branch wrote the
  // queue out exactly as the ancestor had it, which says nothing about C.
  const ancestor = backlogOf([], list("ABC"));
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(project, ancestor, backlogOf([], list("CAB")), ancestor),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([], list("CAB")));
});

test("merge order does not read an untouched order as undoing a reprioritization", async (t) => {
  // One branch reprioritized B above A; the other left that order alone and
  // completed C. Leaving an order alone is not an instruction to restore it,
  // so the reprioritization stands and the removal still applies.
  const ancestor = backlogOf([], list("ABC"));
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("BAC")),
      backlogOf([], list("AB")),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([], list("BA")));
  assert.equal(occurrences(project.read(), item("C")), 0);
});

test("merge order does not read work shifting up behind a removal as a reprioritization", async (t) => {
  // Both branch versions are the real operations' own doing. From A, B, C, D
  // one branch completed A and gave D the place above C; the other completed
  // B. Every surviving entry ends up at a different numbered position than the
  // ancestor gave it, and only D and C had their place among the others
  // changed, so both closures apply and the one reprioritization stands.
  const ancestor = backlogOf([], list("ABCD"));
  const project = scratchProject(t, ancestor);
  const reprioritized = await branchFrom(
    t,
    ancestor,
    ["complete", "--identity", named("A")],
    ["place", "--identity", named("D"), "--before", named("C")],
  );
  const closed = await branchFrom(t, ancestor, [
    "complete",
    "--identity",
    named("B"),
  ]);

  const merged = await run(
    project,
    versions(project, ancestor, reprioritized, closed),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([], list("DC")));
});

test("merge order appends concurrent claims to Taken and will not order a queue that way", async (t) => {
  // Taken holds M. One branch claimed P; the other claimed N and then Z.
  // Survivors keep their order, each branch's additions keep theirs, and the
  // lexically smallest waiting identity goes next: M, N, P, Z.
  const ancestor = backlogOf(list("M"), list("NPZK"));
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf(list("MP"), list("NZK")),
      backlogOf(list("MNZ"), list("PK")),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf(list("MNPZ"), list("K")));

  // The same two additions in the queue are two priority decisions in one
  // place, so the interleaving rule is not applied to them.
  const queued = backlogOf([], list("KM"));
  const project2 = scratchProject(t, queued);
  const refused = await run(
    project2,
    versions(
      project2,
      queued,
      backlogOf([], list("KMP")),
      backlogOf([], list("KMN")),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project2.read(), queued, "the destination was written");
  assert.match(
    refused.stderr,
    new RegExp(`puts "${named("P")}" and .* puts "${named("N")}"`),
  );
  assert.match(refused.stderr, /in the same place, after "SEED-003#story-m"/);
});

test("merge order lists an entry that moved exactly once", async (t) => {
  // One branch moved B to the end of the queue; the other queued X after A.
  const ancestor = backlogOf([], list("ABC"));
  const project = scratchProject(t, ancestor);

  const moved = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("ACB")),
      backlogOf([], list("AXBC")),
    ),
  );

  assert.equal(moved.code, 0, moved.stderr);
  assert.equal(project.read(), backlogOf([], list("AXCB")));
  assert.equal(occurrences(project.read(), item("B")), 1);

  // One branch claimed B, moving it between the lists; the other left it in
  // the queue and queued X after A.
  const claimed = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf(list("B"), list("AC")),
      backlogOf([], list("AXBC")),
    ),
  );

  assert.equal(claimed.code, 0, claimed.stderr);
  assert.equal(project.read(), backlogOf(list("B"), list("AXC")));
  assert.equal(occurrences(project.read(), item("B")), 1);
});

test("merge order gives the same bytes whichever branch is named first", async (t) => {
  const ancestor = backlogOf(list("M"), list("ABCNPZK"));
  const project = scratchProject(t, ancestor);
  // One branch queued X after A and claimed P; the other queued Y after B,
  // reprioritized C to the front, and claimed N and then Z.
  const one = backlogOf(list("MP"), list("AXBCNZK"));
  const other = backlogOf(list("MNZ"), list("CABYPK"));

  const forwards = await run(project, versions(project, ancestor, one, other));
  assert.equal(forwards.code, 0, forwards.stderr);
  const result = project.read();
  assert.equal(result, backlogOf(list("MNPZ"), list("CAXBYK")));

  const backwards = await run(project, versions(project, ancestor, other, one));
  assert.equal(backwards.code, 0, backwards.stderr);
  assert.equal(project.read(), result);
});

test("merge order queues work at the head of the list the branch that put it there wanted", async (t) => {
  // The ordinary "this comes first now" reprioritization: one branch queued X
  // above everything, and the other wrote the queue out as the ancestor had
  // it. An untouched queue says nothing about a place it never named, so X
  // keeps the head, and nothing else in the file moves.
  const ancestor = backlogOf([], list("AB"));
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(project, ancestor, backlogOf([], list("XAB")), ancestor),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([], list("XAB")));
});
