// A manual delivery requires Git evidence on the launch's recorded target.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { CheckoutWorkBuilder } from "../../../Distribution/tests/support/repositoryCheckoutWorkTestData.mjs";
import { defaultGitOutputLimit } from "../../server/gitRunner.ts";
import {
  inspectManualLanding,
  manualLandingTrunk,
} from "../../server/manualSessionLanding.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import { resolveStoryConflict } from "../../test-support/support/completedStoryPublication.ts";
import {
  aCheckoutWithWorktree,
  anIsolatedLaunch,
  canonicalGitDirectory,
  inWorktree,
  minutesAgo,
  work,
} from "../support/doneCaptureCase.ts";

const branch = "draft";
const target = "refs/heads/main";

async function anIsolatedDraft() {
  const { checkout, workspace } = await aCheckoutWithWorktree(branch, {
    "draft.txt": "Original draft\n",
  });
  const repository = canonicalGitDirectory(checkout);
  const record = anIsolatedLaunch(checkout, { workspace, branch }).please();
  const inspect = (tip: string, acceptedTrunk: string) =>
    inspectManualLanding(
      repository,
      tip,
      manualLandingTrunk(record),
      acceptedTrunk,
      { cwd: repository, maxBuffer: defaultGitOutputLimit },
    );
  const onBranch = <Name extends string>(steps: CheckoutWorkBuilder<Name>) =>
    work(inWorktree(checkout, workspace), steps);
  return { checkout, record, repository, onBranch, inspect };
}

test("a verified manual merge retains its accepted trunk parent and actual resolution", async () => {
  const { checkout, repository, onBranch, inspect } = await anIsolatedDraft();
  const { integration } = checkout;
  const { tip } = await onBranch(
    makeMe.aCheckoutWork.committing("tip", {
      at: minutesAgo(50),
      files: { "draft.txt": "Branch draft\n" },
    }),
  );
  const { trunkParent } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("trunkParent", {
        at: minutesAgo(40),
        files: { "draft.txt": "Trunk draft\n" },
      })
      .pushingToTrunk("published-parent", { at: minutesAgo(40) }),
  );
  resolveStoryConflict(
    integration,
    ["merge", "--no-ff", "--no-edit", branch],
    "draft.txt",
    "Resolution on trunk\n",
    "Resolve the draft manually",
  );
  const { stdout: merge } = await git(integration, "rev-parse", "HEAD");
  expect(await inspect(tip, trunkParent)).toBeUndefined();

  const { acceptedTrunk } = await work(
    checkout,
    makeMe.aCheckoutWork
      .pushingToTrunk("published-merge", { at: minutesAgo(30) })
      .committing("later", { at: minutesAgo(20) })
      .pushingToTrunk("acceptedTrunk", { at: minutesAgo(20) }),
  );
  const delivery = await inspect(tip, acceptedTrunk);

  expect(delivery).toEqual({
    repository,
    remote: "origin",
    target,
    base: trunkParent,
    revision: merge.trim(),
  });
  if (delivery === undefined) throw new Error("Missing the verified delivery.");
  expect(
    (await git(integration, "show", `${delivery.base}:draft.txt`)).stdout,
  ).toBe("Trunk draft\n");
  expect(
    (await git(integration, "show", `${delivery.revision}:draft.txt`)).stdout,
  ).toBe("Resolution on trunk\n");
});

test("branch capture ignores a merge accepted on a different remote branch", async () => {
  const { checkout, record, onBranch } = await anIsolatedDraft();
  const { integration, base } = checkout;
  const { tip } = await onBranch(
    makeMe.aCheckoutWork.committing("tip", { at: minutesAgo(30) }),
  );
  await git(integration, "merge", "--quiet", "--no-ff", "--no-edit", branch);
  await git(integration, "push", "--quiet", "origin", "HEAD:elsewhere");

  const { result, delivery } = await captureBranchResult(
    record,
    minutesAgo(10),
  );

  expect(delivery).toBeUndefined();
  expect(result).toMatchObject({
    base,
    committedTip: tip,
    revision: tip,
    manualDeliveryChecked: true,
  });
  expect(result.attributionGap).toBeUndefined();
  expect(
    (
      await git(
        integration,
        "diff",
        "--name-only",
        result.base,
        result.revision,
      )
    ).stdout,
  ).toBe("tip.txt\n");
});

test("an exact fast-forward proves the delivery and leaves the branch attributable", async () => {
  const { checkout, record, repository, onBranch, inspect } =
    await anIsolatedDraft();
  const { tip } = await onBranch(
    makeMe.aCheckoutWork.committing("tip", { at: minutesAgo(30) }),
  );
  await git(checkout.integration, "merge", "--quiet", "--ff-only", tip);
  await git(checkout.integration, "push", "--quiet", "origin", "main");

  expect(await inspect(tip, tip)).toEqual({
    repository,
    remote: "origin",
    target,
    base: checkout.base,
    revision: tip,
  });
  const { result } = await captureBranchResult(record, minutesAgo(10));
  expect(result).toMatchObject({ base: checkout.base, revision: tip });
  expect(result.attributionGap).toBeUndefined();
});

test("a fast-forward with an unwitnessed previous tip leaves delivery unverified", async () => {
  const { checkout, onBranch, inspect } = await anIsolatedDraft();
  const { integration } = checkout;
  const { second } = await onBranch(
    makeMe.aCheckoutWork
      .committing("first", { at: minutesAgo(35) })
      .committing("second", { at: minutesAgo(30) }),
  );
  await git(integration, "merge", "--quiet", "--ff-only", second);
  await git(integration, "push", "--quiet", "origin", "main");

  expect(await inspect(second, second)).toBeUndefined();
});

test("a squash with the same tree as the branch does not prove manual delivery", async () => {
  const { checkout, onBranch, inspect } = await anIsolatedDraft();
  const { integration } = checkout;
  const { tip } = await onBranch(
    makeMe.aCheckoutWork.committing("tip", { at: minutesAgo(30) }),
  );
  await git(integration, "merge", "--quiet", "--squash", tip);
  await git(integration, "commit", "--quiet", "-m", "Squash the edit");
  await git(integration, "push", "--quiet", "origin", "main");
  const { stdout: squash } = await git(integration, "rev-parse", "HEAD");
  await git(integration, "diff", "--exit-code", tip, squash.trim());

  expect(await inspect(tip, squash.trim())).toBeUndefined();
});
