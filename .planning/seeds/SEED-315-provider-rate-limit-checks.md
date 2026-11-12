---
id: SEED-315
status: active
planted: 2026-11-11
planted_during: Terry's early handoff of SEED-303 into five independent optimization stories
trigger_when: Maintainers select this CI test family for faster trustworthy feedback
scope: story
---

# SEED-315 — Speed up provider rate-limit checks

<a id="speed-up-provider-rate-limit-checks"></a>

### Speed up provider rate-limit checks

**Identity:** SEED-315#speed-up-provider-rate-limit-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/598-speed-up-provider-rate-limit-checks/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a7cae822daaedd503e2dee0ed591ece2fc71b4127e4349d27ac62f098f83a1a8","plan":"f8e121bbf8abaf8211beb04b90bd7c0e5538be985fc9991239333b08c85aed32"}}
```

#### Goal

Dashboard maintainers verify provider-directed pacing quickly, without waiting
out real deadlines. Ordinary CI continues to catch the same request-admission
and visible recovery regressions.

#### Scope

- Keep the maintained promises of the
  [rate-limit page case](../../dashboard/tests/observation/auto-refresh-rate-limit.spec.ts)
  and the rate-limited case of the
  [revision stream](../../dashboard/tests/observation/revision-stream-lost.spec.ts):
  a directed wait (`Retry-After`, or a reset time once nothing remains) keeps
  the last snapshot, names when checks resume, offers no Retry and reaches
  GitHub with nothing before that time, even when the page is seen again; the
  check at that time reads what was published and clears the failure; a reset
  later than the steady pace is followed instead of the pace; the steady pace
  then returns; a limited stream closes, stays closed until the directed time
  and reopens with a full freshness bound.
- Pass each directed wait by advancing the time of the actual request owner
  instead of real time. The owner stays the released
  [admission policy](../../src/skills/dough-execute-plan/scripts/github-request-admission.mjs)
  run unchanged in its own process, started by the test with a
  fixture-controlled `Date`, as the maintained
  [owner clock fixture](../../dashboard/tests/support/listingReuseWithOwnerClock.ts)
  already does for listing cooldown. Reuse or extend that fixture; keep one
  owner-clock mechanism.
- Released owner code, its runtime contract, release and installation do not
  change, and no clock setting is added to it. Default production time,
  routing, credentials and process ownership stay as they are. This settles the
  request-owner clock question retained from SEED-303 without new authority.
- A controlled owner serves only the case that controls it; other cases keep
  the real clock.
- Delete the page case's 45-second timeout allowance and both cases' real
  waits for a directed time.
- On keeping the saving, remove the `auto-refresh-rate-limit-real-waits` entry
  from the [test optimization candidates](../TEST-OPTIMIZATION-CANDIDATES.md).
- Preserve ordinary CI selection and equivalent behavioral protection. Use
  shared MakeMe and existing external fixtures. No new internal mocks,
  wall-clock sleeps, retries, skips, timeout inflation or special runner modes
  to obtain a saving. Follow
  [the failure policy](../../AGENTS.md#failing-and-flaky-tests).

Not undertaken here: the backend read-boundary cases that pass one- and
two-second directed waits in real time (backoff, cooldown, resumption, shared
failures, shared request owner). They may adopt the same fixture later.

#### Key examples

- GitHub answers a check with `Retry-After: 2`. The page reports the limit and
  the resume time, shows no Retry and keeps snapshot A. Page time passes to
  just before the directed time, hidden and seen again: no check and no `gh`
  call. Owner and page time then reach the directed time: the page checks.
- That check is answered as limited with a reset time later than the steady
  pace. Page time passes the pace and reaches just before the reset: no check
  and no `gh` call. With B published, owner and page time reach the reset: the
  check reads B, the snapshot is B and the failure clears.
- The following check comes one steady pace later, with no earlier upstream
  request.
- An open stream receives a limited answer directing six seconds. The stream
  closes and nothing reopens or checks before the directed time. Owner and page
  time reach it: the stream reopens, and lost freshness is reported only a full
  bound after that reopening.
- Owner time held before the directed time while page time passes it: the
  owner refuses the read and GitHub is asked nothing. The admission under proof
  is the owner's, not the page's schedule.

#### Success measure

On the same ordinary one-worker selection of the two files, measured before on
the execution base and after, with startup, fixtures and teardown paid, the
page case's time falls by at least 15 seconds and the stream case's by at
least 4 seconds, in repeated passing observations. Retained reference: the
page case cost 20.450–21.624 local case seconds and 25.2–26.1 s in CI, about
20 s of it real waiting; the stream case 10.1 s in CI, 6 s of it a directed
wait. Under machine load, judge the before and after relative to each other.

#### Provenance and evidence

Extracted by Terry's instruction from [SEED-303](SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks),
with the [slice mapping](../evidence/SEED-303-early-handoff/README.md).
Use [comparable-baseline.md](../evidence/SEED-303-early-handoff/comparable-baseline.md) and
[proof-context.md](../evidence/SEED-303-early-handoff/proof-context.md) as retained evidence, not a new baseline.
