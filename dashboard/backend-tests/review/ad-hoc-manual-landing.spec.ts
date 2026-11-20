// Done checks whether an isolated ad hoc branch reached trunk without the
// installed publisher: it keeps a verified manual delivery beside the branch
// result, and otherwise says why delivery is unverified.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { CheckoutWorkBuilder } from "../../../Distribution/tests/support/repositoryCheckoutWorkTestData.mjs";
import { retireAdHocBranch } from "../../test-support/support/adHocReview.ts";
import { resolveStoryConflict } from "../../test-support/support/completedStoryPublication.ts";
import {
  aCheckout,
  anIsolatedLaunch,
  fileText,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  review,
  undoDone,
  work,
} from "../support/doneCaptureCase.ts";

const branch = "draft";
const unverified = expect.stringContaining(
  "Delivery to trunk is unverified",
) as string;

// The project's checkout with an origin and the isolated launch whose start
// created the draft worktree at its base.
async function anIsolatedDraft() {
  const checkout = await aCheckout({
    history: makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        files: { "draft.txt": "Original draft\n" },
      })
      .withWorkspace(branch, { from: "base" }),
    withOrigin: true,
  });
  const workspace = checkout.execution;
  if (workspace === undefined) throw new Error("Missing the draft worktree.");
  const record = anIsolatedLaunch(checkout, { workspace, branch }).please();
  keep(record);
  const onBranch = <Name extends string>(steps: CheckoutWorkBuilder<Name>) =>
    work(inWorktree(checkout, workspace), steps);
  const onTrunk = <Name extends string>(steps: CheckoutWorkBuilder<Name>) =>
    work(checkout, steps);
  return { checkout, workspace, record, onBranch, onTrunk };
}

// Another change published to trunk from the project's checkout.
const publishing = (name: string, at = minutesAgo(25)) =>
  makeMe.aCheckoutWork
    .committing(name, { at })
    .pushingToTrunk(`${name}-pushed`, { at });

test("a verified manual merge retains its trunk parent and actual resolution", async () => {
  const { checkout, workspace, record, onBranch, onTrunk } =
    await anIsolatedDraft();
  const { integration } = checkout;
  await onBranch(
    makeMe.aCheckoutWork
      .committing("branch-draft", {
        at: minutesAgo(50),
        files: { "draft.txt": "Branch draft\n" },
      })
      .editing("working", {
        at: minutesAgo(45),
        files: { "draft.txt": "Working draft\n" },
      }),
  );
  const { trunkParent } = await onTrunk(
    makeMe.aCheckoutWork
      .committing("trunkParent", {
        at: minutesAgo(40),
        files: { "draft.txt": "Trunk draft\n" },
      })
      .pushingToTrunk("pushed", { at: minutesAgo(40) }),
  );
  resolveStoryConflict(
    integration,
    ["merge", "--no-ff", "--no-edit", branch],
    "draft.txt",
    "Resolution on trunk\n",
    "Resolve the draft manually",
  );
  const merge = (await git(integration, "rev-parse", "HEAD")).stdout.trim();
  await markDone(record, minutesAgo(35));
  expect(await review(record)).toMatchObject({
    kind: "branch-result",
    deliveryGap: unverified,
  });
  await undoDone(record);

  await git(integration, "push", "--quiet", "origin", "main");
  await onTrunk(publishing("before-done"));
  await markDone(record);
  await onTrunk(publishing("later", minutesAgo(5)));
  retireAdHocBranch(integration, workspace, branch, {
    discardWorkingChanges: true,
  });

  const delivered = await review(record);
  expect(delivered).toMatchObject({
    kind: "landed",
    baseline: trunkParent,
    tree: merge,
    landing: { remote: "origin", target: "refs/heads/main" },
    files: [{ path: "draft.txt" }],
  });
  if (delivered.kind !== "landed")
    throw new Error("Missing delivered comparison.");
  expect(
    await fileText(record, {
      reference: delivered.landing.reference,
      baseline: trunkParent,
      tree: merge,
      path: "draft.txt",
    }),
  ).toEqual({
    kind: "text",
    baseline: "Trunk draft\n",
    tree: "Resolution on trunk\n",
  });
  const branchResult = await review(record, "branch-result");
  if (branchResult.kind !== "branch-result")
    throw new Error("Missing branch result.");
  expect(
    await fileText(record, {
      baseline: branchResult.baseline,
      tree: branchResult.tree,
      path: "draft.txt",
    }),
  ).toEqual({
    kind: "text",
    baseline: "Original draft\n",
    tree: "Working draft\n",
  });
});

test("acceptance on another remote branch leaves trunk delivery unverified", async () => {
  const { checkout, record, onBranch } = await anIsolatedDraft();
  const { integration } = checkout;
  const { edit } = await onBranch(
    makeMe.aCheckoutWork.committing("edit", { at: minutesAgo(30) }),
  );
  await git(integration, "merge", "--quiet", "--no-ff", "--no-edit", branch);
  await git(integration, "push", "--quiet", "origin", "HEAD:elsewhere");

  await markDone(record);

  expect(await review(record)).toMatchObject({
    kind: "branch-result",
    tree: edit,
    files: [{ path: "edit.txt" }],
    deliveryGap: unverified,
  });
});

test("an unrelated accepted change leaves the saved branch available", async () => {
  const { record, onBranch, onTrunk } = await anIsolatedDraft();
  const { edit } = await onBranch(
    makeMe.aCheckoutWork.committing("edit", { at: minutesAgo(30) }),
  );
  await onTrunk(publishing("other-change"));

  await markDone(record);

  expect(await review(record)).toMatchObject({
    kind: "branch-result",
    tree: edit,
    files: [{ path: "edit.txt" }],
    deliveryGap: unverified,
  });
});

test("a continuous fast-forward from the witnessed parent retains both comparisons", async () => {
  const { checkout, record, onBranch } = await anIsolatedDraft();
  const { integration, base } = checkout;
  const { tip } = await onBranch(
    makeMe.aCheckoutWork.committing("tip", { at: minutesAgo(30) }),
  );
  await git(integration, "merge", "--quiet", "--ff-only", tip);
  await git(integration, "push", "--quiet", "origin", "main");

  await markDone(record);

  expect(await review(record)).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: tip,
    sessionComparisonKeys: ["delivered", "branch-result"],
  });
  expect(await review(record, "branch-result")).toMatchObject({
    kind: "branch-result",
    baseline: base,
    tree: tip,
    files: [{ path: "tip.txt" }],
  });
});

test("a fast-forward with an unwitnessed previous tip leaves delivery unverified", async () => {
  const { checkout, record, onBranch } = await anIsolatedDraft();
  const { integration } = checkout;
  const { second } = await onBranch(
    makeMe.aCheckoutWork
      .committing("first", { at: minutesAgo(35) })
      .committing("second", { at: minutesAgo(30) }),
  );
  await git(integration, "merge", "--quiet", "--ff-only", second);
  await git(integration, "push", "--quiet", "origin", "main");

  await markDone(record);

  expect(await review(record)).toMatchObject({
    kind: "unavailable",
    deliveryGap: expect.stringContaining("exact fast-forward") as string,
  });
});

test("a same-content squash leaves the saved branch readable and delivery unverified", async () => {
  const { checkout, workspace, record, onBranch } = await anIsolatedDraft();
  const { integration, base } = checkout;
  const { edit } = await onBranch(
    makeMe.aCheckoutWork.committing("edit", { at: minutesAgo(30) }),
  );
  await git(integration, "merge", "--quiet", "--squash", edit);
  await git(integration, "commit", "--quiet", "-m", "Squash the edit");
  await git(integration, "push", "--quiet", "origin", "main");

  await markDone(record);
  retireAdHocBranch(integration, workspace, branch);

  expect(await review(record)).toMatchObject({
    kind: "branch-result",
    tree: edit,
    files: [{ path: "edit.txt" }],
    deliveryGap: unverified,
  });
  expect(
    await fileText(record, { baseline: base, tree: edit, path: "edit.txt" }),
  ).toMatchObject({ kind: "text", tree: "edit work\n" });
});
