import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dueDecision,
  localDate,
} from "../../../dashboard/src/feedbackMaintenanceDue.ts";
import { makeMe } from "./makeMe.mjs";
import { launchRetentionDays } from "../../../dashboard/src/launchRecord.ts";

const scheduled = makeMe.aFeedbackReview
  .with({
    reviewed: "2026-10-21",
    reviewAfter: "2026-10-28",
  })
  .please();
const due = { authorized: true, sessions: [], today: "2026-10-29" };

test("a reached due date with nothing serving it launches once for that date", () => {
  assert.deepEqual(dueDecision({ ...due, review: scheduled }), {
    kind: "launch",
    due: "2026-10-28",
  });
  assert.deepEqual(
    dueDecision({ ...due, today: "2026-10-28", review: scheduled }),
    { kind: "launch", due: "2026-10-28" },
  );
});

test("the published review is read only when on and no maintenance session is open", () => {
  assert.deepEqual(dueDecision(due), { kind: "read" });
  assert.deepEqual(dueDecision({ ...due, authorized: false }), {
    kind: "wait",
    reason: "off",
  });
  for (const running of [
    makeMe.aMaintenanceSession
      .with({ due: "2026-10-21", progress: "running" })
      .please(),
    makeMe.aMaintenanceSession.with({ progress: "running" }).please(),
  ]) {
    assert.deepEqual(dueDecision({ ...due, sessions: [running] }), {
      kind: "wait",
      reason: "open",
    });
  }
});

test("a date before the due date, an unread, absent or invalid review is not due", () => {
  assert.deepEqual(
    dueDecision({ ...due, today: "2026-10-27", review: scheduled }),
    { kind: "wait", reason: "not-due" },
  );
  for (const review of [
    { kind: "unread" },
    { kind: "absent" },
    { kind: "invalid", reason: "the block is not valid JSON" },
  ]) {
    assert.deepEqual(dueDecision({ ...due, review }), {
      kind: "wait",
      reason: review.kind,
    });
  }
});

test("a due date an ended launch served is not launched again; a later one is", () => {
  const sessions = [
    makeMe.aMaintenanceSession
      .with({ due: "2026-10-21", progress: "ended" })
      .please(),
    makeMe.aMaintenanceSession
      .with({ due: "2026-10-28", progress: "ended" })
      .please(),
    makeMe.aMaintenanceSession.with({ progress: "ended" }).please(),
  ];
  assert.deepEqual(dueDecision({ ...due, sessions, review: scheduled }), {
    kind: "wait",
    reason: "served",
    due: "2026-10-28",
  });
  assert.deepEqual(
    dueDecision({
      ...due,
      today: "2026-11-05",
      sessions,
      review: makeMe.aFeedbackReview
        .with({ reviewed: "2026-10-21", reviewAfter: "2026-11-04" })
        .please(),
    }),
    { kind: "launch", due: "2026-11-04" },
  );
});

test("a due date the retention window has passed is never launched: still due, as stale", () => {
  const daysAfterDue = (days) => {
    const at = new Date(Date.UTC(2026, 9, 28 + days));
    return at.toISOString().slice(0, 10);
  };
  assert.deepEqual(
    dueDecision({
      ...due,
      today: daysAfterDue(launchRetentionDays),
      review: scheduled,
    }),
    { kind: "launch", due: "2026-10-28" },
  );
  assert.deepEqual(
    dueDecision({
      ...due,
      today: daysAfterDue(launchRetentionDays + 1),
      review: scheduled,
    }),
    { kind: "wait", reason: "stale", due: "2026-10-28" },
  );
});

test("the local date is the calendar day of the local clock", () => {
  assert.equal(localDate(new Date(2026, 9, 9, 23, 59)), "2026-10-09");
  assert.equal(localDate(new Date(2026, 0, 1, 0, 0)), "2026-01-01");
});
