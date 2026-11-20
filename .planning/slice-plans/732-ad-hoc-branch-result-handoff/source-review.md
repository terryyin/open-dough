# Source review

Launch: a fresh general-purpose subagent (no fork, no conversation inheritance)
on 2026-11-20, given only the selected story section of
SEED-413#ad-hoc-branch-result-handoff (title, Goal, Scope with its scope limits,
Key examples, Effort hypothesis), told to read no project files, change
nothing, and number independently observable promises.

Unnumbered context it returned: the CI timing baseline (reason, not a target);
why the quiet-retry drop is safe; the scope limits (quiet Done precedence and
the launch-input wiring case stay with the parent story; observation and
publication with `SEED-413#arrange-done-ad-hoc-observation-and-publication`;
the Done lifecycle with `SEED-413#ad-hoc-done-lifecycle`); the effort
hypothesis.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1a | The moved cases are plain Node Vitest cases calling `setRecordDoneAt`, `recordSessionBranchEntry`, `replaceKeptSession`, `bindRecord` and `deleteRecord` directly with MakeMe kept records and real Git (Goal) | slice 5 | |
| 1b | Cases leave the four listed boundary specs; they no longer start the boundary server, launch sessions, run the reporting CLI or hold Git through a `PATH` shim; each keeps its distinct inputs and expected outcomes (Scope) | slice 5 | |
| 2 | A capture is held by a typed ancestry read that the production capture accepts, in place of the `PATH` shim (Scope bullet 5) | slice 1 | observed: dashboard/server/sessionBranchCapture.ts readBranchResult readAncestry = runGit, threaded via setRecordDoneAt option readAncestry; held by aHeldDone in dashboard/backend-tests/review/ad-hoc-branch-result-supersession.spec.ts |
| 3a | Reopening keeps the branch evidence (Scope, race spec) | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-branch-result-supersession.spec.ts 'reopening keeps the branch evidence…': pins() equals originalPins after undoDone |
| 3b | Reopening refuses the old file pair (Scope, race spec) | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-branch-result-supersession.spec.ts 'reopening keeps the branch evidence…': old fileText rejects RefusedRequest status 409 |
| 4 | While a stale Done's capture is held, the review is unavailable (Scope; key example "A newer Done wins") | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-branch-result-supersession.spec.ts 'a newer Done wins over a held stale capture…': review is unavailable while held |
| 5 | A newer Done wins with only its pins: after release the review shows the branch result at `latest`; pins are the baseline and `latest`, never `stale` (Scope; key example) | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-branch-result-supersession.spec.ts 'a newer Done wins over a held stale capture…': branch-result tree latest; pins [baseline, latest], not stale; fails with guard disabled (evidence s1-discriminate-guard.log) |
| 6 | Deleting a record while its capture reads leaves no pins (Scope, race spec) | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-branch-result-supersession.spec.ts 'deleting a record while its Done capture is reading…': pins [] ; fails with keepBranchResultRefs before write (s1-discriminate-keep.log) |
| 7 | Done keeps the working tree it read: staged, untracked and deleted files, not ignored ones (Scope, worktree spec) | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-branch-worktree-result.spec.ts: result.files are deleted.txt deleted, draft/staged/untracked added, no ignored.txt; fileText of deleted.txt and draft.txt |
| 8 | The capture leaves the index, HEAD and files untouched (Scope, worktree spec) | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-branch-worktree-result.spec.ts: index bytes equal originalIndex, HEAD is committedTip, draft.txt keeps the later edit after Done |
| 9 | An edit made while the capture is held is excluded (Scope, worktree spec) | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-branch-worktree-result.spec.ts: edit written during aHeldDone; diff and text still show 'draft left for review'; fails with tree read after ancestry (s2-discriminate.log) |
| 10 | The result survives a forced retirement (Scope, worktree spec) | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-branch-worktree-result.spec.ts: after retireAdHocBranch discardWorkingChanges, review reads branch-result, pins [baseline, tree, committedTip], committedTip still a commit |
| 11 | A declared branch keeps its entry state and default tip (Scope, handoff spec) | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-session-branch-entry.spec.ts 'a declared branch keeps its entry state…': entry committedTip entered, defaultTip onMain; pins [entered, onMain, tree] |
| 12 | A declared branch answers the same entry after main moves (Scope, handoff spec) | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-session-branch-entry.spec.ts 'a declared branch keeps its entry state…': second recordSessionBranchEntry after main moves equals the first entry; fails with existingEntry undefined (s3-discriminate-existing.log) |
| 13a | A foreign clone is refused (Scope, handoff spec) | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-session-branch-entry.spec.ts 'a branch entry refuses…': foreign clone rejects status 409; fails with both workspace guards removed (s3-discriminate-both.log) |
| 13b | A wrong branch for the worktree is refused (Scope, handoff spec) | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-session-branch-entry.spec.ts 'a branch entry refuses…': other worktree with branch draft rejects status 409; same discrimination |
| 13c | A second different entry is refused (Scope, handoff spec) | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-session-branch-entry.spec.ts 'a branch entry refuses…': a second entry to the other worktree rejects status 409; fails with existingEntry undefined (r3-discriminate-existing.log); 'two declared sessions each review their own branch' |
| 14 | An undeclared checkout move explains the missing branch association: "No branch was identified for this session, and no Default main commits were captured." (Scope; key example "Undeclared move") | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-session-branch-entry.spec.ts 'an undeclared checkout move…': landing-unavailable with the exact explanation; fails with branchEntryMissing never set (s3-discriminate-missing.log) |
| 15 | After Cursor replaces its chat (A to B), the branch pins stay owned by the original chat (Scope; key example "Cursor replacement") | slice 4 | |
| 16a | Deleting the replacement releases only those pins; another launch's pins remain (Scope; key example) | slice 4 | |
| 16b | Expiring the replacement releases only those pins (Scope, cursor spec) | slice 4 | |
| 17 | A stale native replacement keeps a branch identified while it was pending (Scope, cursor spec) | slice 4 | |
| 18 | `review/ad-hoc-branch-result-quiet-retry.spec.ts` is removed (Scope bullet 6) | slice 5 | |
| 19 | Each `dashboard/test-support/` module or export whose last consumer leaves is retired, starting with `cursorBranchRecovery.ts` (Scope bullet 7) | slice 5 | |
| 20 | No new `dashboard/test-support/` module or export is added (Scope bullet 7) | slice 5 | |
