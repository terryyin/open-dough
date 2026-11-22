# Expire published session records after 30 days

**Identity:** SEED-418#expire-published-session-records
**Source:** [Expire published session records after 30 days](../../seeds/SEED-418-review-published-session-changes.md#expire-published-session-records)
**Split from:** SEED-418#attribute-every-workflow-session-record (plan 747) at delivered slice 7 on 2026-11-22

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

Published session records stay current until 30 days after close. At expiry
they leave current review and the UUID route reports them unavailable. The
next authorized session-record publication prunes expired files from the
current snapshot while live records survive; earlier Git snapshots retain them.

Plan 747's old slices 9–10 are the provisional input below. Refinement must
confirm them against the delivered record publication before this plan becomes
executable.

## Provisional decisions

- Use one close-time expiry rule for reads and pruning. Pruning runs against
  the actual candidate base and is recomputed on publication retry.
- Prune within the shared record stage that plan 747 delivered: Land's
  `resumeSessionClose` in
  [`session-record-publication.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs),
  which Trunk Mode `finish` and the Story Branch record adapter also use.
- Follow
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  and the [North Star on directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).

## Decisive premises

| Consuming operation | Result-bearing baseline |
| --- | --- |
| Published listing and review, old slice 9 | At `3569193c7`, `npm run --silent test:dashboard:backend -- review/published-session-review review/published-session-listing` passed with the published routes reading a recorded pair after trunk advances. No expiry boundary was observed. |
| Pruning on publication, old slice 10 | Unobserved. Plan 747 slice 1 observed the record publisher rebasing a record commit onto an advanced target and stopping at `needs-validation`; pruning's recomputation on that retry is unobserved. |

## Outside-in proof

| Promise | Owner and signal |
| --- | --- |
| 30-day expiry and pruning | Old slices 9–10. Check just before and at expiry. Publish against an advanced target, then inspect its live set and the old snapshot. |

## Provisional slices

### Old 9. Stop offering expired published records

Type: Behavior
Status: provisional

**Behavior.** At 30 days from close the repository-backed entry leaves the
current listing and the current UUID route reports it unavailable, including
when its file still exists at the fetched revision.

**Proof.** Freeze the clock around the boundary with a published record on
the configured trunk. Observe listing and review immediately before and at
expiry. Check that the record’s close time controls the boundary
even when the Git commit time differs and that a local kept entry keeps its own lifecycle.

### Old 10. Prune expired records on authorized publication

Type: Behavior
Status: provisional

**Behavior.** The next authorized close removes expired records from the
current snapshot while preserving live files, including a live record from a
writer that advances trunk during publication. The earlier snapshot retains
its record at the original path.

**Proof.** Use a controlled clock and a second writer on a real temporary
origin to force publisher reconciliation. Compare the accepted tree with the
earlier published snapshot and verify that the current close and the
concurrent live record survive, while only the expired session file is removed.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md) when
  their test selection applies. Keep default timeouts and omit `test.slow()`.
- Use `caffeinate -s -i` on AC power for long local runs under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
