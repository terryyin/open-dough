// Slice 3's acceptance and recovery half: a multi-commit rebase that
// finishes with no Git conflict at any step is still checked against the
// whole-rebase aggregate comparison of the true pre-rebase tip and the true
// destination-at-start (`product-backlog-git-rebase-clean.test.mjs` proves
// the refusal path for masked disputes) — but that comparison must not
// falsely dispute a genuinely compatible replay, and must not re-dispute a
// human's already-accepted resolution of an earlier, real Git conflict. It
// also covers the read-only `validate` recovery path for both an accepted
// and a disputed clean-rebase result. Every case here performs a real
// `git rebase` in a scratch repository and asserts on the gate's own outcome
// and on real Git/file-system state — the rebase's local commits, the
// branch's own ref, and the worktree's bytes — never a mocked function call.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  checkout,
  commitOn,
  isMidRebase,
  refSha,
  runRebase,
  scratchRepo,
  stageResolution,
} from "./product-backlog-git-fixture.mjs";

const itemA = "- [Item A](seeds/A.md#a)";
const itemB = "- [Item B](seeds/B.md#b)";
const itemC = "- [Item C](seeds/C.md#c)";
const itemD = "- [Item D](seeds/D.md#d)";

const originalDirection =
  "Enable agents to execute stories in parallel while collaborating through\n" +
  "trunk-based development, with each agent working in its own Git worktree.";
const destinationDirection = originalDirection.replace(
  "execute stories in parallel",
  "execute stories one at a time",
);
const branchFirstDirection = destinationDirection; // masks the divergence
const branchFinalDirection = originalDirection.replace(
  "execute stories in parallel",
  "execute stories only overnight",
);

test("rebase accepts a genuinely compatible multi-commit clean replay, with no false dispute", async (t) => {
  const ancestor = backlogOf([], [itemA, itemB, itemC, itemD]);
  const repo = scratchRepo(t, ancestor);

  repo.git(["checkout", "-q", "-b", "feature"]);
  commitOn(
    repo,
    backlogOf([], ["- [Item A renamed](seeds/A.md#a)", itemB, itemC, itemD]),
    "feature renames A",
  );
  commitOn(
    repo,
    backlogOf(
      [],
      [
        "- [Item A renamed](seeds/A.md#a)",
        itemB,
        itemC,
        "- [Item D renamed](seeds/D.md#d)",
      ],
    ),
    "feature renames D",
  );

  checkout(repo, "main");
  commitOn(
    repo,
    backlogOf([], [itemA, "- [Item B renamed](seeds/B.md#b)", itemC, itemD]),
    "destination renames B, a different entry entirely",
  );
  checkout(repo, "feature");

  const rebased = await runRebase(repo, ["rebase", "--ref", "main"]);

  assert.equal(rebased.code, 0, rebased.stdout + rebased.stderr);
  assert.equal(isMidRebase(repo), false);
  assert.match(
    rebased.stdout + rebased.stderr,
    /aggregate comparison .* agrees with the result/,
  );
  assert.equal(
    repo.read(),
    backlogOf(
      [],
      [
        "- [Item A renamed](seeds/A.md#a)",
        "- [Item B renamed](seeds/B.md#b)",
        itemC,
        "- [Item D renamed](seeds/D.md#d)",
      ],
    ),
    "both sides' compatible intentions survive together",
  );
});

test("a human-resolved earlier replay's accepted decision and the clean remaining suffix both survive the aggregate gate", async (t) => {
  // commit1 disputes Item C with destination (a genuine Git conflict, which
  // slice 2 already gates and a human already resolved); commit2 only adds
  // an unrelated entry and replays clean once the rebase continues. Re-
  // running the whole-rebase aggregate using the *original*, pre-resolution
  // branch content here would falsely re-dispute the human's already
  // accepted decision (confirmed empirically) — proving this gate must not
  // do that.
  const ancestor = backlogOf([], [itemC]);
  const repo = scratchRepo(t, ancestor);

  repo.git(["checkout", "-q", "-b", "feature"]);
  commitOn(
    repo,
    backlogOf([], ["- [Item C, feature renamed](seeds/C.md#c)"]),
    "feature renames C, disputing destination's own rename",
  );
  commitOn(
    repo,
    backlogOf([], ["- [Item C, feature renamed](seeds/C.md#c)", itemD]),
    "feature adds D, unrelated to the dispute",
  );

  checkout(repo, "main");
  commitOn(
    repo,
    backlogOf([], ["- [Item C, dest renamed](seeds/C.md#c)"]),
    "destination renames C",
  );
  checkout(repo, "feature");

  const firstStop = await runRebase(repo, ["rebase", "--ref", "main"]);
  assert.equal(firstStop.code, 1, "the first commit's own conflict stops it");
  assert.equal(isMidRebase(repo), true);

  stageResolution(
    repo,
    backlogOf([], ["- [Item C, resolved by human](seeds/C.md#c)"]),
  );
  const finished = await runRebase(repo, ["continue"]);

  assert.equal(
    finished.code,
    0,
    `the remaining commit replays clean once continued: ${
      finished.stdout
    }${finished.stderr}`,
  );
  assert.equal(isMidRebase(repo), false);
  assert.equal(
    repo.read(),
    backlogOf([], ["- [Item C, resolved by human](seeds/C.md#c)", itemD]),
    "both the accepted human resolution and the clean suffix's own addition survive",
  );

  // The read-only `validate` recovery accepts the current, human-accepted
  // result without re-running any reconciliation over it.
  const validated = await runRebase(repo, ["validate"]);
  assert.equal(validated.code, 0, validated.stdout + validated.stderr);
  assert.match(validated.stdout, /nothing was changed/);
});

test("a disputed clean-rebase result is recoverable: local commits untouched, and `validate` reads a hand repair", async (t) => {
  const ancestor = backlogOf([], [itemA], originalDirection);
  const repo = scratchRepo(t, ancestor);

  repo.git(["checkout", "-q", "-b", "feature"]);
  commitOn(
    repo,
    backlogOf([], [itemA], branchFirstDirection),
    "feature also sets destination's direction",
  );
  commitOn(
    repo,
    backlogOf([], [itemA], branchFinalDirection),
    "feature changes direction again",
  );

  checkout(repo, "main");
  commitOn(
    repo,
    backlogOf([], [itemA], destinationDirection),
    "destination changes direction",
  );
  checkout(repo, "feature");

  const beforeSha = refSha(repo, "feature");
  const rebased = await runRebase(repo, ["rebase", "--ref", "main"]);
  assert.equal(rebased.code, 1);

  // Nothing was aborted or reset: the branch moved to wherever the rebase's
  // own successful replay actually left it (never back to `beforeSha`), and
  // is not mid-rebase.
  assert.notEqual(refSha(repo, "feature"), beforeSha);
  assert.equal(isMidRebase(repo), false);

  // A human decides the automatic candidate should stand as is; `validate`
  // reads that decision back without writing or re-reconciling anything.
  const validated = await runRebase(repo, ["validate"]);
  assert.equal(validated.code, 0, validated.stdout + validated.stderr);
  assert.equal(
    repo.read(),
    backlogOf([], [itemA], branchFinalDirection),
    "validate changed nothing",
  );
});
