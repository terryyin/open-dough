# Speed up provider rate-limit checks

**Identity:** SEED-315#speed-up-provider-rate-limit-checks
**Source:** [Story](../../seeds/SEED-315-provider-rate-limit-checks.md#speed-up-provider-rate-limit-checks)

## Goal and scope

The rate-limit page case and the rate-limited revision stream case keep their
promises while each directed wait passes on the actual request owner's
controlled time instead of real time. The page case gets at least 15 seconds
faster and the stream case at least 4 seconds faster on the same ordinary
one-worker selection, and the page case's 45-second allowance is deleted.

The owner stays the released code, run unchanged in its own process and
started by the test with a fixture-controlled `Date`. No file under
`src/skills/` other than test fixtures changes; no clock setting, runtime
contract, release or installation change is made. A controlled owner serves
only the case that controls it.

Excluded: the backend read-boundary cases that pass one- and two-second
directed waits in real time through `untilReported` (backoff, cooldown,
resumption, shared failures, shared request owner). `untilReported` stays for
them.

[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps request admission at the machine-local owner; the proof keeps reaching
it through real requests.
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires a measured worthwhile improvement and surviving proof.

## Outside-in proof and existing owners

| Promise | Required observation | Owner |
| --- | --- | --- |
| Directed wait reported | Limit notice with HTTP status, directed seconds and resume time; no Retry; snapshot A and its retrieval time kept | page case |
| Nothing asked before the directed time | Page time to just before it, hidden and seen again: no check, no `gh` call | page case |
| Admission is the owner's | Owner time held before the directed time while page time reaches it: the boundary answers held back and GitHub is asked nothing | page case |
| Check at the directed time | Owner and page time at the directed time: the page checks | page case |
| Reset beyond the pace | Reset-directed wait longer than the steady pace: no check at the pace; the check at the reset reads B, clears the failure | page case |
| Steady pace returns | The next check comes one pace later | page case |
| Limited stream | Stream closes; no reopen, check or listing before the directed time; reopens at it; lost freshness only a full bound after reopening; then catches up to B | stream case |
| Fast feedback | Before and after timing of both cases in one ordinary one-worker command | slice 1 baseline, slice 2 result |

Entry points:
[`auto-refresh-rate-limit.spec.ts`](../../../dashboard/tests/observation/auto-refresh-rate-limit.spec.ts)
and the rate-limited case in
[`revision-stream-lost.spec.ts`](../../../dashboard/tests/observation/revision-stream-lost.spec.ts).

## Verification

Selection, used for the baseline and every comparison:

```sh
env -u NO_COLOR -u FORCE_COLOR /usr/bin/time -p caffeinate -s -i \
  npm run --silent test:dashboard -- --workers=1 --reporter=list \
  --grep 'auto refresh rate limit: a rate-limited check waits|a rate-limited stream answer shows'
```

Local gate on fully awake AC macOS uses
[`caffeinate -s -i`](../../../tests/local-test-resources.md#machine-sleep-on-macos);
on battery follow that section. Record base SHA, command, per-case durations,
whole-command time and host load for each run; under load judge before and
after relative to each other. Require three consecutive passing runs of the
selection for each changed case. Run the neighbors that share changed
support: `authenticated-read-shared-listing-failures.spec.ts`,
`intent-ci-comparison-pending-proof.spec.ts`, the rest of
`revision-stream-lost.spec.ts`, and `owner-replacement-recovery.spec.ts` when
the page fixture's owner wiring is touched. Typecheck and lint the changed
dashboard test paths. Ordinary CI on the candidate and on integrated trunk
gives the final verdict. Apply the
[failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, carried verbatim or by link into every delegation and repair
handoff.

## Ordered slices

### 1. Rate-limit page case passes directed waits on owner time
Type: Behavior
Status: planned
Proof: Early probe first, before any edit: run the selection on the execution
base and record both cases' durations as the matched baseline. Then the page
case, on a dashboard whose request owner was started with the controlled
`Date`, observes every page-case row above with no `untilReported` and no
`test.setTimeout`. The reset header is computed from owner time. Show
discrimination once in scratch: with the owner-time advance removed, the
check at the directed time is answered held back and the case fails; revert.
Three consecutive passing runs; the page case is at least 15 s faster than
its baseline. Neighbors pass.

Behavior: GitHub directs a 2-second wait and then a reset beyond the steady
pace → the test advances owner and page time to each directed time → the page
checks exactly then, reads B at the reset, clears the failure and returns to
the steady pace, with nothing asked earlier and no real wait.

Make the owner-clock mechanism in
[`listingReuseWithOwnerClock.ts`](../../../dashboard/tests/support/listingReuseWithOwnerClock.ts)
usable by a page case (the owner's current time readable, advance, restore,
and start of the real owner entry before the dashboard connects), keeping its
two existing callers on the same mechanism. Bind the page's dashboard to that
owner through the fixture's existing private-owner route, as
[`owner-replacement-recovery.spec.ts`](../../../dashboard/tests/observation/owner-replacement-recovery.spec.ts)
binds its own. If the probe shows the page journey cannot run on a controlled
owner without changing released owner code, stop: that is the reserved
authority, and the decision returns to Terry.

### 2. Rate-limited stream case passes its wait on owner time, and the saving is confirmed
Type: Behavior
Status: planned
Proof: The stream case observes its row above on a controlled owner with no
`untilReported`; "no further listing during the wait" is still observed
across the page-time passage before the directed time. Three consecutive
passing runs of the selection; the stream case is at least 4 s faster and the
page case keeps at least 15 s against slice 1's baseline, all setup and
teardown paid. Remaining cases of `revision-stream-lost.spec.ts` pass on
their unchanged real-clock owner. Remove the
`auto-refresh-rate-limit-real-waits` entry from
[`TEST-OPTIMIZATION-CANDIDATES.md`](../../TEST-OPTIMIZATION-CANDIDATES.md)
and correct the header comments of both specs and of
[`directedWait.ts`](../../../dashboard/tests/support/directedWait.ts) to say
which waits pass on owner time. If either saving is not reached, keep what
passes, record the measured numbers here and leave the candidate entry with
them.

Behavior: An open stream is answered as limited for six seconds → owner and
page time reach the directed time → the stream reopens then, with a full
freshness bound from reopening and catch-up to B, and no real wait.

## Current decisions

- PFE: one owner-clock mechanism. Extend the existing fixture in place; do
  not add a second preload, an environment clock file read by released code,
  or a `NODE_OPTIONS` route (the owner link deletes `NODE_OPTIONS` when it
  starts an owner, so the test starts the owner itself, as the fixture does).
- The request-owner clock question retained from SEED-303 is settled by that
  fixture, landed 2026-11-08 (`fd9248ac0`): released owner code is untouched.
- The owner's `Date` is fixed until advanced; process timers run normally.
  The idle check keeps a connected owner standing whatever its time.
- The dashboard server keeps no wait of its own: it passes on the owner's
  `waitSeconds`, so advancing owner time alone releases reads.
- Retained SEED-303 timings are a lead, not the matched baseline.

## Decisive premises

| Premise | Consuming operation | Form / profile observed | Result |
| --- | --- | --- | --- |
| The released owner, started with the fixture's controlled `Date`, answers limited, holds back with the directed seconds, and admits the read once its time is advanced, behind a real dashboard server | Slices 1–2 approach | `authenticated-read-shared-listing-failures.spec.ts` lines 140–157 at `27c155211`, in the same Playwright dashboard profile; ordinary CI run 43138054742 succeeded on `537cc5832`, its first parent | Settled |
| The wait is held only by the owner, not by the dashboard server | Advancing owner time releases the page's check | Read `dashboard/server` at `27c155211`: `readFailureMessage.ts` and `authenticatedRead.ts` only pass on `waitSeconds`/`retryAfterSeconds`; `heldBack` exists only in `github-request-admission.mjs` and its callers | Settled |
| A started owner does not inherit a preload through the dashboard | Fixture must start the owner itself | `github-request-owner-link.mjs` `#started` deletes `NODE_OPTIONS` at `27c155211` | Settled |
| A page case can bind its dashboard to a private owner endpoint | Slice 1 fixture wiring | `owner-replacement-recovery.spec.ts` overrides `extraEnv` with `privateRequestOwner().env` at `27c155211`; covered by the same CI run | Settled for a private owner; its combination with a pre-started controlled owner is open — bounded by slice 1's probe |
| Matched durations of both cases on the execution base | Success measure | The selection command above | Open — bounded by slice 1's early probe |
| The whole page journey (listing reuse, diagnostics, visibility reads) runs on an owner whose `Date` is fixed between advances | Slice 1 sizing | Not run in preparation: this worktree has no installed dependencies | Open — bounded by slice 1's probe, with its stop |

## Concern evidence

Slice-plan refinement was not needed: two slices, each one case's observable
outcome on one shared mechanism, with proof owned by the cases themselves. No
remaining slice-specific concern; the three open premises are bounded by
slice 1's early probe.

## Local gates

Focused strict selections and the named neighbors, default test timeouts,
shared MakeMe data, no wall-clock waits added. Long macOS runs start awake
under the sleep guard named in Verification.
