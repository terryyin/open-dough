// Slice 4's clean-single-commit and mainline claims for
// `product-backlog-git-cherry-pick.mjs`: a single clean pick is still
// validated (reusing `validateCandidate`/`acceptStaged`, never a rebase-shaped
// aggregate — see that file's own header for why a single pick has no such
// composition gap), a clean pick whose own result fails this tool's
// invariants is refused after commit (Git leaves no uncommitted window for a
// clean cherry-pick) and recoverable via `validate`, and a picked merge
// commit with no `--mainline` supplied stops explicitly rather than this tool
// guessing a mainline. Every case here performs a real `git cherry-pick` in a
// scratch repository and asserts on real Git and file-system state.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  isMidCherryPick,
  runCherryPick,
} from "./product-backlog-git-cherry-pick-fixture.mjs";
import {
  checkout,
  commitBranch,
  headSha,
  refSha,
  scratchRepo,
} from "./product-backlog-git-fixture.mjs";

const itemA = "- [Item A](seeds/A.md#a)";
const itemB = "- [Item B](seeds/B.md#b)";

test("a single clean cherry-pick is accepted once its own result validates", async (t) => {
  const ancestor = backlogOf([], [itemA, itemB]);
  const repo = scratchRepo(t, ancestor);
  commitBranch(
    repo,
    "dest",
    backlogOf([], ["- [Item A, dest renamed](seeds/A.md#a)", itemB]),
    "dest renames A",
  );
  commitBranch(
    repo,
    "feature",
    backlogOf([], [itemA, "- [Item B, feature renamed](seeds/B.md#b)"]),
    "feature renames B",
  );
  checkout(repo, "dest");
  const featureTip = refSha(repo, "feature");

  const picked = await runCherryPick(repo, ["pick", "--ref", featureTip]);

  assert.equal(picked.code, 0, picked.stdout + picked.stderr);
  assert.match(picked.stdout + picked.stderr, /applied cleanly/);
  assert.equal(isMidCherryPick(repo), false);
  assert.equal(
    repo.read(),
    backlogOf(
      [],
      [
        "- [Item A, dest renamed](seeds/A.md#a)",
        "- [Item B, feature renamed](seeds/B.md#b)",
      ],
    ),
    "both sides' compatible intentions survive together, reconciled by the shared resolver",
  );
  assert.notEqual(
    headSha(repo),
    featureTip,
    "a real, new commit, not a reuse of the picked sha",
  );
});

test("a clean pick whose own result fails this tool's invariants is refused after commit, and `validate` reads a hand repair", async (t) => {
  // dest never touches the backlog path at all, so the pick applies as a
  // plain, unopposed patch — Git commits it immediately, with no staged,
  // uncommitted window this tool could gate before the fact, the same way a
  // fast-forward has none for `product-backlog-git-merge.mjs`.
  const ancestor = backlogOf([], [itemA]);
  const repo = scratchRepo(t, ancestor);
  repo.git(["checkout", "-q", "-b", "dest"]);

  commitBranch(
    repo,
    "feature",
    "# Product backlog\n\n## Taken\n\n## Backlog list\n\n- Item A with no link\n",
    "feature introduces an invalid entry",
  );
  checkout(repo, "dest");
  const featureTip = refSha(repo, "feature");

  const picked = await runCherryPick(repo, ["pick", "--ref", featureTip]);

  assert.equal(picked.code, 1);
  assert.match(
    picked.stdout + picked.stderr,
    /fails this tool's own invariants/,
  );
  assert.match(picked.stdout + picked.stderr, /Unsupported entry/);
  // Never reset or rewritten: the pick's own commit is real and present.
  assert.equal(isMidCherryPick(repo), false, "Git already committed it");
  assert.equal(
    repo.read(),
    "# Product backlog\n\n## Taken\n\n## Backlog list\n\n- Item A with no link\n",
  );

  // A human repairs it by hand with a further, ordinary commit, then
  // `validate` reads that decision back without rewriting or re-reconciling
  // anything.
  repo.write(backlogOf([], [itemA]));
  repo.git(["commit", "-aq", "-m", "human repairs the invalid pick result"]);
  const validated = await runCherryPick(repo, ["validate"]);
  assert.equal(validated.code, 0, validated.stdout + validated.stderr);
  assert.match(validated.stdout, /nothing was changed/);
});

test("picking a merge commit with no --mainline stops explicitly, never guessing a mainline", async (t) => {
  const ancestor = backlogOf([], [itemA]);
  const repo = scratchRepo(t, ancestor);
  repo.git(["checkout", "-q", "-b", "side"]);
  repo.write(backlogOf([], ["- [Item A, side renamed](seeds/A.md#a)"]));
  repo.git(["add", "-A"]);
  repo.git(["commit", "-q", "-m", "side renames A"]);
  repo.git(["checkout", "-q", "main"]);
  writeFileSync(`${repo.directory}/OTHER.md`, "x\n", "utf8");
  repo.git(["add", "-A"]);
  repo.git(["commit", "-q", "-m", "main touches an unrelated file"]);
  repo.git(["merge", "-q", "--no-edit", "side"]);
  const mergeCommit = headSha(repo);

  repo.git(["branch", "dest", "main~2"]);
  repo.git(["checkout", "-q", "dest"]);

  const withoutMainline = await runCherryPick(repo, [
    "pick",
    "--ref",
    mergeCommit,
  ]);
  assert.equal(withoutMainline.code, 1);
  assert.match(
    withoutMainline.stdout + withoutMainline.stderr,
    /is a merge commit; supply --mainline <n>/,
  );
  assert.match(
    withoutMainline.stdout + withoutMainline.stderr,
    new RegExp(mergeCommit),
    "names the real merge commit Git itself identified",
  );
  assert.equal(isMidCherryPick(repo), false, "Git refused before starting");

  const withMainline = await runCherryPick(repo, [
    "pick",
    "--ref",
    mergeCommit,
    "--mainline",
    "1",
  ]);
  assert.equal(withMainline.code, 0, withMainline.stdout + withMainline.stderr);
  assert.equal(
    repo.read(),
    backlogOf([], ["- [Item A, side renamed](seeds/A.md#a)"]),
    "the named mainline (1, the branch merged into) is the line picked against",
  );
});
