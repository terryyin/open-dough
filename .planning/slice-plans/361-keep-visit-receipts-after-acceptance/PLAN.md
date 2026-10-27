# Keep the integration receipt when a post-acceptance visit is refused

**Identity:** SEED-154#keep-visit-receipts-after-acceptance

**Source:** [Correction story](../../seeds/SEED-154-supplier-integration-consumer-reconciliation.md#keep-visit-receipts-after-acceptance),
from the execution retrospective of
SEED-154#harden-supplier-visit-trigger-and-settlement (plan 360, all four
slices done; reviewed commits `25ffa738`, `c01a7b8a`, `b0f843ab`, `76a568ab`;
Take `e2a363f6`). Plan 360 stays recoverable from that history after its
wrap-up.

## Goal and scope

When a supplier integration, Land publication or Trunk closure is accepted, a
visit that cannot run returns a stopped visit beside the accepted receipt
instead of throwing it away; and a Trunk `finish` interrupted after a clean
visit names the rerun that completes it. Preserve plan 360's outcomes: the one
trigger rule, explicit `--supplier-identity`/`supplierIdentity`, the one-call
clean visit, the `--visit-settled` refusal, standalone `visit-consumers`
refusals of bad input, generic publication without supplier meaning, observer
ownership, landing context and retirement. Exclude new visit features, release
and client rollout. No new story dependency is needed. This plan authorizes no
execution.

## Current findings (verified at `76a568ab` in this checkout)

1. **A post-acceptance visit refusal throws away the receipt.** Plan 360 slice
   3 made `visitCurrentConsumers` rethrow `BacklogError` and removed
   `visitSelectedSupplier`'s wrapper
   (`src/skills/dough-execute-plan/scripts/supplier-integration.mjs`).
   `repositoryRoot` turns a Git failure into a `BacklogError`
   (`product-backlog-git-repository.mjs`), so a caller's `--backlog-path` /
   `backlogPath` outside Git now throws after the push was accepted: Trunk
   `finish` reports `step: "git"` and drops `acceptedSha` and observation;
   Story Branch `integrate` exits 2 as a usage error; Land APIs throw. This
   contradicts `publish-reviewed-checkout.md` ("receipt stands even when that
   visit stopped") and the comment on `visitSelectedSupplier`.
2. **An interrupted clean `finish` gets a misleading recovery.** On plan 360's
   one-call path no `--visit-settled` is passed. A rerun after the worktree is
   gone reaches `trunk-closure-visit.mjs`'s worktree-absent stop, which says
   "nothing here can establish its current consumers", although a clean visit
   was already printed and `--visit-settled <acceptedSha>` would finish it.
3. **A new test repeats an existing journey.**
   `tests/support/supplier-integration-late-consumer.test.mjs` (67 lines) runs
   the same late-trunk-consumer path as
   `tests/support/supplier-integration-visit.test.mjs:33`, differing only in
   `branchedSupplier(t, { consumerBeforeBranch: false })`; the script never
   reads the branch's consumers, and `supplier-visit-guidance.test.mjs` pins the
   "even when its branch shows no consumer" wording.

Dismissed in the review: `laterRegistered` against other executions, rebased
finals and superseded candidates; the clean path's `contained`; the unawaited
`runCli`; generic paths; moved guidance sections. `dough-product-backlog/SKILL.md`
(270 lines) predates plan 360, which changed one line; it is not this
correction's residue.

## Current decisions

- **Caller boundary owns the post-acceptance shape.** `visitSelectedSupplier`,
  called only after acceptance, returns any `BacklogError` as the stopped visit
  (`reason: "error"`, its message, the existing recovery). Standalone
  `visit-consumers` keeps refusing bad input, so `visitCurrentConsumers` stays
  as it is.
- **Recovery text, no new state.** The worktree-absent stop's recovery adds
  that a clean `visit` printed by an earlier `finish` lets the agent rerun with
  `--visit-settled <acceptedSha>`; update the `step: "visit"` row in
  `wrap-up-closure-publication.md` to match. No record of the earlier visit is
  added.
- **Fold, keep the premise.** Move the "branch's own discovery is empty"
  premise into the existing journey (or its fixture default) and delete the
  sibling file, keeping each file under 250 lines.

Applicable direction: [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md),
[maintainer guidance](../../../AGENTS.md).

## Preparation observations

Observed in this checkout at `76a568ab` on 2026-10-27: `visitSelectedSupplier`
called with `backlogPath: "no-such-dir/PRODUCT-BACKLOG.md"` threw
`BacklogError … no-such-dir is not inside a Git repository.` (finding 1). The
worktree-absent recovery text was read at `trunk-closure-visit.mjs` lines
80–88 (finding 2).

## Outside-in proof

| Promise / boundary | Owner | Required observation |
| --- | --- | --- |
| Accepted receipt survives a refused visit | Slice 1 | Installed `integrate --supplier-identity` (and Trunk `finish`) with a backlog path outside Git: accepted receipt with `visit.status: "stopped"`, `reason: "error"`, exit as for any stopped visit, not `step: "git"`/exit 2; fails on current code. Standalone `visit-consumers` non-full revision refusal unchanged. |
| Interrupted clean finish names its rerun | Slice 1 | Worktree-absent `finish` rerun without `--visit-settled` names `--visit-settled <acceptedSha>` in its recovery; that rerun completes and retires. |
| No duplicate late-consumer journey | Slice 1 | One journey covers a late trunk consumer for a branch whose own discovery is empty; supplier integration suites green. |

## Ordered slices

### 1. Keep the receipt and name the rerun

Type: Behavior
Status: planned
Proof: Cases in `tests/support/supplier-integration-visit.test.mjs` and
`tests/support/supplier-trunk-closure-visit-recovery.test.mjs` (or siblings
under 250 lines) through the installed CLIs; scratch-disable each change and
observe its case fail; plus `supplier-*.test.mjs`,
`supplier-visit-guidance.test.mjs`, `ci-completion-lifecycle-guidance.test.mjs`
and `trunk-closure*.test.mjs` touched by the recovery text, through
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 bash scripts/test.sh <paths>`.

Behavior: Given an accepted publication whose visit is refused, the caller
receives the receipt with a stopped visit; given a clean `finish` interrupted
after retirement began, the rerun's recovery names `--visit-settled <acceptedSha>`.

Safe stopping point: correction complete.

## Learnings and concern review

Slice-plan refinement was not needed: one small Behavior slice owns both
recovery outcomes and the test fold, each with its own failing observation.
No remaining slice-specific concern was identified; finding 1's premise was
observed above and finding 2 is a text path read directly. No human decision
is required.
