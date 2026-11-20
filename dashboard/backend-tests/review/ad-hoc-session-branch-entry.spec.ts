// A Default main launch identifies its own branch: the entry keeps the state
// and Default main tip it found, and Done reviews the branch apart from the
// captured Default main commits.
import { realpathSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { proposeBranchEntry } from "../../server/branchEntryProposal.ts";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import { recordSessionBranchEntry } from "../../server/sessionBranchEntry.ts";
import {
  aCheckout,
  aCheckoutWithCanonicalWorktree,
  aDefaultLaunch,
  canonicalGitDirectory,
  type Checkout,
  historyBeforeTheCase,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import { aDoneBranch, fileText, review } from "../support/doneCaptureReview.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";

const branch = "draft";
const published = { id: source, ref: "refs/heads/main" };

const aDraftWorktree = () => aCheckoutWithCanonicalWorktree(branch);

// A launch that committed on main while the draft worktree took a commit and
// an uncommitted edit of its own.
async function aDraftBeforeEntry() {
  const { checkout, workspace } = await aDraftWorktree();
  const launch = aDefaultLaunch(checkout, { sessionId: "declared" });
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
  return { checkout, workspace, launch, onMain, entered };
}

// That launch, kept, then identified the draft worktree as its branch.
async function aDeclaredDraft() {
  const { launch, ...draft } = await aDraftBeforeEntry();
  const record = launch.please();
  keep(record);
  const { workspace } = draft;
  const entry = await recordSessionBranchEntry(published, record, {
    workspace,
    branch,
  });
  return { ...draft, record, entry };
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
  const pins = await sessionBranchPins(workspace, record.session);
  expect(pins).toMatchObject([
    { objectId: entered },
    { objectId: onMain },
    { objectId: entry.tree },
  ]);
  await mainMoves(checkout);
  expect(
    await recordSessionBranchEntry(published, record, { workspace, branch }),
  ).toEqual(entry);
  expect(await sessionBranchPins(workspace, record.session)).toEqual(pins);
});

test("Done reviews a declared branch apart from the Default main commits before its entry", async () => {
  const { checkout, workspace, launch, onMain } = await aDraftBeforeEntry();
  const { entry } = await proposeBranchEntry(
    "refs/heads/main",
    launch.please(),
    { workspace, branch },
  );
  const { result } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("result", {
      at: minutesAgo(30),
      files: { "session.txt": "session.txt\n" },
    }),
  );
  await mainMoves(checkout);
  const record = await aDoneBranch(
    launch.enteredBranch(entry).keptSessionCommits({
      repository: checkout.integration,
      runs: [{ base: checkout.base, revision: onMain }],
    }),
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

test("two declared sessions each review their own branch", async () => {
  const checkout = await aCheckout({
    history: historyBeforeTheCase()
      .withWorkspace(branch, { from: "base" })
      .withWorkspace("other", { from: "base" }),
    withOrigin: true,
  });
  const workspace = realpathSync(checkout.execution ?? "");
  const other = realpathSync(
    path.join(checkout.integration, ".worktrees", "other"),
  );
  const { base } = checkout;
  const { stdout } = await git(workspace, "rev-parse", `${base}^{tree}`);
  const atBase = {
    repository: canonicalGitDirectory(checkout),
    committedTip: base,
    tree: stdout.trim(),
    trunk: { remote: "origin", target: "refs/heads/main", revision: base },
  };
  const first = aDefaultLaunch(checkout, { sessionId: "first" }).enteredBranch({
    ...atBase,
    workspace,
    branch,
  });
  const second = aDefaultLaunch(checkout, {
    sessionId: "second",
  }).enteredBranch({ ...atBase, workspace: other, branch: "other" });
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
  const done = await Promise.all([aDoneBranch(first), aDoneBranch(second)]);

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
