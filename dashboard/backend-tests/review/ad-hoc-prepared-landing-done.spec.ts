// A pair prepared before Done still records as the exact receipt and the
// session's landed comparison after Done, over composed landing stores.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import { aComposedDeclaredLanding } from "../support/composedLandingStores.ts";
import { dashboardOrigin } from "../support/declaredPublisherBranch.ts";
import {
  aCheckoutWithCanonicalWorktree,
  inWorktree,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import { review } from "../support/doneCaptureReview.ts";

test("Done leaves the prepared receipt recordable after acceptance", async () => {
  const branch = "prepared-draft";
  const { checkout, workspace } = await aCheckoutWithCanonicalWorktree(branch);
  const { record, reference, stores } = aComposedDeclaredLanding(checkout, {
    workspace,
    branch,
  });
  const entry = record.branchEntry;
  if (entry === undefined) throw new Error("Missing the branch entry.");
  const base = entry.committedTip;
  const { draft: revision } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("draft", { at: minutesAgo(30) }),
  );
  const submission = makeMe.aLandingSubmission
    .forLaunch({ host: "claude", reference })
    .comparing({ base, revision })
    .please();
  const receipt = await handleLanding(
    submission,
    dashboardOrigin,
    "prepare",
    stores,
  );
  expect(receipt.state).toBe("prepared");
  await git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");

  await stores.markDone(record.session.sessionId, minutesAgo(10));
  const kept = stores.recordOf(record.session.sessionId);
  expect(kept?.doneAt).toBeDefined();
  expect(kept?.landingReporting?.preparations).toMatchObject([
    { receipt: receipt.receipt, base, revision },
  ]);

  expect(
    await handleLanding(submission, dashboardOrigin, "record", stores),
  ).toEqual({
    ...receipt,
    state: "recorded",
  });
  expect(await review(await stores.keptRecords(source), record)).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: revision,
  });
});
