# Leave local main synchronized after Trunk Mode publication

## Source

[SEED-008 Story 5](../../seeds/SEED-008-worktree-branch-trunk-sync.md#publish-trunk-mode-from-local-main).

## Goal

A developer whose IDE stays on the local integration checkout finds that
checkout at the exact SHA published to remote trunk after a successful Trunk
Mode publication, without pulling or replaying that publication.

## Scope

Included:

- Inspect the integration checkout before advancing remote trunk, even when
  the push would be a SHA from the execution worktree.
- Fast-forward that checkout's working tree to the exact candidate with
  `git -C <integration-checkout> merge --ff-only <candidate>` before pushing.
- Report success only when local `main`, fetched `origin/main`, the retained
  published SHA, and the execution branch agree and `main...origin/main` is
  0/0.
- Stop without advancing `origin/main` when local `main` has unpublished
  commits that are not this execution's owned suffix, or ownership is
  ambiguous.
- Run rejected-push recovery Git on the integration checkout so a successful
  rewrite also leaves local `main` at the published candidate.

Excluded / deferred:

- Dirty-target publication or rebase-with-uncommitted-changes. Keep today's
  dirty-target stop as present, unpromised behavior; do not add, remove, or
  prove it here.
- IDE settings, `pull.rebase` policy, publishing the execution branch, Story
  Branch Mode, a merge queue or lock service, force pushes, a publication
  helper script, vendor UI tests.

## Assumptions

- The existing publication sequence in
  `src/skills/dough-execute-plan/references/trunk-publication.md` remains the
  only Trunk Mode publication path (queue claim, verified increment, wrap-up).
- `execution-location.md` already names originating, execution, and
  integration checkouts; agents retain those paths.
- Queue-claim publication uses the same candidate steps; proving them from an
  execution worktree covers wrap-up increments. A claim whose originating
  checkout is already `main` is the same fast-forward when the candidate is
  already `HEAD`.
- Deterministic Git fixtures prove the named command sequence and ref
  invariants. Native Cursor sync is out of scope under ADR 0005 as recorded in
  the story.

## PFE and architecture

Responsibility: leave the shared integration checkout at the published trunk
revision after Trunk Mode publication.

Candidates:

- `trunk-publication.md` already owns claim and increment publication, local
  fast-forward, push, recovery, and stops. Change that rule.
- `execution-location.md` restates that exclusive-turn and cleanliness checks
  apply only to shared-target mutation. Align that sentence so SHA-push from
  the execution worktree cannot skip integration-checkout inspection.
- `wrap-up.md` already defers to the increment rule; do not duplicate the
  sequence.
- `ci-target-branch-worktree-test-fixtures.mjs` builds a worktree fixture for
  CI observer SHA coverage, not publication. Do not overload it.
- A new Git publication helper would be a second representation of the same
  rule. Do not add it.

Decision: change the existing publication rule and the restated location gate.
Prove Git invariants with a focused `node --test` fixture beside the other
execute-plan script tests (`tests/execution-ci-runtime.sh` already runs
`src/skills/dough-execute-plan/scripts/*.test.mjs`).

Cites [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(stop-and-fix, continuous integration),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(deterministic checks for this skill behavior; no vendor UI test), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one shared behavioral source). ADR 0007 stays Proposed.

No new North Star topic: this tightens an existing publication contract rather
than introducing a product boundary.

## Proof mapping

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Successful ordinary publication leaves local `main`, `origin/main`, retained SHA, and execution branch equal and 0/0 | 1 | Git fixture after the named FF + push + refresh |
| Unrelated unpublished local-main commits stop without advancing `origin/main`, preserving both bodies of work | 2 | Git fixture: remote SHA unchanged; execution commit still on the execution branch |
| Successful recovery after a concurrent remote advance leaves the same four-SHA / 0/0 agreement on the rewritten candidate | 3 | Git fixture: rejected first push, recover on integration checkout, second push, then 0/0 |
| Genuinely later remote advance may leave local `main` behind | story distinction, not a slice | Not implemented; ordinary later-fetch behind-only is existing Git |
| Dirty local `main` | deferred | Do not add a promised assertion |

## Slices

### 1. Publish a verified increment onto a clean local main
Type: Behavior
Status: planned
Proof: `node --test src/skills/dough-execute-plan/scripts/trunk-publication-local-main.test.mjs` covering the ordinary fixture. After following the named sequence from the execution worktree (fetch, leave an already-based suffix unchanged, `git -C <integration-checkout> merge --ff-only <candidate>`, push that candidate, refresh remote view), `git rev-parse main`, `origin/main`, and `exec/story` are the candidate SHA, `git rev-list --left-right --count main...origin/main` is `0	0`, and the integration checkout is not left with a staged inverse of the increment. The publication rule names that `merge --ff-only` on the integration checkout, forbids `update-ref` / `branch -f` of a branch checked out elsewhere, and forbids reporting success before the four identities agree.

Behavior: Given a disposable repository whose primary checkout is clean `main` at the same SHA as `origin/main`, and an execution worktree whose unpublished suffix is already based on that trunk, publishing the increment leaves local `main`, remote `main`, and the execution branch at that increment and 0 ahead / 0 behind.

### 2. Stop when local main has unrelated unpublished commits
Type: Behavior
Status: planned
Proof: same test file, unrelated-commit fixture. After the stop, `git ls-remote origin refs/heads/main` is still the pre-publication SHA, the execution increment remains on `exec/story`, and the unpublished local-main commit remains on `main`. The publication rule requires inspecting the integration checkout before advancing remote trunk even when the would-be push is `HEAD:main` from the execution worktree, and treats unpublished local-main commits that are not the owned suffix as a stop, not as permission to push the candidate SHA.

Behavior: Given the same worktree layout, local `main` has an unpublished commit that is not the execution's owned suffix, and the execution increment is ready, publication does not advance `origin/main` and both commits remain recoverable.

### 3. Recover a raced remote onto local main before reporting success
Type: Behavior
Status: planned
Proof: same test file, race fixture. First push of the original candidate is rejected. Recovery rebases only the owned suffix onto fetched `origin/main` on the integration checkout, fast-forwards that checkout to the rewritten candidate, and pushes once. After refresh, local `main`, `origin/main`, and `exec/story` are the rewritten SHA and 0/0. The recovery rule does not treat an execution-worktree-only rewrite plus `HEAD:main` push as a successful publication while primary `main` still points at the rejected candidate.

Behavior: Given local `main` was fast-forwarded to this execution's candidate and another writer then advanced `origin/main` with a disjoint commit, rejected-push recovery publishes the rewritten candidate and leaves local `main` at that published SHA.

## Current decisions

- Keep today's dirty-target stop in the publication preconditions; this plan
  does not own changing or proving it.
- Overlapping-file race conflicts already have a publication-rebase-conflict
  stop; this plan proves only the disjoint successful-recovery path that must
  still update local `main`.
- Do not add a merge queue or exclusive-turn implementation; continue to use
  coordinator-declared ownership as the existing rule.

## Learnings

None yet.
