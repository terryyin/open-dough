// Git mechanics (not guidance-following): trunk publication via
// publish-the-candidate on disposable remotes/worktrees — clean FF,
// unrelated-local stop, and rejected-push recovery.
import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  assertPublicationAgreement,
  createCleanTrunkFixture,
  exec,
  fetchAndAssertOriginMain,
  git,
  lsRemoteSha,
  revParse,
} from "./trunk-publication-local-main-test-fixtures.mjs";

test("publishing a verified increment onto a clean local main leaves local main, origin/main, and the execution branch at the candidate SHA", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  assert.notEqual(
    candidateSha,
    trunkSha,
    "the increment must start unpublished, ahead of trunk",
  );

  // 1. Fetch the authorized remote for the target branch.
  await fetchAndAssertOriginMain(integration, trunkSha);

  // 2 & 3. Reconcile from the fetched target and confirm the owned
  // unpublished suffix is already based on current trunk, so the rule
  // leaves its commits unchanged (no rebase performed).
  const executionParent = await revParse(execution, "exec/story~1");
  assert.equal(
    executionParent,
    trunkSha,
    "the increment's parent must already be current trunk",
  );

  // 5. Fast-forward the local target to the exact candidate by running
  // `git -C <integration-checkout> merge --ff-only <candidate>` on the
  // integration checkout, per the tightened rule text -- not a SHA push
  // from the execution worktree and not `update-ref`/`branch -f`.
  await git(integration, "merge", "--ff-only", candidateSha);
  assert.equal(await revParse(integration, "main"), candidateSha);

  // 6. Push that exact candidate from the integration checkout, then
  // refresh the integration checkout's remote view.
  await git(integration, "push", "origin", "main");
  await git(integration, "fetch", "origin");

  // Observable proof: local main (integration checkout), the bare origin
  // itself (not just the integration checkout's cached remote-tracking ref),
  // and the execution branch all agree on the same candidate SHA, main and
  // origin/main have converged, and the fast-forward merge left the
  // integration checkout's working tree clean.
  await assertPublicationAgreement(
    { origin, integration, execution },
    candidateSha,
    "the integration checkout must be clean after merge --ff-only",
  );
});

// Builds the Slice 2 fixture on top of Slice 1's clean-trunk starting point:
// the same layout, but local `main` on the integration checkout also carries
// a commit made directly on that checkout (not via the execution worktree),
// so it is ahead of both `origin/main` and the execution suffix's parent by a
// commit that is not the owned unpublished suffix.
test("stopping when local main has unrelated unpublished commits preserves both the unrelated commit and the execution increment without advancing origin/main", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  // Diverge local main directly on the integration checkout: an unrelated
  // commit made outside the execution worktree, not part of the owned
  // unpublished suffix (exec/story's candidate).
  writeFileSync(join(integration, "unrelated.txt"), "unrelated local work\n");
  await git(integration, "add", "unrelated.txt");
  await git(integration, "commit", "-m", "unrelated local main commit");
  const unrelatedSha = await revParse(integration, "main");

  assert.notEqual(
    unrelatedSha,
    trunkSha,
    "the unrelated commit must actually diverge local main from trunk",
  );
  assert.notEqual(
    unrelatedSha,
    candidateSha,
    "the unrelated commit must not coincide with the execution's candidate",
  );

  // 1. Fetch the authorized remote for the target branch.
  await fetchAndAssertOriginMain(integration, trunkSha);

  // 2. Reconcile from the fetched target, per publish-the-candidate.md's
  // "Publish the candidate" step 2 and the Preconditions section: the local
  // target (main) has an unpublished commit that is neither the fetched
  // remote tip nor this execution's owned suffix (exec/story's candidate).
  // That is a stop, not permission to fast-forward or push the candidate
  // SHA.
  //
  // Demonstrate the real Git mechanism the rule leans on, not a JS-level
  // decision not to act: local main (at unrelatedSha) is NOT an ancestor of
  // candidateSha (which descends from trunkSha, unrelatedSha's parent), so
  // even a naive attempt at step 5's `git -C <integration> merge --ff-only
  // <candidate>` cannot silently succeed -- Git itself refuses the
  // fast-forward. That is what makes stopping at the step-2 ownership check
  // (rather than falling back to a forced ref move, `update-ref`,
  // `branch -f`, or a same-command SHA push -- all already forbidden by
  // Slice 1) load-bearing: there is no quiet way to advance past the
  // unrelated commit.
  await assert.rejects(
    () => git(integration, "merge", "--ff-only", candidateSha),
    /Not possible to fast-forward|not possible to fast-forward/,
    "a naive fast-forward merge onto the candidate must be genuinely refused by Git while local main carries an unrelated, non-ancestor commit",
  );

  // Preserved-state proof, per Slice 2's fixture description:

  // The bare origin itself is still the pre-publication trunk SHA, not the
  // execution's candidate.
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);

  // The execution increment remains recoverable on exec/story: it still
  // resolves to the same candidate SHA it had before the attempt.
  assert.equal(await revParse(execution, "exec/story"), candidateSha);

  // The unrelated local-main commit remains on the integration checkout's
  // main -- not reverted, reset, or overwritten.
  assert.equal(await revParse(integration, "main"), unrelatedSha);
});

// Builds the Slice 3 fixture on top of Slice 1's clean-trunk starting point:
// the integration checkout is fast-forwarded to the candidate exactly as
// Slice 1's rule prescribes, but a concurrent writer advances the bare
// `origin` with a disjoint commit (based on trunkSha, not candidateSha)
// before the integration checkout's push lands. This genuinely races the
// first ordinary publish push, which Git must actually reject.
test("recovering a rejected push after a concurrent remote advance publishes the rewritten candidate and moves local main and the execution branch onto it", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  // 1. Fast-forward the integration checkout to the candidate exactly as
  // Slice 1's rule prescribes -- but do NOT push yet, so the concurrent
  // writer's advance below is still racing an unpublished local main.
  await git(integration, "merge", "--ff-only", candidateSha);
  assert.equal(await revParse(integration, "main"), candidateSha);

  // 2. Simulate a concurrent writer: a throwaway third checkout clones the
  // bare origin (still at trunkSha), commits a disjoint change, and pushes
  // it to origin's main -- producing disjointSha, whose parent is trunkSha,
  // not candidateSha.
  const thirdCheckout = (await exec("mktemp", ["-d"])).stdout.trim();
  await exec("git", ["clone", origin, thirdCheckout]);
  await git(thirdCheckout, "config", "user.name", "Concurrent Writer");
  await git(thirdCheckout, "config", "user.email", "concurrent@example.test");
  writeFileSync(join(thirdCheckout, "disjoint.txt"), "concurrent work\n");
  await git(thirdCheckout, "add", "disjoint.txt");
  await git(thirdCheckout, "commit", "-m", "concurrent disjoint commit");
  await git(thirdCheckout, "push", "origin", "main");
  const disjointSha = await lsRemoteSha(origin, "refs/heads/main");
  t.after(() => rmSync(thirdCheckout, { recursive: true, force: true }));

  assert.notEqual(
    disjointSha,
    trunkSha,
    "the concurrent commit must actually advance origin/main",
  );
  assert.equal(
    await revParse(thirdCheckout, `${disjointSha}~1`),
    trunkSha,
    "the concurrent commit's parent must be trunkSha, not the candidate -- a genuinely disjoint race",
  );

  // 3. Attempt the ordinary publish push from the integration checkout.
  // This MUST be actually attempted and MUST be genuinely rejected by Git
  // as non-fast-forward, since origin/main (disjointSha) is no longer an
  // ancestor of the integration checkout's view of the push. The exact
  // wording below was verified against real Git output in a throwaway
  // repository before being used here (Git emits
  // "! [rejected]        main -> main (fetch first)" plus the
  // "Updates were rejected because the remote contains work..." hint).
  await assert.rejects(
    () => git(integration, "push", "origin", "main"),
    /! \[rejected\]\s+main -> main \(fetch first\)/,
    "the first ordinary publish push must be genuinely rejected by Git as non-fast-forward",
  );

  // Confirm the rejection did not silently advance anything: origin is
  // still exactly at disjointSha, and local main is still the pre-rebase
  // candidate.
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), disjointSha);
  assert.equal(await revParse(integration, "main"), candidateSha);

  // 4. Recovery sequence from publish-the-candidate.md's "Recover a rejected
  // push": fetch, then rebase only the owned suffix (previously published
  // base trunkSha..main) onto the fetched trunk (disjointSha), on the
  // integration checkout.
  await git(integration, "fetch", "origin");
  assert.equal(await revParse(integration, "origin/main"), disjointSha);

  await git(integration, "rebase", "--onto", disjointSha, trunkSha, "main");
  const rewrittenSha = await revParse(integration, "main");

  assert.notEqual(
    rewrittenSha,
    candidateSha,
    "the rebase must produce a genuinely new, different commit SHA, not reuse the pre-rebase candidate",
  );
  assert.equal(
    (
      await git(integration, "log", "--format=%P", "-1", rewrittenSha)
    ).stdout.trim(),
    disjointSha,
    "the rewritten candidate's parent must be the disjoint commit -- a real rewrite, not a discard",
  );

  // Move the execution branch to the rewritten candidate, per "Recover a
  // rejected push" step 3: `git rebase --onto <target-branch>
  // <rejected-candidate> <execution-branch>`.
  await git(execution, "rebase", "--onto", "main", candidateSha, "exec/story");
  assert.equal(await revParse(execution, "exec/story"), rewrittenSha);

  // Push once. This attempt must actually succeed now that origin's tip
  // (disjointSha) is an ancestor of the rewritten candidate.
  await git(integration, "push", "origin", "main");
  await git(integration, "fetch", "origin");

  // 5. Genuine final-state proof: local main, the bare origin itself, and
  // the execution branch all agree on the rewritten candidate, main and
  // origin/main have converged, and recovery left the integration checkout
  // clean.
  await assertPublicationAgreement(
    { origin, integration, execution },
    rewrittenSha,
    "the integration checkout must be clean after recovery and push",
  );

  // The rewritten commit still carries the increment's actual content --
  // proving the rebase preserved the change, not just a same-named empty
  // commit.
  const incrementContent = (
    await git(integration, "show", `${rewrittenSha}:increment.txt`)
  ).stdout;
  assert.equal(incrementContent, "increment\n");
});
