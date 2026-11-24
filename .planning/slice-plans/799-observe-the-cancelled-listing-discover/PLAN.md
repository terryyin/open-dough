# Observe that a failed listing discover cancels the other branch

**Identity:** SEED-423#observe-the-cancelled-listing-discover
**Source:** [Observe that a failed listing discover cancels the other branch](../../seeds/SEED-423-shrink-the-installed-distribution.md#observe-the-cancelled-listing-discover)

## Goal and scope

A maintainer changing `discoverAdapterAttempts` learns from the Dashboard CI
status suite that when one branch's custom CI discover fails, the other
branch's adapter request is stopped, not merely abandoned while it keeps
running. Strengthen the existing case's observation in place; product
behavior is unchanged. Deferred: AbortSignal delivery assertions, a separate
cancellation case, non-ciAdapter discover cancellation, and comparison-mode
cancel behavior beyond this case.

## Current decisions

- `discoverAdapterAttempts` in `dashboard/server/baseCiAdapterAttempts.ts`
  aborts the other listing through `ended.abort()` when one branch's discover
  rejects. The case "a ciAdapter story branch whose main discover fails is
  unread with its reason, never passed, without waiting for its own" in
  `Distribution/tests/support/dashboard-story-branch-ci-adapter.test.mjs`
  already reaches that path: main fails and the story branch's adapter is
  delayed 5 s. It reads `events` right after rejection and then removes the
  root, so it cannot tell cancellation from abandonment.
- Strengthen that observing assertion in place rather than adding a case:
  keep the adapter log outside the removed root, wait past the delayed
  adapter's delay, and assert it never logged its end. Keep the unread
  judgment and early-return timing. Apply
  [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) to the support
  test and keep the default test timeout.
- Direction chosen against adding a second case or coupling to AbortSignal
  internals: the black-box log after the delay window distinguishes cancel
  from abandon with the smallest change that still catches the Intent Coverage
  fault.

## Decisive premises

| Consuming operation | Observation and result |
| --- | --- |
| The cancellation assertion distinguishes the fault | Dough Intent Coverage at `c8c3aa62a`: with `ended.abort();` commented out, the focused node suite passed 121 of 121. A scratch witness importing `discoverAdapterAttempts`, failing `main` and delaying `codex/x` by 2.5 s, logged `["start codex/x","start main"]` on the restored code and `["start main","start codex/x","end codex/x"]` under the fault. Re-checked on this preparation's HEAD: the same comment-out leaves `Distribution/tests/support/dashboard-story-branch-ci-adapter.test.mjs` green (6/6), including the weak cancellation case. |

## Slices

### 1. The failed-discover case observes the stopped listing

Type: Structure
Status: planned

Strengthen the existing case's observation as decided above.

**Proof.** With `ended.abort();` removed in a scratch edit, the strengthened
case fails; restore it. The restored suite
`Distribution/tests/support/dashboard-story-branch-ci-adapter.test.mjs`
passes, and the case's added wait stays within the default timeout.

## Verification and delivery

- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run the focused support test through its maintained runner, apply the normal
  post-change refactor, and use the commit and publication gates.

## Preparation review

- Slice-plan refinement: not needed — one Structure slice, proof already maps
  the Intent Coverage fault, and no cumulative-design or sizing concern remains.
- Remaining slice-specific concerns: none.
