import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import { observedSessionDeliveries } from "../../server/observedSessionDeliveries.ts";
import { minutesAgo, source } from "../support/doneCaptureCase.ts";
import {
  aDoneCaptureCase,
  type Refinement,
} from "../support/doneCaptureCaseBuilder.ts";

const sourceTrunk = { id: source, ref: "main" };
const originTrunk = { remote: "origin", target: "refs/heads/main" };

test("decides each hand-merged Done branch's exact delivery without writing pins", async () => {
  const doneFrom =
    (tip: "first" | "second"): Refinement<"first" | "second"> =>
    (launch, { checkout, work }) =>
      launch.branchResultFrom({
        repository: checkout.gitDirectory,
        committedTip: work[tip],
        manualDeliveryChecked: true,
      });
  const {
    checkout,
    records: { "isolated-first": first, "isolated-second": second },
    work: { first: firstTip, second: secondTip },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace("first")
    .withWorkspace("second")
    .withWork(
      (at) => makeMe.aCheckoutWork.committing("first", { at: at(30) }),
      { in: "first" },
    )
    .withWork(
      (at) => makeMe.aCheckoutWork.committing("second", { at: at(30) }),
      { in: "second" },
    )
    .withIsolatedLaunch(
      "isolated-first",
      { launched: 60, done: 10 },
      "first",
      doneFrom("first"),
    )
    .withIsolatedLaunch(
      "isolated-second",
      { launched: 60, done: 10 },
      "second",
      doneFrom("second"),
    )
    .please();
  const repository = checkout.gitDirectory;
  const { firstMerge, head } = await performWork(
    makeMe.aCheckoutWork
      .mergingTipByHand("firstMerge", { tip: firstTip, at: at(5) })
      .mergingTipByHand("head", { tip: secondTip, at: at(5) })
      .pushingToTrunk("pushed", { at: at(5) }),
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
  trunk,
};
const result = { repository: branch.repository, base, revision };
const branchResult = { repository: branch.repository, committedTip: revision };
const checkedResult = { ...branchResult, manualDeliveryChecked: true } as const;
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
    aDraft("unchecked").markedDone().branchResultFrom(branchResult),
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
