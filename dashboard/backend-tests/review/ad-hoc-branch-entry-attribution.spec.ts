// Capture separates a declared branch's own changes from what the branch held
// when the session identified it and from the trunk history it took in, or
// explains why it cannot.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { proposeBranchEntry } from "../../server/branchEntryProposal.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import {
  aCheckoutWithWorktree,
  aDefaultLaunch,
  inWorktree,
  minutesAgo,
  type Checkout,
  work,
} from "../support/doneCaptureCase.ts";

const branch = "topic";

// The project's checkout with an origin and the topic worktree at its base,
// which holds the shared file.
const aTopicWorktree = () =>
  aCheckoutWithWorktree(branch, { "shared.txt": "original\n" });

// A Default main launch that then identified the existing topic worktree as
// its branch, entering it with whatever the worktree already held and the
// trunk it observed then.
async function aDeclaredTopic(checkout: Checkout, workspace: string) {
  const launch = aDefaultLaunch(checkout);
  const { entry } = await proposeBranchEntry(
    "refs/heads/main",
    launch.please(),
    { workspace, branch },
  );
  return { launch: launch.enteredBranch(entry), entry };
}

test("capture separates declared branch work from its entry and its trunk import", async () => {
  const { checkout, workspace } = await aTopicWorktree();
  await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork
      .committing("earlier-commit", { at: minutesAgo(70) })
      .editing("earlier-draft", { at: minutesAgo(65) }),
  );
  const { launch, entry } = await aDeclaredTopic(checkout, workspace);
  const { "session-only": committedTip } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork
      .mergingTrunkWork("imported", {
        at: minutesAgo(40),
        files: {
          "import-only.txt": "trunk addition\n",
          "shared.txt": "imported line\n",
        },
      })
      .committing("session-only", { at: minutesAgo(30) })
      .editing("edit", {
        at: minutesAgo(20),
        files: { "shared.txt": "session edit of imported line\n" },
      }),
  );

  const { result } = await captureBranchResult(launch.please(), minutesAgo(10));
  const { integration } = checkout;
  expect(result.attributionGap).toBeUndefined();
  expect(result.committedTip).toBe(committedTip);
  expect(
    (await git(integration, "diff", "--name-only", entry.tree, result.base))
      .stdout,
  ).toBe("import-only.txt\nshared.txt\n");
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
  ).toBe("session-only.txt\nshared.txt\n");
  expect(
    (await git(integration, "show", `${result.base}:shared.txt`)).stdout,
  ).toBe("imported line\n");
  expect(
    (await git(integration, "show", `${result.revision}:shared.txt`)).stdout,
  ).toBe("session edit of imported line\n");
});

test("conflicting baseline evidence explains why the branch changes cannot be attributed", async () => {
  const { checkout, workspace } = await aTopicWorktree();
  await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("earlier", {
      at: minutesAgo(70),
      files: { "shared.txt": "branch line from before entry\n" },
    }),
  );
  const { launch, entry } = await aDeclaredTopic(checkout, workspace);
  const { imported } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("imported", {
        at: minutesAgo(40),
        files: { "shared.txt": "trunk line\n" },
      })
      .pushingToTrunk("pushed", { at: minutesAgo(40) }),
  );
  await git(workspace, "fetch", "--quiet", "origin");
  await git(workspace, "merge", "--quiet", "--no-edit", "-X", "ours", imported);
  const { tip } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("tip", { at: minutesAgo(30) }),
  );

  const { result } = await captureBranchResult(launch.please(), minutesAgo(10));

  expect(result).toMatchObject({
    base: entry.tree,
    revision: tip,
    attributionGap:
      "Earlier branch changes conflict with imported trunk changes, so the saved branch changes could not be separated.",
  });
});
