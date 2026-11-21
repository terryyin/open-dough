// An open Default main launch proposes the registered worktree it names as its
// own branch from its typed record and real Git: the captured or already kept
// entry, or a refusal of any other place.
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { proposeBranchEntry } from "../../server/branchEntryProposal.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

const trunkRef = "refs/heads/main";
const branch = "draft" as const;

// An open launch that committed on main before its draft worktree held a
// commit and an uncommitted edit of its own.
const anOpenDraft = aDoneCaptureCase()
  .withOrigin()
  .withWorkspace(branch)
  .withDefaultMainLaunch("first", { launched: 60 })
  .withWork((at) => makeMe.aCheckoutWork.committing("onMain", { at: at(50) }))
  .withWork(
    (at) =>
      makeMe.aCheckoutWork
        .committing("entered", { at: at(45) })
        .editing("dirty", {
          at: at(44),
          files: { "dirty.txt": "uncommitted\n" },
        }),
    { in: branch },
  );

test("an open launch proposes its draft's working tree, Default main tip and trunk", async () => {
  const {
    worktrees: { [branch]: workspace },
    records: { first: record },
    work: { onMain, entered },
  } = await anOpenDraft.please();

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
  const {
    checkout,
    worktrees: { [branch]: workspace, other },
    records: { first: record, second },
  } = await anOpenDraft
    .withWorkspace("other")
    .withDefaultMainLaunch("second", { launched: 60 })
    .please();
  const foreign = path.join(checkout.fixture, "foreign");
  await git(checkout.integration, "clone", "--quiet", "--local", ".", foreign);
  await git(foreign, "switch", "--quiet", "-c", branch);
  const { entry } = await proposeBranchEntry(trunkRef, record, {
    workspace,
    branch,
  });
  const entered = { ...record, branchEntry: entry };
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
  const {
    at,
    worktrees: { [branch]: workspace },
    records: { first: record },
    performWork,
  } = await anOpenDraft.please();
  const { entry } = await proposeBranchEntry(trunkRef, record, {
    workspace,
    branch,
  });
  await performWork(
    makeMe.aCheckoutWork.committing("later-main", { at: at(20) }),
  );
  await performWork(
    makeMe.aCheckoutWork.committing("later-draft", { at: at(15) }),
    { in: branch },
  );

  expect(
    await proposeBranchEntry(
      trunkRef,
      { ...record, branchEntry: entry },
      { workspace, branch },
    ),
  ).toEqual({ kept: true, entry });
});
