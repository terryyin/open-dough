import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { inspectManualLanding } from "../../server/manualSessionLanding.ts";
import { observedSessionDeliveries } from "../../server/observedSessionDeliveries.ts";
import type { readBranchTrunkRevision } from "../../server/sessionBranchAttribution.ts";
import {
  aCheckoutWithWorktree,
  anIsolatedLaunch,
  inWorktree,
  minutesAgo,
  work,
} from "../support/doneCaptureCase.ts";
import { aDoneBranch } from "../support/doneCaptureReview.ts";
import { observedTrunk } from "../support/doneBranchObservation.ts";

test("an unmerged branch is inspected again only when the observed revision advances", async () => {
  const branch = "draft";
  const { checkout, workspace } = await aCheckoutWithWorktree(branch);
  const { draft } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing(branch, { at: minutesAgo(30) }),
  );
  const record = await aDoneBranch(
    anIsolatedLaunch(checkout, { workspace, branch }),
  );
  const { unrelated } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("unrelated", { at: minutesAgo(5) })
      .pushingToTrunk("published", { at: minutesAgo(5) }),
  );
  const inspect = vi.fn(inspectManualLanding);
  const observations = observedSessionDeliveries({ inspect });

  expect(
    await observations.observe(observedTrunk, unrelated, [record]),
  ).toEqual([]);
  expect(
    await observations.observe(observedTrunk, unrelated, [record]),
  ).toEqual([]);
  expect(inspect.mock.calls.map(([, tip, , head]) => [tip, head])).toEqual([
    [draft, unrelated],
  ]);

  const { advance } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("advance", { at: minutesAgo(3) })
      .pushingToTrunk("advanced", { at: minutesAgo(3) }),
  );
  expect(await observations.observe(observedTrunk, advance, [record])).toEqual(
    [],
  );
  expect(inspect.mock.calls.at(-1)?.[3]).toBe(advance);
});

const base = "a".repeat(40);
const revision = "b".repeat(40);
const observed = "c".repeat(40);
const target = "refs/heads/main";
const repository = "repository";

function aWitnessedBranch(branch: string, remote = "origin") {
  return makeMe.aLaunchRecord
    .adHoc({ title: branch })
    .inClaudeSession({ sessionId: branch })
    .enteredBranch({
      repository,
      workspace: branch,
      branch,
      committedTip: base,
      tree: base,
      trunk: { remote, target, revision: base },
    })
    .markedDone()
    .branchResultFrom({
      repository,
      base,
      revision,
      manualDeliveryChecked: true,
    })
    .please();
}

test.each([
  { outcome: "an unavailable", failedRead: () => Promise.resolve(undefined) },
  {
    outcome: "a rejected",
    failedRead: () => Promise.reject(new Error("Could not read the target")),
  },
])(
  "$outcome trunk head is retried on the next check",
  async ({ failedRead }) => {
    const records = [
      aWitnessedBranch("first"),
      aWitnessedBranch("second"),
      aWitnessedBranch("independent", "mirror"),
    ];
    const readTrunkHead = vi
      .fn<typeof readBranchTrunkRevision>(() => Promise.resolve(observed))
      .mockImplementationOnce(failedRead);
    const inspect = vi.fn<typeof inspectManualLanding>(() =>
      Promise.resolve(undefined),
    );
    const observations = observedSessionDeliveries({ readTrunkHead, inspect });

    await observations.observe(observedTrunk, observed, records);
    expect(readTrunkHead.mock.calls.map(([trunk]) => trunk?.remote)).toEqual([
      "origin",
      "mirror",
    ]);
    expect(inspect.mock.calls.map(([, , trunk]) => trunk?.remote)).toEqual([
      "mirror",
    ]);

    await observations.observe(observedTrunk, observed, records);
    expect(readTrunkHead.mock.calls.map(([trunk]) => trunk?.remote)).toEqual([
      "origin",
      "mirror",
      "origin",
    ]);
    expect(
      inspect.mock.calls.slice(1).map(([, , trunk]) => trunk?.remote),
    ).toEqual(["origin", "origin"]);
  },
);

test("each project keeps its own revision and checked witnesses", async () => {
  const records = [aWitnessedBranch("same-session")];
  const otherProject = { ...observedTrunk, id: "another-project" };
  const readTrunkHead = vi.fn(() => Promise.resolve(observed));
  const inspect = vi.fn(() => Promise.resolve(undefined));
  const observations = observedSessionDeliveries({ readTrunkHead, inspect });

  await observations.observe(observedTrunk, observed, records);
  await observations.observe(otherProject, observed, records);
  expect(inspect).toHaveBeenCalledTimes(2);

  await observations.observe(otherProject, revision, records);
  await observations.observe(observedTrunk, observed, records);
  expect(inspect).toHaveBeenCalledTimes(3);
});

test("a repeat check joins the pass through application of its delivery", async () => {
  const record = aWitnessedBranch("merged");
  const pair = { repository, remote: "origin", target, base, revision };
  const readRecords = vi.fn(() => [record]);
  const readTrunkHead = vi.fn(() => Promise.resolve(observed));
  const inspect = vi.fn(() => Promise.resolve(pair));
  const observations = observedSessionDeliveries({ readTrunkHead, inspect });

  let applyEntered!: () => void;
  const applying = new Promise<void>((resolve) => {
    applyEntered = resolve;
  });
  let release!: () => void;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  const apply = vi.fn(() => {
    applyEntered();
    return released;
  });

  const first = observations.run(observedTrunk, observed, readRecords, apply);
  await applying;
  const repeat = observations.run(observedTrunk, observed, readRecords, apply);
  release();
  const [deliveries, repeatedDeliveries] = await Promise.all([first, repeat]);

  expect(readRecords).toHaveBeenCalledTimes(1);
  expect(inspect).toHaveBeenCalledTimes(1);
  expect(apply).toHaveBeenCalledTimes(1);
  expect(deliveries.map((delivery) => delivery.pair)).toEqual([pair]);
  expect(repeatedDeliveries).toEqual(deliveries);
});
