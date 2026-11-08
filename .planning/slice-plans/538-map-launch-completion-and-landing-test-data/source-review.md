# Source review

Launch: fresh general-purpose reviewer (no conversation inheritance) on 2026-11-08 during execution start. Input: only the selected story's heading, Goal, Scope and Key examples from `.planning/seeds/SEED-261-share-domain-test-data.md#map-launch-completion-and-landing-test-data`, verbatim, with sibling links reduced to their names. Instructed to read no files, change nothing, and return numbered commitments and exclusions.

Returned exclusions: the common store writer belongs to the kept launch record story; live launch observation and host continuation own their data in mixed cases; product behavior and proof boundaries do not change.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: maintainers can read a launch test's starting facts in the product's vocabulary. | slice 4 | |
| 1a | The vocabulary covers the whole range "from a retained final report and its receipt to the comparison accepted for a landing." | slice 4 | |
| 2 | Those facts can be recognized across dashboard tests and the landing delivery script. | slice 3 | |
| 3 | Each test's original proof stays visible. | slice 4 | |
| 4 | Valid completion reports are arranged through MakeMe. | slice 1 | observed: slice 1: makeMe.aCompletionReport replaces deleted dashboard/tests/support/completionReport.ts in all 7 importers; slice selection 61 passed |
| 5 | Valid receipts are arranged through MakeMe. | slice 2 | |
| 6 | Retained final-report facts are arranged through MakeMe. | slice 1 | observed: slice 1: retainedReport.ts recordedClaude/recordedCursor, reportTouchJourney.ts, sessionAttributionFixture.ts, sessionsReplayRecords.ts completion built via makeMe; final-report-admission and session-attribution specs pass |
| 7 | The existing kept launch builder is extended with the outcome facts the cases need. | slice 1 | observed: slice 1: tests/support/launchOutcomeTestData.mjs completedWith takes receipt/receivedAt, withReportRead() in launchTestData.mjs; base-vs-new launchOutcomeFacts output byte-identical |
| 7a | Examples of those facts, not a closed list: report identity, receipt time and disposition. | slice 1 | observed: slice 1: completedWith({receipt, receivedAt}), withReportRead(), markedDoneAt; CompletionReportBuilder withReceipt/receivedAt |
| 8 | The report, the delivery receipt, native terminal evidence and the developer Done mark stay distinct. | slice 2 | |
| 9 | Valid landing authority is arranged through MakeMe where the dashboard suites and `dashboard-landing.test.mjs` supply those starting facts. | slice 3 | |
| 10 | Valid submissions are arranged the same way, under the same condition. | slice 3 | |
| 11 | Valid retained comparisons are arranged the same way, under the same condition. | slice 4 | |
| 12 | Valid landing receipts are arranged the same way, under the same condition. | slice 3 | |
| 13 | The original launch stays explicit when it drives the case. | slice 3 | |
| 14 | The comparison's base and revision stay explicit when they drive the case. | slice 3 | |
| 15 | Real Git is used where the test observes publication, pinning or recovery. | slice 3 | |
| 16 | The actual capture path is used where the test observes publication, pinning or recovery. | slice 3 | |
| 17 | The completion and landing factories in scope are either removed or made to delegate to MakeMe. These are two allowed alternatives. | slice 4 | |
| 18a | Facts that drive the case stay visible. | slice 4 | |
| 18b | Independent expectations stay visible. | slice 4 | |
| 18c | Exact malformed input stays visible. | slice 4 | |
| 18d | Exact legacy input stays visible. | slice 4 | |
| 18e | Injected faults stay visible. | slice 4 | |
| 18f | The operations under proof stay visible. | slice 4 | |
| 19 | The story keeps product behavior unchanged. | slice 4 | |
| 20 | The story keeps proof boundaries unchanged. | slice 4 | |
| E1.1 | Example 1: given a kept launch with a read final report, a report that arrives with a new receipt makes the new message unread. | slice 1 | observed: slice 1: session-unread-rule.spec.ts 'a newer report after a read one is unread again' — kept record read receipt ...0001, newer receipt ...0002 shows 'Unfinished work', '1 unread report' |
| E1.2 | Example 1: a quiet completion and a developer Done mark can still be read as separate facts. | slice 1 | observed: slice 1: session-unread-rule.spec.ts 'a reported session marked done...' (Done, no unread, with/without read) and 'a quiet completion retained for wrap-up...' (no unread, no alert) |
| E2.1 | Example 2: a completion report accepted before native session binding carries its receipt into the bound record. | slice 2 | |
| E2.2 | Example 2: when a bound launch loses the acknowledgment for a later delivery, retrying that delivery after a restart returns its original receipt. | slice 2 | |
| E2.3 | Example 2: that retry does not repeat Git or retirement. | slice 2 | |
| E3.1 | Example 3: a one-shot or story-branch publication has an accepted base and revision. Both publication kinds are covered. | slice 3 | |
| E3.2 | Example 3: when landing evidence is captured or recovered after trunk advances, it keeps that comparison for the original launch. | slice 3 | |
| E3.3 | Example 3: recording the comparison leaves completion and Done to their own operations. | slice 3 | |
| E4.1 | Example 4: for a completed story whose retained comparison has an unavailable local repository, published evidence can still supply its changes when review opens the story. | slice 4 | |
| E4.2 | Example 4: the test arranges the unusable local comparison. | slice 4 | |
| E4.3 | Example 4: the test obtains the fallback through the real published reader. | slice 4 | |
