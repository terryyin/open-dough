# Source review: SEED-221#launch-records-poll-waits

Launched 2026-11-02 as a fresh general-purpose subagent without conversation
inheritance. Input: only the story section text of
`SEED-221-launch-records-poll-waits.md#launch-records-poll-waits` (Identity,
heading, For / why, Goal, Scope, Key examples), with the instruction to read no
other project files, change nothing, and return numbered commitments. Reviewer
notes: no key example covers the reopen race (its behavior comes from scope);
"four waits" across three tests leaves their split unspecified; the examples'
read counts are illustrations, not rejection rules.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developers waiting on `npm run test:dashboard` stop losing about a minute of summed test time to four waits that only sit out the page's 15s launch-records poll in real time | slice 3 | |
| 2 | The three tests drive the page's next launch-records read with the existing page clock and one-read pace instead of waiting in real time | slice 2 | |
| 2.1 | The attention journey in `agent-completion-attention.spec.ts` | slice 2 | |
| 2.2 | The close race in `agent-launch-ad-hoc-terminal.spec.ts` | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts closed race: release() lifts withholding then passOnePace; focused 1.8-1.9s vs 16.7-17.0s baseline |
| 2.3 | The reopen race in `agent-launch-ad-hoc-terminal.spec.ts` | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts reopened race: release() then passOnePace; focused 1.7-1.8s vs 16.4s baseline |
| 3 | Every behavior these tests protect stays covered | slice 2 | |
| 4 | The change reuses two existing mechanisms | slice 2 | |
| 4.1 | `pausePageClockAt` (`dashboard/tests/dashboardTest.ts`) | slice 2 | |
| 4.2 | `watchRecordReads(page).passOnePace` (`dashboard/tests/sessionStatePace.ts`) | slice 2 | |
| 5 | No new clock or pacing mechanism is added | slice 2 | |
| 6 | Protected behavior that must be kept | slice 2 | |
| 6.1 | Attention journey: a delivered report reaches the open page without a reload | slice 2 | |
| 6.2 | Close race: a closed terminal stays closed once its session starts | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts closed race: after await release(), panel toHaveCount(0), openTerminal focused, claudeAttaches unchanged; Open terminal shows attached id and echo |
| 6.3 | Reopen race: a reopened terminal stays open once its session starts | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts reopened race: after await release(), panel toHaveCount(1), rows toHaveText(shown), claudeAttaches unchanged |
| 7 | Both races keep `withholdLaunchOutcomes` as it is | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts withholdLaunchOutcomes body unchanged in git diff |
| 8 | The clock change does not extend the `withholdLaunchOutcomes` response rewriting | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts git diff: withholdLaunchOutcomes route handler unchanged; clock via pausePageClockAt/watchRecordReads only |
| 9 | Whether the change is kept depends on its measured gain against a comparable focused baseline | slice 3 | |
| 9.1 | A change with no measured gain is undone | slice 3 | |
| 9.2 | A change with no measured gain is recorded | slice 3 | |
| 10 | After `release()`, the closed-terminal race shows the quiet actions row after one paced read, with the panel still closed and no new attach | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts closed race: await release() (one passOnePace asserting exactly one read) then expectQuietAdHocActionsRow, panel count 0, attaches unchanged |
| 11 | After the reported completion, the attention card shows the message after paced reads, without a reload | slice 2 | |
| 11.1 | The same card later shows "Unfinished work" after paced reads, without a reload | slice 2 | |
