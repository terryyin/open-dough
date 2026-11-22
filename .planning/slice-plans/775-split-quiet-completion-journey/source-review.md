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
| 1 | Each case passes inside the default 30 s timeout under load, so local and CI runs agree ("At load about 50 on 16 cores, each case in both owners passes inside 30 s.") | slice 2 | |
| 2 | The default timeout stays, with no override added | slice 2 | |
| 3 | The Closure and reporting owner proves its rules without a browser page | slice 2 | |
| 4 | The Page owner starts from a composed record that is already retired and reported | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts quietlyDone: retained() + makeMe.aCompletionReport receipt and doneAt, no launch/closure/reporting |
| 5 | The real installed closure retires accepted work before quiet reporting | slice 2 | |
| 6 | Reporting records the completion: a receipt, `doneAt`, and no native interruption | slice 2 | |
| 7 | The rename happens after the receipt | slice 2 | |
| 8 | Story Branch Wrap Up: a first report that fails to write is retried, and the retry records the completion | slice 2 | |
| 9 | Story Branch Wrap Up: a duplicate report returns the same receipt, with no native call and no Git | slice 2 | |
| 10 | Trunk Wrap Up: a refused native rename is recorded as a done problem and the entry offers Mark as done | slice 2 | |
| 11 | Trunk Wrap Up: a retried submission clears the problem with exactly one rename | slice 2 | |
| 12 | The kept landing leaves the story Taken | slice 2 | |
| 13 | Recently done shows Done and "Native session is still working" for a quiet completion | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts first case: recent toContainText Done and 'Native session is still working' |
| 14 | That Recently done entry shows no Startup recovery and no attention message | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts first case: startupRecovery count 0, .session-attention-message count 0 |
| 15 | That entry reads the native final report "Done." | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts first case: readFinalReport reportText 'Done.' via thread/read includeTurns |
| 16 | That entry still shows Done after a reload | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts first case: reloadUntilRead then recent toContainText Done |
| 17 | Every current observation survives at its named owner; one is removed only when another test already proves the same rule | slice 2 | |
| 18 | The parked observer-stop repair is decided: kept only after one green run reaches its path, otherwise not kept | slice 2 | |
