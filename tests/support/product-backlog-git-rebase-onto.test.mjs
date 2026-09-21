// Git mechanics (not guidance-following): `rebase --onto` replays only the
// commits after `--ref` on the named `--branch`, including when that branch
// is not checked out. A conflicting replay leaves that branch unmoved.
// Aggregate-endpoint overrides are not this file's claim.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  checkout,
  commitOn,
  headSha,
  isMidRebase,
  rebaseStop,
  refSha,
  runRebase,
  scratchRepo,
  unresolvedPaths,
} from "./product-backlog-git-fixture.mjs";

const itemA = "- [Item A](seeds/A.md#a)";
const itemB = "- [Item B](seeds/B.md#b)";
const itemC = "- [Item C](seeds/C.md#c)";
const itemD = "- [Item D](seeds/D.md#d)";
const ownedD = "- [Item D, owned](seeds/D.md#d)";
const ownedA = "- [Item A, owned](seeds/A.md#a)";
const siblingB = "- [Item B, sibling](seeds/B.md#b)";
const featureRenamedC = "- [Item C, feature renamed](seeds/C.md#c)";
const destRenamedC = "- [Item C, dest renamed](seeds/C.md#c)";

function commitFile(repo, name, contents, message) {
  writeFileSync(join(repo.directory, name), contents);
  repo.git(["add", "--", name]);
  repo.git(["commit", "-q", "-m", message]);
}

test("rebase --onto replays only the owned suffix of a branch that is not checked out and keeps the sibling backlog change", async (t) => {
  const repo = scratchRepo(t, backlogOf([], [itemA, itemB, itemC, itemD]));
  repo.git(["checkout", "-q", "-b", "owned"]);
  commitFile(repo, "outside-suffix.txt", "outside\n", "outside the suffix");
  commitFile(repo, "cutoff.txt", "cutoff\n", "previously published base");
  const cutoff = headSha(repo);
  commitOn(repo, backlogOf([], [itemA, itemB, itemC, ownedD]), "owned suffix");
  commitOn(
    repo,
    backlogOf([], [ownedA, itemB, itemC, ownedD]),
    "second owned commit",
  );
  checkout(repo, "main");
  commitOn(
    repo,
    backlogOf([], [itemA, siblingB, itemC, itemD]),
    "sibling on trunk",
  );
  const trunk = headSha(repo);

  const rebased = await runRebase(repo, [
    "rebase",
    "--onto",
    "main",
    "--ref",
    cutoff,
    "--branch",
    "owned",
  ]);

  assert.equal(rebased.code, 0, rebased.stdout + rebased.stderr);
  assert.match(rebased.stdout, /whole-rebase aggregate/);
  assert.equal(isMidRebase(repo), false);
  assert.equal(
    refSha(repo, "main"),
    trunk,
    "the fetched trunk commit is not rewritten",
  );
  assert.equal(
    repo.git(["rev-parse", "owned~2"]).trim(),
    trunk,
    "both suffix commits sit on the fetched trunk and nothing before the cutoff does",
  );
  assert.equal(
    repo.git(["log", "--format=%s", "main..owned"]).trim(),
    "second owned commit\nowned suffix",
  );
  assert.equal(repo.read(), backlogOf([], [ownedA, siblingB, itemC, ownedD]));
  const files = repo.git(["ls-tree", "-r", "--name-only", "owned"]);
  assert.equal(files.includes("outside-suffix.txt"), false);
  assert.equal(files.includes("cutoff.txt"), false);
});

test("rebase --onto stops a conflicting owned suffix without moving that branch", async (t) => {
  const repo = scratchRepo(t, backlogOf([], [itemC]));
  repo.git(["checkout", "-q", "-b", "owned"]);
  commitOn(repo, backlogOf([], [featureRenamedC]), "owned renames C");
  const ownedTip = headSha(repo);
  const cutoff = repo.git(["rev-parse", "owned^"]).trim();
  checkout(repo, "main");
  commitOn(repo, backlogOf([], [destRenamedC]), "trunk renames C");
  const trunk = headSha(repo);

  const stopped = await runRebase(repo, [
    "rebase",
    "--onto",
    "main",
    "--ref",
    cutoff,
    "--branch",
    "owned",
  ]);

  assert.equal(stopped.code, 1);
  assert.match(stopped.stdout + stopped.stderr, /unresolved/);
  assert.equal(isMidRebase(repo), true);
  assert.notEqual(unresolvedPaths(repo), "");
  assert.equal(refSha(repo, "owned"), ownedTip);
  assert.equal(refSha(repo, "main"), trunk);
  assert.equal(rebaseStop(repo).replayedCommit, ownedTip);
});
