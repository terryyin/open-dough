import assert from "node:assert/strict";
import { test } from "node:test";
import {
  feedbackMaintenanceState,
  heldReason,
  maintenanceOffReason,
  maintenanceRowText,
  maintenanceStatusText,
  nextCheckReason,
  staleDueReason,
} from "../../dashboard/src/feedbackMaintenanceState.ts";

const today = "2026-10-29";
const review = (reviewAfter) => ({
  kind: "scheduled",
  reviewed: "2026-10-21",
  reviewAfter,
});
// The review read after every session below started.
const on = {
  authorized: true,
  review: review("2026-10-28"),
  readAt: "2026-10-29T08:30:00Z",
};
const launched = (
  progress,
  due = "2026-10-28",
  at = "2026-10-28T09:00:00Z",
) => ({
  due,
  at,
  progress,
});
const state = (observation, sessions = []) =>
  feedbackMaintenanceState("open-dough", observation, sessions, today);

test("a served date whose automatic session ended or was deleted, or was marked done and read unchanged after it started, is due and did not complete", () => {
  for (const progress of ["done", "ended"]) {
    const answer = state(on, [launched(progress)]);
    assert.deepEqual(answer.row, { kind: "incomplete", due: "2026-10-28" });
    assert.equal(
      maintenanceRowText(answer.row),
      "Feedback maintenance due since 2026-10-28; its automatic session did not complete",
    );
    assert.equal(
      maintenanceStatusText(answer),
      "Due since 2026-10-28. Last automatic launch: did not complete (due 2026-10-28).",
    );
  }
  // Turned off since: still the served date's outcome.
  assert.equal(
    state({ ...on, authorized: false }, [launched("ended")]).row?.kind,
    "incomplete",
  );
});

test("a session marked done after the review of its date was read is done, with nothing on the row, until a read after it started finds that date", () => {
  const readBefore = { ...on, readAt: "2026-10-28T08:59:00Z" };
  const quiet = state(readBefore, [launched("done")]);
  assert.equal(quiet.row, undefined);
  assert.deepEqual(quiet.lastLaunch, { kind: "done", due: "2026-10-28" });
  assert.equal(
    maintenanceStatusText(quiet),
    "Due since 2026-10-28. Last automatic launch: done (due 2026-10-28).",
  );
  const readAfter = state({ ...on, readAt: "2026-10-28T09:01:00Z" }, [
    launched("done"),
  ]);
  assert.deepEqual(readAfter.row, { kind: "incomplete", due: "2026-10-28" });
  assert.deepEqual(readAfter.lastLaunch, {
    kind: "incomplete",
    due: "2026-10-28",
  });
  // An ended session did not report completion, whenever the date was read.
  const ended = state(readBefore, [launched("ended")]);
  assert.deepEqual(ended.row, { kind: "incomplete", due: "2026-10-28" });
  assert.deepEqual(ended.lastLaunch, { kind: "incomplete", due: "2026-10-28" });
});

test("any running feedback-maintenance session, automatic or the developer's, is running", () => {
  const automatic = state(on, [launched("running")]);
  assert.deepEqual(automatic.row, { kind: "running" });
  assert.equal(
    maintenanceRowText(automatic.row),
    "Feedback maintenance is running",
  );
  assert.equal(
    maintenanceStatusText(automatic),
    "Due since 2026-10-28. Last automatic launch: running (due 2026-10-28).",
  );
  const manual = state(on, [
    launched("ended"),
    { at: "2026-10-29T08:00:00Z", progress: "running" },
  ]);
  assert.deepEqual(manual.row, { kind: "running" });
  assert.deepEqual(manual.lastLaunch, {
    kind: "incomplete",
    due: "2026-10-28",
  });
});

test("a reached date nothing served says why it did not start", () => {
  const held = {
    due: "2026-10-28",
    reason: heldReason({
      kind: "existing-changes",
      paths: ["notes.txt"],
      count: 1,
      fingerprint: "f",
    }),
  };
  const answer = state({ ...on, held });
  assert.equal(
    maintenanceRowText(answer.row),
    "Feedback maintenance due since 2026-10-28; not started: default main has existing changes (1 changed path)",
  );
  assert.equal(
    maintenanceStatusText(answer),
    "Due since 2026-10-28. Last automatic launch: not started (due 2026-10-28): default main has existing changes (1 changed path).",
  );
  assert.equal(
    heldReason({ kind: "failed", reason: "refused", explanation: "No." }),
    "No.",
  );
  assert.equal(
    state({ ...on, authorized: false }).row?.reason,
    maintenanceOffReason,
  );
  assert.equal(state(on).row?.reason, nextCheckReason);
  assert.equal(
    feedbackMaintenanceState("open-dough", on, [], "2026-12-01").row?.reason,
    staleDueReason,
  );
});

test("a date not yet reached, not read, or unreadable says nothing on the row", () => {
  const ahead = state({ ...on, review: review("2026-11-05") }, [
    launched("done"),
  ]);
  assert.equal(ahead.row, undefined);
  assert.equal(
    maintenanceStatusText(ahead),
    "Next due 2026-11-05. Last automatic launch: done (due 2026-10-28).",
  );
  for (const observation of [
    { authorized: true },
    { authorized: true, review: { kind: "unread" } },
    { authorized: true, review: { kind: "absent" } },
  ]) {
    const answer = state(observation);
    assert.equal(answer.row, undefined);
    assert.equal(
      maintenanceStatusText(answer),
      "Next due date not read yet. Last automatic launch: none yet.",
    );
  }
});

test("the last automatic launch is the latest one", () => {
  const answer = state({ ...on, review: review("2026-11-05") }, [
    launched("done", "2026-10-21", "2026-10-21T09:00:00Z"),
    launched("ended", "2026-10-28", "2026-10-28T09:00:00Z"),
  ]);
  assert.deepEqual(answer.lastLaunch, {
    kind: "incomplete",
    due: "2026-10-28",
  });
});
