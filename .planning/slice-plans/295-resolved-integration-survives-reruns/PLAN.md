# A resolved integration survives a failed or early rerun

**Identity:** SEED-088#resolved-integration-survives-reruns
**Source:** [correction story](../../seeds/SEED-088-dashboard-story-code-review.md#resolved-integration-survives-reruns),
written 2026-10-11 by the execution retrospective of
`SEED-088#landing-capture-after-integration-conflict` (story and plan 294
recoverable at `961c03c285141f2ad7f9fbfd80d099197fce0373`:
`.planning/seeds/SEED-088-dashboard-story-code-review.md#landing-capture-after-integration-conflict` and
`.planning/slice-plans/294-landing-capture-after-integration-conflict/PLAN.md`; commits
`9aa4ec9f`, `f4cbf529`, `5f6ab04c`, `a5c55a56` on
`claude/a-conflicted-story-branch-integration-still-reco`). Planning only; this
plan grants no Take, execution, or publication.

## Goal and boundaries

Plan 294 made `integrate` take a hand-resolved merge as its candidate. The
resolution is now work only the agent holds, and early or failed reruns the guidance
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
3. **The guidance omits what these states need.**
   `preserve-published-history.md` says a moved target "computes the merge
   again" without saying the committed resolution is set aside and the conflict
   is resolved again, and it covers only `reason: conflict`: an adapter
   `blocked` or `refused` result is also labelled `conflict` with an empty
   `conflictedPaths`, where no merge may be stopped.
4. **Residue.** `closure-story-integration-agent-credit.test.mjs` names
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
- **Existing accepted merge parent orders remain accepted.** Plan 294 takes a
  resolved merge in either parent order. The proposed trunk-first restriction
  changed that delivered behavior and contradicted this correction's preserved
  boundary. Terry's 2026-10-11 instruction to resolve readiness is satisfied by
  preserving the current contract and removing that proposed restriction and
  its slice. Changing which merges are accepted is outside this correction.
- **An uncommitted merge is a preserved result.** A `MERGE_HEAD` naming the
  published tip with nothing unmerged answers `preserved` with its own reason
  and leaves the workspace untouched; committing it is the agent's step, as
  for a conflict. Slice 2 answers this for any merge in progress with nothing
  unmerged, whatever `MERGE_HEAD` names: checking out the target would drop
  that merge too, and the conflict answer likewise does not ask which merge
  left the unmerged paths.

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
| A merge of trunk into the story branch is currently accepted | Preserved compatibility | On `story`: `git merge origin/main`, resolve, commit, run | `published`; this correction preserves that behavior |

### Receiver restart premise settled on 2026-10-11

Observed in this preparation's checkout,
`.worktrees/a-resolved-integration-survives-a-failed-or-earl`, at
`7b941f04135db373428fee05148d608ee48b26db`, with the actual
`startOrigin`, `startPreview`, `claimedLaunchWithStoryCommit`, and
`startDashboardServer` fixtures used by `story-branch-landing-conflict.spec.ts`.
The disposable `preparation-receiver-restart-probe.spec.ts` ran with:

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/preparation-receiver-restart-probe.spec.ts
```

One selected test passed, exit 0. It launched a conflicted Story Branch
integration, resolved and committed it, closed the real receiver, and observed
the integration fail with `fetch failed` while origin stayed at the fetched
trunk tip. It restarted `startDashboardServer` with the same `machine`,
`prebuilt: builtDashboardDir`, and `port: Number(new URL(oldOrigin).port)`.
The original endpoint, session, and reporting context were unchanged. A later
integration recorded the resolved merge and one retained pair on that same
launch record, using the original landing context.

The current product loses the detached resolution on the offline run, so the
probe explicitly restored that scratch precondition before the final run.
This observation proves the receiver restart setup, not the retention repair;
Slice 1's permanent regression must omit that restoration and assert the
resolved `HEAD` survives the failed run. The disposable probe was removed.

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| A resolved merge survives a failed retention and is published by the next run | Slice 1: node test in `closure-story-landing-retention-cases.mjs` with a landing context whose origin refuses (thrown error, `HEAD` still the resolved merge, the rerun with a reachable receiver or no context publishes it); `story-branch-landing-conflict.spec.ts` closes the real receiver before the resolved run, restarts it, and asserts the pair recorded |
| An uncommitted merge is preserved with a result | Slice 2: node test through the CLI for a staged resolution and for an identity-refused merge: exit 1, `preserved` with the new reason, `MERGE_HEAD` and index unchanged; after the commit the rerun publishes |
| Existing accepted resolved merges remain accepted | Keep `headMerges`' existing parent-order behavior unchanged; the existing resolved journeys stay green |
| The residue is gone | Slice 3: the conflict and agent-credit node tests and the four `story-branch-landing-*` specs; typecheck |

## Ordered slices

### 1. A resolved merge survives a failed landing retention
Type: Behavior
Status: done
Proof: The node test and receiver journey above. Accepted:
`closure-story-landing-retention-cases.mjs` (run by
`closure-story-integration.test.mjs`) asserts the rejected run leaves `HEAD`
detached on the resolved merge with nothing pushed and the next run publishes
it, and that a rebuilt merge still returns to its branch;
`story-branch-landing-conflict.spec.ts` "a resolved merge stays checked out
when the dashboard is closed, and the run after its restart publishes and
records it" asserts the one recorded pair on the original launch.

Behavior: A launch's conflicted integration is resolved and committed; the
dashboard cannot be reached → `integrate` fails as today with its retry
command, and the workspace stays on the resolved merge → the same command run
again takes that merge, retains its pair, pushes and records it.
The receiver journey uses the verified same-machine, same-port restart above,
checks the original launch/session and landing context, and contains no
scratch restoration of the resolved merge.
`preserve-published-history.md` says the resolved merge stays in the workspace
when the run fails before its push.

Safe stopping point: a rebuilt candidate still returns to its branch.

### 2. An uncommitted integration merge is preserved
Type: Behavior
Status: done
Proof: The node test above; `closure-story-integration-agent-credit.test.mjs`
stays green. Accepted: `closure-story-uncommitted-merge-cases.mjs` (run by
`closure-story-integration.test.mjs`) runs the CLI for a staged resolution and
for an identity-refused merge; `assertPreservedThenPublished` asserts exit 1,
`preserved` / `uncommitted-merge`, unchanged `HEAD`, `MERGE_HEAD`, index tree,
status and branch, nothing pushed, and the committed merge published by the
next run.

Behavior: The stopped merge is resolved and staged, or was left clean by an
identity refusal → `integrate` prints `preserved` with a reason naming the
uncommitted merge, exit 1, and changes nothing → the agent commits it → the
next run publishes that commit. The guidance names this reason beside
`conflict`, and says an adapter `blocked` or `refused` result follows the
adapter's status instead of the two steps.

Safe stopping point: a conflict with unmerged paths answers as today.

### 3. The conflict proof has one fault seam and no repeated assertions
Type: Structure
Status: done
Proof: The conflict and agent-credit node tests; the four
`story-branch-landing-*` specs; typecheck. Accepted: those, plus the
`one-shot-landing-recovery*` specs that share `launchLandingFault.ts`;
`closure-story-conflict-cases.mjs` and
`closure-story-uncommitted-merge-cases.mjs` assert `mergeCount` 0 for the
unmerged-paths rerun and the uncommitted merge and 1 for the moved-target
recompute.

Internal change: `launchLandingFault.ts` gains the racing writer and
`racingTrunkWriter`'s wrapper goes; the first receiver journey keeps the
receiver's record and preparations and drops the assertions the node test
owns; the agent-credit test's comment names `preserve-published-history.md`;
`mergeCount` counts only merges that ran. Owned directly by this correction
(finding 4). The moved-target guidance says the committed resolution is set
aside and the conflict is resolved again on the new merge. It adds no
parent-order restriction.

Safe stopping point: no behavior changes.

## Execution complete

Product advice: no backlog change. The review found no bug or regression and
planned no correction. Two low-impact observations stay unplanned: the
`uncommitted-merge` guidance says to commit and rerun, and for a merge that is
not this integration's on a detached `HEAD` the rerun publishes a rebuilt
merge and sets that commit aside (the command cannot produce that state, and
the earlier behavior lost more); the first receiver journey in
`story-branch-landing-conflict.spec.ts` is now mostly contained in the
second, at the cost of one real start.

## Story obligations

### G1. Receiver refusal and timeout are not exercised separately
Reported: slice 1 — "A receiver refusal (HTTP non-ok) or the 10-second timeout as the retention failure is not tested separately. They go through the same catch; only connection refused and a closed receiver are exercised."
Story clause: "keeps a resolved merge in the workspace when landing retention fails"
Disposition: proved by slice 1: `publishHistoryPreservingCandidate` has one catch around `retainLandingComparison` for every thrown retention failure; `closure-story-landing-retention-cases.mjs` and the closed-receiver journey observe that catch keeping the resolved `HEAD`

### G2. `mergeCount` reads 1 for an uncommitted merge
Reported: slice 2 — "the `uncommitted-merge` result currently reports `mergeCount: 1` although no merge ran, the same residue as the unmerged-paths return."
Story clause: "the conflict proof's duplicated fault seam and repeated assertions go"
Disposition: proved by slice 3: `closure-story-uncommitted-merge-cases.mjs` `assertPreservedThenPublished` asserts `mergeCount` 0, and `closure-story-conflict-cases.mjs` asserts 0 for the unmerged-paths rerun

### G3. Other merges in progress are not exercised
Reported: slice 2 — "for a truly foreign merge, \"commit it, then run the same command\" makes the rerun detach to trunk and rebuild, as it already does for any `HEAD` that is not the expected merge. [...] This case is untested." and "Adapter `refused-before-commit`: this status also leaves a merge in progress, so its rerun now takes the `uncommitted-merge` path too. Not tested."
Story clause: "reports an uncommitted merge as a preserved result"
Disposition: proved by slice 2: `constructCandidate` has one `mergeInProgress` check ahead of every checkout, whatever the merge; `closure-story-uncommitted-merge-cases.mjs` observes that check leaving the merge state unchanged

### G4. The adapter `blocked` or `refused` guidance has no test
Reported: slice 2 — "the `blocked`/`refused` wording is guidance only; no test in this slice exercises an adapter `blocked` result."
Story clause: "the guidance names those states and the moved-target rerun"
Disposition: proved by slice 2: `preserve-published-history.md` "Resolve a conflicted integration" names the empty-`conflictedPaths` adapter answer; the result shape it describes is `constructCandidate`'s existing adapter return, unchanged by this correction

## Execution context

Story Branch Mode in `.worktrees/a-resolved-integration-survives-a-failed-or-earl`
on `claude/a-resolved-integration-survives-a-failed-or-earl`, remote `origin`,
trunk `main`. Claim `85c000159d24762067a585c36cf690d2a77aab41` accepted on
`main`; increments publish to the execution branch. Slice 1 accepted there
at `475f4a45d3d7e1c0808950de1ab51ca5b2651790` and slice 2 at
`b3812abe9b061c499c8837731cdb0d2a39f010e5`, slice 3 at
`8420aaf3d8457628c6471d1b73ea5dce5bf61aa2`.

## Learnings

- The refactor pass moved the retention node tests into
  `closure-story-landing-retention-cases.mjs` and the shared-file conflict
  fixture (`writeShared`, `conflictedLaunch`, `resolveMerge`) into
  `dashboard/tests/support/storyBranchIntegration.ts`; `restartPreview` in
  `support/launchPreview.ts` is the same-port restart. Slices 2 and 3 build on
  those.
- `mergeInProgress` is exported from `history-preserving-candidate.mjs` and
  `returnToBranch` uses it; `integrateCommand`, `runScript` and
  `agentStoryBehindTrunk` live in `closure-git-fixtures.mjs`.
- `constructCandidate`'s answer carries one provenance flag, `mergeRan`; both
  `mergeCount` and staying on a taken resolved merge after a failed retention
  read it.
