// A queue dispute names both competing priority decisions so a human can resolve it.
import assert from "node:assert/strict";
import { test } from "node:test";
import { occurrences } from "./product-backlog-fixture.mjs";
import {
  branchFrom,
  mergeBacklog,
  mergeRefusal,
  named,
} from "./product-backlog-merge-fixture.mjs";

test("merge order refuses completing work the other branch reprioritized", async (t) => {
  // Both branch versions are the real operations' own doing. From the queue
  // A, B, C, D one branch completed B, and closed the unrelated A with it; the
  // other gave B the last place in the queue. Closing A moves everything
  // behind it up a place without reprioritizing any of it, so B's competing
  // removal and priority is the only thing in dispute.
  const ancestor = mergeBacklog({ queued: "ABCD" });
  const closed = await branchFrom(
    t,
    ancestor,
    ["complete", "--identity", named("B")],
    ["complete", "--identity", named("A")],
  );
  const last = ["place", "--identity", named("B"), "--position", "last"];
  const reprioritized = await branchFrom(t, ancestor, last);

  const refused = mergeRefusal(ancestor, closed, reprioritized);
  assert.match(
    refused,
    new RegExp(
      `"${named("B")}": the first branch version removes it while the second ` +
        `branch version gives it a different place in the queue, which is ` +
        `its priority\\. Removing work and reprioritizing it are different ` +
        `intentions`,
    ),
  );
  // No other entry is in dispute: A was closed on one branch and left alone on
  // the other, and C and D only shifted up behind the closures.
  for (const letter of "ACD") {
    assert.equal(occurrences(refused, named(letter)), 0, letter);
  }

  // Neither intention wins by being named first.
  const swapped = mergeRefusal(ancestor, reprioritized, closed);
  assert.match(
    swapped,
    new RegExp(
      `"${named("B")}": the second branch version removes it while the first ` +
        `branch version gives it a different place in the queue`,
    ),
  );
});

test("merge order refuses two branches moving one entry different ways", () => {
  // The case an ordinary text merge accepts and then duplicates: each branch
  // moved B, to a different place. Neither move is the ancestor's order, so
  // nothing establishes which one holds.
  const ancestor = mergeBacklog({ queued: "ABCD" });

  const refused = mergeRefusal(
    ancestor,
    mergeBacklog({ queued: "ACBD" }),
    mergeBacklog({ queued: "ACDB" }),
  );

  assert.match(
    refused,
    /"## Backlog list": the versions put the entries they share in different orders/,
  );
});

test("merge order refuses a queue position the versions do not determine", () => {
  const ancestor = mergeBacklog({ queued: "ABC" });

  // Both branches queued new work into the same gap, between B and C.
  const gap = mergeRefusal(
    ancestor,
    mergeBacklog({ queued: "ABXC" }),
    mergeBacklog({ queued: "ABYC" }),
  );
  assert.match(
    gap,
    /in the same place, after "SEED-003#story-b", and nothing in the versions says which of them comes first/,
  );
  assert.match(gap, /which is a decision for a human/);

  // The same branch moved one entry to two different places.
  const apart = mergeRefusal(
    ancestor,
    mergeBacklog({ queued: "AXBC" }),
    mergeBacklog({ queued: "ABXC" }),
  );
  assert.match(
    apart,
    new RegExp(
      `puts "${named("X")}" after "${named("A")}" and .* puts it after ` +
        `"${named("B")}"`,
    ),
  );

  // Both branches queued the same two entries into the same gap, in opposite
  // order. They agree about where the pair sits and disagree about which of
  // the two is the more important, which is the same decision to hand back.
  const swapped = mergeRefusal(
    ancestor,
    mergeBacklog({ queued: "AXYBC" }),
    mergeBacklog({ queued: "AYXBC" }),
  );
  assert.match(
    swapped,
    new RegExp(
      `puts "${named("X")}", "${named("Y")}" and .* puts "${named("Y")}", ` +
        `"${named("X")}" in the same place, after "${named("A")}"`,
    ),
  );
});

test("merge order refuses two branches both queuing work at the head", () => {
  // Each branch decided its own work was the most important thing in the
  // queue. Nothing in the three versions orders the two decisions.
  const ancestor = mergeBacklog({ queued: "AB" });

  const refused = mergeRefusal(
    ancestor,
    mergeBacklog({ queued: "XAB" }),
    mergeBacklog({ queued: "YAB" }),
  );

  assert.match(
    refused,
    new RegExp(
      `puts "${named("X")}" and .* puts "${named("Y")}" in the same place, ` +
        `at the start of the list, and nothing in the versions says which of ` +
        `them comes first`,
    ),
  );
});

test("merge order refuses one entry queued at the head on one branch and below it on the other", () => {
  // The head is a place like any other, so putting one entry there and
  // putting the same entry after A are two different priority decisions.
  const ancestor = mergeBacklog({ queued: "AB" });

  const refused = mergeRefusal(
    ancestor,
    mergeBacklog({ queued: "XAB" }),
    mergeBacklog({ queued: "AXB" }),
  );

  assert.match(
    refused,
    new RegExp(
      `puts "${named("X")}" at the start of the list and .* puts it after ` +
        `"${named("A")}"`,
    ),
  );
});
