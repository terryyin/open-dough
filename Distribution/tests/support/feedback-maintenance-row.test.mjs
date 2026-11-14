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
} from "../../../dashboard/src/feedbackMaintenanceState.ts";
import { makeMe } from "./makeMe.mjs";

const today = "2026-10-29";
// The review read after every session below started.
const on = makeMe.aMaintenanceObservation
  .with({
    authorized: true,
    review: makeMe.aFeedbackReview
      .with({
        reviewed: "2026-10-21",
        reviewAfter: "2026-10-28",
      })
      .please(),
    readAt: "2026-10-29T08:30:00Z",
  })
  .please();
const state = (observation, sessions = []) =>
  feedbackMaintenanceState("open-dough", observation, sessions, today);

test("any running feedback-maintenance session, automatic or the developer's, is running", () => {
  const automatic = state(on, [
    makeMe.aMaintenanceSession
      .with({ progress: "running", due: "2026-10-28" })
      .observedAt("2026-10-28T09:00:00Z")
      .please(),
  ]);
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
    makeMe.aMaintenanceSession
      .with({ progress: "ended", due: "2026-10-28" })
      .observedAt("2026-10-28T09:00:00Z")
      .please(),
    makeMe.aMaintenanceSession
      .with({ progress: "running" })
      .observedAt("2026-10-29T08:00:00Z")
      .please(),
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
  const answer = state(
    makeMe.aMaintenanceObservation.with({ ...on, held }).please(),
  );
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
    state(
      makeMe.aMaintenanceObservation
        .with({ ...on, authorized: false })
        .please(),
    ).row?.reason,
    maintenanceOffReason,
  );
  assert.equal(state(on).row?.reason, nextCheckReason);
  assert.equal(
    feedbackMaintenanceState("open-dough", on, [], "2026-12-01").row?.reason,
    staleDueReason,
  );
});

test("a date not yet reached, not read, or unreadable says nothing on the row", () => {
  const ahead = state(
    makeMe.aMaintenanceObservation
      .with({
        ...on,
        review: makeMe.aFeedbackReview
          .with({ reviewed: "2026-10-21", reviewAfter: "2026-11-05" })
          .please(),
      })
      .please(),
    [
      makeMe.aMaintenanceSession
        .with({ progress: "done", due: "2026-10-28" })
        .observedAt("2026-10-28T09:00:00Z")
        .please(),
    ],
  );
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
    const answer = state(
      makeMe.aMaintenanceObservation.with(observation).please(),
    );
    assert.equal(answer.row, undefined);
    assert.equal(
      maintenanceStatusText(answer),
      "Next due date not read yet. Last automatic launch: none yet.",
    );
  }
});
