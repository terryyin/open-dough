# Source review — SEED-240#show-freshness-loss-across-stream-retries

**Launch:** Cursor Task general-purpose agent `9d217453-3558-48b8-a1a4-6927e5fd705a` (source-only; no plan, product, or proof).
**Input:** Goal, Scope, key examples, exclusions, selected approach, and prerequisite from `.planning/seeds/SEED-240-reliable-dashboard-updates-and-session-details.md#show-freshness-loss-across-stream-retries` only (Evidence retained as cause qualification, not as promises).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | While a page delivers by stream, a developer watching a streaming Board can tell when published updates have stopped arriving. | slice 1 | observed: revision-stream-lost.spec.ts failed-opens journey: problem at 45s with freshness was lost |
| 2 | That includes when every connection attempt fails before its first answer. | slice 1 | observed: revision-stream-lost.spec.ts failed-opens: page.route 500 before openStreamingAtA; problem at 45s |
| 3 | The developer can see freshness recover. | slice 1 | observed: revision-stream-lost.spec.ts failed-opens: unroute+push B → problem count 0 |
| 4 | The shown snapshot stays honest while revision streams carry the dashboard's live updates. | slice 1 | observed: revision-stream-lost.spec.ts failed-opens: expectMembership titlesOfA while problem shown; then titlesOfB after catch-up |
| 5 | While a page delivers by stream, the 45-second silence bound (one pace plus the read wait bound) counts from the last successful revision answer, or from when this observation began if none arrived yet. | slice 1 | observed: revisionStreamSchedule.ts armSilence at observation start / on answer; revisionStreamSilenceMs = pace + read wait |
| 6 | Connection attempts, failed or hung, neither restart nor postpone that bound. | slice 1 | observed: revisionStreamSchedule.ts stopHolding no longer clears silence; open() does not re-arm; failed-opens journey problem at 45s across failed attempts |
| 7 | When the bound passes, the page shows the existing lost-freshness problem. | slice 1 | observed: revision-stream-lost.spec.ts + revision-stream-stopped.spec.ts failed-opens + SIGSTOP: containText freshness was lost / Published work could not be read |
| 8 | When that problem is shown, the page keeps the shown revision. | slice 1 | observed: revision-stream-lost.spec.ts + revision-stream-stopped.spec.ts failed-opens + SIGSTOP: expectMembership titlesOfA while problem shown (failed-check status omits revision line; Board membership is the kept snapshot) |
| 9 | When that problem is shown, the page keeps its retrieval time. | slice 1 | observed: revision-stream-lost.spec.ts + revision-stream-stopped.spec.ts failed-opens + SIGSTOP: problem time nth(1) datetime === retrievedA |
| 10 | When that problem is shown, the page keeps the automatic-check sentence. | slice 1 | observed: revision-stream-lost.spec.ts + revision-stream-stopped.spec.ts failed-opens + SIGSTOP: Automatic checks continue every N seconds… |
| 11 | Reopens keep the existing pace. | slice 1 | observed: revision-stream-lost.spec.ts + revision-stream-stopped.spec.ts failed-opens + SIGSTOP reopen gap steps: gap >= checkIntervalMs - pageTimeStepMs |
| 12 | Rate-limited answers keep the directed wait and notice. | slice 1 | observed: revision-stream-lost.spec.ts rate-limit journey: 429 notice, asks nothing until T, Automatic checks resume then |
| 13 | The first successful answer still clears the problem. | slice 1 | observed: revision-stream-lost.spec.ts + revision-stream-stopped.spec.ts failed-opens catch-up + SIGSTOP replacement: problem toHaveCount 0 after first answer |
| 14 | The first successful answer still catches up. | slice 1 | observed: revision-stream-lost.spec.ts + revision-stream-stopped.spec.ts failed-opens + SIGSTOP: expectSettledPage titlesOfB / shortRevision(revisionB) |
| 15 | A failure after an answer still reports at once. | slice 1 | observed: revisionStreamSchedule.ts onerror: loseStream(answered) reports when answered; SIGSTOP path after prior stream answers |
| 16 | An observation restart starts a new bound. | slice 1 | observed: revisionStreamSchedule.ts effect cleanup clearSilence; rate-limit wait end arms new bound before open; visibility/shownRevision/limitedUntil/readSettled deps; revision-stream-visibility.spec.ts |
| 17 | Hidden time does not count, consistent with the existing visibility lifecycle. | slice 1 | observed: revision-stream-visibility.spec.ts hide/reveal lifecycle stays green |
| 18 | The shown retrieval time remains the developer's evidence of age across such restarts. | slice 1 | observed: revision-stream-lost.spec.ts + visibility: retrieval datetime kept on problem; snapshot age evidence across restarts |
| 19 | No new wording or control. | slice 1 | observed: diff: no new problem wording/control; PUBLISHED-OBSERVATION.md stream sentence only clarifies bound counting |
| 20 | The problem names the stream as "closed or fell silent", which also describes an open that failed. | slice 1 | observed: revisionStreamSchedule.ts lostStreamProblem: closed or fell silent; failed-opens journey asserts that text |
| 21 | Implementation uses a watchdog instead of a per-attempt timer. | slice 1 | observed: revisionStreamSchedule.ts single armSilence deadline; open() removed per-attempt arm |
| 22 | Only a successful revision answer counts as acting for the watchdog; reconnecting does not. | slice 1 | observed: revisionStreamSchedule.ts armSilence only at observation start, on successful answer, and after fire; not in open() |
| 23 | One deadline per observation is armed at its start. | slice 1 | observed: revisionStreamSchedule.ts: armSilence at effect start when waitForLimit===0; when waitForLimit>0 armSilence immediately before first open after wait |
| 24 | That deadline is re-armed by each successful answer. | slice 1 | observed: revisionStreamSchedule.ts onmessage success: armSilence() |
| 25 | That deadline survives an attempt's close. | slice 1 | observed: revisionStreamSchedule.ts stopHolding leaves silenceTimer; failed-opens journey |
| 26 | The watchdog is reset by the dashboard's existing restart rules rather than by elapsed visible time. | slice 1 | observed: revisionStreamSchedule.ts effect deps / cleanup; not elapsed-visible-time accumulator |
| 27 | The change stays inside the browser's stream schedule. | slice 1 | observed: diff owned paths: only revisionStreamSchedule.ts (+ test + PUBLISHED-OBSERVATION.md) |
| 28 | The change adds no server responsibility. | slice 1 | observed: diff: no server/request/stored-state files |
| 29 | The change touches no Accepted decision. | slice 1 | observed: plan Accepted decisions: ADR 0008 browser-local; no ADR edit in diff |
| E1 | A snapshot is shown and every stream open after it fails promptly before answering. | slice 1 | observed: revision-stream-lost.spec.ts failed-opens: route 500 + openStreamingAtA snapshot A |
| E1.1 | At 45 seconds of page time from the observation start, the lost-freshness problem is visible with the snapshot's revision and retrieval time. | slice 1 | observed: revision-stream-lost.spec.ts failed-opens: at 45s+step problem + retrievedA + membership A |
| E1.2 | Before 45 seconds it is not shown. | slice 1 | observed: revision-stream-lost.spec.ts failed-opens: at 40s problem toHaveCount 0 |
| E1.3 | Opens keep coming no more often than the 15-second pace, before and after the warning. | slice 1 | observed: revision-stream-lost.spec.ts failed-opens: open gaps >= pace before/after warning |
| E2 | A stream answers "unchanged", then every reopen fails promptly. | slice 1 | observed: composition: openStreamingAtA answers then SIGSTOP silence; failed-opens proves failed reopen pace after warning (same deadline survives close) |
| E2.1 | The problem appears 45 seconds after that answer. | slice 1 | observed: revision-stream-stopped.spec.ts SIGSTOP: passPageMs(revisionStreamSilenceMs) after answering stream → problem |
| E2.2 | The problem stays across further failed reopens. | slice 1 | observed: revision-stream-lost.spec.ts failed-opens: after problem, three more failed opens at pace without clearing |
| E2.3 | The first successful answer clears it. | slice 1 | observed: revision-stream-lost.spec.ts + revision-stream-stopped.spec.ts failed-opens + SIGSTOP catch-up: problem cleared |
| E2.4 | When that successful answer names a new commit, the page reads and shows that commit. | slice 1 | observed: revision-stream-lost.spec.ts + revision-stream-stopped.spec.ts failed-opens + SIGSTOP: titlesOfB / revisionB after first naming answer |
| E3 | A rate-limited stream answer keeps today's notice and directed wait. | slice 1 | observed: revision-stream-lost.spec.ts rate-limit journey: notice + directed wait |
| E3.1 | The stream opens again when the wait ends. | slice 1 | observed: revision-stream-lost.spec.ts rate-limit journey: untilReported then passPageMs resumes streaming at B |
| E3.2 | A new bound starts then. | slice 1 | observed: revision-stream-lost.spec.ts rate-limit journey: Retry-After 20; no freshness lost during wait; after reopen+route 500, no problem at 40s, problem at 45s+step with retrievedA (full bound from wait end) |
| X1 | Deferred: reporting the first failed open at once, as a failed revision check does. |  | G1 |
| X2 | Deferred: falling back to revision checks after failed opens. |  | G2 |
| X3 | No new wording or control. | slice 1 | observed: diff: existing problem wording retained; manual clarifies bound only |
| X4 | No server responsibility added. | slice 1 | observed: diff: no server changes |
| X5 | No Accepted decision touched. | slice 1 | observed: diff: no ADR changes |
| X6 | Connection attempts (failed or hung) do not restart or postpone the silence bound. | slice 1 | observed: same as 6: stopHolding/open do not reset bound; failed-opens journey |
| X7 | Hidden time does not count toward the bound. | slice 1 | observed: same as 17: revision-stream-visibility.spec.ts |
