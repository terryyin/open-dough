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
| 1 | Developers waiting on `npm run test:dashboard` stop losing about a minute of summed test time to four waits that only sit out the page's 15s launch-records poll in real time | slice 3 | observed: PLAN.md Accepted proof slice 3: focused waits removed (races 16.4-17.0s to 1.7-1.9s, attention 36.1-36.2s to 6.1-7.0s, about 60 summed seconds); full test:dashboard 31.3 to 29.6 min Playwright time, same 1,898 cases |
| 2 | The three tests drive the page's next launch-records read with the existing page clock and one-read pace instead of waiting in real time | slice 2 | observed: dashboard/tests/agent-completion-attention.spec.ts and dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts: pausePageClockAt before the page opens, then passOnePace at each former real-time wait (two in the attention journey, release() in both races) |
| 2.1 | The attention journey in `agent-completion-attention.spec.ts` | slice 2 | observed: dashboard/tests/agent-completion-attention.spec.ts: passOnePace before the message toHaveText and before toContainText("Unfinished work"); focused 6.1-7.0s vs 36.1-36.2s baseline |
| 2.2 | The close race in `agent-launch-ad-hoc-terminal.spec.ts` | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts closed race: release() lifts withholding then passOnePace; focused 1.8-1.9s vs 16.7-17.0s baseline |
| 2.3 | The reopen race in `agent-launch-ad-hoc-terminal.spec.ts` | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts reopened race: release() then passOnePace; focused 1.7-1.8s vs 16.4s baseline |
| 3 | Every behavior these tests protect stays covered | slice 2 | observed: dashboard/tests/agent-completion-attention.spec.ts all later assertions unchanged (column change, retirement rmSync + retained receipt, restart, Mark as read, Mark as done, Recently done); dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts all race assertions kept |
| 4 | The change reuses two existing mechanisms | slice 2 | observed: dashboard/tests/agent-completion-attention.spec.ts and dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts import pausePageClockAt from dashboardTest.ts and watchRecordReads from sessionStatePace.ts |
| 4.1 | `pausePageClockAt` (`dashboard/tests/dashboardTest.ts`) | slice 2 | observed: dashboard/tests/agent-completion-attention.spec.ts and dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts: await pausePageClockAt(page, new Date()) before the page opens |
| 4.2 | `watchRecordReads(page).passOnePace` (`dashboard/tests/sessionStatePace.ts`) | slice 2 | observed: dashboard/tests/agent-completion-attention.spec.ts and dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts: const { passOnePace } = await watchRecordReads(page), called at each paced read |
| 5 | No new clock or pacing mechanism is added | slice 2 | observed: git diff 4c7e5995..: dashboardTest.ts and sessionStatePace.ts unchanged; only spec-local calls added |
| 6 | Protected behavior that must be kept | slice 2 | observed: dashboard/tests/agent-completion-attention.spec.ts attention lifecycle assertions and dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts race assertions unchanged in the diff |
| 6.1 | Attention journey: a delivered report reaches the open page without a reload | slice 2 | observed: dashboard/tests/agent-completion-attention.spec.ts: report("completed") then passOnePace then message toHaveText(text), with no reload until the later reloadUntilRead |
| 6.2 | Close race: a closed terminal stays closed once its session starts | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts closed race: after await release(), panel toHaveCount(0), openTerminal focused, claudeAttaches unchanged; Open terminal shows attached id and echo |
| 6.3 | Reopen race: a reopened terminal stays open once its session starts | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts reopened race: after await release(), panel toHaveCount(1), rows toHaveText(shown), claudeAttaches unchanged |
| 7 | Both races keep `withholdLaunchOutcomes` as it is | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts withholdLaunchOutcomes body unchanged in git diff |
| 8 | The clock change does not extend the `withholdLaunchOutcomes` response rewriting | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts git diff: withholdLaunchOutcomes route handler unchanged; clock via pausePageClockAt/watchRecordReads only |
| 9 | Whether the change is kept depends on its measured gain against a comparable focused baseline | slice 3 | observed: PLAN.md Current decisions: slices 1 and 2 retained on measured focused gain against the recorded comparable baseline |
| 9.1 | A change with no measured gain is undone | slice 3 | observed: No change without a measured gain arose; PLAN.md Current decisions records both retained changes with measured gains |
| 9.2 | A change with no measured gain is recorded | slice 3 | observed: PLAN.md Accepted proof slices 1-3 record the measured outcome; the TEST-OPTIMIZATION-CANDIDATES.md accepted entries agent-launch-poles and long-integrated-journeys carry the focused before/after timings |
| 10 | After `release()`, the closed-terminal race shows the quiet actions row after one paced read, with the panel still closed and no new attach | slice 1 | observed: dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts closed race: await release() (one passOnePace asserting exactly one read) then expectQuietAdHocActionsRow, panel count 0, attaches unchanged |
| 11 | After the reported completion, the attention card shows the message after paced reads, without a reload | slice 2 | observed: dashboard/tests/agent-completion-attention.spec.ts: after report("completed"), passOnePace then messagePartOf(queued).text toHaveText(text), Unread report: Completed with attention, Mark as read, with no reload |
| 11.1 | The same card later shows "Unfinished work" after paced reads, without a reload | slice 2 | observed: dashboard/tests/agent-completion-attention.spec.ts: after report("unfinished"), passOnePace then queued toContainText("Unfinished work"), before any reload |
