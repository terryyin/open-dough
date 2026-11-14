import assert from "node:assert/strict";
import { test } from "node:test";
import {
  revisionDeliveryForSlot,
  revisionStreamSlotCap,
  revisionStreamSlotLockNames,
} from "../../../dashboard/src/revisionStreamSlot.ts";

test("h2 and h3 are uncapped; any other protocol is capped at two", () => {
  assert.equal(revisionStreamSlotCap("h2"), Number.POSITIVE_INFINITY);
  assert.equal(revisionStreamSlotCap("h3"), Number.POSITIVE_INFINITY);
  assert.equal(revisionStreamSlotCap("http/1.1"), 2);
  assert.equal(revisionStreamSlotCap("http/1.0"), 2);
  assert.equal(revisionStreamSlotCap(""), 2);
  assert.equal(revisionStreamSlotCap("unknown"), 2);
});

test("the capped budget names two Web Lock slots", () => {
  assert.deepEqual(revisionStreamSlotLockNames(), [
    "open-dough-revision-stream-slot-0",
    "open-dough-revision-stream-slot-1",
  ]);
});

test("a held slot streams; a page without one keeps the check", () => {
  assert.equal(revisionDeliveryForSlot(true), "stream");
  assert.equal(revisionDeliveryForSlot(false), "check");
});
