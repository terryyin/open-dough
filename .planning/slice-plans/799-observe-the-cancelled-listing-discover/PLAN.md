# Observe that a failed listing discover cancels the other branch

**Identity:** SEED-423#observe-the-cancelled-listing-discover
**Source:** [Observe that a failed listing discover cancels the other branch](../../seeds/SEED-423-shrink-the-installed-distribution.md#observe-the-cancelled-listing-discover)

## Goal and scope

The Dashboard CI status test shows that when one branch's custom CI discover
fails, the other branch's adapter request is stopped, not merely abandoned
while it keeps running. Product behavior is unchanged.

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
  adapter's delay, and assert it never logged its end. Apply
  [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) to the support
  test and keep the default test timeout.

## Decisive premises

| Consuming operation | Observation and result |
| --- | --- |
| The cancellation assertion distinguishes the fault | Dough Intent Coverage at `c8c3aa62a`: with `ended.abort();` commented out, the focused node suite passed 121 of 121. A scratch witness importing `discoverAdapterAttempts`, failing `main` and delaying `codex/x` by 2.5 s, logged `["start codex/x","start main"]` on the restored code and `["start main","start codex/x","end codex/x"]` under the fault. |

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
