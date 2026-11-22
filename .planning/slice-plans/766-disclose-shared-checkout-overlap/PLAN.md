# Disclose shared-checkout overlap in published session records

**Identity:** SEED-418#disclose-shared-checkout-overlap
**Source:** [Disclose shared-checkout overlap in published session records](../../seeds/SEED-418-review-published-session-changes.md#disclose-shared-checkout-overlap)
**Split from:** SEED-418#attribute-every-workflow-session-record (plan 747) at delivered slice 7 on 2026-11-22

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

A developer reviewing a published session from another machine can see when
one of its comparisons may include another session's work from the same
checkout. Pulled-only and unpublished edits stay outside the record, and an
isolated or nonoverlapping session shows no warning.

Plan 747's old slice 8 is the provisional input below. Refinement must settle
the cross-component design recorded in the story's design finding and split
the work into at least two slices before this plan becomes executable.

## Provisional decisions

- Extend the [shared record contract](../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs),
  which the producer and the Dashboard both read, with an optional per-range
  `uncertainty: "shared-checkout"`. Keep records without it readable.
- Reuse the [Default main log interpretation](../../../dashboard/server/sessionCommitAttribution.ts)
  and [checkout overlap rule](../../../dashboard/server/sessionCheckoutShared.ts)
  from [SEED-379](../../seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md).
  Expose their Git observations and interval decision independently of local
  Done and pins. Use the workflow's retained Git evidence as the acceptance
  bound. Only record the resulting comparisons and uncertainty. Keep final
  Dashboard completion after publication, observation and retirement.
- Slice 8 of plan 747 found that `checkoutSharedMeanwhile` reads local launch
  records that the Distribution publisher cannot see. Recommended: the
  Dashboard evaluates overlap at launch and writes a shared-checkout note
  beside each open session's landing context; the publisher marks ranges
  accepted at or after the overlap start; the published review reuses the Done
  shared-checkout warning wording. Suggested split: the note and range
  marking, then the review display end to end.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  keeps launch records local; only the resulting uncertainty is published.

## Decisive premises

| Consuming operation | Result-bearing baseline |
| --- | --- |
| Local overlap rule, old slice 8 | At `3569193c7`, `npm run --silent test:dashboard:backend -- review/published-session-review review/published-session-listing review/done-kept-session-shared-checkout` passed 23 cases. Done capture detects concurrent and previously overlapping activity in the same checkout, distinguishes isolated and nonoverlapping sessions, and shows the existing warning. Its result establishes the local rule. Its use before Done at an accepted close, and the publisher's access to it, are unobserved. |

## Outside-in proof

| Promise | Owner and signal |
| --- | --- |
| Shared-checkout uncertainty and exclusions | Old slice 8. Inspect the affected published range from another checkout. Observe the warning and absence of pulled-only and unpublished edits. |

## Provisional slices

### Old 8. Disclose ambiguity in a shared checkout

Type: Behavior
Status: provisional

**Behavior.** When sessions overlap in one checkout, accepted comparisons that
may include either session's work display that uncertainty. Pulled-only and
unpublished edits stay outside the record. Isolated and nonoverlapping
activity produces a comparison without the warning.

**Proof.** Use two overlapping sessions with timed commits and a pull in a
real shared repository, and a control in an isolated checkout. Drive the
close path with observed checkout intervals and accepted Git pairs. Open
the published range from another clone and check its warning and files.
Keep the existing Done capture observations at their normal entry point.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md) when
  their test selection applies. Keep default timeouts and omit `test.slow()`.
- Use `caffeinate -s -i` on AC power for long local runs under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
