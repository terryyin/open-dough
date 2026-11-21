# Source-only review

The fresh Codex `source_review` launch in dashboard session
`1b49221c-d0f7-4e59-b457-e5683caaf585` supplied only the selected seed's goal,
scope and key examples and the correction input's preserved behavior and
scope limits. It had no conversation inheritance and was instructed to read no
other files and change nothing. The launch and actual return are in that session.

The correction comes from the execution retrospective of
`SEED-413#split-done-mark-decision-from-store`. Its purpose is to let
Dashboard maintainers update the proof of Done capture, persistence, or session
Review behavior when they change that behavior. Aborts, deadlines, and
lifecycle ordering are preserved product baselines. Observation decision and
store separation, branch entry, observation and landing store reads, landing
store design, launch presets, and timing targets stay with their respective
stories.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | After a Default main launch amends its work and rebases it onto a pulled trunk commit, the capture result identifies the surviving session run from the real Git reflog. | slice 1 | observed: dashboard/backend-tests/review/done-kept-session-rebased-runs.spec.ts, capture keeps the published run when an amended session rebases onto pulled trunk. The dated Default main launch amends its second commit before rebasing with git pull, and readSessionCommits returns exactly the pulled trunk tip to the published session tip. Git observes the surviving files and amended bytes. |
| 2 | If that launch enters a branch and Default main advances again, its saved Default main capture ends at the recorded branch-entry tip. | slice 2 | |
| 3 | When two launches overlap in one Default main checkout, the attribution result identifies the checkout as shared. | slice 2 | |
| 4 | Marking one of those launches Done stores that launch’s captured run in its saved session. | slice 2 | |
| 5 | The saved capture for that launch carries the shared-checkout flag. | slice 2 | |
| 6 | When an accepted branch tip has a prepared receipt at Done, the saved session retains the branch result. | slice 3 | |
| 7 | The saved session retains the prepared receipt alongside that branch result. | slice 3 | |
| 8 | Done recording uses the prepared receipt for that accepted branch tip. | slice 3 | |
| 9 | With a verified manual merge and no prepared receipt, Done saves the branch pair in the session. | slice 3 | |
| 10 | Under the same conditions, Done saves the delivery pair in the session. | slice 3 | |
| 11 | Under the same conditions, Done pins the branch pair in Git. | slice 3 | |
| 12 | Under the same conditions, Done pins the delivery pair in Git. | slice 3 | |
| 13 | If a working file changes after Done snapshots it but before Done settles, a representative historical Review file read after worktree retirement returns the earlier bytes. | slice 5 | |
| 14 | A representative historical Review read after pruning can still read the supported retained evidence. | slice 6 | |
| 15 | The production Review boundary resolves the requested session using its source, host, and session identity. When two hosts share a native session ID, it resolves the requested host’s record. | slice 8 | |
| 16 | The comparison handler receives the session record resolved by the Review boundary. | slice 8 | |
| 17 | The file handler receives the session record resolved by the Review boundary. | slice 8 | |
| 18 | With composed retained evidence for two hosts sharing a native session ID, comparison uses the retained run from the requested host’s record. | slice 8 | |
| 19 | With composed retained evidence for those hosts, the file read uses the literal file pair from the requested host’s record. | slice 8 | |
| 20 | File admission evaluated against composed retained evidence preserves the refusal for an unknown source. | slice 8 | |
| 21 | File admission evaluated against composed retained evidence preserves the refusal for a missing session. | slice 8 | |
| 22 | File admission evaluated against composed retained evidence preserves the refusal for a story launch. | slice 8 | |
| 23 | The revised proof has fewer cases while retaining protection for distinct regressions. | slice 8 | |
| 24 | The revised proof performs fewer full Review reads while retaining representative reads that establish evidence survival. | slice 8 | |
| 25 | The procedures that imitate Done are retired. | slice 3 | |
| 26 | The procedures that route unrelated tests through Review are retired. | slice 8 | |
