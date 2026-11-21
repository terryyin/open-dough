# Attribute every workflow session’s published changes

**Identity:** SEED-418#attribute-every-workflow-session-record
**Source:** [Attribute every workflow session’s published changes](../../seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record)
**Split from:** SEED-418#review-published-session-changes (plan 739 at `2d82175d5:.planning/slice-plans/739-review-published-session-changes/PLAN.md`) on 2026-11-21 at its delivered slice-2 boundary

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.
It resumes through story refinement and plan realignment; the original slices'
readiness does not carry over. [provisional-source-review.md](provisional-source-review.md)
predates this story's refinement.

## Goal and provisional scope

Every publishing session, not just a standalone Land, leaves a faithful
published record that later story reviews and follow-ups can refer to by its
stable UUID. Story Wrap-up and Land close refinement, execution and ad hoc
story follow-ups, including earlier publications on trunk or a story branch.
Records carry multiple ranges when intervening work makes an enclosing range
inaccurate, mark shared-checkout uncertainty, keep the UUID and original close
time on retry, and associate the story identity. Records stay current for 30
days and are pruned afterwards. The record contract
(`.planning/sessions/<uuid>.json`,
`{version:1, sessionId, workflow, closedAt, story?, ranges:[{base,candidate}]}`),
the standalone Land publication (`publishSessionClose` in
`Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs`)
and the Dashboard reader come from SEED-418#review-published-session-changes.

## Current decisions

Carried from plan 739 for refinement to confirm.

- The workflow keeps the UUID and enough accepted-publication evidence to
  retry a close before retiring its checkout. Reusing a checkout or story
  identity conveys no session identity.
- Reuse the accepted candidate/base pairs and Git containment checks in the
  [publisher](../../../Distribution/src/skills/dough-execute-plan/references/publish-the-candidate.md)
  and [history-preserving integration](../../../Distribution/src/skills/dough-execute-plan/references/preserve-published-history.md).
  Preserve exact branch hashes and the order of independent ranges. Where
  integration repeats a branch contribution, represent that work once and
  retain separately attributable integration changes. Reuse the authorized
  publication path for the record commit after the work is accepted, with
  closure's existing refresh, CI, retirement and reporting owners. Each record
  publication can be retried independently from the work publication.
- Reuse the checkout-log and overlap rules from
  [Default main session commits](../../seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md).
  The [existing capture](../../../dashboard/server/doneCapture.ts) runs on
  local Done and writes local pins. Share its observation rules through a
  store-independent input so closure can settle published evidence before
  retirement, keeping local Done capture and final reporting separate. Every
  disclosed range needs published endpoints. Mark uncertainty where observed
  overlap makes individual attribution unavailable.
- Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  and the [Architectural North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  Preserve one comparison model for all workflow variants and keep changes to
  the publication and observation entry points thin.

## Decisive premises

Carried from plan 739, observed in its preparation workspace on 2026-11-20 at
`9efbd70c1` (advance to `b216770db` left the paths untouched). Refinement
rechecks them against current trunk.

| Consuming operation | Observation |
| --- | --- |
| Accepted publication supplies the comparison used by slices 1 and 2 | Ran distribution Node tests `execution-increment-comparison.test.mjs` and `trunk-closure-rebased-rerun.test.mjs` in the owned checkout. The real temporary Git remote accepted the retry's rewritten candidate with its new base. The pair diff contained just the increment. Closure resumed from the original request after acceptance and retired without replaying the publication. |
| Earlier branch comparisons survive integration and branch deletion in slice 3 | Ran `history-preserving-landing-expectation.test.mjs` against a temporary remote, confirming branch publication carries no one-time trunk landing and the first trunk integration captures once. Separately, with Apple Git 2.50.1, pushed a branch, merged it with both histories, published a sample UUID JSON on trunk and removed the branch. A `git clone --no-local --single-branch` could read the JSON and diff the original exact pair after retirement. Diffing the broader initial base through the merge included `unrelated.txt`. The scratch test exercised Git reachability, with record serialization and Dashboard wiring owned by the slices. |
| Current shared-checkout behavior to reuse in slice 4 | Ran `npm run --silent test:dashboard:backend -- review/ad-hoc-review-subject review/ad-hoc-review-file review/done-kept-session-shared-checkout`. All 17 cases passed in the Vitest profile. Two overlapping sessions in the same checkout show uncertainty; isolated and nonoverlapping sessions do not. |
| Refinement closure still releases the assignment with its accepted result in slice 5 | Ran `preparation-assignment-land.test.mjs` against a temporary remote. The accepted snapshot retained the queued story's recorded facts, removed only its own assignment and kept the other profiles. The new session record has its own acceptance after that snapshot. |

## Outside-in proof

| Promise | Owning slice and observation |
| --- | --- |
| Retry after work or record acceptance | 1. Interrupt record publication before acceptance and lose its response after acceptance in separate temp-origin cases. Resume at the first unfinished stage, with one work publication, one UUID file and an unchanged close time. |
| Include earlier trunk and story-branch work with faithful attribution | 2–3. Drive execution publication and wrap-up using real Git. Read every recorded comparison from a fresh clone and assert the first and later changes, the absence of an intervening writer's file, and resolvable branch hashes after retirement. |
| Shared changes carry visible uncertainty | 4. Publish overlapping shared-checkout runs separated by a pull. Review the same runs and their warning on the receiving machine. Assert that pulled-only and unpublished edits are absent. |
| Workflow and story association | 5. Close a refinement and ad hoc follow-up for the same story. The published tree contains independent UUIDs with the correct workflow and story association. Execution variants are proved in 2–3. |
| 30-day lifetime | 6. A controlled clock proves availability just before expiry and removal at expiry. An authorized publication prunes the aged JSON, preserves a live record and leaves the aged one in the earlier published commit. |

## Ordered slices

Provisional slices mapped from plan 739 (old slice → new): 4 → 1, 5 → 2,
6 → 3, 7 → 4, 8 → 5, 9 → 6. Plan 739 keeps old slices 1–2 (done) and the
split old slice 3 as its slices 3–5.

### 1. Resume publishing the same close record

Type: Behavior
Status: planned

**Behavior.** The work is accepted and the record publication fails or loses
its acknowledgement. The workflow can resume the record before retirement,
keeping the original UUID, time and ranges. A later target advance still
allows recognition of an accepted record. A conflicting record under the same
UUID is surfaced instead of replacing its evidence.

**Proof.** Use real remote acceptance and a refused or interrupted record
publication with the existing publication recovery entry point. Assert commit
counts and record bytes on the remote after retry as well as the independent
work and record outcomes.

### 2. Recover earlier trunk publications at wrap-up

Type: Behavior
Status: planned

**Behavior.** An execution session publishes separate trunk increments,
another session lands between them, and the first closes through Story Wrap-up.
Its UUID resolves its accepted ranges, including any accepted retry rewrite,
with neither the intervening commit nor the record commit in the comparison.
Keep per-publication evidence beyond the first trunk landing.

**Proof.** Use the distribution execution-increment and trunk-closure
entry points against one temp origin. From a fresh clone, inspect the record's
diffs and confirm both attributable edits and the absent intervening file.

### 3. Keep story-branch comparisons after integration

Type: Behavior
Status: planned

**Behavior.** Story Branch Mode publishes an earlier increment, integrates and
retires the branch. The close record preserves the attributable branch ranges
and any distinct landing changes. A second clone can inspect the original
published hashes without duplicating the merged contribution.

**Proof.** Drive the history-preserving integration and retirement boundary
against a real temp origin with an intervening trunk commit. Resolve the
record from a default-branch-only clone after the execution branch is gone,
and verify its exact edits and commit membership.

### 4. Disclose ambiguity in a shared checkout

Type: Behavior
Status: planned

**Behavior.** Two sessions share a checkout while producing published commits.
At close, the comparison lists the observed ranges and indicates which may
include shared work. If the log includes a pull or commits that remain local,
those stay out of the recorded contribution. Use the existing Default main
interpretation of checkout-log and overlap evidence at the close boundary.

**Proof.** Run the real shared-checkout log reader and authorized publication
through a focused fixture. Check the published record in a second checkout
and use the existing standalone comparison reader to observe the warning and
exact files. Preserve the current Done capture cases.

### 5. Publish refinement and ad hoc story follow-up associations

Type: Behavior
Status: planned

**Behavior.** A refinement closes through Land and a later ad hoc session
publishes a follow-up to the same story. Each publishes its own UUID and
correct workflow and story identity. The refinement keeps its normal
assignment release as part of the accepted preparation result.

**Proof.** Drive both closure paths and read the two records and the released
assignment from the accepted remote snapshot. The records resolve separate
comparisons even though their story identity is the same.

### 6. Expire current session records

Type: Behavior
Status: planned

**Behavior.** At 30 days, a published session leaves current review. The next
authorized session-record publication removes expired files from its current
snapshot while keeping live records. Reconciliation preserves a concurrent
writer's live file. The original accepted snapshot still contains the aged
record and UUID.

**Proof.** Use a controlled clock at the published read and close boundaries.
Read just before and at expiry, publish with contending temporary writers, then
compare the current and earlier remote snapshots.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  when their test selection applies. Keep default timeouts and omit
  `test.slow()`. Apply the maintainer skill-authoring guidance if editing
  distributed workflow guidance.
- Use `caffeinate -s -i` on AC power for long macOS runs under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Put Bash 5 on `PATH` for the distribution test runner. Run the focused
  distribution checks using `npm test -- <paths>`, the changed Dashboard
  checks through the backend or frontend npm runner, and the focused browser
  journey with `npm run test:e2e -- <spec>`. Check Dashboard types after
  changing its contract or consumers. Run the relevant lint gate.

## Plan review

Not reviewed as this story's plan. Story refinement and plan realignment
precede any slice-plan refinement or execution. This plan depends on
SEED-418#review-published-session-changes for the published record contract
and reader.
