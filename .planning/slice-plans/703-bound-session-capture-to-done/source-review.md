# Source-only review

Launch: fresh general-purpose reviewer (no plan, product files, or conversation inheritance).
Input: Goal and Scope from
`.planning/seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#bound-capture-to-done`,
plus the plan-homed Correction input and preserved expected-result decisions
(not Ordered slice). Reviewer returned numbered commitments below.

Acceptance: slice 1 compared return, product (`sessionCommitsCapture.ts`
tip-before-log + ancestor filter), and proof in
`ad-hoc-session-commits-pending-done.spec.ts` plus related suites / run records
under the checkout evidence directory.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Review/comparison shows only commits through the Done named there. Goal: “A developer opening a Default main session's review sees only the commits through the Done shown there, even when the checkout read starts later or waits for another read.” Correction: “the session's commits through the Done named in the review.” Scope: “Use the Done being captured to bound which checkout evidence can contribute to its comparison.” Preserved: “Use the current durable Done and existing checkout evidence. A trustworthy boundary can keep the commits already present when Done was written.” Qualifications: Default main session review; bound by the durable Done being captured; holds even when the checkout read starts later or waits for another read. Journey: after quiet receipt, held Git log, then `after-done.txt` before release — review naming the earlier Done must not treat the third commit as that Done’s tree. | slice 1 | observed: `dashboard/backend-tests/review/ad-hoc-session-commits-pending-done.spec.ts` “a held Done keeps…” — review names `secondDone` with `tree: second`; `after-done.txt` file reads 409; tip settled before held `git log -g` in `dashboard/server/sessionCommitsCapture.ts` `readSessionCommits`; scratch fault (log head) failed then restored |
| 2 | A commit made after that Done belongs to a later capture. Scope: “Another commit made after that Done belongs to a later capture.” | slice 1 | observed: same test — third quiet report after release → `tree: third` |
| 3 | When the Done boundary cannot be settled from available checkout evidence, keep the existing not-captured answer (claims no commits). Scope: “When the available checkout evidence cannot settle this boundary, retain the existing not-captured explanation.” Preserved: “When a boundary is unresolved, the existing not-captured answer claims no commits.” | slice 1 | observed: same file held later-Done / no-commit-inheritance tests return not-captured while capture is in flight; failed capture still sets `sessionCommitsFailedAt` in `recordDoneAt.ts` (tip-before-log has no Done/reflog same-second unresolved path) |
| 4 | Before treating timestamps as exact evidence, account for Git reflog whole-second ambiguity. Preserved: “Git's reflog has whole-second times. Account for ambiguous ordering before using timestamps as exact evidence.” | slice 1 | observed: `readSessionCommits` keeps launch lower bound on whole-second log times only; Done upper bound is tip-before-log, not Done vs reflog second equality (comment on `readSessionCommits`) |
| 5 | An ordinary empty result still says the session made no commits. Preserved: “An ordinary empty result still says the session made no commits.” | slice 1 | observed: related `ad-hoc-review*` / pending-done empty-result paths under evidence `related-ad-hoc-review` and `pending-done-primary` (exit 0) |
| 6 | Existing exclusions for merges, earlier replayed work, and uncommitted changes still stand. Preserved: “Existing exclusions for merges, earlier replayed work and uncommitted changes stand.” | slice 1 | observed: `madeSince` / moving / replaying unchanged; evidence `related-ad-hoc-session-commit` exit 0 |
| 7 | The comparison still uses the saved repository. Preserved: “The comparison still uses the saved repository.” | slice 1 | observed: capture still returns `--git-common-dir` repository; related session-commit review suites exit 0 |
| 8 | No separate landing or uncommitted review work is selected. Preserved: “No separate landing or uncommitted review work is selected.” | slice 1 | observed: no landing/uncommitted review product paths edited; related review suites exit 0 |
| 9 | Completion receipt, native Done handling, immutable retry rules, and existing comparison and reference lifecycles remain in force. Scope: “Keep the completion receipt, native Done handling, immutable retry rules, and existing comparison and reference lifecycles.” | slice 1 | observed: evidence `related-agent-launch-done` and `related-kept-commits-release` exit 0; `recordDoneAt` / Done admission ownership unchanged |
| 10 | Report acknowledgement keeps its existing ownership of the durable mark and native continuation. Preserved: “The report acknowledgement keeps its existing ownership of the durable mark and native continuation.” | slice 1 | observed: new pending-done test still uses quiet `session.report` to mark Done then capture |
| 11 | Later successful captures, exact receipt retry, pending capture visibility, current run/file admission, shared checkout context, and session-ref cleanup retain their existing promises. Preserved: “Later successful captures, exact receipt retry, pending capture visibility, current run/file admission, shared checkout context and session-ref cleanup retain their promises.” | slice 1 | observed: pending visibility in existing held tests; later capture in new test’s third Done; related done/release/session-commit suites exit 0 |

## Unnumbered source context

- Correction framing: plan-homed correction; completed execution of plan 700 reviewed at `a7a008a9f8473ded6a1bb0aa4f3c0cdf7d2dc8aa`.
- Settled defect baseline: server still chooses the latest observed HEAD and filters only by launch time in `dashboard/server/sessionCommitsCapture.ts`; same lower-only window predates this correction at `730571d29023631e33ef8bb8da3260fa6eb1fcd7`; plan 700 made the later Done obtain a fresh read.
- Failure evidence (2026-11-18, AC macOS host): after the held-read / post-Done commit sequence, the review returned the third commit as its tree while naming the earlier Done; assertion on the second tree failed with exit 1.
- Acceptance learning: dated fixtures set reflog via committer date; tip-before-log (not Done-wall-clock upper bound) preserves them while fixing the held-log race.
