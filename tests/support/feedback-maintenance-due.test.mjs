import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dueDecision,
  localDate,
  observedSessions,
} from "../../dashboard/src/feedbackMaintenanceDue.ts";
import { launchRetentionDays } from "../../dashboard/src/launchRecord.ts";

const scheduled = {
  kind: "scheduled",
  reviewed: "2026-10-21",
  reviewAfter: "2026-10-28",
};
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
    { due: "2026-10-21", progress: "running" },
    { progress: "running" },
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
    { due: "2026-10-21", progress: "ended" },
    { due: "2026-10-28", progress: "ended" },
    { progress: "ended" },
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
      review: { ...scheduled, reviewAfter: "2026-11-04" },
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

// This machine's feedback-maintenance launches in Open Dough: an automatic
// request serving a due date, its kept record, and its attempt.
const automatic = (dueDate) => ({
  source: "open-dough",
  workflow: "ad-hoc",
  host: "codex",
  instruction: "$maintain-feedback-cycle",
  maintenance: { due: dueDate },
});
const session = { host: "codex", sessionId: "maintenance-1" };
const record = (fields) => ({
  request: automatic("2026-10-28"),
  session,
  launchedAt: "2026-10-28T09:00:00Z",
  sessionState: { kind: "running" },
  ...fields,
});
const attempt = (fields) => ({
  request: automatic("2026-10-28"),
  acceptedAt: "2026-10-28T09:00:00Z",
  running: false,
  ...fields,
});
const read = (records, attempts) =>
  observedSessions("open-dough", records, attempts);

test("an automatic start no process runs, still unsettled, has ended: it serves its date and frees a later one", () => {
  const sessions = read([], [attempt({})]);
  assert.deepEqual(sessions, [
    { due: "2026-10-28", at: "2026-10-28T09:00:00Z", progress: "ended" },
  ]);
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
      review: { ...scheduled, reviewAfter: "2026-11-04" },
    }),
    { kind: "launch", due: "2026-11-04" },
  );
});

test("an automatic start a live process still runs is running and holds the check", () => {
  const sessions = read([], [attempt({ running: true })]);
  assert.deepEqual(sessions, [
    { due: "2026-10-28", at: "2026-10-28T09:00:00Z", progress: "running" },
  ]);
  assert.deepEqual(dueDecision({ ...due, sessions }), {
    kind: "wait",
    reason: "open",
  });
});

test("a launched attempt whose session has a kept record is read once, from the record", () => {
  assert.deepEqual(
    read([record({})], [attempt({ outcome: { kind: "launched", session } })]),
    [{ due: "2026-10-28", at: "2026-10-28T09:00:00Z", progress: "running" }],
  );
});

test("a kept record is done when marked done, ended when found unavailable, and running otherwise", () => {
  assert.deepEqual(
    read(
      [
        record({ doneAt: "2026-10-28T09:30:00Z" }),
        record({ sessionState: { kind: "unavailable" } }),
        record({
          request: { ...automatic("2026-10-21"), maintenance: undefined },
        }),
        record({ request: { ...automatic("2026-10-28"), source: "other" } }),
      ],
      [],
    ).map(({ due, progress }) => ({ due, progress })),
    [
      { due: "2026-10-28", progress: "done" },
      { due: "2026-10-28", progress: "ended" },
      { due: undefined, progress: "running" },
    ],
  );
});
