import assert from "node:assert/strict";
import { test } from "node:test";
import { observedSessions } from "../../../dashboard/src/feedbackMaintenanceDue.ts";
import {
  feedbackMaintenanceState,
  maintenanceRowText,
  maintenanceStatusText,
} from "../../../dashboard/src/feedbackMaintenanceState.ts";
import { makeMe } from "./makeMe.mjs";
import { incomingAdHocRequest } from "./launchRequestTestData.mjs";

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

test("a served date whose automatic session ended or was deleted, or was marked done and read unchanged after it started, is due and did not complete", () => {
  for (const progress of ["done", "ended"]) {
    const answer = state(on, [
      makeMe.aMaintenanceSession
        .with({ progress, due: "2026-10-28" })
        .observedAt("2026-10-28T09:00:00Z")
        .please(),
    ]);
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
    state(
      makeMe.aMaintenanceObservation
        .with({ ...on, authorized: false })
        .please(),
      [
        makeMe.aMaintenanceSession
          .with({ progress: "ended", due: "2026-10-28" })
          .observedAt("2026-10-28T09:00:00Z")
          .please(),
      ],
    ).row?.kind,
    "incomplete",
  );
});

test("a session marked done after the review of its date was read is done, with nothing on the row, until a read after it started finds that date", () => {
  const readBefore = makeMe.aMaintenanceObservation
    .with({ ...on, readAt: "2026-10-28T08:59:00Z" })
    .please();
  const quiet = state(readBefore, [
    makeMe.aMaintenanceSession
      .with({ progress: "done", due: "2026-10-28" })
      .observedAt("2026-10-28T09:00:00Z")
      .please(),
  ]);
  assert.equal(quiet.row, undefined);
  assert.deepEqual(quiet.lastLaunch, { kind: "done", due: "2026-10-28" });
  assert.equal(
    maintenanceStatusText(quiet),
    "Due since 2026-10-28. Last automatic launch: done (due 2026-10-28).",
  );
  const readAfter = state(
    makeMe.aMaintenanceObservation
      .with({ ...on, readAt: "2026-10-28T09:01:00Z" })
      .please(),
    [
      makeMe.aMaintenanceSession
        .with({ progress: "done", due: "2026-10-28" })
        .observedAt("2026-10-28T09:00:00Z")
        .please(),
    ],
  );
  assert.deepEqual(readAfter.row, { kind: "incomplete", due: "2026-10-28" });
  assert.deepEqual(readAfter.lastLaunch, {
    kind: "incomplete",
    due: "2026-10-28",
  });
  // An ended session did not report completion, whenever the date was read.
  const ended = state(readBefore, [
    makeMe.aMaintenanceSession
      .with({ progress: "ended", due: "2026-10-28" })
      .observedAt("2026-10-28T09:00:00Z")
      .please(),
  ]);
  assert.deepEqual(ended.row, { kind: "incomplete", due: "2026-10-28" });
  assert.deepEqual(ended.lastLaunch, { kind: "incomplete", due: "2026-10-28" });
});

test("an automatic start no process runs, still unsettled, did not complete", () => {
  const launch = makeMe.aLaunchRecord
    .adHoc({
      source: "open-dough",
      title: "Feedback maintenance",
      maintenance: { due: "2026-10-28" },
    })
    .inCodexSession({ sessionId: "maintenance-1" })
    .please();
  const accepted = makeMe.anAcceptedAttempt
    .requesting(incomingAdHocRequest(launch.request))
    .acceptedAt("2026-10-28T09:00:00Z")
    .please();
  const interrupted = makeMe.anAttemptObservation
    .of(accepted)
    .owned(false)
    .running(false)
    .please();
  const answer = state(on, observedSessions("open-dough", [], [interrupted]));
  assert.deepEqual(answer.row, { kind: "incomplete", due: "2026-10-28" });
  assert.deepEqual(answer.lastLaunch, {
    kind: "incomplete",
    due: "2026-10-28",
  });
});

test("the last automatic launch is the latest one", () => {
  const answer = state(
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
        .with({ progress: "done", due: "2026-10-21" })
        .observedAt("2026-10-21T09:00:00Z")
        .please(),
      makeMe.aMaintenanceSession
        .with({ progress: "ended", due: "2026-10-28" })
        .observedAt("2026-10-28T09:00:00Z")
        .please(),
    ],
  );
  assert.deepEqual(answer.lastLaunch, {
    kind: "incomplete",
    due: "2026-10-28",
  });
});
