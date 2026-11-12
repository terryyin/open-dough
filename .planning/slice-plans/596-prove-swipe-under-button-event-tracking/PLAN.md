# Prove the phone swipe under button-event pointer tracking

**Identity:** SEED-316#prove-swipe-under-button-event-tracking
**Source:** [Correction story](../../seeds/SEED-316-mobile-terminal-text-selection.md#prove-swipe-under-button-event-tracking)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A bounded correction from the Intent Coverage check of
SEED-316#select-and-copy-terminal-text-on-mobile at
`7981c2cce7c2dab3a354afb371040ac89a76a496`. A maintained test fails when a
one-finger swipe stops giving wheel input to an application that asks for
button-event (`vt200`) or drag (`drag`) pointer tracking.

Preserved: the delivered product behavior, the existing proof under
any-motion tracking and under press-only tracking in
`dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts`,
and the scrollback journeys in `dashboard/tests/terminals/`. No product
source changes; if the new proof exposes a defect, that defect is repaired in
this slice under the failure policy.

## Provenance and current findings

- Reviewed execution: commits `19442de20`, `7b26cc9d3` and `fb62a8266` on
  `claude/select-and-copy-text-in-the-dashboard-terminal-o`; the swipe decision
  arrived in `19442de20`. The reviewed story and its plan are recoverable at
  `ebaf16f6336d2d9111f95984b907a006b67f3c04`:
  `.planning/seeds/SEED-316-mobile-terminal-text-selection.md#select-and-copy-terminal-text-on-mobile`
  and `.planning/slice-plans/591-select-and-copy-terminal-text-on-mobile/PLAN.md`.
- `dashboard/src/terminalTouchScroll.ts` decides by
  `wheelTracking = ["vt200", "drag", "any"]` against
  `terminal.modes.mouseTrackingMode`.
- Intent Coverage, 2026-11-11, scratch worktree of `7981c2cce`: with `"vt200"`
  removed from that list, both tests of
  `agent-terminal-touch-application-scroll.spec.ts` still passed, while a
  scratch copy of its first test whose application announced `?1000h` sent no
  wheel report and left the conversation at line 051. Verdict: confirmed
  missing test path, bounded to those two tests.
- The delivering execution recorded the same limit at acceptance: `vt200` and
  `drag` share the list without a page open of their own.

## Architecture and current decisions

1. The proof stays in the frontend tier with the terminal substitute, where
   the application case is already proved once; this adds its tracking
   variants, as [where a check goes](../../../dashboard/tests/README.md#where-a-check-goes)
   directs.
2. `selfScrollingApplication` in
   `dashboard/tests/support/terminalSubstituteApplication.ts` announces
   `?1003h`. The variants need the tracking the application announces to be a
   fact the test states. Extend that application; add no second one.
3. Prefer the cheapest arrangement that still opens a terminal in each
   tracking mode. One page open per mode costs about four seconds each beside
   the existing full journey; the full place, draft and return assertions stay
   with the existing any-motion test and are not repeated per mode.

## Decisive premises and observations

| Premise / consuming operation | Observation, result and remainder |
| --- | --- |
| The swipe works under `vt200` at the delivered revision (slice 1) | Intent Coverage scratch witness at `7981c2cce`, 2026-11-11, `npm run test:dashboard -- frontend-tests/<witness>`: the application announced `?1049h ?1000h ?1006h`; one five-and-a-half-row stroke sent five `ESC [ < 64 ; 20 ; 1 M` reports and the first conversation line shown went from 051 to 046. |
| The swipe works under `drag` at the delivered revision (slice 1) | Same witness with `?1002h`, run in the execution checkout at `7981c2cce` on 2026-11-11: five wheel reports, then the typed key; first conversation line shown 046; 1 passed. |
| The maintained proof misses the `vt200` path (slice 1's negative control) | Intent Coverage run with `"vt200"` removed: 2 passed. |

## Ordered slices

### 1. A swipe under button-event and drag tracking is proved
Type: Structure
Status: done
Proof: In `dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts`,
a terminal whose application announces `?1000h`, and one whose application
announces `?1002h`, each receive one wheel report per whole row of a finger
stroke and show earlier conversation lines; nothing else is sent. Negative
controls: with `"vt200"` removed from `wheelTracking` the `?1000h` case fails,
and with `"drag"` removed the `?1002h` case fails; the source is restored
after each. The existing two tests stay green with their assertions unchanged.
`npm run test:dashboard -- frontend-tests/agent-terminal-touch-application-scroll.spec.ts dashboard/tests/terminals/agent-terminal-touch.spec.ts dashboard/tests/terminals/agent-terminal-touch-keys.spec.ts`
and `npm run typecheck:dashboard`.

Structure: the test suite's weakness removed is that two of the three tracking
modes the swipe decision names have no page open of their own, so deleting
either from the decision leaves every test green. Product behavior is
unchanged and is proved preserved by the existing application-scroll and
scrollback tests in the same command.

Accepted proof (2026-11-12):
- `selfScrollingApplication` takes optional `tracking` (`?1000h`|`?1002h`|`?1003h`,
  default `?1003h`); cheap mode cases in
  `agent-terminal-touch-application-scroll.spec.ts`.
- Focused command: 7 passed. `npm run typecheck:dashboard`: pass.
  `npm run test:dashboard -- frontend-tests/agent-terminal-touch`: 16 passed.
- Negative controls verified in execution; `terminalTouchScroll.ts` restored.
- Source commitments 1, 2.1–2.3, 3, 4 observed in `source-review.md`.
- Post-change refactor: none — already clean.

Learnings: default `?1003h` kept existing callers green; cheap mode cases are
enough for the Structure gap without repeating place/draft/return.

## Verification and delivery gates

Follow [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
as written in every delegation and repair handoff, and
[AGENTS.md — Test automation](../../../AGENTS.md#test-automation): MakeMe for
domain data, observable events instead of wall-clock waits, the default
timeout, never `test.slow()`. Run the focused command above through
`npm run test:dashboard` from the repository root with
`npm run typecheck:dashboard`, `git diff --check` and the selective pre-commit
gates. The changed support module's other consumers are the frontend touch
terminal specs; run `frontend-tests/agent-terminal-touch` when
`terminalSubstituteApplication.ts` changes. No project rule requires the whole
dashboard suite locally for this change; hosted CI runs it after publication.

Before a longer local run inspect current load and competing work and choose
bounded concurrency. On macOS start fully awake: on AC use `caffeinate -s -i`;
on battery plug in, or keep the lid open under `caffeinate -i` and inspect
sleep logs under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

## Plan concern assessment

Slice-plan refinement was not needed: one slice, one outcome, one proof loop.
No remaining slice-specific concern was found. This plan grants no execution.
