// Done saves an isolated ad hoc branch's result with Git references, so its
// review outlives the worktree and branch, and only that launch's removal
// releases them.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import {
  changeSessionRecord,
  deleteRecord,
  keptRecords,
} from "../../server/launchRecordStore.ts";
import { retireExpiredRecords } from "../../server/launchRecordRemoval.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  launchRetentionDays,
  type LaunchRecord,
} from "../../src/launchRecord.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import {
  aCheckout,
  anIsolatedLaunch,
  historyBeforeTheCase,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import {
  aDoneBranch,
  fileDiff,
  fileText,
  review,
} from "../support/doneCaptureReview.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";

// A checkout whose isolated launches each started a worktree at its base,
// answered by branch.
async function aCheckoutWithWorktreeLaunches<Branch extends string>(
  first: Branch,
  ...others: Branch[]
) {
  const history = others.reduce(
    (described, branch) => described.withWorkspace(branch, { from: "base" }),
    historyBeforeTheCase().withWorkspace(first, { from: "base" }),
  );
  const checkout = await aCheckout({ history, withOrigin: true });
  const worktrees = {} as Record<
    Branch,
    {
      workspace: string;
      branch: Branch;
      launch: ReturnType<typeof anIsolatedLaunch>;
      record: LaunchRecord;
    }
  >;
  for (const branch of [first, ...others]) {
    const workspace =
      branch === first
        ? checkout.execution
        : path.join(checkout.integration, ".worktrees", branch);
    if (workspace === undefined) throw new Error("Missing the worktree.");
    const launch = anIsolatedLaunch(checkout, { workspace, branch });
    worktrees[branch] = { workspace, branch, launch, record: launch.please() };
  }
  return { checkout, worktrees };
}

// That checkout with its launches kept.
async function aCheckoutWithWorktrees<Branch extends string>(
  first: Branch,
  ...others: Branch[]
) {
  const launched = await aCheckoutWithWorktreeLaunches(first, ...others);
  keep(
    ...Object.values<{ record: LaunchRecord }>(launched.worktrees).map(
      ({ record }) => record,
    ),
  );
  return launched;
}

test("the branch comparison at Done and its files survive worktree and branch removal and pruning", async () => {
  const { checkout, worktrees } = await aCheckoutWithWorktrees("draft");
  const { workspace, branch, record } = worktrees.draft;
  const { draft: tree } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("draft", { at: minutesAgo(30) }),
  );

  await markDone(record);
  retireAdHocBranch(checkout.integration, workspace, branch);

  const baseline = checkout.base;
  expect(await review(await keptRecords(source), record)).toMatchObject({
    kind: "branch-result",
    baseline,
    tree,
    files: [expect.objectContaining({ path: "draft.txt", kind: "added" })],
  });
  const named = { baseline, tree, path: "draft.txt" };
  expect(
    await fileDiff(await keptRecords(source), record, named),
  ).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+draft work") as string,
  });
  expect(await fileText(await keptRecords(source), record, named)).toEqual({
    kind: "text",
    baseline: null,
    tree: "draft work\n",
  });
  const refused = fileText(await keptRecords(source), record, {
    ...named,
    baseline: tree,
  });
  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({ status: 409 });
});

test("Done's capture reads an empty branch and refuses a missing checkout", async () => {
  const {
    checkout,
    worktrees: { empty, missing },
  } = await aCheckoutWithWorktreeLaunches("empty", "missing");
  await git(checkout.integration, "worktree", "remove", missing.workspace);
  const doneAt = minutesAgo(10);

  expect(
    (await captureBranchResult(empty.record, doneAt)).result,
  ).toMatchObject({
    base: checkout.base,
    revision: checkout.base,
    committedTip: checkout.base,
  });
  await expect(captureBranchResult(missing.record, doneAt)).rejects.toThrow();
});

test("Done reviews an empty branch result apart from a missing checkout", async () => {
  const {
    checkout,
    worktrees: { empty, missing },
  } = await aCheckoutWithWorktreeLaunches("empty", "missing");
  const doneAt = minutesAgo(10);
  const emptyDone = await aDoneBranch(empty.launch, { doneAt });
  const missingDone = missing.launch
    .branchResultFailedAt(doneAt)
    .markedDoneAt(doneAt)
    .please();
  const done = [emptyDone, missingDone];

  expect(await review(done, emptyDone)).toMatchObject({
    kind: "branch-result",
    baseline: checkout.base,
    tree: checkout.base,
    files: [],
  });
  expect(await review(done, missingDone)).toMatchObject({
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
      worktrees: { leaving, staying },
    } = await aCheckoutWithWorktrees("leaving", "staying");
    const { first } = await work(
      inWorktree(checkout, leaving.workspace),
      makeMe.aCheckoutWork.committing("first", { at: minutesAgo(30) }),
    );
    writeFileSync(
      path.join(leaving.workspace, "draft.txt"),
      "A draft to keep.\n",
    );
    const { second } = await work(
      inWorktree(checkout, staying.workspace),
      makeMe.aCheckoutWork.committing("second", { at: minutesAgo(30) }),
    );
    await markDone(leaving.record);
    await markDone(staying.record);
    const pins = (launch: typeof leaving) =>
      sessionBranchPins(checkout.integration, launch.record.session);
    expect(await pins(leaving)).toContainEqual(
      expect.objectContaining({ objectId: first }),
    );
    expect(await pins(leaving)).toHaveLength(3);
    const stayingPins = await pins(staying);
    expect(stayingPins).toContainEqual(
      expect.objectContaining({ objectId: second }),
    );

    await remove(leaving.record);

    expect(await pins(leaving)).toEqual([]);
    expect(await pins(staying)).toEqual(stayingPins);
  });
}
