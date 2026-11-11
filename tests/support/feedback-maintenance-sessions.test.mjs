import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dueDecision,
  observedSessions,
} from "../../dashboard/src/feedbackMaintenanceDue.ts";
import { makeMe } from "./makeMe.mjs";
import { incomingAdHocRequest } from "./launchRequestTestData.mjs";

const scheduled = makeMe.aFeedbackReview
  .with({
    reviewed: "2026-10-21",
    reviewAfter: "2026-10-28",
  })
  .please();
const due = { authorized: true, today: "2026-10-29" };
const maintenance = makeMe.aLaunchRecord
  .adHoc({
    source: "open-dough",
    title: "Feedback maintenance",
    instruction: "$maintain-feedback-cycle",
    maintenance: { due: "2026-10-28" },
  })
  .inCodexSession({ sessionId: "maintenance-1" })
  .launchedAt("2026-10-28T09:00:00Z")
  .please();
const request = incomingAdHocRequest(maintenance.request);
const read = (records, attempts) =>
  observedSessions("open-dough", records, attempts);

test("an automatic start no process runs, still unsettled, has ended: it serves its date and frees a later one", () => {
  const accepted = makeMe.anAcceptedAttempt
    .requesting(request)
    .acceptedAt("2026-10-28T09:00:00Z")
    .please();
  const sessions = read(
    [],
    [
      makeMe.anAttemptObservation
        .of(accepted)
        .owned(false)
        .running(false)
        .please(),
    ],
  );
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
      review: makeMe.aFeedbackReview
        .with({
          reviewed: "2026-10-21",
          reviewAfter: "2026-11-04",
        })
        .please(),
    }),
    { kind: "launch", due: "2026-11-04" },
  );
});

test("an automatic start a live process still runs is running and holds the check", () => {
  const accepted = makeMe.anAcceptedAttempt
    .requesting(request)
    .acceptedAt("2026-10-28T09:00:00Z")
    .please();
  const sessions = read(
    [],
    [
      makeMe.anAttemptObservation
        .of(accepted)
        .owned(true)
        .running(true)
        .please(),
    ],
  );
  assert.deepEqual(sessions, [
    { due: "2026-10-28", at: "2026-10-28T09:00:00Z", progress: "running" },
  ]);
  assert.deepEqual(dueDecision({ ...due, sessions }), {
    kind: "wait",
    reason: "open",
  });
});

test("a launched attempt whose session has a kept record is read once, from the record", () => {
  const accepted = makeMe.anAcceptedAttempt
    .requesting(request)
    .acceptedAt("2026-10-28T09:00:00Z")
    .launched(maintenance.session)
    .please();
  const kept = makeMe.anObservedLaunch
    .of(maintenance)
    .withSessionState(makeMe.aSessionState.loaded("working").please())
    .please();
  const attempt = makeMe.anAttemptObservation
    .of(accepted)
    .owned(false)
    .running(false)
    .please();
  assert.deepEqual(read([kept], [attempt]), [
    { due: "2026-10-28", at: "2026-10-28T09:00:00Z", progress: "running" },
  ]);
});

test("a kept record is done when marked done, ended when found unavailable, and running otherwise", () => {
  const done = makeMe.aLaunchRecord
    .adHoc({
      source: "open-dough",
      title: "Feedback maintenance",
      instruction: "$maintain-feedback-cycle",
      maintenance: { due: "2026-10-28" },
    })
    .inCodexSession({ sessionId: "maintenance-1" })
    .launchedAt("2026-10-28T09:00:00Z")
    .markedDoneAt("2026-10-28T09:30:00Z")
    .please();
  const manual = makeMe.aLaunchRecord
    .adHoc({
      source: "open-dough",
      title: "Feedback maintenance",
      instruction: "$maintain-feedback-cycle",
    })
    .inCodexSession({ sessionId: "maintenance-1" })
    .launchedAt("2026-10-28T09:00:00Z")
    .please();
  const other = makeMe.aLaunchRecord
    .adHoc({
      source: "other",
      title: "Feedback maintenance",
      instruction: "$maintain-feedback-cycle",
      maintenance: { due: "2026-10-28" },
    })
    .inCodexSession({ sessionId: "maintenance-1" })
    .launchedAt("2026-10-28T09:00:00Z")
    .please();
  const working = makeMe.aSessionState.loaded("working").please();
  assert.deepEqual(
    read(
      [
        makeMe.anObservedLaunch.of(done).withSessionState(working).please(),
        makeMe.anObservedLaunch
          .of(maintenance)
          .withSessionState(makeMe.aSessionState.unavailable().please())
          .please(),
        makeMe.anObservedLaunch.of(manual).withSessionState(working).please(),
        makeMe.anObservedLaunch.of(other).withSessionState(working).please(),
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
