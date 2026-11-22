// Done saves an isolated ad hoc branch's result with Git references, so its
// review outlives the worktree and branch, and only that launch's removal
// releases them.
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import {
  changeSessionRecord,
  deleteRecord,
  keptSession,
} from "../../server/launchRecordStore.ts";
import { retireExpiredRecords } from "../../server/launchRecordRemoval.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  launchRetentionDays,
  type LaunchRecord,
} from "../../src/launchRecord.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import { markDone, minutesAgo, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { aDoneBranch } from "../support/doneCaptureReview.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";

test("the branch comparison at Done and its files survive worktree and branch removal and pruning", async () => {
  const {
    checkout,
    worktrees: { draft: workspace },
    records: { draft: record },
    work: { draft: tree },
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace("draft")
    .withIsolatedLaunch("draft", { launched: 60 }, "draft")
    .withWork(
      (at) => makeMe.aCheckoutWork.committing("draft", { at: at(30) }),
      {
        in: "draft",
      },
    )
    .kept()
    .please();

  await markDone(record);
  retireAdHocBranch(checkout.integration, workspace, "draft");

  const baseline = checkout.base;
  const saved = await keptSession(source, record.session);
  if (saved === undefined) throw new Error("Missing the kept launch.");
  const signal = new AbortController().signal;
  expect(await storyReview({ record: saved, read: {} }, signal)).toMatchObject({
    kind: "branch-result",
    baseline,
    tree,
    files: [expect.objectContaining({ path: "draft.txt", kind: "added" })],
  });
  const file = { record: saved, read: { baseline, tree, path: "draft.txt" } };
  expect(await reviewedFileDiff(file, signal)).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+draft work") as string,
  });
  expect(await reviewedFileText(file, signal)).toEqual({
    kind: "text",
    baseline: null,
    tree: "draft work\n",
  });
  const wrongPair = { ...file.read, baseline: tree };
  const refused = reviewedFileText({ record: saved, read: wrongPair }, signal);
  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({ status: 409 });
});

test("Done's capture reads an empty branch and refuses a missing checkout", async () => {
  const {
    checkout,
    worktrees,
    records: { empty, missing },
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace("empty")
    .withWorkspace("missing")
    .withIsolatedLaunch("empty", { launched: 60 }, "empty")
    .withIsolatedLaunch("missing", { launched: 60 }, "missing")
    .please();
  await git(checkout.integration, "worktree", "remove", worktrees.missing);
  const doneAt = at(10);

  expect((await captureBranchResult(empty, doneAt)).result).toMatchObject({
    base: checkout.base,
    revision: checkout.base,
    committedTip: checkout.base,
  });
  await expect(captureBranchResult(missing, doneAt)).rejects.toThrow();
});

test("Done reviews an empty branch result apart from a missing checkout", async () => {
  const doneAt = minutesAgo(10);
  const {
    checkout,
    worktrees,
    records: { missing: missingDone },
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace("empty")
    .withWorkspace("missing")
    .withIsolatedLaunch(
      "missing",
      { launched: 60, done: 10 },
      "missing",
      (launch) => launch.branchResultFailedAt(doneAt),
    )
    .please();
  const emptyDone = await aDoneBranch(
    makeMe.aLaunchRecord
      .isolatedIn(checkout, { workspace: worktrees.empty, branch: "empty" })
      .inClaudeSession({ sessionId: "empty" })
      .launchedAt(at(60)),
    { doneAt },
  );

  const signal = new AbortController().signal;
  expect(
    await storyReview({ record: emptyDone, read: {} }, signal),
  ).toMatchObject({
    kind: "branch-result",
    baseline: checkout.base,
    tree: checkout.base,
    files: [],
  });
  expect(
    await storyReview({ record: missingDone, read: {} }, signal),
  ).toMatchObject({
    kind: "unavailable",
    explanation: "This session's branch changes at Done were not captured.",
  });
});

const retentionAgo = new Date(
  Date.now() - (launchRetentionDays + 1) * 86_400_000,
).toISOString();

const removals = {
  deletion: (record) => deleteRecord(source, record.session),
  // Retention drops the aged record at the project's next record write,
  // which retires it through the production cleanup.
  expiry: async (record) => {
    await changeSessionRecord(source, record.session, (kept) => ({
      ...kept,
      doneAt: retentionAgo,
    }));
    await changeSessionRecord(
      source,
      record.session,
      (kept) => kept,
      retireExpiredRecords,
    );
  },
} satisfies Record<string, (record: LaunchRecord) => Promise<unknown>>;

for (const [reason, remove] of Object.entries(removals)) {
  test(`${reason} releases only that launch's retained branch evidence`, async () => {
    const {
      checkout,
      worktrees,
      records: { leaving, staying },
      work: { first, second },
    } = await aDoneCaptureCase()
      .withOrigin()
      .withWorkspace("leaving")
      .withWorkspace("staying")
      .withIsolatedLaunch("leaving", { launched: 60 }, "leaving")
      .withIsolatedLaunch("staying", { launched: 60 }, "staying")
      .withWork(
        (at) => makeMe.aCheckoutWork.committing("first", { at: at(30) }),
        {
          in: "leaving",
        },
      )
      .withWork(
        (at) => makeMe.aCheckoutWork.committing("second", { at: at(30) }),
        {
          in: "staying",
        },
      )
      .kept()
      .please();
    writeFileSync(
      path.join(worktrees.leaving, "draft.txt"),
      "A draft to keep.\n",
    );
    await markDone(leaving);
    await markDone(staying);
    const pins = (record: LaunchRecord) =>
      sessionBranchPins(checkout.integration, record.session);
    expect(await pins(leaving)).toContainEqual(
      expect.objectContaining({ objectId: first }),
    );
    expect(await pins(leaving)).toHaveLength(3);
    const stayingPins = await pins(staying);
    expect(stayingPins).toContainEqual(
      expect.objectContaining({ objectId: second }),
    );

    await remove(leaving);

    expect(await pins(leaving)).toEqual([]);
    expect(await pins(staying)).toEqual(stayingPins);
  });
}
