# Prove the Mark as done rule for every reading it reads

**Identity:** SEED-104#prove-mark-as-done-rule
**Source:** [correction story](../../seeds/SEED-104-confirm-mark-as-done.md#prove-mark-as-done-rule).
**Kind:** Bounded retrospective correction of
confirm Mark as done (story recoverable at
`662cd7a4:.planning/seeds/SEED-104-confirm-mark-as-done.md#confirm-mark-as-done`).
**Prepared:** 2026-10-05, by that execution's retrospective.

## Provenance

Original contract: SEED-104#confirm-mark-as-done and its plan
`662cd7a4:.planning/slice-plans/246-confirm-mark-as-done/PLAN.md`. Related commits:
`0ae01bd4` (slice 1), `01f7d61f` (slice 2), `4f6d9f89` (CI repair),
`8df2e91b` (slice 3), `04567b76` (slice 4).

## Current findings

- `unfinishedIntention` (`dashboard/src/sessionShown.ts`) treats Cursor's
  held labels `cursorHeldLabel.working` and `.waiting` as working and
  waiting, as the story requires, but no test drives either label into the
  rule (`grep cursorHeldLabel dashboard/tests` finds only follow-up label
  checks). The precedence of a working or waiting reading over an
  `unfinished` or `completed` report is likewise unproven except for a
  Claude `completed`-then-Working journey. A changed held label or Cursor
  normalization would silently give a busy Cursor session one-click Done.
- The new journeys each define the same native stop-call filter:
  `agent-launch-done-question.spec.ts`, `agent-launch-done-question-follows.spec.ts`,
  `agent-terminal-done-report.spec.ts`, `agent-terminal-done.spec.ts`, and
  `session-unread-report.spec.ts`.

## Preserved promises and constraints

All SEED-104#confirm-mark-as-done promises and wording stay unchanged; no
product code changes. Journeys keep every observation they make today.

## Outside-in proof

Rule checks run as pure Playwright tests beside
`dashboard/tests/session-unread-rule.spec.ts`, which already reads
`sessionShown.ts` without a page. Run with `NODE_ENV` unset:
`npx playwright test --config dashboard/playwright.config.ts --reporter=line <spec>`,
plus `npm run lint` and `npm run typecheck:dashboard`.

| Promise | Slice |
| --- | --- |
| Each reading and report combination the rule distinguishes yields its statement or none | 1 |
| Journeys count stop calls through one shared step | 2 |

## Ordered slices

### 1. The rule's readings and reports are checked without a page
Type: Behavior
Status: done
Proof: New `dashboard/tests/done-question-rule.spec.ts`: `completed` with
an idle Claude reading and with Cursor `at the follow-up prompt` → none;
Cursor held `working` with a `completed` report → “still working…”; Cursor
held `waiting for an answer` with a `completed` report → “waiting for your
input.”; Claude waiting with an `unfinished` report → “waiting for your
input.”; `unfinished` while idle → “reported unfinished work.”; no report
while idle → “has not reported its work complete. It reads <reading>.”
Removing either Cursor label from the rule fails a case.
Accepted: 7 table cases pass, each asserting `unfinishedIntention` directly
(idle Claude is the `review` reading, “Ready for review”); removing
`cursorHeldLabel.working` or `.waiting` from the rule fails one case each.
Expected wording comes from `support/markDone.ts`; reports come from the new
shared `support/completionReport.ts`, which `session-unread-rule.spec.ts`
now uses too.

### 2. Journeys count native stop calls through one support step
Type: Structure
Status: done
Proof: The five specs named above use one exported step from
`dashboard/tests/support/markDone.ts` and still pass unchanged in what they
assert:
`npx playwright test --config dashboard/playwright.config.ts --reporter=line agent-launch-done-question agent-terminal-done session-unread-report`.
Accepted: the refactor pass placed the step on the fake itself,
`claudeStopCalls()` in `dashboard/tests/support/fakeClaude.ts` beside
`claudeLaunchCalls()`, since delete journeys count the same native call; the
five specs and ten more done and delete specs use it, leaving it the only
`stop` filter. `npx playwright test --config dashboard/playwright.config.ts --reporter=line agent-launch-done agent-terminal-done session-unread-report agent-launch-card-done agent-launch-delete agent-launch-card-delete agent-launch-recent-delete agent-terminal-delete`
→ 64 passed, assertions unchanged.

## Current decisions

- Cover the rule at its pure function, not with new Cursor journeys; the
  journeys already prove the card and panels consume it.

## Learnings

None yet.

## Execution complete

Product advice: no change. The rule-level checks and the single native stop
step close the coverage gap this correction named; backlog priorities stand.
