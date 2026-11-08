# Drive Running Cursor sessions tests with page time and observed replies

**Identity:** SEED-262#drive-polls-with-time-and-replies

**Source:** [Make dashboard polling tests advance on controlled time and observed replies](../../seeds/SEED-262-faster-dashboard-test-feedback.md#drive-polls-with-time-and-replies)

**Source review:** [source review](source-review.md)

## Goal and scope

Remove real waits from the two [frontend polling cases](../../../dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts)
while keeping their browser and service substitute boundary. The existing
attention, integrated Cursor and revision-stream journeys retain their own
proof. No production clock or request-owner change is needed. Use
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) for
the retention decision and the
[journey synchronization guidance](../../../dashboard/tests/writing-journeys.md)
for the test changes.

## Outside-in proof

Slice 1 owns all three examples at the browser request and visible UI boundary.

| Promise | Observation |
| --- | --- |
| One owned read and no early follow-up | Hold the first real browser GET at its route and advance past an ask gap. Observe one started and one outstanding. Release it and observe the session row. Once the page has acted on the completed reply, observe zero new GETs one millisecond before the next interval and one when it is due. |
| Hidden and collapsed states pause demand | Count GETs across several virtual gaps while hidden and while collapsed. Reveal the expanded list with page time paused and observe the resumed GET and its answer. Check the kept sidebar row and closed Terminal after collapse. |
| The list follows successive answers | Observe the reading state before releasing the first reply. Advance a settled pace for each subsequent answer and observe unreachable, restored working session, and empty running states, with the kept sidebar row and closed Terminal. |

## Ordered slices

### 1. Make the two Running Cursor polling cases advance on replies

Type: Structure
Status: done
Proof: Both cases pass through the existing frontend fixture with the observations
above. Their matched before-and-after comparison meets the seed's 7 s retention
threshold without relaxing a request or UI assertion.

Reuse the [paused page clock](../../../dashboard/tests/autoRefreshJourney.ts),
[page request and settlement notes](../../../dashboard/tests/pageRequestNotes.ts)
and the [Cursor request tracker](../../../dashboard/tests/support/cursorSessionsDemand.ts).
Register the GET observation before the action, and reuse the existing held-route
pattern for slow responses. Let page time pass while the reply is deliberately
held and observe the request count after the page has had its turns. Wait for
the completed reply and application settlement before stepping the next ask
gap. Use the page's request initiation as the negative-count boundary so a
late Playwright event cannot make an early request look absent. Keep any
endpoint-specific instrumentation local unless the existing request notes need
a small extension. Release held replies on failure and teardown as well.

Extend the existing [MakeMe launch builder](../../../tests/support/launchTestData.mjs)
for the ad hoc Cursor record used by this spec. Keep the launch facts visible
where the case is arranged and compose the kept machine record and live list
answer from them. Preserve story launch defaults and keep route behavior and
independent expectations outside the builder.

Run the normal spec and `npm run typecheck:dashboard`. If the shared Cursor
request tracker changes, also run the
[integrated quiet-rate spec](../../../dashboard/tests/sessions/cursor-runner-sessions-quiet-rate.spec.ts).
Trace affected callers if shared request notes or story-launch builder behavior
changes and run their relevant checks. Prefer an additive builder path that
keeps those callers on their existing behavior. Use a scratch early-follow-up
or overlapping-request fault to confirm the corresponding request assertion
discriminates, then restore it and rerun the case.

## Current decisions and baseline

- The page owns the ask timer. The
  [running list](../../../dashboard/src/RunningCursorSessions.tsx) starts the
  next gap after the prior read settles and owns visibility and collapse.
  The integrated quiet-rate case already uses the same browser clock and
  request tracker. The frontend route remains the controllable reply source.
- On `9958b6f1a`, macOS on AC, Node 24.21.0 and Playwright 1.63.0, the isolated
  repeat run below passed six cases with two default workers and no retries.
  The slow/visibility case took 13.655, 12.554 and 12.632 s (median 12.632 s).
  The response-state case took 4.753, 3.731 and 3.743 s (median 3.743 s).
  Runner elapsed time was 31.696 s. A broader 25-case selection including
  the attention and revision-stream tests also passed. Its 4.564 s two-tab
  revision-stream case includes a real 3 s server pace. The standalone frontend
  cases offer the larger saving with the existing page clock.

```sh
caffeinate -s -i ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts --reporter=json --repeat-each=3 'frontend-tests/cursor-runner-sessions-ui\.spec\.ts$'
```

- Matched comparison, 2026-11-08, macOS on AC, load 7–8.6, same command.
  Baseline on unchanged `91d07d0fb`: 6/6 passed; slow/visibility 14.185,
  12.582, 12.609 s (median 12.609 s); response-state 5.335, 3.719, 3.731 s
  (median 3.731 s); runner 34.3 s. Candidate: 6/6 passed; 1.216, 0.521,
  0.567 s (median 0.567 s) and 1.185, 0.484, 0.508 s (median 0.508 s);
  runner 4.4 s. Saving 15.27 s across the medians; `--repeat-each=15` gave
  30/30. Removed waits: the route's real delay, two hidden/collapsed
  `waitForTimeout` calls and the real follow-up intervals. Request counts at
  publish, follow-up, hidden, visible and collapse are now exact (1, 1 at
  gap−1 ms then 2, 2, 3, 3) with peak 1; the response-state case asks 4
  times. Early-ask, overlap, ignored-visibility, uncleared-collapse,
  scheduled-reveal and ignored-unreachable faults each failed a case.

Repeat the same selection on the candidate and record the verdicts, case
medians, runner time, removed waits and request counts at the named transitions.
Treat runner time as context because build and worker scheduling are shared.
If the proof or savings do not justify the test-support cost, keep the evidence
and reconsider before delivering the change.

**Local gate.** Keep the default timeout and follow the
[test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Start long runs fully awake. On macOS AC power, use `caffeinate -s -i`.
On battery, plug in or start fully awake with the lid open under `caffeinate -i`
and read the sleep log afterwards. See the
[maintained sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos).

**Slice-plan refinement.** Unneeded because the two cases share one polling
boundary, one setup, and one proof loop. No remaining slice-specific concern.

## Execution complete

Product advice: no change. The story's retention threshold is met (15.27 s
saved across the two case medians) and every source commitment is observed.
The new `.adHoc(...)` and `.inCursorSession(...)` launch-builder steps make
later migration of hand-built ad hoc kept records possible; the story
excluded fixture migrations, so treat that as a hypothesis for a future
test-optimization candidate rather than a queued need.
