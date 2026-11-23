// The order the two lists end up in when the three supplied versions determine
// it: each branch's own placement decision survives, an untouched order is not
// read as an instruction to restore anything, and an entry that moved is listed
// exactly once. Where the versions do not determine a position the run is
// handed back, which `product-backlog-merge-order-refusals.test.mjs` establishes.
import assert from "node:assert/strict";
import { mergeBacklogs } from "../../src/skills/dough-product-backlog/scripts/product-backlog-merge.mjs";
import { test } from "node:test";
import { backlogOf, occurrences } from "./product-backlog-fixture.mjs";
import {
  branchFrom,
  item,
  list,
  mergeBacklog,
  mergeRefusal,
  named,
} from "./product-backlog-merge-fixture.mjs";

test("merge order places each branch's addition where that branch put it", () => {
  // The queue both branches started from is A, B, C. One queued X between A
  // and B; the other queued Y between B and C. Both placements are explicit
  // priority decisions, and both survive.
  const ancestor = mergeBacklog({ queued: "ABC" });

  const merged = mergeBacklogs(
    ancestor,
    mergeBacklog({ queued: "AXBC" }),
    mergeBacklog({ queued: "ABYC" }),
  );

  assert.equal(merged.source, backlogOf([], list("AXBYC")));
});

test("merge order keeps a reprioritization the other branch left alone", () => {
  // One branch moved C to the front of the queue. The other branch wrote the
  // queue out exactly as the ancestor had it, which says nothing about C.
  const ancestor = mergeBacklog({ queued: "ABC" });

  const merged = mergeBacklogs(
    ancestor,
    mergeBacklog({ queued: "CAB" }),
    ancestor,
  );

  assert.equal(merged.source, backlogOf([], list("CAB")));
});

test("merge order does not read an untouched order as undoing a reprioritization", () => {
  // One branch reprioritized B above A; the other left that order alone and
  // completed C. Leaving an order alone is not an instruction to restore it,
  // so the reprioritization stands and the removal still applies.
  const ancestor = mergeBacklog({ queued: "ABC" });

  const merged = mergeBacklogs(
    ancestor,
    mergeBacklog({ queued: "BAC" }),
    mergeBacklog({ queued: "AB" }),
  );

  assert.equal(merged.source, backlogOf([], list("BA")));
  assert.equal(occurrences(merged.source, item("C")), 0);
});

test("merge order does not read work shifting up behind a removal as a reprioritization", async (t) => {
  // Both branch versions are the real operations' own doing. From A, B, C, D
  // one branch completed A and gave D the place above C; the other completed
  // B. Every surviving entry ends up at a different numbered position than the
  // ancestor gave it, and only D and C had their place among the others
  // changed, so both closures apply and the one reprioritization stands.
  const ancestor = mergeBacklog({ queued: "ABCD" });
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

  const merged = mergeBacklogs(ancestor, reprioritized, closed);

  assert.equal(merged.source, backlogOf([], list("DC")));
});

test("merge order appends concurrent claims to Taken and will not order a queue that way", () => {
  // Taken holds M. One branch claimed P; the other claimed N and then Z.
  // Survivors keep their order, each branch's additions keep theirs, and the
  // lexically smallest waiting identity goes next: M, N, P, Z.
  const ancestor = mergeBacklog({ taken: "M", queued: "NPZK" });

  const merged = mergeBacklogs(
    ancestor,
    mergeBacklog({ taken: "MP", queued: "NZK" }),
    mergeBacklog({ taken: "MNZ", queued: "PK" }),
  );

  assert.equal(merged.source, backlogOf(list("MNPZ"), list("K")));

  // The same two additions in the queue are two priority decisions in one
  // place, so the interleaving rule is not applied to them.
  const queued = mergeBacklog({ queued: "KM" });
  const refused = mergeRefusal(
    queued,
    mergeBacklog({ queued: "KMP" }),
    mergeBacklog({ queued: "KMN" }),
  );

  assert.match(
    refused,
    new RegExp(`puts "${named("P")}" and .* puts "${named("N")}"`),
  );
  assert.match(refused, /in the same place, after "SEED-003#story-m"/);
});

test("merge order lists an entry that moved exactly once", () => {
  // One branch moved B to the end of the queue; the other queued X after A.
  const ancestor = mergeBacklog({ queued: "ABC" });

  const moved = mergeBacklogs(
    ancestor,
    mergeBacklog({ queued: "ACB" }),
    mergeBacklog({ queued: "AXBC" }),
  );

  assert.equal(moved.source, backlogOf([], list("AXCB")));
  assert.equal(occurrences(moved.source, item("B")), 1);

  // One branch claimed B, moving it between the lists; the other left it in
  // the queue and queued X after A.
  const claimed = mergeBacklogs(
    ancestor,
    mergeBacklog({ taken: "B", queued: "AC" }),
    mergeBacklog({ queued: "AXBC" }),
  );

  assert.equal(claimed.source, backlogOf(list("B"), list("AXC")));
  assert.equal(occurrences(claimed.source, item("B")), 1);
});

test("merge order gives the same bytes whichever branch is named first", () => {
  const ancestor = mergeBacklog({ taken: "M", queued: "ABCNPZK" });
  // One branch queued X after A and claimed P; the other queued Y after B,
  // reprioritized C to the front, and claimed N and then Z.
  const one = mergeBacklog({ taken: "MP", queued: "AXBCNZK" });
  const other = mergeBacklog({ taken: "MNZ", queued: "CABYPK" });

  const forwards = mergeBacklogs(ancestor, one, other);
  const result = forwards.source;
  assert.equal(result, backlogOf(list("MNPZ"), list("CAXBYK")));

  const backwards = mergeBacklogs(ancestor, other, one);
  assert.equal(backwards.source, result);
});

test("merge order queues work at the head of the list the branch that put it there wanted", () => {
  // The ordinary "this comes first now" reprioritization: one branch queued X
  // above everything, and the other wrote the queue out as the ancestor had
  // it. An untouched queue says nothing about a place it never named, so X
  // keeps the head, and nothing else in the file moves.
  const ancestor = mergeBacklog({ queued: "AB" });

  const merged = mergeBacklogs(
    ancestor,
    mergeBacklog({ queued: "XAB" }),
    ancestor,
  );

  assert.equal(merged.source, backlogOf([], list("XAB")));
});
