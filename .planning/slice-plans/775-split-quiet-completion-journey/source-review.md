# Source review

Launch: a fresh general-purpose subagent, without conversation inheritance, on
2026-11-22. Input: only the story's Goal, Scope, Key examples and Baseline text
from [SEED-341#split-quiet-completion-journey](../../seeds/SEED-341-simplify-session-tests.md#split-quiet-completion-journey),
with the source-only reviewer instructions. No plan, product or proof.

Unnumbered context returned: the scope limit (no other completion spec and no
dashboard behavior changes); the baseline serial-work and load figures; the
developer's choice of the split over moving fixture cost or overriding the
timeout; the diagnosis record and parked patch at `3a1ba5ca6`; the split covers
Land, Story Branch Wrap Up and Trunk Wrap Up.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Each case passes inside the default 30 s timeout under load, so local and CI runs agree ("At load about 50 on 16 cores, each case in both owners passes inside 30 s.") | slice 2 | observed: Slice 2 load comparison: split quiet cases 9.1-14.4 s and page cases 4.6-8.1 s at 1-minute load 40-71 on 16 cores, all passing under the default 30 s |
| 2 | The default timeout stays, with no override added | slice 2 | observed: diff of e2e/sessions/agent-completion-quiet.spec.ts, e2e/sessions/agent-completion-quiet-done.spec.ts and installedCompletionClosure.ts: no test.slow or timeout override |
| 3 | The Closure and reporting owner proves its rules without a browser page | slice 2 | observed: e2e/sessions/agent-completion-quiet.spec.ts has no page fixture; DEBUG=pw:browser showed no browser for all 9 quiet cases (s2-m-split*) |
| 4 | The Page owner starts from a composed record that is already retired and reported | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts quietlyDone: retained() + makeMe.aCompletionReport receipt and doneAt, no launch/closure/reporting |
| 5 | The real installed closure retires accepted work before quiet reporting | slice 2 | observed: e2e/sessions/agent-completion-quiet.spec.ts withInstalledCompletionClosure: Git log push and worktree remove, workspace gone, doneAt undefined until the report (s2-gate) |
| 6 | Reporting records the completion: a receipt, `doneAt`, and no native interruption | slice 2 | observed: e2e/sessions/agent-completion-quiet.spec.ts receipt toMatchObject recorded/completed, stored completion receipt and doneAt == receivedAt, no turn/interrupt, turn/start or thread/resume (s2-gate) |
| 7 | The rename happens after the receipt | slice 2 | observed: e2e/sessions/agent-completion-quiet.spec.ts poll of thread/name/set after the receipt equals one done-<name> rename (s2-gate) |
| 8 | Story Branch Wrap Up: a first report that fails to write is retried, and the retry records the completion | slice 2 | observed: e2e/sessions/agent-completion-quiet.spec.ts Story Branch failedCompletionRetry then the report records the receipt (s2-gate) |
| 9 | Story Branch Wrap Up: a duplicate report returns the same receipt, with no native call and no Git | slice 2 | observed: e2e/sessions/agent-completion-quiet.spec.ts Story Branch duplicate: same receipt, no native calls, Git log unchanged (s2-gate) |
| 10 | Trunk Wrap Up: a refused native rename is recorded as a done problem and the entry offers Mark as done | slice 2 | observed: e2e/sessions/agent-completion-quiet.spec.ts Trunk poll of stored doneProblem containing 'Native rename refused.'; e2e/sessions/agent-completion-quiet-done.spec.ts second case shows the refusal and Mark as done |
| 11 | Trunk Wrap Up: a retried submission clears the problem with exactly one rename | slice 2 | observed: e2e/sessions/agent-completion-quiet.spec.ts Trunk retry clears doneProblem; second retry makes no thread/name/set; final name done-<name> (s2-gate) |
| 12 | The kept landing leaves the story Taken | slice 2 | observed: e2e/sessions/agent-completion-quiet.spec.ts kept-landing callback: landing defined, doneAt undefined, no rename (s2-gate) |
| 13 | Recently done shows Done and "Native session is still working" for a quiet completion | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts first case: recent toContainText Done and 'Native session is still working' |
| 14 | That Recently done entry shows no Startup recovery and no attention message | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts first case: startupRecovery count 0, .session-attention-message count 0 |
| 15 | That entry reads the native final report "Done." | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts first case: readFinalReport reportText 'Done.' via thread/read includeTurns |
| 16 | That entry still shows Done after a reload | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts first case: reloadUntilRead then recent toContainText Done |
| 17 | Every current observation survives at its named owner; one is removed only when another test already proves the same rule | slice 2 | observed: removed page observations now in e2e/sessions/agent-completion-quiet-done.spec.ts (Done/still working, no Startup recovery, no attention message, final report via thread/read with turns, Done after reload, refusal and Mark as done); all other assertions are kept in e2e/sessions/agent-completion-quiet.spec.ts |
| 18 | The parked observer-stop repair is decided: kept only after one green run reaches its path, otherwise not kept | slice 2 | observed: Slice 2 notes: patch kept after green s2-patch run reaching the success-path result.json assertion for Story Branch and Trunk |
