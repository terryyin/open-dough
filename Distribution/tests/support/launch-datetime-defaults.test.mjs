import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { launchRecordSchema } from "../../../dashboard/src/launchRecord.ts";
import { withinRetention } from "../../../dashboard/server/launchRecordDocument.ts";

test("a default Done mark is valid and retained, while an explicit expired mark still expires", (t) => {
  const now = new Date("2040-06-15T12:00:00.000Z");
  t.mock.timers.enable({ apis: ["Date"], now });
  const current = makeMe.aLaunchRecord
    .adHoc({ title: "Completed session" })
    .markedDone()
    .please();
  const expired = makeMe.aLaunchRecord
    .adHoc({ title: "Expired session" })
    .markedDone()
    .markedDoneAt("2040-05-01T12:00:00.000Z")
    .please();

  assert.equal(launchRecordSchema.safeParse(current).success, true);
  assert.equal(launchRecordSchema.safeParse(expired).success, true);
  assert.equal(current.doneAt, now.toISOString());
  assert.equal(expired.doneAt, "2040-05-01T12:00:00.000Z");
  assert.deepEqual(withinRetention([current, expired], now.getTime()), [
    current,
  ]);
});
