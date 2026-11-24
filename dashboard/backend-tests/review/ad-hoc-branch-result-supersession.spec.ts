// A Done held after capture cannot outlast changes to the launch: reopening
// keeps the saved evidence, a newer Done wins with only its pins, and
// deletion leaves none.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import { deleteRecord, keptSession } from "../../server/launchRecordStore.ts";
import {
  aHeldDone,
  markDone,
  minutesAgo,
  source,
  undoDone,
} from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

// A kept isolated launch whose worktree started on `draft` at the base.
async function anIsolatedDraft() {
  const {
    checkout,
    records: { "isolated-draft": record },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace("draft")
    .withIsolatedLaunch("isolated-draft", { launched: 60 }, "draft")
    .kept()
    .please();
  const commit = async <Name extends string>(name: Name, minutes: number) =>
    (
      await performWork(
        makeMe.aCheckoutWork.committing(name, { at: at(minutes) }),
        { in: "draft" },
      )
    )[name];
  const pins = () => sessionBranchPins(checkout.integration, record.session);
  return { record, commit, pins };
}

test("reopening keeps the branch evidence and its pins", async () => {
  const { record, commit, pins } = await anIsolatedDraft();
  const first = await commit("first", 30);
  await markDone(record);
  const originalPins = await pins();
  expect(originalPins).toMatchObject([{ objectId: first }]);

  await undoDone(record);

  const reopened = await keptSession(source, record.session);
  if (reopened === undefined)
    throw new Error("The reopened session is missing.");
  expect(reopened.doneAt).toBeUndefined();
  expect(reopened.branchResult).toMatchObject({
    committedTip: first,
  });
  expect(await pins()).toEqual(originalPins);
});

test("a newer Done wins when an earlier Done waits after capture", async () => {
  const { record, commit, pins } = await anIsolatedDraft();
  await commit("stale", 30);
  const staleDone = aHeldDone(record);
  const newerDoneAt = minutesAgo(5);
  let latest: string;
  try {
    await staleDone.reading;
    const pending = await keptSession(source, record.session);
    expect(pending).toBeDefined();
    expect(pending?.doneAt).toBeUndefined();
    expect(pending?.branchResult).toBeUndefined();
    latest = await commit("latest", 20);
    await markDone(record, newerDoneAt);
  } finally {
    staleDone.release();
    await staleDone.marking;
  }

  expect(await keptSession(source, record.session)).toMatchObject({
    doneAt: newerDoneAt,
    branchResult: { doneAt: newerDoneAt, committedTip: latest },
  });
  expect(await pins()).toMatchObject([{ objectId: latest }]);
});

test("deleting a record after branch capture leaves no session or pins when Done settles", async () => {
  const { record, commit, pins } = await anIsolatedDraft();
  await commit("abandoned", 30);
  const done = aHeldDone(record);
  try {
    await done.reading;
    await deleteRecord(source, record.session);
  } finally {
    done.release();
    await done.marking;
  }

  expect(await keptSession(source, record.session)).toBeUndefined();
  expect(await pins()).toEqual([]);
});
