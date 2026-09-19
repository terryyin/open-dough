// A second, independent conflict later in the same rebase must be identified
// by its own real revisions, not conflated with the first stop's identity or
// with an invalid human supply — the regression this project's rebase gate
// must resist once more than one replayed commit can conflict. A real `git
// rebase` in a scratch repository is driven through two successive conflicts
// on the same path, asserting on real rebase state and Git history after
// each stop and after the whole rebase completes.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  commitBranch,
  commitOn,
  headSha,
  isMidRebase,
  rebaseStop,
  runRebase,
  scratchRepo,
  stageResolution,
} from "./product-backlog-git-fixture.mjs";

const itemC = "- [Item C](seeds/C.md#c)";

test("a fresh conflict on the next replayed commit is identified again, not conflated with an invalid supply", async (t) => {
  // Here the second commit *also* disputes Item C, so once the first
  // conflict is resolved, replaying the second must conflict again — a
  // second, independent stop this gate must identify by its own real
  // revisions rather than reusing the first stop's identity.
  const ancestor = backlogOf([], [itemC]);
  const repo = scratchRepo(t, ancestor);
  commitBranch(
    repo,
    "dest",
    backlogOf([], ["- [Item C, dest renamed](seeds/C.md#c)"]),
    "dest renames C",
  );
  repo.git(["checkout", "-q", "-b", "feature"]);
  commitOn(
    repo,
    backlogOf([], ["- [Item C, feature renamed once](seeds/C.md#c)"]),
    "feature renames C once",
  );
  commitOn(
    repo,
    backlogOf([], ["- [Item C, feature renamed twice](seeds/C.md#c)"]),
    "feature renames C twice",
  );
  const secondCommit = headSha(repo);

  const firstStop = await runRebase(repo, ["rebase", "--ref", "dest"]);
  assert.equal(firstStop.code, 1);
  const firstIdentity = rebaseStop(repo);
  assert.notEqual(firstIdentity.replayedCommit, secondCommit);

  stageResolution(
    repo,
    backlogOf([], ["- [Item C, resolved once](seeds/C.md#c)"]),
  );
  const secondStop = await runRebase(repo, ["continue"]);

  assert.equal(
    secondStop.code,
    1,
    "the second commit's own conflict stops it too",
  );
  assert.equal(isMidRebase(repo), true);
  const secondIdentity = rebaseStop(repo);
  assert.equal(
    secondIdentity.replayedCommit,
    secondCommit,
    "the fresh stop identifies the second commit, not the first",
  );
  assert.notEqual(
    secondIdentity.replayedCommit,
    firstIdentity.replayedCommit,
    "each stop names its own real replayed commit",
  );
  assert.match(
    secondStop.stdout + secondStop.stderr,
    new RegExp(secondCommit),
    "the message names the fresh commit, not the resolved one",
  );

  // Resolve the second conflict too, and confirm the rebase then completes
  // with both original commits represented exactly once.
  stageResolution(
    repo,
    backlogOf([], ["- [Item C, resolved twice](seeds/C.md#c)"]),
  );
  const finished = await runRebase(repo, ["continue"]);
  assert.equal(finished.code, 0, finished.stdout + finished.stderr);
  assert.equal(isMidRebase(repo), false);
  assert.equal(repo.git(["rev-list", "--count", "dest..feature"]).trim(), "2");
});
