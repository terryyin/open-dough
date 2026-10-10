# A resolved integration survives a failed or early rerun

**Identity:** SEED-088#resolved-integration-survives-reruns
**Source:** [correction story](../../seeds/SEED-088-dashboard-story-code-review.md#resolved-integration-survives-reruns),
written 2026-10-11 by the execution retrospective of
`SEED-088#landing-capture-after-integration-conflict`
([story](../../seeds/SEED-088-dashboard-story-code-review.md#landing-capture-after-integration-conflict),
[plan 294](../294-landing-capture-after-integration-conflict/PLAN.md); commits
`9aa4ec9f`, `f4cbf529`, `5f6ab04c`, `a5c55a56` on
`claude/a-conflicted-story-branch-integration-still-reco`). Planning only; this
plan grants no Take, execution, or publication.

## Goal and boundaries

Plan 294 made `integrate` take a hand-resolved merge as its candidate. The
resolution is now work only the agent holds, and three reruns the guidance
invites lose it or stop without a result. This correction makes each of those
reruns keep the resolution and answer with a printed result, and removes the
residue the review found.

Preserved: everything plan 294 delivered and proved: the `preserved` result
with `conflictedPaths` on a conflict, the resolved merge published and its
pair recorded, a moved target recomputing the merge, one fixed landing per
launch, the `published` and `already-accepted` shapes, and the later-publication
rule.

Excluded: Trunk Mode; where `install.sh`'s payload declaration lives.

## Current findings

1. **A failed landing retention drops the resolved merge.**
   `publishHistoryPreservingCandidate` (`history-preserving-publication.mjs`)
   calls `returnToBranch` when `retainLandingComparison` throws. A taken
   resolved `HEAD` is clean with no `MERGE_HEAD`, so the workspace checks out
   its branch and the resolution sits on no ref; the next run rebuilds the
   merge and stops on the same conflict. A closed dashboard, its timeout, or a
   receiver refusal triggers it. Before plan 294 every candidate could be
   rebuilt, so returning lost nothing.
2. **A merge in progress with nothing unmerged exits 2 and loses its merge
   state.** `constructCandidate` (`history-preserving-candidate.mjs`) checks
   unmerged paths and `HEAD`'s parents, not `MERGE_HEAD`. A resolution staged
   but not committed, or the clean merge a `developer-identity-refused` result
   leaves, falls through to `git checkout --detach`, which drops `MERGE_HEAD`;
   the merge then fails with no printed result and the staged content left on
   detached trunk. Plan 294's obligation G5 called this rerun costless.
3. **A merge with the story as first parent is published.** `headMerges`
   ignores parent order, so a merge of trunk into the checked-out story branch
   is taken, without the backlog adapter, and trunk's first-parent line then
   runs through the story's commits. Plan 294's obligation G1 assumed only the
   stopped merge reaches this check.
4. **The guidance omits what these states need.**
   `preserve-published-history.md` says a moved target "computes the merge
   again" without saying the committed resolution is set aside and the conflict
   is resolved again, and it covers only `reason: conflict`: an adapter
   `blocked` or `refused` result is also labelled `conflict` with an empty
   `conflictedPaths`, where no merge may be stopped.
5. **Residue.** `closure-story-integration-agent-credit.test.mjs` names
   `publish-the-candidate.md` for a command now in
   `preserve-published-history.md`; `racingTrunkWriter` in
   `story-branch-landing-conflict.spec.ts` builds a second PATH `git` wrapper
   beside `launchLandingFault.ts`; `mergeCount` counts 1 on the unmerged-paths
   return although no merge ran; the first receiver journey in
   `story-branch-landing-conflict.spec.ts` repeats the node test's assertions
   on `MERGE_HEAD`, status, parents and content at real-start cost.

## Current decisions

- **A taken candidate is never left unreferenced.** When retention fails for a
  resolved `HEAD`, the workspace stays on it, so the same command takes it
  again. Considered: writing a rescue ref; rejected because the detached
  `HEAD` already is the state the rerun reads.
- **Only the merge `integrate` stopped is taken.** The candidate's first
  parent is the fetched target's tip and its second the published tip.
  Considered: accepting either order, as plan 294 delivered; rejected because
  it reorders trunk's first-parent history and bypasses the backlog adapter
  for a merge made elsewhere. This narrows plan 294's delivered behavior and
  is the developer's to overrule before Take.
- **An uncommitted merge is a preserved result.** A `MERGE_HEAD` naming the
  published tip with nothing unmerged answers `preserved` with its own reason
  and leaves the workspace untouched; committing it is the agent's step, as
  for a conflict.

## Observed premises

Observed on 2026-10-11 at `a5c55a56` in the execution worktree, by the
independent outcome review, in scratch repositories under the job's temporary
directory (bare origin; `main` and `story` each change `f.txt`), running
`node src/skills/dough-execute-plan/scripts/history-preserving-publication.mjs integrate --workspace … --published-tip <B> --branch story --target-ref refs/heads/main`.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| A failed retention on a resolved `HEAD` returns to the branch and the next run meets the conflict again | Slice 1 | Add `--landing-context` whose origin is `http://127.0.0.1:9`; run, resolve, commit, run, run | Run 2: stderr `fetch failed` with a `Retry reporting only:` command, exit 2, workspace on `story`, `git branch --contains <resolved>` empty. Run 3: `preserved` / `conflict`, `UU f.txt` |
| A staged, uncommitted resolution makes the rerun exit 2 and drops `MERGE_HEAD` | Slice 2 | Run, resolve, `git add`, run | `error: Your local changes … would be overwritten by merge`, exit 2, no printed result, `MERGE_HEAD` gone, change staged on detached trunk |
| A clean merge left in progress behaves the same | Slice 2 | `git merge --no-ff --no-commit <B>` on detached trunk without a conflict, run | Same error and exit 2 |
| A merge of trunk into the story branch is published | Slice 3 | On `story`: `git merge origin/main`, resolve, commit, run | `published`; `git log --first-parent origin/main` lists merge, story commit, base, with the trunk commit off that line |

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| A resolved merge survives a failed retention and is published by the next run | Slice 1: node test in `closure-story-conflict-cases.mjs` with a landing context whose origin refuses (thrown error, `HEAD` still the resolved merge, the rerun with a reachable receiver or no context publishes it); `story-branch-landing-conflict.spec.ts` closes the real receiver before the resolved run, restarts it, and asserts the pair recorded |
| An uncommitted merge is preserved with a result | Slice 2: node test through the CLI for a staged resolution and for an identity-refused merge: exit 1, `preserved` with the new reason, `MERGE_HEAD` and index unchanged; after the commit the rerun publishes |
| Only the stopped merge is taken | Slice 3: node test: a merge with the story as first parent is not taken (the merge is computed again from the fetched target); the existing resolved journeys stay green |
| The residue is gone | Slice 4: the conflict and agent-credit node tests and the four `story-branch-landing-*` specs; typecheck |

## Ordered slices

### 1. A resolved merge survives a failed landing retention
Type: Behavior
Status: planned
Proof: The node test and receiver journey above.

Behavior: A launch's conflicted integration is resolved and committed; the
dashboard cannot be reached → `integrate` fails as today with its retry
command, and the workspace stays on the resolved merge → the same command run
again takes that merge, retains its pair, pushes and records it.
`preserve-published-history.md` says the resolved merge stays in the workspace
when the run fails before its push.

Safe stopping point: a rebuilt candidate still returns to its branch.

### 2. An uncommitted integration merge is preserved
Type: Behavior
Status: planned
Proof: The node test above; `closure-story-integration-agent-credit.test.mjs`
stays green.

Behavior: The stopped merge is resolved and staged, or was left clean by an
identity refusal → `integrate` prints `preserved` with a reason naming the
uncommitted merge, exit 1, and changes nothing → the agent commits it → the
next run publishes that commit. The guidance names this reason beside
`conflict`, and says an adapter `blocked` or `refused` result follows the
adapter's status instead of the two steps.

Safe stopping point: a conflict with unmerged paths answers as today.

### 3. Only the merge `integrate` stopped is taken
Type: Behavior
Status: planned
Proof: The node test above; the resolved journeys of plan 294 stay green.

Behavior: `HEAD` is a merge whose first parent is the published tip → it is
not taken; the merge is computed again from the fetched target. The guidance
says a moved target sets the committed resolution aside and the conflict is
resolved again on the new merge.

Safe stopping point: the stopped merge, trunk first, is taken as today.

### 4. The conflict proof has one fault seam and no repeated assertions
Type: Structure
Status: planned
Proof: The conflict and agent-credit node tests; the four
`story-branch-landing-*` specs; typecheck.

Internal change: `launchLandingFault.ts` gains the racing writer and
`racingTrunkWriter`'s wrapper goes; the first receiver journey keeps the
receiver's record and preparations and drops the assertions the node test
owns; the agent-credit test's comment names `preserve-published-history.md`;
`mergeCount` counts only merges that ran. Owned directly by this correction
(finding 5).

Safe stopping point: no behavior changes.
