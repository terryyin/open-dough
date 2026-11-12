# Speed up provider rate-limit checks

**Identity:** SEED-315#speed-up-provider-rate-limit-checks
**Source:** [Story](../../seeds/SEED-315-provider-rate-limit-checks.md#speed-up-provider-rate-limit-checks)
**Source review:** [source-review.md](source-review.md)

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
Status: done
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
Status: done
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

## Execution complete

Product advice: no change to this story. One supported recommendation for the
developer to decide: the "later proof recovers" Intent comparison case
(`intent-ci-comparison-pending-proof.spec.ts`) spends most of its time in the
product's sequential later-build walk, about 100 fake `gh` starts, and can
approach the 30-second default on a saturated host; recording it as a test
optimization candidate would keep that measured cost owned. The backend
read-boundary cases that still pass one- and two-second waits through
`untilReported` could adopt the owner clock, but each saves little and no
evidence yet makes that worthwhile.

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

## Execution state

- Mode: Story Branch; workspace `.worktrees/speed-up-provider-rate-limit-checks`,
  branch `claude/speed-up-provider-rate-limit-checks`, remote `origin`, target
  `main`. Claim `2ed4aa4fb` accepted on `main`; starting revision `75f37ffcf`.
- Matched baseline on `2ed4aa4fb`, 2026-11-12, AC power, the Verification
  selection, both runs passing:

  | Run | Page case | Stream case | Whole command | Load (1 min) at start |
  | --- | --- | --- | --- | --- |
  | 1 | 33.9 s | 11.5 s | 99.87 s | 37.0 |
  | 2 | 28.6 s | 12.1 s | 58.91 s | 55.5 |

  The host carried unrelated load of 37–55 throughout, so judge the after
  runs relative to these and under comparable load.

- Slice 1 accepted proof, 2026-11-12, uncommitted candidate on `2ed4aa4fb`:
  - Interleaved with a temporary checkout of the base, same selection, page
    case: base 30.5 / 33.3 / 38.1 s (loads 38, 33, 66) against after 9.4 s
    and 24.9 s (loads 31, 49). Fourteen further passing after runs at loads
    35–65 gave 9.5–18.4 s, median 11.9 s. Against the five base runs
    (28.6–38.1 s, median 33.3 s) the page case is about 20 s faster; the
    stream case is unchanged until slice 2.
  - Discrimination: with `owner.advanceOwnerClock(2_000)` removed, the check
    at the directed time is answered 502 held back and
    `expect(headsChecks(callsSince(page, from))).toHaveLength(1)` receives 0.
  - One interleaved after run failed (one of the two cases, 31.4 s and
    22.8 s, whole command 116.78 s at load 55 rising); its output was not
    kept. Sixteen other runs of the same candidate passed, and two runs with
    the base observation suite added as load passed at 19.9 s and 25.3 s.
    The durations scale with host load, so a 30 s default timeout during a
    load spike is the supported explanation, not an observed one. Slice 2's
    three consecutive runs and ordinary CI still own the verdict.
  - Neighbors at one worker, load 30 rising to 70: 10 passed, 1 failed.
    `intent-ci-comparison-pending-proof.spec.ts:31` "later proof recovers…"
    exceeded the 30 s default; it does not use the owner-clock fixture and
    passed alone at 25.6–28.8 s. Its repair is this execution's under the
    failure policy and is delivered separately from the slices.
- Slice 2 accepted proof, 2026-11-12, uncommitted candidate on `9b471af20`,
  the Verification selection run strictly interleaved with the base checkout
  (`2ed4aa4fb`), all six runs passing:

  | Run | Page case | Stream case | Whole command | Load (1 min) at start |
  | --- | --- | --- | --- | --- |
  | base 1 | 26.1 s | 8.8 s | 49.70 s | 24.3 |
  | after 1 | 4.4 s | 2.9 s | 13.32 s | 18.4 |
  | base 2 | 26.9 s | 9.6 s | 47.56 s | 16.2 |
  | after 2 | 4.3 s | 2.1 s | 16.72 s | 17.4 |
  | base 3 | 26.1 s | 8.9 s | 43.03 s | 17.3 |
  | after 3 | 4.5 s | 1.8 s | 15.39 s | 31.6 |

  The page case is about 21.8 s faster and the stream case about 6.8 s
  faster, so the candidate entry is removed. Discrimination: without
  `owner.advanceOwnerClock` the stream case fails at
  `expectSettledPage(page, titlesOfB)`, the owner still holding the read. The
  other case of `revision-stream-lost.spec.ts` passed on the shared
  real-clock owner. The slice 1 failure did not recur in these or two further
  runs.
- Owned repair of `intent-ci-comparison-pending-proof.spec.ts:31`, 2026-11-12,
  after slice 2 (`c90a4d62d`). Measured share of the "later" case at load 45
  (body 15.5 s): the product's sequential later-build walk and its about 100
  fake `gh` starts about 10 s, the shared landing fixture about 2.2 s, the 29
  later commits and their push about 2.7 s. Repair kept:
  `pendingLandedComparison.ts` makes the 29 commits through the existing
  `commitTrunkChanges` batch (29 commits: 837–1235 ms as a loop, 155–275 ms
  as one import, paired in one process); the fixture origin's first-parent
  history is byte-identical with SHAs normalised, and the file passed three
  consecutive runs. The gain is 1–2 s, below end-to-end noise (the same case
  ran 4.4–17.7 s across loads 20–43). Remaining defect: under host load near
  70 the case can still approach the 30 s default; what is left is the
  product walk's one `gh` start per revision, the Node start cost of the fake
  `gh`, and the shared landing fixture, each a product, design or suite-wide
  decision returned to Terry.
- Learning: after a held-back answer the page's next check comes at the
  steady pace unless the page was seen again
  (`revisionCheckSchedule.ts`). The page case therefore holds owner time in
  the first wait, after the page was seen again, and proves the owner's
  refusal there before owner and page time reach the directed time together.

- Learning: a plain-value file-level `test.use({ extraEnv })` replaces the
  owner binding an extended `test` makes; a spec mixing owner-bound and plain
  cases merges the incoming `extraEnv` in a function instead.

## Decisive premises

| Premise | Consuming operation | Form / profile observed | Result |
| --- | --- | --- | --- |
| The released owner, started with the fixture's controlled `Date`, answers limited, holds back with the directed seconds, and admits the read once its time is advanced, behind a real dashboard server | Slices 1–2 approach | `authenticated-read-shared-listing-failures.spec.ts` lines 140–157 at `27c155211`, in the same Playwright dashboard profile; ordinary CI run 43138054742 succeeded on `537cc5832`, its first parent | Settled |
| The wait is held only by the owner, not by the dashboard server | Advancing owner time releases the page's check | Read `dashboard/server` at `27c155211`: `readFailureMessage.ts` and `authenticatedRead.ts` only pass on `waitSeconds`/`retryAfterSeconds`; `heldBack` exists only in `github-request-admission.mjs` and its callers | Settled |
| A started owner does not inherit a preload through the dashboard | Fixture must start the owner itself | `github-request-owner-link.mjs` `#started` deletes `NODE_OPTIONS` at `27c155211` | Settled |
| A page case can bind its dashboard to a private owner endpoint | Slice 1 fixture wiring | `owner-replacement-recovery.spec.ts` overrides `extraEnv` with `privateRequestOwner().env` at `27c155211`; covered by the same CI run | Settled — slice 1's page case runs on it and asserts the started owner still stands |
| Matched durations of both cases on the execution base | Success measure | The selection command above, twice on `2ed4aa4fb` | Settled — see Execution state |
| The whole page journey (listing reuse, diagnostics, visibility reads) runs on an owner whose `Date` is fixed between advances | Slice 1 sizing | Slice 1's page case, every step | Settled |

## Concern evidence

Slice-plan refinement was not needed: two slices, each one case's observable
outcome on one shared mechanism, with proof owned by the cases themselves. No
remaining slice-specific concern; the three open premises are bounded by
slice 1's early probe.

## Local gates

Focused strict selections and the named neighbors, default test timeouts,
shared MakeMe data, no wall-clock waits added. Long macOS runs start awake
under the sleep guard named in Verification.
