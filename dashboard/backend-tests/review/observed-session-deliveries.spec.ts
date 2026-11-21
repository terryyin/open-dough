import path from "node:path";
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import { observedSessionDeliveries } from "../../server/observedSessionDeliveries.ts";
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
const result = { repository: branch.repository, base, revision };
const checkedResult = { ...result, manualDeliveryChecked: true } as const;
const aDraft = (title: string) =>
  makeMe.aLaunchRecord
    .adHoc({ title })
    .inClaudeSession({ sessionId: title })
    .enteredBranch(branch);
const awaitingDelivery = (title: string) =>
  makeMe.aLaunchRecord
    .adHoc({ title })
    .inClaudeSession({ sessionId: title })
    .awaitingManualDelivery(result);

test("inspects only Done branch results awaiting delivery, including one Done since the last check", async () => {
  const readTrunkHead = vi.fn(() => Promise.resolve(observed));
  const inspect = vi.fn(() => Promise.resolve({ ...originTrunk, ...result }));
  const observations = observedSessionDeliveries({ readTrunkHead, inspect });
  const notAwaiting = [
    aDraft("newly Done").branchResultFrom(checkedResult),
    awaitingDelivery("delivered").withLanding(
      makeMe.aLaunchLanding.comparing({ base, revision }),
    ),
    aDraft("without a result").markedDone(),
    aDraft("captured earlier")
      .markedDone()
      .branchResultFrom({ ...checkedResult, doneAt: minutesAgo(20) }),
    aDraft("unchecked").markedDone().branchResultFrom(result),
    awaitingDelivery("unwitnessed").enteredBranch({
      ...branch,
      trunk: originTrunk,
    }),
    awaitingDelivery("witnessed").enteredBranch({
      ...branch,
      trunk: { ...trunk, revision: observed },
    }),
    awaitingDelivery("elsewhere").enteredBranch({
      ...branch,
      trunk: { ...trunk, target: "refs/heads/elsewhere" },
    }),
  ].map((launch) => launch.please());

  expect(
    await observations.observe(sourceTrunk, observed, notAwaiting),
  ).toEqual([]);
  expect(readTrunkHead).not.toHaveBeenCalled();

  const newlyDone = awaitingDelivery("newly Done").please();
  const delivered = await observations.observe(sourceTrunk, observed, [
    newlyDone,
  ]);
  expect(delivered.map(({ record }) => record)).toEqual([newlyDone]);
});
