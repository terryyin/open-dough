# Independent source review

A fresh general-purpose reviewer (`/root/source_review`) received the selected
story’s Goal, Scope, key examples and Evidence and approach in its launch message.
The launch and returned table are retained in this execution’s conversation. The
reviewer had no conversation inheritance and was directed to read no project files
and change nothing.

The selected source preserves the exclusions and the ADRs governing the native
approach. The plan holds the comparison conditions and stopping rule for an
unqualified control.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | Run a small native Codex control using current source guidance. Scope. | slice 1 | observed: control.md: native app-server profile, pinned guidance, and the success, overdue failure and CI, and early user stop observations |
| P02 | If the control exposes avoidable empty wakes, compare it with a matched Codex candidate whose wait is bounded by both the next real check and the host limit. Scope and example 4. | slice 2 | |
| P03 | If the control does not expose avoidable empty wakes, skip the candidate comparison. Scope’s “only if” restriction. | slice 2 | |
| P04 | The worker retains ownership of its original command through the wait. Scope. | slice 1 | observed: control.md: one original worker-owned run to the 0 and 7 receipts, and the owned proof tree to the 143 terminal stop |
| P05 | The waiting developer gets the original proof result promptly. In the quiet success journey, the coordinator receives the recorded success after the check exits `0` before its next due check. Goal and example 1. | slice 2 | |
| P06 | In that quiet success journey, the owner returns the recorded success exactly once. Example 1. | slice 2 | |
| P07 | The candidate produces zero empty wakes in that quiet success journey. Examples 1 and 4. | slice 2 | |
| P08 | If the check is still live when it falls due, obtain bounded liveness evidence. Scope’s overdue diagnosis and example 2. | slice 2 | |
| P09 | If the live check takes the continuation path, continue the same command. Scope and example 2. | slice 2 | |
| P10 | If the live check takes the recovery path, record its explicit recovery state. Example 2. | slice 2 | |
| P11 | If the check fails, return the exact failure status, failing assertion, and log as the failure result. Example 2. | slice 2 | |
| P12 | If the user stops work during the wait, honor cancellation at the supported safe boundary. Scope and example 3. | slice 2 | |
| P13 | After cancellation, verify the state of the owned work. Example 3. | slice 2 | |
| P14 | If CI needs attention during the wait, act at the supported safe boundary. Example 3. | slice 2 | |
| P15 | Account for the observer separately from CI. Example 3. | slice 2 | |
| P16 | Account for CI completion against the applicable revision. Scope and example 3. | slice 2 | |
| P17 | If the change is adopted, the matched candidate shows lower combined coordinator and worker effort than the control. Goal and example 4. | slice 2 | |
| P18 | Record **Deploy** only when the matched Codex candidate satisfies the proof and intervention conditions, eliminates quiet empty wakes, and lowers combined effort. Goal, scope, and example 4. | slice 3 | |
| P19 | Otherwise, record **Do not deploy**. Example 4. | slice 3 | |
| P20 | On **Do not deploy**, retain the current guidance. Example 4. | slice 3 | |
| P21 | Record **Run the Claude Code trial** only when retained Claude Code evidence supports repeatable, recoverable savings from an eligible alternate owner large enough to justify the trial. Goal, scope, and example 5. | slice 3 | |
| P22 | Otherwise, record **Drop the Claude Code trial**, including when the retained evidence is inconclusive. Example 5. | slice 3 | |
| P23 | On **Run the Claude Code trial**, queue a separate follow-up. Scope and example 5. | slice 3 | |
| P24 | Queue no Claude Code trial follow-up on **Drop the Claude Code trial**. Example 5’s “only on a Run decision” restriction. | slice 3 | |
| P25 | Make the Claude Code decision independently of the Codex outcome. Example 5. | slice 3 | |
