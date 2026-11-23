# Source-only review

A fresh general-purpose reviewer (`source_review`) received only the selected
seed's Goal, Scope, and Key examples. Its launch and response are retained in
the execution conversation. The history payload and live transport have their
own stories. The recorded Done mark determines recurring read membership, and
the slice replaces the superseded behavior and assertions together.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | Recurring Codex observation reads a tracked open session even when older Done records precede it and Recently done holds hundreds of conversations. (Goal, Scope 1, Example 1) | slice 1 | observed: dashboard/backend-tests/sessions/agent-launch-codex-open-polling.spec.ts, exact [open] batch with 427 older saved Done records |
| P02 | Recurring Codex observation excludes sessions marked Done by the dashboard, including a conversation the developer continues directly in Codex. (Scope 1 and 4, Example 1) | slice 1 | observed: dashboard/backend-tests/sessions/agent-launch-codex-open-polling.spec.ts, exact batch excludes every saved identity even though explicit stateOf reads saved-0 Working |
| P03 | Sessions shows the current observed status for open Codex work. In the example, the newer open session shows Working. (Goal, Scope 4, Example 1) | slice 1 | observed: dashboard/backend-tests/sessions/agent-launch-codex-open-polling.spec.ts, open row reads Working, also e2e/sessions/agent-launch-codex-observation.spec.ts |
| P04 | Recently done lists the saved Done entries and reads their saved records, including for a conversation currently working directly in Codex. (Scope 1 and 3, Example 1) | slice 1 | observed: dashboard/backend-tests/sessions/agent-launch-codex-open-polling.spec.ts, all retained identities read Done, also e2e/sessions/agent-terminal-done-codex-page.spec.ts refused interrupt keeps active native conversation Done through reload |
| P05 | Recently done continues to provide saved review evidence. (Scope 3) | slice 1 | observed: e2e/review/recently-done-one-shot-review.spec.ts, saved landing and exact review diffs after checkout and branch retirement |
| P06 | Recently done continues to provide saved completion evidence. (Scope 3) | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts, quiet completion reads Done with no attention and the retained answer |
| P07 | Opening a Done session’s terminal checks that conversation on demand. (Scope 2, Example 2) | slice 1 | observed: e2e/sessions/agent-terminal-done-codex-page.spec.ts, failed attach issues exactly one thread/read for the saved native identity |
| P08 | A failed terminal attachment preserves the same saved Done record and leaves its entry Done. (Scope 2, Example 2) | slice 1 | observed: e2e/sessions/agent-terminal-done-codex-page.spec.ts, failed attach leaves the exact saved doneAt and Done row |
| P09 | A successful terminal attachment restores that session’s terminal history. (Example 2) | slice 1 | observed: e2e/sessions/agent-terminal-done-codex-page.spec.ts, successful reconnect displays original retained terminal history |
| P10 | A successful terminal attachment reopens the same session and returns its entry to the open list. (Scope 2, Example 2) | slice 1 | observed: e2e/sessions/agent-terminal-done-codex-page.spec.ts, successful reconnect clears doneAt and restores the same native session to the open list through reload |
| P11 | A successful terminal attachment brings the reopened session back into recurring live status observation. (Scope 2, Example 2) | slice 1 | observed: e2e/sessions/agent-terminal-done-codex-page.spec.ts, actual readiness clears Done, and dashboard/backend-tests/sessions/agent-launch-codex-open-polling.spec.ts, exact [saved-0, open] batch after that persisted transition |
| P12 | A Done session’s final report remains available through its dedicated read, including after its workspace has retired. (Scope 3, Example 3) | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts, retired workspace report opens and returns the exact native final answer |
| P13 | The final report opens read-only in the retired-workspace journey. (Example 3) | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts, dedicated history read, and dashboard/backend-tests/sessions/final-report-codex.spec.ts, exact passive native requests and absent workspace |
| P14 | Reading the final report of a Done session whose workspace has retired leaves that session Done. (Example 3) | slice 1 | observed: e2e/sessions/agent-completion-quiet-done.spec.ts, exact Done while the final report is open and after reload |
