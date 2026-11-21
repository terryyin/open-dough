import path from "node:path";
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import {
  decideObservedDeliveries,
  observedSessionDeliveries,
} from "../../server/observedSessionDeliveries.ts";
import {
  aCheckout,
  anIsolatedLaunch,
  canonicalGitDirectory,
  historyBeforeTheCase,
  inWorktree,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";

const sourceTrunk = { id: source, ref: "main" };
const originTrunk = { remote: "origin", target: "refs/heads/main" };

test("decides each hand-merged Done branch's exact delivery without writing pins", async () => {
  const checkout = await aCheckout({
    history: historyBeforeTheCase()
      .withWorkspace("first", { from: "base" })
      .withWorkspace("second", { from: "base" }),
    withOrigin: true,
  });
  const firstWorkspace = checkout.execution;
  if (firstWorkspace === undefined) throw new Error("Missing first worktree.");
  const secondWorkspace = path.join(
    checkout.integration,
    ".worktrees",
    "second",
  );
  const { first: firstTip } = await work(
    inWorktree(checkout, firstWorkspace),
    makeMe.aCheckoutWork.committing("first", { at: minutesAgo(30) }),
  );
  const { second: secondTip } = await work(
    inWorktree(checkout, secondWorkspace),
    makeMe.aCheckoutWork.committing("second", { at: minutesAgo(30) }),
  );
  const repository = canonicalGitDirectory(checkout);
  const doneBranch = (branch: string, workspace: string, revision: string) =>
    anIsolatedLaunch(checkout, { branch, workspace })
      .branchResultFrom({
        repository,
        base: checkout.base,
        revision,
        manualDeliveryChecked: true,
      })
      .markedDoneAt(minutesAgo(10))
      .please();
  const first = doneBranch("first", firstWorkspace, firstTip);
  const second = doneBranch("second", secondWorkspace, secondTip);
  const { firstMerge, head } = await work(
    checkout,
    makeMe.aCheckoutWork
      .mergingTipByHand("firstMerge", { tip: firstTip, at: minutesAgo(5) })
      .mergingTipByHand("head", { tip: secondTip, at: minutesAgo(5) })
      .pushingToTrunk("pushed", { at: minutesAgo(5) }),
  );

  const actual = await observedSessionDeliveries().observe(sourceTrunk, head, [
    first,
    second,
  ]);

  expect(actual).toEqual([
    {
      record: first,
      result: first.branchResult,
      pair: {
        repository,
        ...originTrunk,
        base: checkout.base,
        revision: firstMerge,
      },
    },
    {
      record: second,
      result: second.branchResult,
      pair: { repository, ...originTrunk, base: firstMerge, revision: head },
    },
  ]);
  expect(await heldLandingPins(repository)).toEqual([]);
});

const base = "a".repeat(40);
const revision = "b".repeat(40);
const observed = "c".repeat(40);
const trunk = { ...originTrunk, revision: base };
const branch = {
  repository: "repository",
  workspace: "draft-worktree",
  branch: "draft",
  committedTip: base,
  tree: base,
  trunk,
};
const result = {
  repository: branch.repository,
  base,
  revision,
};
const checkedResult = { ...result, manualDeliveryChecked: true } as const;
type LaunchBuilder = typeof makeMe.aLaunchRecord;

const ineligible: [string, (launch: LaunchBuilder) => LaunchBuilder][] = [
  ["an open launch", (launch) => launch.branchResultFrom(checkedResult)],
  [
    "a Done launch with a delivery",
    (launch) =>
      launch
        .markedDone()
        .branchResultFrom(checkedResult)
        .withLanding(makeMe.aLaunchLanding.comparing({ base, revision })),
  ],
  ["a Done launch without a result", (launch) => launch.markedDone()],
  [
    "a result captured for an earlier Done mark",
    (launch) =>
      launch.markedDone().branchResultFrom({
        ...checkedResult,
        doneAt: minutesAgo(20),
      }),
  ],
  [
    "a result without a manual-delivery check",
    (launch) => launch.markedDone().branchResultFrom(result),
  ],
  [
    "a branch without a witnessed trunk revision",
    (launch) =>
      launch
        .markedDone()
        .branchResultFrom(checkedResult)
        .enteredBranch({
          ...branch,
          trunk: originTrunk,
        }),
  ],
  [
    "a branch that already witnessed the observed revision",
    (launch) =>
      launch
        .markedDone()
        .branchResultFrom(checkedResult)
        .enteredBranch({
          ...branch,
          trunk: { ...trunk, revision: observed },
        }),
  ],
  [
    "a branch targeting another trunk ref",
    (launch) =>
      launch
        .markedDone()
        .branchResultFrom(checkedResult)
        .enteredBranch({
          ...branch,
          trunk: { ...trunk, target: "refs/heads/elsewhere" },
        }),
  ],
];

test.each(ineligible)(
  "skips %s before reading the authorized head",
  async (title, arrange) => {
    const record = arrange(
      makeMe.aLaunchRecord.adHoc({ title }).enteredBranch(branch),
    ).please();
    const readTrunkHead = vi.fn(() => Promise.resolve(observed));

    const decision = decideObservedDeliveries(
      [record],
      sourceTrunk.ref,
      observed,
      {
        readTrunkHead,
      },
    );

    expect(await decision.next()).toMatchObject({ done: true });
    expect(readTrunkHead).not.toHaveBeenCalled();
  },
);
