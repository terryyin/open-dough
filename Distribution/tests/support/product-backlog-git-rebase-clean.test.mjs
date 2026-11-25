// A replay can finish cleanly even when an early commit masks a dispute
// and a later commit changes the same backlog entry or direction again.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import {
  backlogOf,
  direction,
  linkedEntries,
} from "./product-backlog-fixture.mjs";
import {
  checkout,
  checkoutOf,
  commitOn,
  isMidRebase,
  occurrences,
  refSha,
  runRebase,
  unresolvedPaths,
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

test("rebase stops a clean direction dispute no single replayed commit ever conflicted on", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: { queued: linkedEntries("A"), direction: originalDirection },
      })
      .withRevision("cutoff", { files: { "cutoff.txt": "Earlier work" } })
      .withRevision("destination", {
        parents: ["ancestor"],
        backlog: {
          queued: linkedEntries("A"),
          direction: destinationDirection,
        },
      })
      .please(),
  );

  repo.git(["checkout", "-q", "-b", "feature", repo.revisions.cutoff]);
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

  const originalTip = refSha(repo, "feature");
  checkout(repo, "main");

  const rebased = await runRebase(repo, [
    "rebase",
    "--onto",
    "HEAD",
    "--ref",
    repo.revisions.cutoff,
    "--branch",
    "feature",
  ]);

  assert.equal(rebased.code, 1, rebased.stdout + rebased.stderr);
  assert.equal(
    isMidRebase(repo),
    false,
    "Git itself never stopped mid-rebase; every step replayed clean",
  );
  assert.equal(
    unresolvedPaths(repo),
    "",
    "nothing is left unmerged; this was never a Git conflict",
  );
  assert.match(
    rebased.stdout + rebased.stderr,
    /no Git conflict in .* at any step, but the whole-rebase aggregate comparison/,
  );
  assert.match(
    rebased.stdout + rebased.stderr,
    /the rebase's local commits are left exactly where the rebase completed them/,
  );
  assert.match(
    rebased.stdout + rebased.stderr,
    /"## Near-future direction": the versions give it different text/,
  );

  assert.ok(rebased.stdout.includes(`tip (${originalTip})`));
  assert.ok(
    rebased.stdout.includes(
      `destination-at-start (${repo.revisions.destination})`,
    ),
  );
  assert.equal(refSha(repo, "main"), repo.revisions.destination);
  assert.equal(refSha(repo, "feature^"), repo.revisions.destination);
  assert.equal(refSha(repo, "ORIG_HEAD"), originalTip);
  assert.equal(repo.git(["ls-files", "--", "cutoff.txt"]), "");
  assert.equal(
    repo.read(),
    backlogOf([], [itemA], branchFinalDirection),
    "the rebase's own local result is untouched by this refusal",
  );
});

test("rebase stops the duplicate-move regression no single replayed commit ever conflicted on", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: {
          queued: linkedEntries("A", "B", "C", "D"),
          direction,
        },
      })
      .please(),
  );

  repo.git(["checkout", "-q", "-b", "feature"]);
  commitOn(
    repo,
    backlogOf([], [itemA, itemC, itemB, itemD]),
    "feature also moves B after C, matching destination's own move",
  );
  commitOn(
    repo,
    backlogOf([], [itemA, itemC, itemD, itemB]),
    "feature moves B again, to the end",
  );

  checkout(repo, "main");
  commitOn(
    repo,
    backlogOf([], [itemA, itemC, itemB, itemD]),
    "destination moves B after C",
  );
  checkout(repo, "feature");

  const rebased = await runRebase(repo, ["rebase", "--ref", "main"]);

  assert.equal(rebased.code, 1, rebased.stdout + rebased.stderr);
  assert.equal(isMidRebase(repo), false, "every step replayed clean");
  assert.equal(unresolvedPaths(repo), "", "this was never a Git conflict");
  assert.match(
    rebased.stdout + rebased.stderr,
    /no Git conflict in .* at any step, but the whole-rebase aggregate comparison/,
  );
  assert.equal(
    occurrences(repo.read(), itemB),
    1,
    "the rebase's own local result names Item B once, not duplicated",
  );
});

test("rebase rejects retired endpoint overrides before registering drivers or changing Git state", async (t) => {
  const repo = await checkoutOf(t, makeMe.aRepository.please(), {
    gitTemplates: false,
  });
  const refs = repo.git(["show-ref"]);
  const config = repo.git(["config", "--local", "--list"]);
  const index = repo.git(["ls-files", "--stage"]);
  const help = await runRebase(repo, ["--help"]);

  assert.equal(help.code, 0, help.stderr);
  assert.match(help.stdout, /--onto <newbase>.*--branch <branch>/);
  for (const flag of ["--pre-rebase-tip", "--destination-at-start"]) {
    assert.ok(!help.stdout.includes(flag));
    const result = await runRebase(repo, [
      "rebase",
      "--ref",
      "HEAD",
      flag,
      "HEAD",
    ]);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /ERR_PARSE_ARGS_UNKNOWN_OPTION/);
    assert.ok(result.stderr.includes(flag));
    assert.equal(repo.git(["show-ref"]), refs);
    assert.equal(repo.git(["config", "--local", "--list"]), config);
    assert.equal(repo.git(["ls-files", "--stage"]), index);
    assert.equal(repo.git(["status", "--porcelain"]), "");
    assert.equal(isMidRebase(repo), false);
    assert.match(
      repo.git([
        "check-attr",
        "merge",
        "--",
        ".planning/PRODUCT-BACKLOG.md",
        ".planning/done/.catalog.json",
      ]),
      /^.*: merge: unspecified\n.*: merge: unspecified\n$/,
    );
  }
});
