# Show lost freshness across repeated revision-stream failures

**Identity:** SEED-240#show-freshness-loss-across-stream-retries
**Source:** [selected story](../../seeds/SEED-240-reliable-dashboard-updates-and-session-details.md#show-freshness-loss-across-stream-retries)
**Source review:** [source-review.md](./source-review.md)
**Prepared:** 2026-11-05; preparation only. Execution is not authorized by this plan.

## Goal and boundaries

A developer watching a streaming Board sees the existing lost-freshness
problem when the 45-second silence bound has passed since the last successful
revision answer (or the observation's start), however many connection
attempts failed in between. The first successful answer clears it. The story
section owns goal, scope, key examples and the selected approach; this plan
does not restate them.

Included: the browser stream schedule's silence deadline, its comments, the
published-observation manual's stream sentence, and one journey proving
failed opens. Excluded (from the story): reporting the first failed open at
once, falling back to revision checks, carrying the bound across observation
restarts, and any server or wording change.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to execution, verification, delegation and repair
handoffs.

**Local gate:** `npm run lint`, `npm run typecheck:dashboard`, and
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/tests/revision-stream-lost.spec.ts dashboard/tests/revision-stream-stopped.spec.ts dashboard/tests/revision-stream.spec.ts dashboard/tests/revision-stream-visibility.spec.ts --reporter=list`
with Homebrew Bash 5 first on `PATH`. The change stays inside the stream
schedule hook, whose consumers are these journeys, so no whole local suite is
required. If a whole suite is run anyway, follow the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i`; on battery plug in or keep
the lid open under `caffeinate -i` and read the sleep log afterwards. Hosted
CI on the published revision remains owned under the failure policy.

## Existing solutions and direction

- **Change the existing deadline, add no second mechanism.**
  `useRevisionStreamSchedule` (`dashboard/src/revisionStreamSchedule.ts`)
  already owns the silence timer, the reopen pace, the lost-stream problem and
  the rate-limit wait. It loses the bound because `open()` re-arms the timer,
  `stopHolding()` clears it, and `onerror` measures from `openedAt` of the
  current attempt. Arm the deadline once when the effect starts, re-arm it on
  each successful answer only, and let it survive an attempt's close. The
  effect cleanup clears it, so every existing observation restart (reveal,
  shown revision, project, limit end, read settled) starts a new bound.
- **Keep closing hung attempts after the warning.** When the deadline fires
  it reports, closes any held attempt and reopens at the pace (today's
  `loseStream(true)`). It must then re-arm for one more bound, so an attempt
  that later connects but never answers is still closed and reopened. The
  scratch observation below stopped re-arming and would have left such an
  attempt held indefinitely.
- **Error handling.** An attempt that errors after answering still reports at
  once. An unanswered attempt's error reports only if the deadline has
  already passed, which the deadline itself covers, so `openedAt` and
  `silentLongEnough` go.
- **Accepted decisions.** The change is browser-local derived state under
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md);
  it adds no server responsibility, request, or stored state. No conflict.

## Decisive premises observed during preparation

Observed in the established preparation workspace on 2026-11-05 at
`67d855934`, after `node scripts/setup-native.mjs npm` and `browser`, with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts <spec> --reporter=list`.
Scratch files and edits were reverted before recording.

| Premise | Consuming operation | Observation and result | Remainder |
| --- | --- | --- | --- |
| A Playwright route answering every revision-stream request with HTTP 500 reproduces the defect under the paused page clock | Slice 1 journey | Scratch spec: `page.route(isRevisionStream → fulfill 500)` before `openStreamingAtA`, then `passPageMs` 30 s, +20 s, +40 s. Current code: opens 3, 4, 6; problems 0, 0, 0 after 90 s of page time | — |
| The anchored deadline makes that journey show the problem between 30 s and 50 s without changing the pace | Slice 1 journey discriminates | Same spec with a scratch edit (arm at effect start, no re-arm in `open`, no clear in `stopHolding`, clear in cleanup): opens 3, 4, 6; problems 0, 1, 1 | The scratch did not re-arm after firing; slice 1 adds that (see direction) |
| Existing stream journeys still hold with the anchored deadline | Slice 1 consumers | `revision-stream-lost.spec.ts` (incl. former SIGSTOP cases now in `revision-stream-stopped.spec.ts`), `revision-stream.spec.ts`, `revision-stream-visibility.spec.ts` with the scratch edit: 9 passed (24.2 s) | Re-run with the final implementation |

## Outside-in proof

| Source promise / examples | Owner and observable result |
| --- | --- |
| Every open fails promptly: no problem before 45 s, problem at 45 s with revision and retrieval time; opens no more often than the pace (example 1) | Slice 1: new journey in `revision-stream-lost.spec.ts` |
| Answered, then failed reopens: problem 45 s after the answer, stays across failed reopens, first answer clears and catches up (example 2) | Slice 1: same journey continues by unrouting and publishing a new commit; `revision-stream-stopped.spec.ts` SIGSTOP keeps proving silence after answers |
| Rate-limited answer keeps today's notice and wait; new bound after it (example 3) | Slice 1: existing rate-limit journey in `revision-stream-lost.spec.ts` stays green |
| Hidden and revealed pages keep their lifecycle | Slice 1: `revision-stream-visibility.spec.ts` stays green |
| Manual states the bound counts across reopens | Slice 1: `dashboard/PUBLISHED-OBSERVATION.md` stream sentence updated |

## Slices

### 1. Lost freshness survives failed stream opens
Type: Behavior
Status: done
Proof: accepted — failed-opens journey plus
`revision-stream-lost.spec.ts`, `revision-stream-stopped.spec.ts`,
`revision-stream.spec.ts`, and `revision-stream-visibility.spec.ts` (10/10);
discriminating failure before impl: no problem after ~90 s page time on the
old schedule. Rate-limit journey (Retry-After 20) proves E3.2: full bound
from wait end.

**Behavior:** a streaming Board whose every stream open fails promptly →
45 seconds of page time pass → the lost-freshness problem shows with the
snapshot's revision and retrieval time, opens stay at the pace, and after the
route is lifted the first answer clears the problem and a commit published
meanwhile is read.

Write the journey first with `page.route` on `isRevisionStream` answering
500 before `openStreamingAtA`. Assert no problem at 40 s and the problem at
45 s plus one page-time step, the problem's retrieval time equal to the
snapshot's, and open gaps of at least the pace. Then `page.unroute`, push
revision B and let one pace pass. Implement the deadline as described above,
including re-arming after it fires, update the hook's header and inline
comments, and update the stream sentence in
`dashboard/PUBLISHED-OBSERVATION.md`: the bound counts from the last answer,
or from when the page began observing, across reopens.

## Plan concerns

Refinement was not needed: one slice with one outcome, settled premises and
mapped proof. This review identified no remaining slice-specific concern.

## Learnings

- Arm silence after a standing rate-limit wait ends (`arm-and-open`), not at
  effect entry while the directed notice stands; otherwise a long Retry-After
  spends the bound during the wait (G3 / E3.2).
- Post-change refactor extracted SIGSTOP/504 journeys to
  `revision-stream-stopped.spec.ts` and shared lost-freshness helpers in
  `revisionStreamJourney.ts`.


## Story obligations

### G1. Deferred: report first failed open at once
Reported: slice 1 — "Source review X1: reporting the first failed open at once is deferred."
Story clause: "Reporting the first failed open at once, as a failed revision check does, and falling back to revision checks after failed opens were considered. Both change the agreed 45-second bound or traffic, and neither is needed for the goal."
Disposition: excluded "Reporting the first failed open at once, as a failed revision check does, and falling back to revision checks after failed opens were considered. Both change the agreed 45-second bound or traffic, and neither is needed for the goal."
Commitment: X1


### G2. Deferred: fall back to revision checks after failed opens
Reported: slice 1 — "Source review X2: falling back to revision checks after failed opens is deferred."
Story clause: "Reporting the first failed open at once, as a failed revision check does, and falling back to revision checks after failed opens were considered. Both change the agreed 45-second bound or traffic, and neither is needed for the goal."
Disposition: excluded "Reporting the first failed open at once, as a failed revision check does, and falling back to revision checks after failed opens were considered. Both change the agreed 45-second bound or traffic, and neither is needed for the goal."
Commitment: X2

### G3. Rate-limit wait end must start a new silence bound
Reported: slice 1 — "Acceptance: armSilence runs at effect start while waitForLimit > 0, so the bound counts during the directed wait and is partially spent when the stream reopens; story E3.2 requires a new bound when the wait ends."
Story clause: "The stream opens again when the wait ends, and a new bound starts then."
Disposition: proved by slice 1: revision-stream-lost.spec.ts rate-limit E3.2 step + revisionStreamSchedule.ts scheduleOpenAfter(waitForLimit, "arm-and-open")