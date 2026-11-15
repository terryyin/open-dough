// The case's actual native scheduler, with a controlled clock. Observable
// publication emissions protect timing; no real observation interval elapses.
import assert from "node:assert/strict";
import { test } from "node:test";
import { schedulePublications } from "../native-comparison/supplier-watch/clock.mjs";

test("native publications occur at 180 and 360 seconds from the watch turn even when setup starts later", (t) => {
  t.mock.timers.enable({ apis: ["Date", "setTimeout"], now: 10000 });
  const emitted = [];
  // The turn began nine seconds before the scheduler was started.
  schedulePublications(1000, (event) =>
    emitted.push({ event, at: Date.now() }),
  );
  t.mock.timers.tick(170999);
  assert.deepEqual(emitted, []);
  t.mock.timers.tick(1);
  assert.deepEqual(emitted, [{ event: "nonqualifying", at: 181000 }]);
  t.mock.timers.tick(179999);
  assert.deepEqual(emitted, [{ event: "nonqualifying", at: 181000 }]);
  t.mock.timers.tick(1);
  assert.deepEqual(emitted, [
    { event: "nonqualifying", at: 181000 },
    { event: "qualifying", at: 361000 },
  ]);
});

test("a late first release keeps the second publication anchored to the original turn", (t) => {
  t.mock.timers.enable({ apis: ["Date", "setTimeout"], now: 200000 });
  const emitted = [];
  schedulePublications(1000, (event) =>
    emitted.push({ event, at: Date.now() }),
  );
  t.mock.timers.tick(0);
  assert.deepEqual(emitted, [{ event: "nonqualifying", at: 200000 }]);
  t.mock.timers.tick(160999);
  assert.deepEqual(emitted, [{ event: "nonqualifying", at: 200000 }]);
  t.mock.timers.tick(1);
  assert.deepEqual(emitted, [
    { event: "nonqualifying", at: 200000 },
    { event: "qualifying", at: 361000 },
  ]);
});
