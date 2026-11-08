# Source review: SEED-262#drive-polls-with-time-and-replies

Launch: fresh general-purpose reviewer, no conversation inheritance, 2026-11-08,
before slice 1 delegation. Input: the story's Goal, Scope, Key examples and
Evaluation text only, with instructions to read no project files and change
nothing. Exclusions returned: X1 attention journeys, X2 recent setup change,
X3 fluent page-object pilot, X4 integrated preview / revision-stream clock,
X5 request-owner rate-limit clock, X6 production changes, X7 page-object
migrations, X8 fixture migrations.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer gets faster feedback from the Running Cursor sessions polling tests. | slice 1 | observed: matched repeat-each=3 comparison: medians 12.609+3.731=16.34 s -> 0.567+0.508=1.075 s (job tmp baseline.json, candidate-repeat.json) |
| 2 | A developer gets repeatable feedback from the same tests. | slice 1 | observed: repeat-each=15: 30/30 passed, no retries |
| 3.1 | The tests still prove, through the browser: request ownership | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: asked()==1, reads.held()==1, outstanding 1, peak 1 while page time passes the ask gap |
| 3.2 | The tests still prove, through the browser: cadence | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: asked()==1 at askGapMs-1 after settlement, 2 when due |
| 3.3 | The tests still prove, through the browser: visibility | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: hidden asked() unchanged over 3 gaps; visible again asks at once |
| 3.4 | The tests still prove, through the browser: recovery | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts reading/unreachable/restored case: unreachable then restored then empty running list shown in order |
| 4.1 | Drive both cases in the frontend polling spec with controlled browser time | slice 1 | observed: both cases: pausePageClock + page.clock.runFor only; no waitForTimeout/setTimeout |
| 4.2 | Drive both cases with explicit request arrival | slice 1 | observed: both cases: reads.nextArrival() registered before each action and awaited |
| 4.3 | Drive both cases with explicit reply completion | slice 1 | observed: both cases: reads.answer(...) releases each held reply |
| 5 | Keep the real page. | slice 1 | observed: both cases: openFrontendTakenBacklog real page |
| 6 | Keep the existing frontend service boundary. | slice 1 | observed: both cases: frontendApp fixture service substitutes + page.route on cursorRunnerSessionsEndpoint |
| 7 | Arrange the ad hoc Cursor launch through the shared MakeMe launch-record builder. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts heldRecord via makeMe.aLaunchRecord.adHoc(...).inCursorSession(...); tests/support/launchTestData.mjs |
| 8.1 | Keep in the spec, not in the builder: route control | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts holdCursorSessionsReads route control in spec |
| 8.2 | Keep in the spec, not in the builder: the expected responses | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts heldSessions/unreachable/noHeldSessions answers in spec |
| 8.3 | Keep in the spec, not in the builder: the UI observations | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts region/row/sidebar/Terminal expectations in spec |
| 9.1 | An expanded visible list holds its first reply past an ask interval. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: first read held, page.clock.runFor(askGapMs+200) |
| 9.2 | While the reply is held, exactly one request is in flight. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: expect(await asked()).toBe(1), reads.held()==1, demand.outstanding()==1 |
| 9.3 | The reply publishes the working session. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: region 'The Cursor runner is running.' and row 'working' after answer |
| 9.4 | The next request starts one full interval after settlement. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: after untilPageRequestsAnswered, runFor(1) at full gap gives arrival and asked()==2 |
| 9.5 | No request starts early. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: asked()==1 at askGapMs-1; fault askGapMs-100 fails here |
| 10.1 | While hidden or collapsed, the list starts no new requests across several intervals. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: hidden and collapsed: asked() unchanged over 3x(askGapMs+200); faults for visibility and collapse fail |
| 10.2 | Revealing an expanded list resumes demand. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: setPageVisibility visible -> arrival, asked()==3, answer shown |
| 10.3 | Collapsing leaves the kept sidebar session visible. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: sidebar button named instruction visible after collapse |
| 10.4 | Collapsing leaves the Terminal closed. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts slow Cursor sessions case: Terminal region count 0 after collapse |
| 11.1 | A held first reply shows the reading state. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts reading/unreachable/restored case: 'Reading the Cursor runner…' with no list items while first read held |
| 11.2 | Subsequent controlled polls then show the unreachable state, | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts reading/unreachable/restored case: 'The Cursor runner cannot be reached.' after answerNextRead(unreachable) |
| 11.3 | then the restored session, | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts reading/unreachable/restored case: running + row working after answerNextRead(heldSessions) |
| 11.4 | then the empty running list, in that order. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts reading/unreachable/restored case: no listitems, running, not 'cannot be reached' after answerNextRead(noHeldSessions) |
| 11.5 | The kept sidebar session remains available. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts reading/unreachable/restored case: sidebar button named instruction visible |
| 11.6 | The Terminal stays closed. | slice 1 | observed: dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts reading/unreachable/restored case: Terminal region count 0 |
| 12.1 | Compare the same ordinary cases before and after with the same runner settings | slice 1 | observed: same command/config/--repeat-each=3/2 workers, AC power, load 7-8.6 before and after |
| 12.2 | Compare with the same frontend fixture | slice 1 | observed: same frontendApp fixture and frontend service substitutes |
| 13.1 | Keep the change only if it saves at least 7 s across the two median case durations | slice 1 | observed: saving 15.27 s across the two medians (>= 7 s) |
| 13.2 | Keep only if request counts at the named transitions are equivalent | slice 1 | observed: request counts equal or stricter at publish, follow-up, hidden, visible, collapse transitions (PLAN Current decisions) |
| 13.3 | Keep only if the behavioral verdicts are the same | slice 1 | observed: 6/6 passed before and after |
| 13.4 | Keep only if the test-support change is small | slice 1 | observed: about 75 spec-local helper lines plus 30 additive builder lines |
| 14 | Treat elapsed time as comparison evidence, kept separate from the tests' pass criteria. | slice 1 | observed: no test asserts elapsed time; durations only in comparison evidence |
