import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  reviewedFileTextSchema,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";
import {
  adHocReview,
  markAdHocDone,
  retireAdHocBranch,
} from "../../test-support/support/adHocReview.ts";
import { getReview } from "../../test-support/support/completedReviewRequests.ts";
import { git } from "../../test-support/support/launchLanding.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { launched } from "../../test-support/support/startSessionLandingCapture.ts";
import {
  land,
  landingHandoff,
} from "../../test-support/support/startSessionLandingContext.ts";
import { lines } from "../../test-support/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });

test("the same Done session opens its delivery and keeps its different branch result after retirement", async ({
  dashboard,
  origin,
  request,
}) => {
  const baseline = lines("unchanged");
  writeFileSync(path.join(origin.project, "draft.txt"), baseline);
  git(origin.project, "add", "draft.txt");
  git(origin.project, "commit", "--quiet", "-m", "Draft baseline");
  git(origin.project, "push", "--quiet", "origin", "main");

  const { record } = await launched(dashboard, {
    instruction: "Rename the draft",
    policy: { workspace: "isolated", landing: "review" },
  });
  const { session, reporting } = landingHandoff(record);
  const id = record.session.sessionId;
  const renamed = { path: "review.txt", oldPath: "draft.txt" };
  git(session.workspace, "mv", renamed.oldPath, renamed.path);
  const write = (text: string) => {
    writeFileSync(path.join(session.workspace, renamed.path), text);
  };
  const committed = `${baseline}Delivered draft\n`;
  const working = `${baseline}Left for review\n`;
  write(committed);
  git(session.workspace, "add", renamed.path);
  git(session.workspace, "commit", "--quiet", "-m", "Rename the draft");
  write(working);
  await markAdHocDone(dashboard, id);

  write(committed);
  const { result } = land(record, origin, dashboard.home);
  retireAdHocBranch(origin.project, session.workspace, session.branch);

  const choices = ["delivered", "branch-result"];
  const delivered = await adHocReview(request, dashboard, id);
  const branch = await adHocReview(request, dashboard, id, "branch-result");
  expect(delivered).toMatchObject({
    kind: "landed",
    selectedRun: "delivered",
    sessionComparisonKeys: choices,
    baseline: result.landing.receipt.base,
    tree: result.landing.receipt.revision,
    files: [expect.objectContaining({ kind: "renamed", ...renamed })],
  });
  expect(branch).toMatchObject({
    kind: "branch-result",
    selectedRun: "branch-result",
    sessionComparisonKeys: choices,
    baseline: session.startingRevision,
    files: [expect.objectContaining({ kind: "renamed", ...renamed })],
  });
  if (delivered.kind !== "landed" || branch.kind !== "branch-result")
    throw new Error("Missing the retained comparisons.");

  const file = {
    source: "open-dough",
    host: "claude",
    session: id,
    ...renamed,
  };
  const read = (query: Readonly<Record<string, string>>) =>
    getReview(request, dashboard, storyReviewFileTextEndpoint, {
      ...file,
      ...query,
    });
  const deliveryPair = {
    baseline: delivered.baseline,
    tree: delivered.tree,
    reference: reporting.reference,
  };
  const branchPair = { baseline: branch.baseline, tree: branch.tree };
  const deliveredText = await read(deliveryPair);
  const branchText = await read(branchPair);
  expect(deliveredText.status()).toBe(200);
  expect(branchText.status()).toBe(200);
  expect(reviewedFileTextSchema.parse(await deliveredText.json())).toEqual({
    kind: "text",
    baseline,
    tree: committed,
  });
  expect(reviewedFileTextSchema.parse(await branchText.json())).toEqual({
    kind: "text",
    baseline,
    tree: working,
  });
  expect((await read({ ...deliveryPair, tree: branch.tree })).status()).toBe(
    409,
  );
  expect((await read({ ...branchPair, oldPath: "other.txt" })).status()).toBe(
    409,
  );
});
