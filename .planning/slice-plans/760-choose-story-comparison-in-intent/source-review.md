# Source review for SEED-420#choose-story-comparison-in-intent

The coordinator launched a fresh general-purpose reviewer on 2026-11-21 with
no conversation inheritance. Its only input was the story's Goal, Scope, Out
of scope, Key examples, UI, Architecture and Effort hypothesis text from the
seed. It was told to read no files and change nothing. The launch input and
returned commitments are in this execution's Claude Code conversation.

Unnumbered context returned: the Goal's reason (Review changes can send a
story to Intent without losing a choice); "present defaults and availability"
qualifies 1–5; Sessions picker, session runs, merged changes and proof for the
chosen comparison are out of scope; the choice is presentation state and not
part of a link; Compare's placement follows the design direction; the
Architecture paragraph; effort M, low confidence.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | All changes is offered, and a Taken story opens on all changes with uncommitted changes included, as today. (Scope 1; Key example 1) | slice 2 | observed: dashboard/frontend-tests/intent/intent-story-compare-commits.spec.ts: opens on All changes with uncommitted changes included |
| 2 | Include uncommitted changes is offered with All changes while the worktree holds uncommitted changes; clearing it removes files only uncommitted edits changed, such as `landing.ts`. (Scope 1; Key example 2) | slice 3 | observed: dashboard/frontend-tests/intent/intent-story-compare-uncommitted.spec.ts: check shown and on with All changes; clearing removes dashboard/tests/landing.spec.ts (Intent's file view lists located files, so the story's landing.ts is its located counterpart) and the header's uncommitted words; hidden under Commits; absent for a worktree without uncommitted changes |
| 3 | Commits offers a contiguous range of the story's commits and its uncommitted changes chosen by two ends; the two oldest commits list only their files, each diff from the commit before them. (Scope 1; Key example 1) | slice 2 | observed: dashboard/frontend-tests/intent/intent-story-compare-commits.spec.ts: Commits, two oldest ends list only their Modified/Added files; range query asks first.fromTree to second.tree |
| 4 | Published completion is offered; a Done story whose worktree is retired opens on it and the header names the completion revision. (Scope 1; Key example 3) | slice 4 | observed: dashboard/frontend-tests/intent/intent-story-compare-done.spec.ts: opens on Published completion naming the completion revision, without a run choice |
| 5 | Landed runs is offered with a choice among captured runs; choosing one lists its changes and names its tree. (Scope 1; Key example 3) | slice 4 | observed: dashboard/frontend-tests/intent/intent-story-compare-done.spec.ts: Landed runs then the older run lists older.txt and the header names tree 2222222 |
| 6 | Refresh reads the worktree again and keeps the choice; a new commit appears and a cleared uncommitted check stays cleared. (Scope 1; Key example 2) | slice 3 | observed: dashboard/frontend-tests/intent/intent-story-compare-uncommitted.spec.ts: Refresh answered by the next snapshot shows the new commit's file and 'third change', the check stays cleared and landing.spec.ts stays absent |
| 7 | A choice changes the listed changed files, their change markers and every diff together. (Scope 2; Key example 1) | slice 2 | observed: dashboard/frontend-tests/intent/intent-story-compare-commits.spec.ts: after choosing the range, listed files, markers and diff change together |
| 8 | The header names what is compared: two revisions, or for a commit range its count and two ends, as the Side panel review names them. (Scope 2; Key examples 1, 3) | slice 2 | observed: dashboard/frontend-tests/intent/intent-story-compare-commits.spec.ts: header 'Changes in 2 commits / From c1c1c1c first change to c2c2c2c second change.' |
| 9 | A selected file still changed under the new choice stays selected and shows its new diff. (Scope 2) | slice 2 | observed: dashboard/frontend-tests/intent/intent-story-compare-commits.spec.ts: selected file stays selected and shows its new diff |
| 10 | Unchanged files keep the source Intent reads today. (Scope 2) | slice 2 | observed: dashboard/frontend-tests/intent/intent-story-compare-commits.spec.ts: unchanged kept.spec.ts under a chosen range shows Purpose 'kept 11' |
| 11 | CI comparison, Proof and Intent coverage keep reading the story's default comparison and keep naming the build measured, whatever is chosen. (Scope 3; Key example 3; Architecture) | slice 5 | |
| 12 | While a non-default comparison is chosen, CI comparison, Proof and Intent coverage each say they describe the whole story. (Scope 3; Key example 1) | slice 5 | |
| 13 | A Done story's locations stay at its landed revision whatever is chosen. (Scope 3; Key example 3; Architecture) | slice 4 | observed: dashboard/frontend-tests/intent/intent-story-compare-done.spec.ts: under a chosen run every locations read names the completion revision and the CI comparison's landed endpoint text is unchanged |
| 14 | Switching among the story's views keeps the choice, including range and selected file (`landing.spec.ts` in a two-commit range survives CI comparison and back). (Scope 4; Key example 4) | slice 2 | observed: dashboard/frontend-tests/intent/intent-story-compare-commits.spec.ts: CI comparison and back keeps the range and selected file |
| 15 | Selecting a story, including the same story again later, opens on its default comparison; returning after another story opens on all changes. (Scope 4; Key example 4) | slice 2 | observed: dashboard/frontend-tests/intent/intent-story-compare-commits.spec.ts: Story B then A opens on All changes; Commits then shows no earlier range |
| 16 | A chosen comparison that cannot be read (commit range or landed run with missing objects) is explained where Intent explains the story's comparison and never reads as a story without changes. (Scope 5; Key example 5) | slice 6 | |
| 17 | A failed read of a chosen comparison offers Retry. (Scope 5) | slice 6 | |
| 18 | Other choices stay offered after an unreadable choice, e.g. Published completion when a landed run cannot be read. (Scope 5; Key example 5) | slice 6 | |
| 19 | The default comparison's gaps (no workspace on this machine, several worktrees holding the claim, a failed read) keep today's explanations. (Scope 5) | slice 6 | |
| 20 | A visible Compare choice sits beside the compared-revisions line in the Intent header. (UI) | slice 2 | observed: dashboard/frontend-tests/intent/intent-story-compare-commits.spec.ts + intentStoryPage.ts compare(): Compare visible in the story header beside compared revisions |
| 21 | The Intent header stays uncollapsible. (UI) | slice 2 | observed: dashboard/frontend-tests/intent/intent-story-compare-commits.spec.ts: storyHeaderDetail asserts the header has no collapsed control |
| 22 | Each control appears only with its choice: the uncommitted check with All changes, the commit ends with Commits, the run choice with Landed runs. (UI) | slice 4 | observed: dashboard/frontend-tests/intent/intent-story-compare-done.spec.ts: run choice shown only under Landed runs; intent-story-compare-uncommitted.spec.ts: check only with All changes; intent-story-compare-commits.spec.ts: commits only with Commits |
