// A revision observation discovers the hand-made trunk delivery of a Done
// branch: after a restart, a later advance and branch retirement it keeps
// the comparison fixed at Done beside the delivered one, and a check at an
// unchanged revision still finds a session that became Done since.
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptRecords, keptSession } from "../../server/launchRecordStore.ts";
import { observedSessionDeliveries } from "../../server/observedSessionDeliveries.ts";
import { sessionLandingObservations } from "../../server/observedSessionLandings.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import { resolveStoryConflict } from "../../test-support/support/completedStoryPublication.ts";
import {
  aCheckoutWithWorktree,
  anIsolatedBranch,
  anIsolatedLaunch,
  inWorktree,
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
import { observedTrunk } from "../support/doneBranchObservation.ts";

const branch = "draft";
const head = async (checkout: string) =>
  (await git(checkout, "rev-parse", "HEAD")).stdout.trim();

test("the first observation after restart discovers a delivery while preserving the fixed branch comparison", async () => {
  const { checkout, workspace, record } = await anIsolatedBranch(branch, {
    "draft.txt": "Original draft\n",
  });
  const { integration, base: baseline } = checkout;
  await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork
      .committing("committed", {
        at: minutesAgo(30),
        files: { "draft.txt": "Committed draft\n" },
      })
      .editing("working", {
        at: minutesAgo(20),
        files: { "draft.txt": "Working draft\n" },
      }),
  );
  const done = minutesAgo(10);
  await markDone(record, done);
  const branchAtDone = await review(await keptRecords(source), record);
  expect(branchAtDone).toMatchObject({
    kind: "branch-result",
    baseline,
    files: [{ path: "draft.txt" }],
  });

  const { trunk: trunkParent } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("trunk", {
      at: minutesAgo(5),
      files: { "draft.txt": "Trunk draft\n" },
    }),
  );
  resolveStoryConflict(
    integration,
    ["merge", "--no-ff", "--no-edit", branch],
    "draft.txt",
    "Resolution on trunk\n",
    "Resolve the draft",
  );
  const merge = await head(integration);
  const { later: latest } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("later", { at: minutesAgo(3) })
      .pushingToTrunk("later-push", { at: minutesAgo(3) }),
  );
  retireAdHocBranch(integration, workspace, branch, {
    discardWorkingChanges: true,
  });

  const restarted = sessionLandingObservations();
  expect(await review(await keptRecords(source), record)).toEqual(branchAtDone);
  await restarted.observe(observedTrunk, latest);
  const delivered = await review(await keptRecords(source), record);
  expect(delivered).toMatchObject({
    kind: "landed",
    baseline: trunkParent,
    tree: merge,
    sessionComparisonKeys: ["delivered", "branch-result"],
    files: [{ path: "draft.txt" }],
  });
  const savedBranch = await review(
    await keptRecords(source),
    record,
    "branch-result",
  );
  expect(savedBranch).toMatchObject({
    kind: "branch-result",
    baseline,
    files: [{ path: "draft.txt" }],
  });
  if (delivered.kind !== "landed" || savedBranch.kind !== "branch-result")
    throw new Error("Missing the saved branch and delivered comparisons.");
  expect(branchAtDone).toMatchObject({ tree: savedBranch.tree });
  expect((await keptSession(source, record.session))?.doneAt).toBe(done);

  await git(
    integration,
    "remote",
    "set-url",
    "origin",
    path.join(path.dirname(integration), "offline"),
  );
  expect(await review(await keptRecords(source), record)).toEqual(delivered);
  expect(
    await review(await keptRecords(source), record, "branch-result"),
  ).toEqual(savedBranch);
  for (const [comparison, before, after, reference] of [
    [
      delivered,
      "Trunk draft",
      "Resolution on trunk",
      delivered.landing.reference,
    ],
    [savedBranch, "Original draft", "Working draft", undefined],
  ] as const) {
    const file = {
      baseline: comparison.baseline,
      tree: comparison.tree,
      path: "draft.txt",
      ...(reference === undefined ? {} : { reference }),
    };
    const diff = await fileDiff(await keptRecords(source), record, file);
    expect(diff.kind).toBe("diff");
    expect(diff.kind === "diff" && diff.printed).toContain(
      `-${before}\n+${after}`,
    );
    expect(await fileText(await keptRecords(source), record, file)).toEqual({
      kind: "text",
      baseline: `${before}\n`,
      tree: `${after}\n`,
    });
  }
});

test("an unchanged revision check discovers delivery for a newly Done session", async () => {
  const { checkout, workspace } = await aCheckoutWithWorktree(branch);
  const launch = anIsolatedLaunch(checkout, { workspace, branch });
  const { "newly-done": tip } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("newly-done", { at: minutesAgo(30) }),
  );
  const { merge } = await work(
    checkout,
    makeMe.aCheckoutWork
      .mergingTipByHand("merge", { tip, at: minutesAgo(5) })
      .pushingToTrunk("pushed", { at: minutesAgo(5) }),
  );
  const observations = observedSessionDeliveries();
  expect(
    await observations.observe(observedTrunk, merge, [launch.please()]),
  ).toEqual([]);

  const done = await aDoneBranch(launch);
  expect(done.branchResult?.manualDeliveryChecked).toBe(true);
  expect(done.landing).toBeUndefined();
  const [delivery] = await observations.observe(observedTrunk, merge, [done]);
  if (delivery === undefined)
    throw new Error("Missing the newly Done delivery.");
  const { pair } = delivery;
  const kept = {
    ...delivery.record,
    landing: makeMe.aLaunchLanding.capturedFrom(pair).comparing(pair).please(),
  };
  expect(await review([kept], done)).toMatchObject({
    kind: "landed",
    baseline: checkout.base,
    tree: merge,
    files: [{ path: "newly-done.txt" }],
  });
});
