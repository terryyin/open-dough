# Source review

Codex task `/root/source_reviewer` ran with no conversation inheritance. Its
launch supplied only the correction's Goal, Scope, preservation statement and
the referenced reviewed story's requirements, examples, limits, UI and
architecture. The inputs are the linked seed section and the
`keep-default-main-session-changes-for-review` section at `6d9e4c398`.
The launch and return are in the execution conversation. The same reviewer
split C41 into C41a and C41b on follow-up.

Follow-up means this correction. Reviewed means Keep Default main ad hoc
session changes for review.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | A future ad hoc session in the shared Default main checkout retains its starting point at launch. Reviewed Required behavior 1 includes default launches and blank launches. | slice 8 | |
| C02 | When the developer or automation marks the session Done, its launch record retains the qualifying commits made in that checkout from launch through the Done being reviewed. Follow-up Goal and Reviewed Required behavior 2. The checkout’s local Git log determines the window. The overlap example shows the commits in each session’s own window. | slice 8 | |
| C03 | The dashboard server can capture the comparison at Done from the checkout’s local Git log without session cooperation. Reviewed Architecture applies this to every host, blank launches, and plain Git pushes. The Reviewed plain-push and checkout Dough landing examples both use commits made in that checkout. | slice 8 | |
| C04 | A later automatic Done retains eligible commits through that later Done. Follow-up Scope 1. | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-session-commits-done.spec.ts: both later quiet report cases observe the second Done and review tree |
| C05 | Pulled or merged trunk changes are excluded from the retained comparisons, including changes to another part of a file the session changed. Follow-up Goal and Reviewed Required behavior 2. The Reviewed pulled-landing example excludes the story’s changes from both runs. | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-session-commit-runs.spec.ts: amended-merge file lists and pulled-landing notes.txt diffs |
| C06 | A merge commit is excluded from session commits, including when the merge commit has been amended. Follow-up Scope 2. | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-session-commit-runs.spec.ts: ordinary and amended merge cases exclude the merge from commit runs |
| C07 | An amended session commit is retained in its final form. Reviewed Required behavior 2. The amended-then-rebased example retains both final commits in one comparison. | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-session-commit-runs.spec.ts: amended then rebased case retains the amended file and two final commits |
| C08 | A rebased session commit is retained in its final form. Reviewed Required behavior 2. The amended-then-rebased example excludes the pulled trunk work and retains both rebased commits in one comparison. | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-session-commit-runs.spec.ts: amended then rebased case and publish-from-checkout test keep the rebased tip with session files |
| C09 | A continued cherry-pick is retained in its final form. Follow-up Scope 3. | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-session-commit-rewrites.spec.ts: continued cherry-pick review pair and HTTP file text contain the conflict resolution |
| C10 | A rebase fixup of session commits is retained in its final form. Follow-up Scope 3. | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-session-commit-rewrites.spec.ts: autosquashed fixup returns one rewritten commit with both files |
| C11 | A rebase squash of session commits is retained in its final form. Follow-up Scope 3. | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-session-commit-rewrites.spec.ts: autosquashed squash returns one rewritten commit with both files |
| C12 | Each uninterrupted run of qualifying commits has one retained comparison with fixed endpoints at the commit immediately before the run and the last commit in the run. Reviewed Required behavior 3 and Architecture. The pulled-landing example has two runs. The amended-then-rebased example has one. | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-session-commit-runs.spec.ts: pulled landing and amended merge pair endpoints, plus single run after amendment and rebase |
| C13 | A session with one uninterrupted run opens directly on its single comparison. Reviewed Required behavior 3. | slice 6 | |
| C14 | The Comparison switch is absent for a single comparison. Reviewed plain-Git-push example, including after Done and trunk advance. | slice 6 | |
| C15 | When pulled work interrupts the session commits, the Comparison switch lists the retained runs. Reviewed Required behavior 3. The pulled-landing example yields two runs. | slice 6 | |
| C16 | The Comparison switch lists interrupted runs oldest first. Reviewed Required behavior 3. | slice 6 | |
| C17 | With interrupted runs, the review opens on the first comparison. Reviewed Required behavior 3. | slice 6 | |
| C18 | Each switch label reports its run’s commit count. Reviewed UI. | slice 6 | |
| C19 | Each switch label reports the subject of its run’s last commit. Reviewed UI. | slice 6 | |
| C20 | Each switch label reports the time of its run’s last commit. Reviewed UI. | slice 6 | |
| C21 | The review is offered on the Done session’s entry in Recently done. Reviewed Goal and Scope limits. The audience is the developer who launched the session and returns to its card after trunk has advanced. | slice 7 | |
| C22 | The context heading names session commits. Follow-up Goal and Reviewed UI. | slice 7 | |
| C23 | The context identifies the comparison as commits made in the Default main checkout while the session was open. Reviewed Required behavior 4. | slice 7 | |
| C24 | The context shows the comparison’s exact two revisions. Reviewed Required behavior 4 and UI. | slice 7 | |
| C25 | If another session was open in the same checkout during the window, the context says that session’s work may be included. Reviewed Required behavior 4 and overlapping-launch example. Each overlapping review uses its own window. | slice 7 | |
| C26 | The shared-checkout note appears as its own sentence beside the two revisions and before the files. Reviewed UI. | slice 7 | |
| C27 | The review uses the landed-run review panel. Reviewed UI. | slice 6 | |
| C28 | The review uses the landed-run file browser. Reviewed UI. | slice 6 | |
| C29 | When shown, the review uses the landed-run Comparison switch. Reviewed UI. | slice 6 | |
| C30 | When the available checkout evidence establishes that the session made no commits there, the review shows the no-commit explanation. Reviewed Required behavior 5 distinguishes this outcome from changes not captured. The blank-edit example made no commits. | slice 4 | observed: dashboard/backend-tests/review/ad-hoc-review-unavailable.spec.ts blank edit and ad-hoc-session-commit-runs.spec.ts pre-launch replay, both HTTP no-commit explanation |
| C31 | A session completed before the reviewed story keeps the changes-not-captured explanation. Reviewed Scope limits and pre-story default-launch example. | slice 4 | observed: dashboard/backend-tests/review/ad-hoc-review-unavailable.spec.ts older Done with no retained capture returns the not-captured explanation |
| C32 | If the checkout log cannot be read at Done, the session keeps the changes-not-captured explanation. Reviewed Scope limits. | slice 5 | observed: dashboard/backend-tests/review/kept-commits-release-after-done.spec.ts: unreadable real log at second Done returns not captured |
| C33 | If a log entry wrote a commit that capture cannot place, the session keeps the changes-not-captured explanation. Follow-up Goal and Scope 3. | slice 4 | observed: dashboard/backend-tests/review/ad-hoc-review-unavailable.spec.ts lone reword and reword with a still-reachable commit both return not captured |
| C34 | If all the session’s commits have left the checkout’s `HEAD` at capture, the session keeps the changes-not-captured explanation. Follow-up Goal and Scope 3. | slice 4 | observed: dashboard/backend-tests/review/ad-hoc-review-unavailable.spec.ts only commit left on the side branch returns not captured |
| C35 | The unavailable review describes the missing review as belonging to the session. Follow-up Goal and Scope 5. The source specifies session wording without supplying a literal string. | slice 7 | |
| C36 | Retained comparisons stay readable as trunk advances, for as long as the launch record is kept. Reviewed Required behavior 6 and plain-push example. | slice 8 | |
| C37 | Retained comparisons stay readable after their commits leave every branch, for as long as the launch record is kept. Reviewed Required behavior 6. This condition applies to comparisons already retained. | slice 5 | observed: dashboard/backend-tests/review/ad-hoc-session-commits.spec.ts: real checkout commit outside every branch still gives exact review pair after pruning |
| C38 | Releasing the launch record releases its retained comparisons and their session-commit references, whatever capture the record still holds. Reviewed Required behavior 6 and Follow-up Scope 4. | slice 5 | observed: dashboard/backend-tests/review/kept-commits-release-after-done.spec.ts: real Done pins removed on deletion, failed capture and legacy no-capture deletion; kept-commits-release.spec.ts covers expiry and neighboring records |
| C39 | Reading the retained comparisons through the landed-run reader is observation-only. Reviewed Architecture. | slice 5 | observed: dashboard/backend-tests/review/ad-hoc-session-commits.spec.ts: detached comparison review retains checkout HEAD and index; storyReviewSessionCommits.ts uses the landed reader and Git queries |
| C40 | Capture writes only the references needed to keep each comparison pair’s commits. Reviewed Architecture. | slice 5 | observed: dashboard/backend-tests/review/kept-commits-release-after-done.spec.ts: exact Git ref set after Done adds only actual comparison base and revision |
| C41a | The first guide states the delivered behavior. Follow-up Scope 5. | slice 1 | observed: dashboard/AGENT-LAUNCH-COMPLETION.md, Session commits kept at Done |
| C41b | The second guide states the delivered behavior. Follow-up Scope 5. | slice 7 | |
| C42 | The review’s page objects are reorganized. Follow-up Scope 6. | slice 6 | |
| C43 | The review’s spec support is reorganized. Follow-up Scope 6. | slice 8 | |
| C44 | The review’s overlapping cases are reorganized. Follow-up Scope 6. | slice 7 | |
| C45 | The reorganization preserves proof of the reviewed promises. Follow-up Scope 6 and closing scope sentence. The product promises being preserved are listed above. | slice 8 | |

ADR 0008 permits machine-local evidence to supplement the published view, and
a time window cannot establish which session authored a commit. The maintenance
goal makes references, tests and guides findable without first-delivery residue.
The Reviewed deferrals remain uncommitted edits in the shared checkout,
separate capture of Dough landing for a default launch and a combined view of
interrupted runs. A landing from the shared checkout is represented by eligible
commits there. A landing from a session-created worktree belongs to the
own-branch story.
