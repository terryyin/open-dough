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
Status: done

Strengthen the existing case's observation as decided above.

**Proof.** With `ended.abort();` removed in a scratch edit, the strengthened
case fails; restore it. The restored suite
`Distribution/tests/support/dashboard-story-branch-ci-adapter.test.mjs`
passes, and the case's added wait stays within the default timeout.

**Accepted proof.** With `ended.abort();` removed, the retained log gained
`end codex/x` and failed the new assertion after the unread reason and
early-return checks passed. With cancellation restored, all six focused
cases passed under the default timeout. The independent refactor renamed
the local fixture helper and reran the focused suite successfully.

## Execution complete

Product advice: no change. The existing typed judgment test now proves the
adapter cancellation at the subprocess boundary. The mutation exposed the
original blind spot and confirmed the strengthened assertion catches it.

The test increment `072cebb20df000f950ade5fef4b78653a3c3a896` was accepted on
the execution branch. Process review is deferred to wrap-up after the
automatic Intent Coverage check.

## Verification and delivery

- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run the focused support test through its maintained runner, apply the normal
  post-change refactor, and use the commit and publication gates.
- Local gate on macOS: from an awake machine on AC power, use the maintained
  [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `env PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- Distribution/tests/support/dashboard-story-branch-ci-adapter.test.mjs`.

## Execution context

- Story Branch Mode in the established worktree on
  `codex/observe-that-a-failed-listing-discover-cancels-t`. The Take
  `a4fd82cfd1b91a57325a355d2a76e20da95d9c4e` was accepted on
  `origin/main` and published to the execution branch as its base.
- Codex observer `rio-chan-799` watches GitHub Actions `ci.yml` on the
  execution branch from `/tmp/dough-ci-501/watch-0Dwttp`
  (cell `g103:17`, session `18912`, PID `57517`).

## Preparation review

- Slice-plan refinement: not needed — one Structure slice, proof already maps
  the Intent Coverage fault, and no cumulative-design or sizing concern remains.
- Remaining slice-specific concerns: none.
