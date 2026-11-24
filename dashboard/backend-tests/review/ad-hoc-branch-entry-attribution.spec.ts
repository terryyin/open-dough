// Capture separates a declared branch's own changes from what the branch held
// when the session identified it and from the trunk history it took in, or
// explains why it cannot.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { proposeBranchEntry } from "../../server/branchEntryProposal.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

const branch = "topic" as const;

// An execution checkout launch beside the topic worktree, at a base that holds the
// shared file.
const aTopicCase = aDoneCaptureCase()
  .withBaseFiles({ "shared.txt": "original\n" })
  .withOrigin()
  .withWorkspace(branch)
  .withCheckoutLaunch("declared", { launched: 80 });

test("capture separates declared branch work from its entry and its trunk import", async () => {
  const {
    published,
    at,
    checkout,
    worktrees: { [branch]: workspace },
    records: { declared: record },
    performWork,
  } = await aTopicCase
    .withWork(
      (at) =>
        makeMe.aCheckoutWork
          .committing("earlier-commit", { at: at(70) })
          .editing("earlier-draft", { at: at(65) }),
      { in: branch },
    )
    .please();
  const { entry } = await proposeBranchEntry(published.ref, record, {
    workspace,
    branch,
  });
  const { imported } = await performWork(
    makeMe.aCheckoutWork
      .committing("imported", {
        at: at(40),
        files: {
          "import-only.txt": "trunk addition\n",
          "shared.txt": "imported line\n",
        },
      })
      .pushingToTrunk("pushed", { at: at(40) }),
  );
  const { "session-only": committedTip } = await performWork(
    makeMe.aCheckoutWork
      .mergingTipByHand("merged", { tip: imported, at: at(40) })
      .committing("session-only", { at: at(30) })
      .editing("edit", {
        at: at(20),
        files: { "shared.txt": "session edit of imported line\n" },
      }),
    { in: branch },
  );

  const { result } = await captureBranchResult(
    { ...record, branchEntry: entry },
    at(10),
  );
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
  const {
    published,
    at,
    worktrees: { [branch]: workspace },
    records: { declared: record },
    performWork,
  } = await aTopicCase
    .withWork(
      (at) =>
        makeMe.aCheckoutWork.committing("earlier", {
          at: at(70),
          files: { "shared.txt": "branch line from before entry\n" },
        }),
      { in: branch },
    )
    .please();
  const { entry } = await proposeBranchEntry(published.ref, record, {
    workspace,
    branch,
  });
  const { imported } = await performWork(
    makeMe.aCheckoutWork
      .committing("imported", {
        at: at(40),
        files: { "shared.txt": "trunk line\n" },
      })
      .pushingToTrunk("pushed", { at: at(40) }),
  );
  await git(workspace, "fetch", "--quiet", "origin");
  await git(workspace, "merge", "--quiet", "--no-edit", "-X", "ours", imported);
  const { tip } = await performWork(
    makeMe.aCheckoutWork.committing("tip", { at: at(30) }),
    { in: branch },
  );

  const { result } = await captureBranchResult(
    { ...record, branchEntry: entry },
    at(10),
  );

  expect(result).toMatchObject({
    base: entry.tree,
    revision: tip,
    attributionGap:
      "Earlier branch changes conflict with imported trunk changes, so the saved branch changes could not be separated.",
  });
});
