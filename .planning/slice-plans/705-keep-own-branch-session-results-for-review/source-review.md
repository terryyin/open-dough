# Source-only review

Fresh Codex reviewer `/root/source_review` ran with no conversation inheritance. The launch supplied only the source's Goal, Scope, and Key examples from [SEED-379](../../seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#keep-own-branch-session-results-for-review) and the source-only review instructions. The review used no project files, plan, or execution evidence.

The source calls out a differing merge resolution as the reason the two comparisons can give different answers. Reviewer identification of rewritten delivery, automatic guessing of workspace ownership, and retroactive capture for older launches are outside this increment.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 01 | A future isolated ad hoc launch has its branch result available at Done through its standalone Recently done → Review changes entry. (Goal, Scope 1 and 3, isolated-session example) | slice 1 | observed: ad-hoc-branch-result.spec.ts: isolated start, manual Done and retained review after retirement; recently-done-ad-hoc-branch-result.spec.ts: standalone Review changes opens the branch list and file diff |
| 02 | A Default main session that identifies its own branch at entry has that branch result available at Done through its own entry. (Scope 1, Default main example) | slice 3 | |
| 03 | A Default main session that identifies its linked worktree at entry has that worktree’s branch result available at Done through its own entry. (Scope 1, Default main example) | slice 3 | |
| 04 | The Default main handoff associates the launch with the checkout it identifies. (Scope 1) | slice 3 | |
| 05 | The Default main handoff associates the launch with that checkout’s starting state. (Scope 1) | slice 3 | |
| 06 | Work from another session’s similarly named worktree stays out of the branch result. (Default main example) | slice 3 | |
| 07 | A successful branch capture shows the session’s committed work. (Scope 1, isolated-session example) | slice 1 | observed: ad-hoc-branch-result.spec.ts: the committed draft's exact pair, added file diff and complete text after pruning |
| 08 | A successful branch capture shows the working-tree changes the session leaves for review as they stood at Done, including the isolated session’s further uncommitted edit. (Scope 1, isolated-session example) | slice 2 | observed: ad-hoc-branch-worktree-result.spec.ts: reported Done after staged, unstaged, deleted and ignored changes; held validation and later edit; exact list, diff and text after worktree removal and pruning |
| 09 | Earlier branch work stays out of the branch result, including the pre-existing branch file in the Default main example. (Scope 1, Default main example) | slice 3 | |
| 10 | Changes incorporated from trunk stay out of the branch result’s file list. The isolated example’s trunk-only file is absent from the list. (Scope 1, isolated-session example) | slice 4 | |
| 11 | Changes incorporated from trunk stay out of the branch result’s file diffs. The isolated example’s trunk-only file is absent from the diffs. (Scope 1, isolated-session example) | slice 4 | |
| 12 | Evidenced Default main commit runs remain available. (Scope 1) | slice 5 | |
| 13 | A verified manual integration of the session’s committed branch is retained for its review after it reaches the authorized remote trunk. (Scope 2, manual-merge example) | slice 7 | |
| 14 | Verified Dough Land delivery from a session-identified worktree is retained for that session’s own Recently done entry. (Scope 2, Default main example) | slice 6 | |
| 15 | The delivered comparison requires delivery to the authorized remote trunk. Integration to another destination does not qualify. (Scope 2) | slice 7 | |
| 16 | The delivered comparison includes the actual conflict resolution that reached trunk, including a manual resolution that differs from the branch result. (Goal, Scope 2, manual-merge example) | slice 7 | |
| 17 | The delivered merge is compared against its trunk parent. (Manual-merge example) | slice 7 | |
| 18 | Verified delivery discovered after Done can be added to the same review while the launch record is retained. (Scope 2, manual-merge example) | slice 8 | |
| 19 | When both results exist, Recently done → Review changes shows the branch at Done and the delivery to trunk as distinct comparisons. (Goal, Scope 3) | slice 5 | |
| 20 | After the reviewer’s manual merge and worktree removal, the reviewer can still select the branch result containing the uncommitted edit. (Manual-merge example) | slice 8 | |
| 21 | Branch file list at Done remains readable after later trunk advance. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 | |
| 22 | Branch file list at Done remains readable after dashboard restart. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 | |
| 23 | Branch file list at Done remains readable after worktree removal. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 |  |
| 24 | Branch file diffs at Done remains readable after later trunk advance. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 | |
| 25 | Branch file diffs at Done remains readable after dashboard restart. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 | |
| 26 | Branch file diffs at Done remains readable after worktree removal. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 |  |
| 27 | Delivered file list remains readable after later trunk advance. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 | |
| 28 | Delivered file list remains readable after dashboard restart. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 | |
| 29 | Delivered file list remains readable after worktree removal. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 | |
| 30 | Delivered file diffs remains readable after later trunk advance. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 | |
| 31 | Delivered file diffs remains readable after dashboard restart. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 | |
| 32 | Delivered file diffs remains readable after worktree removal. The manual-merge journey includes a push, worktree removal, and a subsequent trunk advance. (Scope 3, manual-merge example) | slice 8 | |
| 33 | Deleting the launch record releases its evidence. (Scope 3) | slice 8 | |
| 34 | Expiry of the launch record releases its evidence. (Scope 3) | slice 8 | |
| 35 | If the session association cannot be established, the review explains that gap. (Scope 4) | slice 3 | |
| 36 | If the session association cannot be established, any captured branch result remains usable. (Scope 4) | slice 7 | |
| 37 | If the exact delivered change cannot be established, the review explains the delivery evidence gap. The matching-file squash without a session link is an example. (Scope 4, manual-merge and squash example) | slice 7 | |
| 38 | If the exact delivered change cannot be established, any captured branch result remains usable, including in the squash example. (Scope 4, manual-merge and squash example) | slice 7 | |
| 39 | A squash with matching files and no link to the session does not qualify as verified delivery. (Scope 2 and 4, manual-merge and squash example) | slice 7 | |
| 40 | A verified empty branch comparison says there were no changes. (Scope 4) | slice 1 | observed: ad-hoc-branch-result.spec.ts: successful empty pair distinct from the missing checkout; recently-done-ad-hoc-branch-result.spec.ts: the visible No changes body |
| 41 | A verified empty delivered comparison says there were no changes. (Scope 4) | slice 5 | |
