# Settle detail reads by default before passing page time to a check

**Identity:** SEED-344#settle-reads-before-passing-page-time
**Source:** [Settle detail reads by default before passing page time to a check](../../seeds/SEED-344-settle-reads-before-passing-page-time.md#settle-reads-before-passing-page-time)

## Goal and scope

Maintainers stop getting revision-check timeouts caused by page time passing
over an in-flight detail read. The ordinary "pass time until the next check"
step settles outstanding page reads first; a journey that deliberately keeps a
read held asks for that through a variant whose name says so.

Included: make `passTimeUntilChecked` settle outstanding page reads before
advancing page time (comment states why); remove `passTimeUntilCheckedAfterSettled`
once the default does the same; give callers that must pass page time while a
read stays held an explicitly named variant; keep existing journey observations
and assertions on the default case timeout. Excluded: product auto-refresh
behavior, raising or overriding timeouts, `test.slow()`, waits on wall-clock
time, and rewriting other active executions' uncommitted work (SEED-324,
SEED-332, SEED-334 — reconcile call sites when merging). This plan authorizes
no implementation by itself.

## Architecture and PFE

Reuse the existing settle-then-check behavior already owned by
`passTimeUntilCheckedAfterSettled` in `dashboard/tests/autoRefreshJourney.ts`
(it calls `untilPageReadsAnswered` then the plain check step). Change that
file's default `passTimeUntilChecked` to own the settle-first rule; do not add
a second helper family or move the responsibility out of the auto-refresh
journey module. No product code, ADR, or North Star topic is implicated: this
is test-journey pacing only. Helper file is under 250 lines; call-site edits
are import and name changes. Re-run `wc -l` on every actual edit.

## Decisive premises

Observed at `071db1eaf` in this workspace (AC power; `caffeinate -s -i`).

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Settling before the check is what AfterSettled already does | Slice 1 helper change | `passTimeUntilCheckedAfterSettled` calls `untilPageReadsAnswered` then `passTimeUntilChecked` (`autoRefreshJourney.ts`) | Settled |
| Making settle the default keeps direction-disclosure and held-before-check journeys green | Slice 1 proof | Scratch: `passTimeUntilChecked` called `untilPageReadsAnswered` first; AfterSettled aliased to it; then `caffeinate -s -i -- npx playwright test` on `direction-disclosure`, `steady-refresh`, `auto-refresh-detail-recovery`, `auto-refresh`, `story-readiness-accessible` → 12 passed in 38.0s; scratch reverted | Settled: hold-then-check callers that start the held read from that check do not hang |
| AfterSettled call sites are rename-only once the default settles | Slice 1 caller update | At HEAD, 43 `passTimeUntilCheckedAfterSettled` name refs outside the helper; 97 plain `passTimeUntilChecked` name refs | Settled |
| Plain settle-first prevents the CI flake class | Slice 1 rationale | Seed evidence: 11 one-off switches to AfterSettled, last `4ffa3df4f` for `direction-disclosure.spec.ts` (CI run 43394751685, dashboard shard 6/13); Terry chose correcting the default | Settled as retained evidence |

## Outside-in proof

| Promise | Slice | Proof |
| --- | --- | --- |
| Default step settles outstanding reads, then the check arrives on steady pace without arming detail recovery | 1 | `dashboard/tests/stories/direction-disclosure.spec.ts` (same-project refresh through loading / replacement / failure) |
| Journeys that hold a detail before the check that starts that read keep their mid-read observations | 1 | `dashboard/tests/observation/steady-refresh.spec.ts`, `auto-refresh-detail-recovery.spec.ts`, `auto-refresh.spec.ts` (held backlog / claims shapes), and `story-readiness-accessible.spec.ts` (queued plan focus while a seed is held) |
| AfterSettled name is gone; former callers use the default | 1 | `rg passTimeUntilCheckedAfterSettled dashboard/tests` empty; former callers import `passTimeUntilChecked` |
| Callers that must pass page time while a read stays outstanding use the named held variant | 1 | Variant exported with a name that says reads stay open; any such caller (audit during the slice) uses it and shows why the read is held; scratch found none among the held-before-check shapes above |

## Ordered slices

### 1. Settle reads by default before passing page time to a check

Type: Behavior
Status: planned
Proof: focused dashboard specs and call-site grep above; consumer trace over
`autoRefreshJourney.ts` exports; `npm run typecheck:dashboard` and full
check-only `npm run lint`

Behavior: a dashboard journey asks for the next revision check through the
ordinary helper → outstanding page reads settle first → page time advances to
the check on its steady pace → detail recovery is not armed by that step. The
helper comment states that reason. `passTimeUntilCheckedAfterSettled` is
removed; its callers use the default. A second export, named so it is clear
reads stay open (recommended: `passTimeUntilCheckedWhileReadsOutstanding`),
keeps the former plain "advance without settling" behavior for a journey that
must pass page time while a held read is already outstanding; its call sites
show why the read is held. Callers that pass with the default need no other
change. Reconcile with SEED-324 / SEED-332 / SEED-334 call sites only when
merging; do not rewrite their uncommitted work.

## Local gates

Slice 1 runs the proof specs above with `caffeinate -s -i` on AC power (on
battery: lid open, `caffeinate -i`, then read `pmset -g log`), per
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos),
plus any further consumer the export trace names, `npm run typecheck:dashboard`,
the full check-only `npm run lint`, and `npm run --silent format`. Hosted CI
(`ci.yml`, push) is the integrated completion check. Apply the project's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. Resolve test paths through the installed MakeMe and page-object
skills (`dashboard/tests`: both). Never sleep in tests, use `test.slow()`, or
raise suite, file, group, or hook timeouts.

## Plan review

Refinement not needed: one Behavior slice, one proof loop, settle-first already
owned by AfterSettled, scratch showed no hung held-before-check callers.
Remaining slice-specific concern: none.

## Current decisions

- Held-variant name: `passTimeUntilCheckedWhileReadsOutstanding` unless a
  clearer existing journey term appears during the slice; the name must say
  that outstanding reads are left open.
- Hold-then-check callers that only start the held read from that check stay
  on the default; switch only callers that must advance page time while a read
  is already outstanding.

## Learnings
