// Done saves a declared branch's own changes apart from what the branch held
// when the session identified it and from the trunk history it took in, or
// explains why it cannot.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { proposeBranchEntry } from "../../server/branchEntryProposal.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  aCheckoutWithWorktree,
  aDefaultLaunch,
  type Checkout,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  work,
} from "../support/doneCaptureCase.ts";
import { fileDiff, fileText, review } from "../support/doneCaptureReview.ts";

const branch = "topic";

// The project's checkout with an origin and the topic worktree at its base,
// which holds the shared file.
const aTopicWorktree = () =>
  aCheckoutWithWorktree(branch, { "shared.txt": "original\n" });

// A kept Default main launch that then identified the existing topic worktree
// as its branch, entering it with whatever the worktree already held and the
// trunk it observed then.
async function aDeclaredTopic(checkout: Checkout, workspace: string) {
  const launch = aDefaultLaunch(checkout);
  const { entry } = await proposeBranchEntry(
    "refs/heads/main",
    launch.please(),
    { workspace, branch },
  );
  const record = launch.enteredBranch(entry).please();
  keep(record);
  return { record, entry };
}

test("a declared branch's saved comparison shows only its new work and its edit to imported text", async () => {
  const { checkout, workspace } = await aTopicWorktree();
  await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork
      .committing("earlier-commit", { at: minutesAgo(70) })
      .editing("earlier-draft", { at: minutesAgo(65) }),
  );
  const { record } = await aDeclaredTopic(checkout, workspace);
  await work(
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

  await markDone(record);

  const answer = await review(record);
  if (answer.kind !== "branch-result") throw new Error(JSON.stringify(answer));
  expect(answer.files.map(({ path }) => path)).toEqual([
    "session-only.txt",
    "shared.txt",
  ]);
  const shared = {
    baseline: answer.baseline,
    tree: answer.tree,
    path: "shared.txt",
  };
  expect(await fileDiff(record, shared)).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining(
      "-imported line\n+session edit of imported line",
    ) as string,
  });
  expect(await fileText(record, shared)).toEqual({
    kind: "text",
    baseline: "imported line\n",
    tree: "session edit of imported line\n",
  });
  await expect(
    fileDiff(record, { ...shared, path: "import-only.txt" }),
  ).rejects.toMatchObject({ status: 409 });
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
  const { record, entry } = await aDeclaredTopic(checkout, workspace);
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

  await markDone(record);

  expect(await review(record)).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringContaining(
      "Earlier branch changes conflict with imported trunk",
    ) as string,
  });
  const refused = fileDiff(record, {
    baseline: entry.tree,
    tree: tip,
    path: "tip.txt",
  });
  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({ status: 409 });
});
