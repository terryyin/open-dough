# Source-only review

Reviewer: `/root/source_review`, fresh `fork_turns: none` launch. The launch supplied only the selected source’s Goal, Scope and Key examples verbatim, with instructions to read no project files and change nothing. Actual launch and numbered return are retained in this execution’s agent history. No plan, implementation or proof was supplied.

Qualifications from the return: timeout prevention targets the stated in-flight-read cause; removal accompanies the default acquiring settling behavior; variant spelling is not prescribed; having a held read alone does not require the variant unless time must advance during that hold; detail-recovery and steady-refresh examples are illustrative alternatives; policy and automation contents remain owned by AGENTS.md. Direction-disclosure pace/recovery commitments assume the unanswered new-revision detail precondition. Merge reconciliation triggers when those executions integrate.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Prevent revision-check timeouts caused by passing page time over an in-flight detail read. | slice 1 | observed: dashboard/tests/stories/direction-disclosure.spec.ts same-project refresh: held B read keeps Date.now at heldAt, then expectSteadyPace(nextCheck) and ordinary 15-second check continuation; 104-case consumer command passed |
| 2 | The default time-passing step settles outstanding page reads before advancing page time. | slice 1 | observed: dashboard/tests/autoRefreshJourney.ts passTimeUntilChecked awaits untilPageReadsAnswered before variant; direction-disclosure heldAt assertion observes no page-time advance until release |
| 3 | The default step’s comment explains why reads settle first. | slice 1 | observed: dashboard/tests/autoRefreshJourney.ts default comment names detail wait bound, recovery and suspended revision checks |
| 4 | The separate `AfterSettled` name disappears once its behavior becomes the default. | slice 1 | observed: rg passTimeUntilCheckedAfterSettled dashboard/tests has no matches; removed export inspected in autoRefreshJourney.ts |
| 5 | Existing `passTimeUntilCheckedAfterSettled` callers become callers of the default step. | slice 1 | observed: git diff of nineteen migrated consumer sources changes former AfterSettled callers to passTimeUntilChecked; no remaining code refs |
| 6 | Those former `AfterSettled` journeys retain their behavior. | slice 1 | observed: 104 selected tests across 53 direct and indirect consumer specs passed; scenario observations/assertions preserved in migration diff |
| 7 | An explicit variant permits page time to advance while a deliberately held read remains held. | slice 1 | observed: dashboard/tests/intent/intent-source-target-recovery.spec.ts held-then-released source: outstanding file read remains held while named variant returns steady check, then old content/revision asserted before release |
| 8 | The variant’s name communicates that a read stays held. | slice 1 | observed: dashboard/tests/autoRefreshJourney.ts export passTimeUntilCheckedWhileReadsOutstanding communicates outstanding reads stay open |
| 9 | Every caller that needs time to advance while a read stays held uses that variant. | slice 1 | observed: whole-checkout direct and indirect consumer audit in /tmp/seed344-consumer-trace.md; existing hold-before-check shapes start reads from that check, deliberate Intent held-source caller uses variant |
| 10 | Each such journey makes the reason for holding the read evident. | slice 1 | observed: dashboard/tests/intent/intent-source-target-recovery.spec.ts comment explains retaining previous source answer across revision check while source read stays held |
| 11 | Callers that work with the default require no other change. | slice 1 | observed: migration diff leaves ordinary default callers unchanged, except direction-disclosure strengthened proof; all 53 affected whole specs pass |
| 12 | All existing journeys retain their observations. | slice 1 | observed: git diff preserves existing observations; added heldAt/loading/problem and held source checks; 104-case consumer command passes |
| 13 | All existing journeys retain their assertions. | slice 1 | observed: git diff preserves every original assertion; 104-case consumer command passes with added assertions |
| 14 | All existing journeys pass locally using the default case timeout. | slice 1 | observed: 104 selected cases in all 53 traced affected whole browser spec files passed locally under default case timeout; unchanged unrelated journeys do not reach changed operation |
| 15 | All existing journeys pass in hosted CI using the default case timeout. | target CI | |
| 16 | The work follows the referenced failing/flaky-test policy. | slice 1 | observed: all local proof terminal success with no failing/flaky test ignored; AGENTS.md failing/flaky-test policy carried verbatim by link in implementation/refactor briefs |
| 17 | The work follows the referenced test-automation rules. | slice 1 | observed: test-entry selector resolved MakeMe/pageObjects for affected consumers; unchanged factories and focused page-mechanics owners reused, controlled clock/message turns; no timeout edits |
| 18 | Merging reconciles affected call sites with the dashboard-spec work of SEED-324, SEED-332, and SEED-334. | landing | |
| 19 | Their uncommitted work is preserved. | slice 1 | observed: only this established owned checkout edited; no other worktree modified and no stash/reset/clean used; siblings remain independently Taken |
| 20 | In the direction-disclosure example, the next check arrives on its steady pace. | slice 1 | observed: dashboard/tests/stories/direction-disclosure.spec.ts held-B continuation expectSteadyPace(await nextCheck) observes 15000–15250ms |
| 21 | In that direction-disclosure example, detail recovery is never armed. | slice 1 | observed: direction-disclosure observes unchanged Date.now and no problem while B held, then steady nextCheck and Automatic checks continue every 15 seconds after release; no detail recovery schedule |
| 22 | In a deliberate held-read journey, the held observation continues to work through the named variant. | slice 1 | observed: intent-source-target-recovery held source: expectSteadyPace(variant), old assert True source and beforeRevision retained prior to latest.release; original target-line/focus/offset and eventual content assertions remain |
| 23 | Product auto-refresh behavior is outside the change. | slice 1 | observed: git diff scope includes only test helpers/specs plus execution records; no production auto-refresh changes |
| 24 | Raising timeouts is excluded. | slice 1 | observed: git diff introduces no timeout increases; all affected cases pass unchanged default bound |
| 25 | Overriding timeouts is excluded. | slice 1 | observed: git diff introduces no timeout overrides |
| 26 | Using `test.slow()` is excluded. | slice 1 | observed: git diff introduces no test.slow() |
| 27 | Waiting for wall-clock time is excluded. | slice 1 | observed: diff uses paused page clock and existing MessageChannel page turns; no wall-clock waits introduced |
