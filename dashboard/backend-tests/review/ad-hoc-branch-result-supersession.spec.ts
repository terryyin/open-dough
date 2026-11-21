// A Done held after capture cannot outlast changes to the launch: reopening
// keeps the saved evidence, a newer Done wins with only its pins, and
// deletion leaves none.
import { reviewedFileText } from "../../server/storyReviewFileResponse.ts";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import { deleteRecord, keptSession } from "../../server/launchRecordStore.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  aCheckout,
  aHeldDone,
  historyBeforeTheCase,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  source,
  undoDone,
  work,
} from "../support/doneCaptureCase.ts";

// A kept isolated launch whose worktree started on `draft` at the base.
async function anIsolatedDraft() {
  const history = historyBeforeTheCase().withWorkspace("draft", {
    from: "base",
  });
  const checkout = await aCheckout({ history, withOrigin: true });
  const workspace = checkout.execution;
  if (workspace === undefined) throw new Error("Missing the worktree.");
  const record = makeMe.aLaunchRecord
    .isolatedIn(checkout, { workspace, branch: "draft" })
    .please();
  keep(record);
  const commit = async <Name extends string>(name: Name, minutes: number) =>
    (
      await work(
        inWorktree(checkout, workspace),
        makeMe.aCheckoutWork.committing(name, { at: minutesAgo(minutes) }),
      )
    )[name];
  const pins = () => sessionBranchPins(checkout.integration, record.session);
  return { baseline: checkout.base, record, commit, pins };
}

test("reopening keeps the branch evidence and refuses the old file pair", async () => {
  const { baseline, record, commit, pins } = await anIsolatedDraft();
  const first = await commit("first", 30);
  await markDone(record);
  const originalPins = await pins();
  expect(originalPins).toMatchObject([
    { objectId: baseline },
    { objectId: first },
  ]);

  await undoDone(record);

  const reopened = await keptSession(source, record.session);
  if (reopened === undefined)
    throw new Error("The reopened session is missing.");
  expect(reopened.doneAt).toBeUndefined();
  expect(reopened.branchResult).toMatchObject({
    base: baseline,
    revision: first,
  });
  expect(await pins()).toEqual(originalPins);
  const oldFile = reviewedFileText(
    {
      record: reopened,
      read: {
        baseline,
        tree: first,
        path: "first.txt",
      },
    },
    new AbortController().signal,
  );
  await expect(oldFile).rejects.toBeInstanceOf(RefusedRequest);
  await expect(oldFile).rejects.toMatchObject({ status: 409 });
});

test("a newer Done wins when an earlier Done waits after capture", async () => {
  const { baseline, record, commit, pins } = await anIsolatedDraft();
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
    branchResult: { doneAt: newerDoneAt, base: baseline, revision: latest },
  });
  expect(await pins()).toMatchObject([
    { objectId: baseline },
    { objectId: latest },
  ]);
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
