// The Done transition decides a kept record's next state as plain values.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { doneTransition } from "../../server/doneTransition.ts";

const earlier = "2026-11-20T09:00:00.000Z";
const doneAt = "2026-11-20T10:00:00.000Z";
const now = "2026-11-20T11:00:00.000Z";

const aSession = () =>
  makeMe.aLaunchRecord
    .adHoc({ title: "Done transition" })
    .inClaudeSession({ sessionId: "done-transition" });

test("marking Done records the Done time, the disposition time and the problem", () => {
  const next = doneTransition(aSession().please(), doneAt, now, {
    doneProblem: "Local done mark retained.",
  });

  expect(next).toMatchObject({
    doneAt,
    dispositionChangedAt: now,
    doneProblem: "Local done mark retained.",
  });
});

test("undoing Done clears the Done time and its problem", () => {
  const record = aSession()
    .markedDoneAt(doneAt, { problem: "Local done mark retained." })
    .please();

  const next = doneTransition(record, undefined, now);

  expect(next.doneAt).toBeUndefined();
  expect(next.doneProblem).toBeUndefined();
  expect(next.dispositionChangedAt).toBe(now);
});

test("a Done time other than the expected one refuses the change", () => {
  const record = aSession().markedDoneAt(doneAt).please();

  expect(
    doneTransition(record, earlier, now, { expectedDoneAt: earlier }),
  ).toBe(record);
});

test("an automatic Done the record no longer allows changes nothing", () => {
  const record = aSession()
    .completedWith({ receivedAt: earlier })
    .markedDoneAt(doneAt)
    .please();

  expect(
    doneTransition(record, doneAt, now, {
      automatic: true,
      expectedDoneAt: doneAt,
    }),
  ).toBe(record);
});

test("finishing the expected Done keeps its time and records the outcome", () => {
  const record = aSession().markedDoneAt(doneAt).please();

  const next = doneTransition(record, doneAt, now, {
    expectedDoneAt: doneAt,
    doneProblem: "Local done mark retained.",
  });

  expect(next).toMatchObject({
    doneAt,
    dispositionChangedAt: now,
    doneProblem: "Local done mark retained.",
  });
});

test("finishing an automatic Done keeps its disposition time", () => {
  const record = aSession()
    .completedWith({ receivedAt: doneAt })
    .markedDoneAt(doneAt)
    .please();

  const next = doneTransition(record, doneAt, now, {
    automatic: true,
    expectedDoneAt: doneAt,
  });

  expect(next.doneAt).toBe(doneAt);
  expect(next.dispositionChangedAt).toBe(record.dispositionChangedAt);
});

test("a branch-review record changed since the capture read it changes nothing", () => {
  const isolated = () =>
    aSession().inIsolatedWorkspace({
      workspace: "/work/done-transition",
      branch: "dough/done-transition",
      repository: "/work/repository",
    });
  const candidate = isolated().please();
  const record = isolated().markedDoneAt(earlier).please();

  expect(doneTransition(record, doneAt, now, { candidate })).toBe(record);
});
