// Done saves an isolated ad hoc branch's own changes apart from the trunk
// history the branch took in, or explains why it cannot.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  anIsolatedBranch,
  fileDiff,
  inWorktree,
  markDone,
  minutesAgo,
  review,
  work,
} from "../support/doneCaptureCase.ts";

const branch = "topic";

// The topic checkout, its base holding the shared file, and the isolated
// launch whose start created its worktree.
const anIsolatedTopic = () =>
  anIsolatedBranch(branch, { "shared.txt": "original\n" });

test("an isolated Done retains its committed and working changes across a trunk import", async () => {
  const { checkout, workspace, record } = await anIsolatedTopic();
  await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork
      .committing("draft", { at: minutesAgo(50) })
      .mergingTrunkWork("imported", {
        at: minutesAgo(40),
        files: { "import-only.txt": "trunk addition\n" },
      })
      .editing("working", {
        at: minutesAgo(30),
        files: { "draft.txt": "draft work\nworking change\n" },
      }),
  );

  await markDone(record);

  const answer = await review(record);
  if (answer.kind !== "branch-result") throw new Error(JSON.stringify(answer));
  expect(answer.files.map(({ path }) => path)).toEqual(["draft.txt"]);
  expect(
    await fileDiff(record, {
      baseline: answer.baseline,
      tree: answer.tree,
      path: "draft.txt",
    }),
  ).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+draft work\n+working change") as string,
  });
});

test("a branch merged into trunk still retains its own Done comparison", async () => {
  const { checkout, workspace, record } = await anIsolatedTopic();
  await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork
      .committing("session-only", { at: minutesAgo(50) })
      .mergingTrunkWork("imported", {
        at: minutesAgo(45),
        files: { "import-only.txt": "trunk addition\n" },
      }),
  );
  const { integration } = checkout;
  await git(integration, "pull", "--quiet", "--ff-only", "origin", "main");
  await git(integration, "merge", "--quiet", "--no-edit", "--no-ff", branch);
  await git(integration, "push", "--quiet", "origin", "main");
  await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("later-trunk", { at: minutesAgo(35) })
      .pushingToTrunk("pushed", { at: minutesAgo(35) }),
  );

  await markDone(record);

  expect(await review(record, "branch-result")).toMatchObject({
    kind: "branch-result",
    files: [{ path: "session-only.txt" }],
  });
});

test("new shared first-parent history can leave branch attribution ambiguous", async () => {
  const { checkout, workspace, record } = await anIsolatedTopic();
  const { direct } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("direct", { at: minutesAgo(50) }),
  );
  await git(checkout.integration, "merge", "--quiet", "--ff-only", direct);
  await git(checkout.integration, "push", "--quiet", "origin", "main");
  await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("after-direct", { at: minutesAgo(40) }),
  );

  await markDone(record);

  expect(await review(record)).toMatchObject({
    kind: "unavailable",
    explanation:
      "The saved branch changes could not be separated from trunk history.",
  });
});
