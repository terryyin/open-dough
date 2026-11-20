// A failed verification of one Done branch's delivery leaves it to retry at
// the same revision while another Done branch's delivery settles.
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptSession } from "../../server/launchRecordStore.ts";
import { inspectManualLanding } from "../../server/manualSessionLanding.ts";
import { sessionLandingObservations } from "../../server/observedSessionLandings.ts";
import {
  aCheckout,
  anIsolatedLaunch,
  historyBeforeTheCase,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  review,
  source,
  work,
} from "../support/doneCaptureCase.ts";

const project = { id: source, ref: "main" };

test("a failed verification retries at the same revision and lets other deliveries settle", async () => {
  const checkout = await aCheckout({
    history: historyBeforeTheCase()
      .withWorkspace("draft", { from: "base" })
      .withWorkspace("independent", { from: "base" }),
    withOrigin: true,
  });
  const workspace = checkout.execution;
  if (workspace === undefined) throw new Error("Missing the draft worktree.");
  // Further declared workspaces are linked under the checkout's .worktrees.
  const independentWorkspace = path.join(
    checkout.integration,
    ".worktrees",
    "independent",
  );
  const retrying = anIsolatedLaunch(checkout, {
    workspace,
    branch: "draft",
    title: "Keep draft for retry",
  }).please();
  const independent = anIsolatedLaunch(checkout, {
    workspace: independentWorkspace,
    branch: "independent",
    title: "Keep independent work",
  }).please();
  keep(retrying, independent);
  const { retry: draft } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("retry", { at: minutesAgo(30) }),
  );
  const { independent: other } = await work(
    inWorktree(checkout, independentWorkspace),
    makeMe.aCheckoutWork.committing("independent", { at: minutesAgo(30) }),
  );
  await markDone(retrying);
  await markDone(independent);
  const { firstMerge, head } = await work(
    checkout,
    makeMe.aCheckoutWork
      .mergingTipByHand("firstMerge", { tip: draft, at: minutesAgo(5) })
      .mergingTipByHand("head", { tip: other, at: minutesAgo(5) })
      .pushingToTrunk("pushed", { at: minutesAgo(5) }),
  );
  let failed = false;
  const observations = sessionLandingObservations(async (...inspection) => {
    if (inspection[1] === draft && !failed) {
      failed = true;
      throw new Error("Verification failed once.");
    }
    return inspectManualLanding(...inspection);
  });

  await observations.observe(project, head);
  expect(await review(independent)).toMatchObject({
    kind: "landed",
    baseline: firstMerge,
    tree: head,
    files: [{ path: "independent.txt" }],
  });
  expect(failed).toBe(true);
  expect(await review(retrying)).toMatchObject({
    kind: "branch-result",
    tree: draft,
  });
  expect((await keptSession(source, retrying.session))?.landing).toBe(
    undefined,
  );

  await observations.observe(project, head);
  expect(await review(retrying)).toMatchObject({
    kind: "landed",
    baseline: checkout.base,
    tree: firstMerge,
    files: [{ path: "retry.txt" }],
  });
});
