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
| 2 | If that launch enters a branch and Default main advances again, its saved Default main capture ends at the recorded branch-entry tip. | slice 2 | observed: ad-hoc-session-branch-entry.spec.ts, Done saves the entry-time Default main run and the declared branch’s own pair. Default main advances after recorded branch entry and before setRecordDoneAt. A kept-session reread returns exactly checkout.base..entry.defaultTip and the independent entry.tree..result branch pair. |
| 3 | When two launches overlap in one Default main checkout, the attribution result identifies the checkout as shared. | slice 2 | observed: done-kept-session-shared-checkout.spec.ts, the two kept Default main launches overlap at Done and production attribution sets the saved capture’s shared flag. The direct historical-overlap case also returns true for an earlier launch that closed during this launch’s lifetime. |
| 4 | Marking one of those launches Done stores that launch’s captured run in its saved session. | slice 2 | observed: done-kept-session-shared-checkout.spec.ts, the real Done write is followed by a keptSession reread that observes the captured checkout base and actual Git commit together with the requested Done time. |
| 5 | The saved capture for that launch carries the shared-checkout flag. | slice 2 | observed: done-kept-session-shared-checkout.spec.ts, the keptSession reread asserts shared: true in the persisted sessionCommits after marking one of two overlapping Default main launches Done. |
| 6 | When an accepted branch tip has a prepared receipt at Done, the saved session retains the branch result. | slice 3 | observed: ad-hoc-prepared-landing-done.spec.ts, Done leaves the prepared receipt recordable after acceptance. A witnessed trunk base and published draft make a competing manual landing possible. After setRecordDoneAt the kept session has the exact entry tree and draft tip. |
| 7 | The saved session retains the prepared receipt alongside that branch result. | slice 3 | observed: ad-hoc-prepared-landing-done.spec.ts, the same kept-session reread after the real Done write observes the original preparation receipt, delivery and exact commit pair alongside the branch result and no substitute manual landing. |
| 8 | Done recording uses the prepared receipt for that accepted branch tip. | slice 3 | observed: ad-hoc-prepared-landing-done.spec.ts, production handleLanding records the original submission after Done, returns the prepared receipt with state recorded, and persists the same receipt, delivery and pair. |
| 9 | With a verified manual merge and no prepared receipt, Done saves the branch pair in the session. | slice 3 | observed: ad-hoc-branch-attribution.spec.ts, Done saves and pins the branch and delivery pairs after a manual merge. With no preparation, the real Done store retains the imported Git tree to the draft tip and excludes trunk-added paths. |
| 10 | Under the same conditions, Done saves the delivery pair in the session. | slice 3 | observed: ad-hoc-branch-attribution.spec.ts, the same real kept-session reread saves the actual merge’s trunk parent to the accepted merge and excludes the later trunk advance. |
| 11 | Under the same conditions, Done pins the branch pair in Git. | slice 3 | observed: ad-hoc-branch-attribution.spec.ts, the unprepared manual-merge case queries sessionBranchPins and compares both object IDs to the actual branch pair. |
| 12 | Under the same conditions, Done pins the delivery pair in Git. | slice 3 | observed: ad-hoc-branch-attribution.spec.ts, the unprepared manual-merge case queries heldLandingPins for the saved delivery and compares both object IDs to the actual trunk parent and merge. |
| 13 | If a working file changes after Done snapshots it but before Done settles, a representative historical Review file read after worktree retirement returns the earlier bytes. | slice 5 | observed: ad-hoc-branch-worktree-result.spec.ts, Done keeps the worktree snapshot through a later edit and forced retirement. The worktree ancestry request is held immediately after readBranchWorkspace snapshots. It edits the live draft, releases and awaits real Done, checks unchanged live index and HEAD, forcibly retires the worktree, checks the saved tree and pins, and reads the earlier draft bytes from the exact retained pair through the production file text response. |
| 14 | A representative historical Review read after pruning can still read the supported retained evidence. | slice 6 | observed: done-kept-session-commits.spec.ts, a Default main launch's commit kept at Done remains reviewable after trunk advances and every branch leaves it. A real Done mark captures dated Git work, reset and reflog expiry leave no branch carrying it, and after prune Review still returns the exact retained pair, files and run summary while HEAD and the live index match post-reset values. |
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
| 25 | The procedures that imitate Done are retired. | slice 4 | observed: Slice 3 removed keptAsDone and keptAsDoneAfterRetirement from doneCaptureReview.ts. Slice 4 removes the last composed test-store markDone procedure in composedLandingStores.ts. The two publisher cases inspect stored receipts and pins without a Done step, and the mixed historical case calls real setRecordDoneAt on the machine store used by the installed publisher. The consumer trace has no remaining caller of the removed procedures. |
| 26 | The procedures that route unrelated tests through Review are retired. | slice 8 | |
