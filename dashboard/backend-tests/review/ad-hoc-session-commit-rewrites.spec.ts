// A Default main session's review keeps a continued cherry-pick and an
// autosquashed commit as they ended. Real Git writes the checkout log, and
// the boundary server reads that log at Done and answers the review over HTTP.
import { reviewedFileTextSchema } from "../../src/storyReviewContract.ts";
import {
  adHocReview,
  adHocSessionFileText,
  establishDefaultMainSession,
  markAdHocDone,
} from "../../tests/support/adHocReview.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import {
  autosquashInCheckout,
  commitInCheckout,
  continueConflictedCherryPick,
} from "../../tests/support/sessionCheckoutWork.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });

// Only the checkout work dated after launch belongs to the session.
const beforeLaunch = "2020-01-02T12:00:00Z";
const firstAt = "2099-01-02T12:00:00Z";
const secondAt = "2099-01-02T12:05:00Z";
const sessionId = "established-default-main";

test("a continued cherry-pick is kept with the session's conflict resolution", async ({
  dashboard,
  origin,
  request,
}) => {
  const file = "notes.txt";
  const original = "Local notes\n";
  const resolution = "Reconciled notes\n";
  const baseline = await commitInCheckout(
    origin.project,
    beforeLaunch,
    file,
    original,
  );
  establishDefaultMainSession(dashboard, origin, sessionId);
  const tree = await continueConflictedCherryPick(origin, firstAt, file, {
    incoming: "Incoming notes\n",
    resolution,
  });
  await markAdHocDone(dashboard, sessionId);

  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "session-commits",
    commitRuns: [{ commits: 1, baseline, tree }],
    baseline,
    tree,
  });
  const response = await adHocSessionFileText(request, dashboard, sessionId, {
    baseline,
    tree,
    path: file,
  });
  expect(response.status()).toBe(200);
  expect(reviewedFileTextSchema.parse(await response.json())).toEqual({
    kind: "text",
    baseline: original,
    tree: resolution,
  });
});

for (const kind of ["fixup", "squash"] as const) {
  test(`an autosquashed ${kind} is kept as one commit with both files`, async ({
    dashboard,
    origin,
    request,
  }) => {
    establishDefaultMainSession(dashboard, origin, sessionId);
    const checkout = origin.project;
    const baseline = git(checkout, "rev-parse", "HEAD");
    const target = await commitInCheckout(checkout, firstAt, "first.txt");
    const tree = autosquashInCheckout(
      checkout,
      secondAt,
      target,
      "added.txt",
      kind,
    );
    await markAdHocDone(dashboard, sessionId);

    expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
      kind: "session-commits",
      commitRuns: [{ commits: 1, baseline, tree }],
      baseline,
      tree,
      files: [{ path: "added.txt" }, { path: "first.txt" }],
    });
  });
}
