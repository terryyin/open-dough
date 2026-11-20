// A Default main launch identifies its own branch: the entry keeps the state
// and Default main tip it found, refuses any other place, and Done reviews the
// branch apart from the captured Default main commits.
import { realpathSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionBranchPins } from "../../test-support/support/adHocBranchRefs.ts";
import {
  aDeclaringLaunch,
  identifyBranch,
} from "../support/declaredBranchCase.ts";
import {
  aCheckout,
  aCheckoutWithCanonicalWorktree,
  aDefaultLaunch,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  source,
  type Checkout,
  work,
} from "../support/doneCaptureCase.ts";
import { aDoneBranch, fileText, review } from "../support/doneCaptureReview.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";

const branch = "draft";

const aDraftWorktree = () => aCheckoutWithCanonicalWorktree(branch);

// A worktree of the checkout on its own branch `other`.
async function anOtherWorktree(checkout: Checkout) {
  const other = path.join(checkout.fixture, "other");
  await git(
    checkout.integration,
    "worktree",
    "add",
    "--quiet",
    "-b",
    "other",
    other,
  );
  return realpathSync(other);
}

// A kept launch that committed on main, then identified the draft worktree
// holding a commit and an uncommitted edit of its own.
async function aDeclaredDraft() {
  const { checkout, workspace } = await aDraftWorktree();
  const launch = aDeclaringLaunch(checkout, { sessionId: "declared" });
  const record = launch.please();
  keep(record);
  const { onMain } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("onMain", {
      at: minutesAgo(50),
      files: { "main-work.txt": "main work\n" },
    }),
  );
  const { entered } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork
      .committing("entered", { at: minutesAgo(45) })
      .editing("prior-draft", { at: minutesAgo(44) }),
  );
  const entry = await identifyBranch(checkout, record, { workspace, branch });
  return { checkout, workspace, launch, record, onMain, entered, entry };
}

const mainMoves = (checkout: Checkout) =>
  work(
    checkout,
    makeMe.aCheckoutWork.committing("later-main", { at: minutesAgo(20) }),
  );

test("a declared branch keeps its entry state and Default main tip after main moves", async () => {
  const { checkout, workspace, record, onMain, entered, entry } =
    await aDeclaredDraft();

  expect(entry).toMatchObject({
    workspace,
    branch,
    committedTip: entered,
    defaultTip: onMain,
  });
  expect(sessionBranchPins(workspace, "declared")).toEqual([
    entered,
    onMain,
    entry.tree,
  ]);
  await mainMoves(checkout);
  expect(await identifyBranch(checkout, record, { workspace, branch })).toEqual(
    entry,
  );
});

test("Done reviews a declared branch apart from the Default main commits before its entry", async () => {
  const { checkout, workspace, launch, onMain, entry } = await aDeclaredDraft();
  const { result } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("result", {
      at: minutesAgo(30),
      files: { "session.txt": "session.txt\n" },
    }),
  );
  await mainMoves(checkout);
  const record = await aDoneBranch(
    launch.keptSessionCommits({
      repository: checkout.integration,
      runs: [{ base: checkout.base, revision: onMain }],
    }),
    { branchEntry: entry },
  );

  expect(await review([record], record)).toMatchObject({
    kind: "branch-result",
    selectedRun: "branch-result",
    sessionComparisonKeys: ["branch-result", "0"],
    baseline: entry.tree,
    tree: result,
    files: [{ kind: "added", path: "session.txt" }],
  });
  expect(
    await fileText([record], record, {
      baseline: entry.tree,
      tree: result,
      path: "session.txt",
    }),
  ).toEqual({ kind: "text", baseline: null, tree: "session.txt\n" });
  expect(await review([record], record, 0)).toMatchObject({
    kind: "session-commits",
    selectedRun: "0",
    sessionComparisonKeys: ["branch-result", "0"],
    tree: onMain,
    files: [{ kind: "added", path: "main-work.txt" }],
  });
});

test("a branch entry refuses a foreign clone, a wrong branch and a second place", async () => {
  const { checkout, workspace } = await aDraftWorktree();
  const record = aDeclaringLaunch(checkout, { sessionId: "first" }).please();
  const second = aDeclaringLaunch(checkout, { sessionId: "second" }).please();
  keep(record, second);
  const other = await anOtherWorktree(checkout);
  const foreign = path.join(checkout.fixture, "foreign");
  await git(checkout.integration, "clone", "--quiet", "--local", ".", foreign);
  await git(foreign, "switch", "--quiet", "-c", branch);
  const refused = { status: 409 };

  await expect(
    identifyBranch(checkout, record, { workspace: foreign, branch }),
  ).rejects.toMatchObject(refused);
  await expect(
    identifyBranch(checkout, record, { workspace: other, branch }),
  ).rejects.toMatchObject(refused);
  await identifyBranch(checkout, record, { workspace, branch });
  await expect(
    identifyBranch(checkout, record, { workspace: other, branch: "other" }),
  ).rejects.toMatchObject(refused);
  await identifyBranch(checkout, second, { workspace: other, branch: "other" });
});

test("two declared sessions each review their own branch", async () => {
  const { checkout, workspace } = await aDraftWorktree();
  const first = aDeclaringLaunch(checkout, { sessionId: "first" });
  const second = aDeclaringLaunch(checkout, { sessionId: "second" });
  const [firstRecord, secondRecord] = [first.please(), second.please()];
  keep(firstRecord, secondRecord);
  const other = await anOtherWorktree(checkout);
  const firstEntry = await identifyBranch(checkout, firstRecord, {
    workspace,
    branch,
  });
  const secondEntry = await identifyBranch(checkout, secondRecord, {
    workspace: other,
    branch: "other",
  });
  const [{ ours }, { theirs }] = await Promise.all([
    work(
      inWorktree(checkout, workspace),
      makeMe.aCheckoutWork.committing("ours", { at: minutesAgo(30) }),
    ),
    work(
      inWorktree(checkout, other),
      makeMe.aCheckoutWork.committing("theirs", { at: minutesAgo(30) }),
    ),
  ]);
  const done = await Promise.all([
    aDoneBranch(first, { branchEntry: firstEntry }),
    aDoneBranch(second, { branchEntry: secondEntry }),
  ]);

  expect(
    await Promise.all(done.map((launch) => review(done, launch))),
  ).toMatchObject([
    { kind: "branch-result", tree: ours, files: [{ path: "ours.txt" }] },
    { kind: "branch-result", tree: theirs, files: [{ path: "theirs.txt" }] },
  ]);
});

test("an undeclared checkout move explains the missing branch association", async () => {
  const checkout = await aCheckout();
  const record = aDefaultLaunch(checkout, { sessionId: "undeclared" }).please();
  keep(record);
  await git(checkout.integration, "switch", "--quiet", "-c", "not-identified");
  await work(
    checkout,
    makeMe.aCheckoutWork.committing("not-attributed", { at: minutesAgo(30) }),
  );
  await markDone(record);

  expect(await review(await keptRecords(source), record)).toMatchObject({
    kind: "landing-unavailable",
    explanation:
      "No branch was identified for this session, and no Default main commits were captured.",
  });
});
