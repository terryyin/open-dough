// Slice 4's multi-commit `git cherry-pick a b` claims for
// `product-backlog-git-cherry-pick.mjs`: Git's own "this step is now empty"
// stop (no rebase analogue — rebase's default backend silently drops such a
// step; cherry-pick's default requires an explicit human decision first),
// its recoverable state, a genuinely compatible sequence accepted by the
// whole-operation aggregate comparison with no false dispute, and the
// documented, accepted gap this shares with
// `product-backlog-git-rebase.mjs`'s own `continueOperation`: once a stop is
// resolved and finished through `continue`, the aggregate is not re-run.
// Confirmed empirically (see the plan's own execution notes): both of slice
// 3's masking mechanisms (an earlier step exactly absorbing the
// destination's own concurrent change) manifest under cherry-pick as this
// "empty" stop rather than a silent multi-step composition, because that
// masking mechanism is, by construction, a zero-diff step — this is
// documented and asserted directly below rather than assumed to transfer
// unchanged from rebase. Every case here performs a real `git cherry-pick`
// in a scratch repository and asserts on real Git and file-system state.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  isMidCherryPick,
  runCherryPick,
} from "./product-backlog-git-cherry-pick-fixture.mjs";
import {
  checkout,
  commitOn,
  headSha,
  scratchRepo,
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

// The same masking shape `product-backlog-git-rebase-clean.test.mjs` proves
// for rebase: `feature`'s first commit sets the same direction text `dest`
// is about to set independently, and its second commit changes it again.
function buildMaskedSequence(t) {
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
  const first = repo.git(["rev-parse", "HEAD~1"]).trim();
  const second = repo.git(["rev-parse", "HEAD"]).trim();

  checkout(repo, "main");
  commitOn(
    repo,
    backlogOf([], [itemA], destinationDirection),
    "destination changes direction",
  );

  return { repo, first, second };
}

test("a multi-commit pick sequence stops with a distinct status when an earlier step's own effect already exists at the destination", async (t) => {
  const { repo, first, second } = buildMaskedSequence(t);

  const picked = await runCherryPick(repo, [
    "pick",
    "--ref",
    `${first} ${second}`,
  ]);

  assert.equal(picked.code, 1, picked.stdout + picked.stderr);
  assert.equal(isMidCherryPick(repo), true, "still mid-pick, recoverable");
  assert.equal(repo.git(["ls-files", "-u"]).trim(), "", "never a Git conflict");
  assert.match(
    picked.stdout + picked.stderr,
    /Applying it changes nothing: the destination already carries this commit's own net effect/,
  );
  assert.match(
    picked.stdout + picked.stderr,
    /decide by hand whether to `git cherry-pick --skip` it or keep it as a recorded no-op/,
  );
  assert.ok(
    (picked.stdout + picked.stderr).includes(first),
    "names the real stopped commit",
  );

  // Recoverable: nothing was auto-aborted, skipped, or reset. Git's own
  // sequencer still holds both steps, untouched, exactly where the pick
  // stopped them.
  assert.equal(
    repo
      .git(["cat-file", "-p", "HEAD"])
      .includes("destination changes direction"),
    true,
    "dest's own commit is still HEAD; nothing was committed on its behalf",
  );
});

test("keeping the empty step by hand (never this tool's decision) lets `continue` finish the sequence — the same accepted gap rebase's own continueOperation carries", async (t) => {
  const { repo, first, second } = buildMaskedSequence(t);
  await runCherryPick(repo, ["pick", "--ref", `${first} ${second}`]);

  // The human decides, by hand, to keep the redundant step as a recorded
  // no-op — this tool never makes that choice itself.
  repo.git(["commit", "--allow-empty", "--no-edit"]);

  const finished = await runCherryPick(repo, ["continue"]);

  assert.equal(finished.code, 0, finished.stdout + finished.stderr);
  assert.match(finished.stdout + finished.stderr, /cherry-pick completed/);
  assert.equal(isMidCherryPick(repo), false);

  // The documented, accepted gap: `continueOperation`'s own finish is never
  // re-gated by the whole-operation aggregate (the same boundary
  // `product-backlog-git-rebase.mjs` documents for the same reason), so the
  // masked destination dispute this sequence embodies is not caught here —
  // the branch's own final local content is the feature line's own final
  // value, exactly as the picks produced it, not flagged as disputed.
  assert.equal(
    repo.read(),
    backlogOf([], [itemA], branchFinalDirection),
    "the masked composition completed silently, the same accepted gap as rebase's",
  );
});

test("a genuinely compatible multi-commit sequence is accepted, with the whole-operation aggregate agreeing and no false dispute", async (t) => {
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
  const first = repo.git(["rev-parse", "HEAD~1"]).trim();
  const second = repo.git(["rev-parse", "HEAD"]).trim();

  checkout(repo, "main");
  commitOn(
    repo,
    backlogOf([], [itemA, "- [Item B renamed](seeds/B.md#b)", itemC, itemD]),
    "destination renames B, a different entry entirely",
  );
  const destTip = headSha(repo);

  const picked = await runCherryPick(repo, [
    "pick",
    "--ref",
    `${first} ${second}`,
  ]);

  assert.equal(picked.code, 0, picked.stdout + picked.stderr);
  assert.equal(isMidCherryPick(repo), false);
  assert.match(
    picked.stdout + picked.stderr,
    /aggregate comparison agrees with the result/,
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
  assert.notEqual(headSha(repo), destTip, "two real, new pick commits landed");
});
