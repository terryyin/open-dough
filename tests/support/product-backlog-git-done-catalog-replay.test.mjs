// The done catalog through the Git-aware rebase and cherry-pick adapters:
// real scratch repositories, real replays through the real adapter CLIs,
// each accepted replay ending with a tip whose committed catalog describes
// its committed record files, in at most one added catalog-only commit.
import assert from "node:assert/strict";
import { test } from "node:test";
import { runCherryPick } from "./product-backlog-git-cherry-pick-fixture.mjs";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  assertCatalogDoneAgrees,
  assertCommittedCatalogCurrent,
  catalog,
  completeAndCommit,
  completingBranch,
  done,
  fileNames,
  items,
  plainMergeConflicts,
} from "./product-backlog-git-done-catalog-fixture.mjs";
import {
  checkout,
  commitOn,
  headSha,
  isMidRebase,
  refSha,
  runRebase,
  scratchRepo,
} from "./product-backlog-git-fixture.mjs";

const catalogSubject = "Rebuild the done catalog from its record files";
const subject = (repo, rev = "HEAD") =>
  repo.git(["log", "-1", "--format=%s", rev]).trim();
const changedPaths = (repo, rev = "HEAD") =>
  repo.git(["diff", "--name-only", `${rev}^`, rev]).trim();

// `main` completes A and B, published without a catalog unless
// `withCatalog`; `feature`, from before them, completes C. Leaves `feature`
// checked out.
async function replayShape(t, { withCatalog }) {
  const repo = scratchRepo(t, backlogOf([], items("A", "B", "C")));
  await completingBranch(repo, "feature", ["C"], "2026-10-06T10:00:00.000Z");
  await completeAndCommit(repo, "A", "2026-10-04T10:00:00.000Z");
  await completeAndCommit(repo, "B", "2026-10-05T10:00:00.000Z");
  if (!withCatalog) {
    repo.git(["rm", "-q", catalog]);
    repo.git(["commit", "-q", "-m", "publish without a catalog"]);
  }
  checkout(repo, "feature");
  return repo;
}

// The tip is one added commit changing only the catalog, onto the replayed
// commit `replayedSubject`, and its catalog lists every record.
async function assertCatalogTip(repo, replayedSubject) {
  assert.equal(subject(repo), catalogSubject);
  assert.equal(changedPaths(repo), catalog);
  assert.equal(subject(repo, "HEAD^"), replayedSubject);
  const committed = assertCommittedCatalogCurrent(repo.git, "HEAD");
  assert.deepEqual(fileNames(committed), ["A_A.json", "B_B.json", "C_C.json"]);
  assert.equal(repo.git(["status", "--porcelain"]), "");
  await assertCatalogDoneAgrees(repo);
}

test("a rebase completing work onto an upstream that added records without a catalog ends with one catalog-only tip commit listing every record", async (t) => {
  const repo = await replayShape(t, { withCatalog: false });

  const rebased = await runRebase(repo, ["rebase", "--ref", "main"]);

  assert.equal(rebased.code, 0, rebased.stdout + rebased.stderr);
  assert.equal(refSha(repo, "HEAD~2"), refSha(repo, "main"));
  await assertCatalogTip(repo, "complete C");
});

test("a rebase where both sides changed the catalog replays without a stop and adds no commit when the replayed catalog is already current", async (t) => {
  const repo = await replayShape(t, { withCatalog: true });
  assert.match(plainMergeConflicts(repo, "main", "feature"), /\.catalog\.json/);

  const rebased = await runRebase(repo, ["rebase", "--ref", "main"]);

  assert.equal(rebased.code, 0, rebased.stdout + rebased.stderr);
  assert.equal(isMidRebase(repo), false);
  assert.equal(refSha(repo, "HEAD^"), refSha(repo, "main"));
  assert.equal(subject(repo), "complete C");
  const committed = assertCommittedCatalogCurrent(repo.git, "HEAD");
  assert.deepEqual(fileNames(committed), ["A_A.json", "B_B.json", "C_C.json"]);
  await assertCatalogDoneAgrees(repo);
});

test("a cherry-pick completing work onto a branch that added records without a catalog ends with one catalog-only tip commit", async (t) => {
  const repo = await replayShape(t, { withCatalog: false });
  const picked = refSha(repo, "feature");
  checkout(repo, "main");
  const before = headSha(repo);

  const result = await runCherryPick(repo, ["pick", "--ref", picked]);

  assert.equal(result.code, 0, result.stdout + result.stderr);
  assert.equal(refSha(repo, "HEAD~2"), before);
  await assertCatalogTip(repo, "complete C");
});

test("a cherry-pick where both sides changed the catalog applies without a stop", async (t) => {
  const repo = await replayShape(t, { withCatalog: true });
  const picked = refSha(repo, "feature");
  checkout(repo, "main");
  const before = headSha(repo);

  const result = await runCherryPick(repo, ["pick", "--ref", picked]);

  assert.equal(result.code, 0, result.stdout + result.stderr);
  assert.equal(refSha(repo, "HEAD^"), before);
  assert.equal(subject(repo), "complete C");
  assertCommittedCatalogCurrent(repo.git, "HEAD");
  await assertCatalogDoneAgrees(repo);
});

// `main` and `feature` both complete A at different times, so the record
// conflicts; leaves `feature` checked out.
async function conflictingRecordShape(t) {
  const repo = scratchRepo(t, backlogOf([], items("A", "B")));
  await completingBranch(repo, "feature", ["A"], "2026-10-05T10:00:00.000Z");
  await completeAndCommit(repo, "A", "2026-10-06T10:00:00.000Z");
  repo.git(["rm", "-q", catalog]);
  repo.git(["commit", "-q", "-m", "publish without a catalog"]);
  checkout(repo, "feature");
  return repo;
}

const completions = (catalogRead) =>
  catalogRead.records.map(({ fileName, completedAt }) => [
    fileName,
    completedAt,
  ]);

test("a conflicting record stops the rebase, and continue after the resolution ends with a current catalog", async (t) => {
  const repo = await conflictingRecordShape(t);

  const stopped = await runRebase(repo, ["rebase", "--ref", "main"]);

  assert.equal(stopped.code, 1);
  assert.equal(isMidRebase(repo), true);
  assert.match(repo.git(["ls-files", "-u"]), /\.planning\/done\/A_A\.json/);

  // The human decides the upstream's record stands ("ours" during a
  // rebase), so the replayed catalog no longer describes it.
  repo.git(["checkout", "--ours", "--", `${done}/A_A.json`]);
  repo.git(["add", "--", `${done}/A_A.json`]);
  const continued = await runRebase(repo, ["continue"]);

  assert.equal(continued.code, 0, continued.stdout + continued.stderr);
  assert.equal(isMidRebase(repo), false);
  assert.equal(subject(repo), catalogSubject);
  assert.equal(changedPaths(repo), catalog);
  assert.deepEqual(
    completions(assertCommittedCatalogCurrent(repo.git, "HEAD")),
    [["A_A.json", "2026-10-06T10:00:00.000Z"]],
  );
  await assertCatalogDoneAgrees(repo);
});

test("a conflicting record stops the cherry-pick, and continue after the resolution ends with a current catalog", async (t) => {
  const repo = await conflictingRecordShape(t);
  const picked = refSha(repo, "feature");
  checkout(repo, "main");

  const stopped = await runCherryPick(repo, ["pick", "--ref", picked]);

  assert.equal(stopped.code, 1);
  assert.match(repo.git(["ls-files", "-u"]), /\.planning\/done\/A_A\.json/);

  repo.git(["checkout", "--ours", "--", `${done}/A_A.json`]);
  repo.git(["add", "--", `${done}/A_A.json`]);
  const continued = await runCherryPick(repo, ["continue"]);

  assert.equal(continued.code, 0, continued.stdout + continued.stderr);
  assert.equal(subject(repo), catalogSubject);
  assert.deepEqual(
    completions(assertCommittedCatalogCurrent(repo.git, "HEAD")),
    [["A_A.json", "2026-10-06T10:00:00.000Z"]],
  );
  await assertCatalogDoneAgrees(repo);
});

test("a disputed rebase commits nothing beyond the replayed commits", async (t) => {
  const direction = (text) =>
    backlogOf([], items("A", "B", "C"), `Ship ${text}.`);
  const repo = scratchRepo(t, direction("in parallel"));
  repo.git(["checkout", "-q", "-b", "feature"]);
  commitOn(repo, direction("one at a time"), "feature matches main");
  await completeAndCommit(repo, "C");
  repo.write(
    repo.read().replace("Ship one at a time.", "Ship only overnight."),
  );
  repo.git(["commit", "-q", "-am", "feature changes direction again"]);
  checkout(repo, "main");
  commitOn(repo, direction("one at a time"), "main changes direction");
  await completeAndCommit(repo, "A");
  repo.git(["rm", "-q", catalog]);
  repo.git(["commit", "-q", "-m", "publish without a catalog"]);
  checkout(repo, "feature");

  const rebased = await runRebase(repo, ["rebase", "--ref", "main"]);

  assert.equal(rebased.code, 1, rebased.stdout + rebased.stderr);
  assert.match(rebased.stdout + rebased.stderr, /aggregate comparison/);
  assert.equal(isMidRebase(repo), false);
  assert.equal(subject(repo), "feature changes direction again");
  assert.equal(repo.git(["status", "--porcelain"]), "");
});
