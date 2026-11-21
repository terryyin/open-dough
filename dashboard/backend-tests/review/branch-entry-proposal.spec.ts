// An open Default main launch proposes the registered worktree it names as its
// own branch from its typed record and real Git: the captured or already kept
// entry, or a refusal of any other place.
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { proposeBranchEntry } from "../../server/branchEntryProposal.ts";
import {
  aCheckout,
  historyBeforeTheCase,
  inWorktree,
  minutesAgo,
  work,
} from "../support/doneCaptureCase.ts";

const trunkRef = "refs/heads/main";
const branch = "draft";

const aDraft = () =>
  historyBeforeTheCase().withWorkspace(branch, { from: "base" });

// An open launch that committed on main before its draft worktree held a
// commit and an uncommitted edit of its own.
async function anOpenDraft(history = aDraft()) {
  const checkout = await aCheckout({ history, withOrigin: true });
  const workspace = checkout.execution ?? "";
  const record = makeMe.aLaunchRecord
    .startedOnMainOf(checkout)
    .inClaudeSession({ sessionId: "first" })
    .please();
  const { onMain } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("onMain", { at: minutesAgo(50) }),
  );
  const { entered } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork
      .committing("entered", { at: minutesAgo(45) })
      .editing("dirty", {
        at: minutesAgo(44),
        files: { "dirty.txt": "uncommitted\n" },
      }),
  );
  return { checkout, workspace, record, onMain, entered };
}

test("an open launch proposes its draft's working tree, Default main tip and trunk", async () => {
  const { workspace, record, onMain, entered } = await anOpenDraft();

  const { kept, entry } = await proposeBranchEntry(trunkRef, record, {
    workspace,
    branch,
  });

  expect(kept).toBe(false);
  expect(entry).toMatchObject({
    repository: record.defaultStart?.repository,
    workspace,
    branch,
    committedTip: entered,
    defaultTip: onMain,
    trunk: { remote: "origin", target: trunkRef },
  });
  const files = await git(workspace, "ls-tree", "--name-only", entry.tree);
  expect(files.stdout.split("\n")).toEqual(
    expect.arrayContaining(["dirty.txt", "entered.txt"]),
  );
});

test("a proposal refuses a foreign clone, a wrong branch and a second place", async () => {
  const { checkout, workspace, record } = await anOpenDraft(
    aDraft().withWorkspace("other", { from: "base" }),
  );
  const other = path.join(checkout.integration, ".worktrees", "other");
  const foreign = path.join(checkout.fixture, "foreign");
  await git(checkout.integration, "clone", "--quiet", "--local", ".", foreign);
  await git(foreign, "switch", "--quiet", "-c", branch);
  const { entry } = await proposeBranchEntry(trunkRef, record, {
    workspace,
    branch,
  });
  const entered = { ...record, branchEntry: entry };
  const second = makeMe.aLaunchRecord
    .startedOnMainOf(checkout)
    .inClaudeSession({ sessionId: "second" })
    .please();
  const refused = { status: 409 };

  await expect(
    proposeBranchEntry(trunkRef, record, { workspace: foreign, branch }),
  ).rejects.toMatchObject(refused);
  await expect(
    proposeBranchEntry(trunkRef, record, { workspace: other, branch }),
  ).rejects.toMatchObject(refused);
  await expect(
    proposeBranchEntry(trunkRef, entered, {
      workspace: other,
      branch: "other",
    }),
  ).rejects.toMatchObject(refused);
  expect(
    await proposeBranchEntry(trunkRef, second, {
      workspace: other,
      branch: "other",
    }),
  ).toMatchObject({
    kept: false,
    entry: { workspace: other, branch: "other" },
  });
});

test("the same place proposes the kept entry after main and the worktree move", async () => {
  const { checkout, workspace, record } = await anOpenDraft();
  const { entry } = await proposeBranchEntry(trunkRef, record, {
    workspace,
    branch,
  });
  await work(
    checkout,
    makeMe.aCheckoutWork.committing("later-main", { at: minutesAgo(20) }),
  );
  await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("later-draft", { at: minutesAgo(15) }),
  );

  expect(
    await proposeBranchEntry(
      trunkRef,
      { ...record, branchEntry: entry },
      { workspace, branch },
    ),
  ).toEqual({ kept: true, entry });
});
