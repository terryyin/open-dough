# Source-only review

The fresh Codex reviewer `/root/source_review` started without conversation
inheritance. Its launch and numbered return are in this execution conversation.
The input was the selected seed section’s Goal, Scope, scope limits and key
examples at the established Take `d7bcd9af3`. The reviewer saw only that text
and the instruction to identify independently observable promises.

P01 and P02 use the 2026-11-19 inventory in Scope. It covers every case in
`ad-hoc-session-commit-runs`, `ad-hoc-session-commit-rewrites`,
`ad-hoc-session-commits-shared`, `ad-hoc-session-commits-file-text` and
`kept-commits-release-after-done`, three cases in `ad-hoc-session-commits`,
and six cases in `ad-hoc-review-unavailable`.

P47 retains native Done, rename, stop, removal, reported Done and retries,
the held checkout read, dashboard deletion and expiry, the launch that keeps
no start, branch result, manual landing, handoff and session comparisons.
The scope excludes a clock seam and edits to `Distribution/src/`. Imported
support remains while the retained tests use it. ADR 0010 guides evaluation
of speed, clarity and support removed.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | The inventoried capture cases and two review-only cases run as plain Node Vitest specs. | slice 7 | |
| P02 | The inventory retains every existing case and observation. The excerpt gives the inventory by reference, including reworded-commit and unreadable-log cases whose existing review assertions it does not state. | slice 7 | |
| P03 | A capture case puts its starting launch records in the launch document. | slice 6 | observed: slice-6-implementation.md family-wide commitments lists all seven capture specs writing their starting launch document through keepLaunchStore |
| P04 | A capture case marks the session Done in-process through `setRecordDoneAt`, passing the Done time stated by the case. | slice 6 | observed: slice-6-implementation.md maps all seven capture specs to their stated Done time passed to setRecordDoneAt |
| P05 | A case deletes a record only when it is proving reference release. | slice 6 | observed: done-kept-commit-refs-release.spec.ts uses deleteRecord only in cases asserting actual ref release or continued absence |
| P06 | A capture case that observes review passes the resulting kept records directly to the typed handler. | slice 5 | observed: slice-5-implementation.md and slice-6-implementation.md map every capture review from fresh keptRecords into typed handlers |
| P07 | The file-text and retained Default main landing cases exercise only the review handlers. | slice 1 | observed: kept-session-commits-review.spec.ts calls only storyReview and reviewedFileText after Git arrangement |
| P08 | The file-text and retained-landing cases build the kept records and pass them through `makeMe.aSessionReviewRead`. | slice 1 | observed: kept-session-commits-review.spec.ts builds both records with aLaunchRecord and passes them through aSessionReviewRead |
| P09 | The file-text and retained-landing cases build a real Git repository. | slice 1 | observed: kept-session-commits-review.spec.ts materializes each named Git history with materializeLocalCheckout |
| P10 | Review calls require no project configuration of their own. | slice 5 | observed: slice-5-implementation.md and slice-6-implementation.md identify all typed review inputs and their Git or private launch-store setup without project configuration |
| P11 | Stored launch document setup is limited to cases exercising the store, including the restriction against a review call requiring its own stored launch document. | slice 6 | observed: slice-6-implementation.md family-wide commitments distinguishes the seven capture specs writing the store from the two review-only cases |
| P12 | Each case states its times against its own clock. | slice 6 | observed: slice-6-implementation.md describes case-relative times and independently scoped Date in the two recapture cases |
| P13 | Launch precedes repository work. The source’s “work after the launch” restates this result. | slice 6 | observed: slice-6-implementation.md maps launch before captured work, with the deliberate pre-launch Git work verified as setup or excluded by capture |
| P14 | Done follows repository work. | slice 6 | observed: slice-6-implementation.md maps captured work before its respective stated Done, including the later work before recapture |
| P15 | Done is no later than the case’s now. | slice 6 | observed: slice-6-implementation.md maps the stated Done times to each case clock, with first historical marks at their local clock in the recapture cases |
| P16 | Launch records are stated through MakeMe. | slice 6 | observed: slice-6-implementation.md lists the MakeMe launch record call sites in the seven capture specs and both review-only cases |
| P17 | Repository work is stated through MakeMe as dated checkout steps. The listed steps are a commit, amend, commit on another branch, fast-forwarding pull, merging pull, rebasing pull, rebase onto fetched trunk, continued cherry-pick, and autosquash. | slice 6 | observed: slice-6-implementation.md maps each dated aCheckoutWork step variant to the consuming capture case |
| P18 | Real Git performs those steps and supplies the checkout’s own HEAD log to capture. | slice 6 | observed: repository-checkout-work.test.mjs, repository-checkout-rewrites.test.mjs and repository-checkout-unavailable.test.mjs observe actual Git history and dated logs consumed by the production capture |
| P19 | The first in-process capture example runs without a server. | slice 1 | observed: done-kept-session-commits.spec.ts established-session case supplies private store and Git inputs to setRecordDoneAt |
| P20 | The first in-process capture example runs without an agent host. | slice 1 | observed: done-kept-session-commits.spec.ts established-session case builds a Claude reference and supplies it directly to the store |
| P21 | For a Default main session established at base an hour ago, with one commit half an hour ago and Done ten minutes ago, the kept record holds one run from base to that commit. | slice 1 | observed: done-kept-session-commits.spec.ts established-session case reads exactly one persisted run with base and the committed revision after Done |
| P22 | In the same example, the repository holds the two references that keep that pair. | slice 1 | observed: done-kept-session-commits.spec.ts established-session case asserts both comparison refs and object IDs |
| P23 | In the same example, typed review answers `session-commits` with that run. | slice 1 | observed: done-kept-session-commits.spec.ts established-session case asserts session-commits, selected run 0 and the single complete run |
| P24 | For the same session with one commit on each side of a pull that merged trunk’s work, Done keeps two runs. | slice 2 | observed: done-kept-session-commit-runs.spec.ts merging-pull case asserts an exact two-run list |
| P25 | Those runs appear oldest first. | slice 2 | observed: done-kept-session-commit-runs.spec.ts merging-pull case selects indices 0 and 1 for the exact ordered pairs |
| P26 | Neither run includes the merge. | slice 2 | observed: done-kept-session-commit-runs.spec.ts merging-pull case expects the merge only as the second baseline |
| P27 | Neither run includes trunk’s changes. | slice 2 | observed: done-kept-session-commit-runs.spec.ts merging-pull case asserts only its first and second session files in their own runs |
| P28 | When a session makes two commits, amends the second, and rebases onto pulled trunk, Done keeps one run. | slice 2 | observed: done-kept-session-rebased-runs.spec.ts amended-series case expects one run at index 0 after the rebasing pull |
| P29 | That run contains the two commits as they ended. | slice 2 | observed: done-kept-session-rebased-runs.spec.ts amended-series case expects two commits from pulled trunk to actual origin tip with both session files and the amendment |
| P30 | Where a kept Default main session has a retained landing and a later kept run, review answers with the landing. This is the precedence check repeated in **Scope: cases** and **Key examples**. | slice 1 | observed: kept-session-commits-review.spec.ts retained-landing case expects landed with the landing pair despite a later kept run |
| P31 | That landing review lists its changed file. | slice 1 | observed: kept-session-commits-review.spec.ts retained-landing case asserts that landed.txt is added |
| P32 | A file-text read of the kept run’s exact pair returns the base-side version. | slice 1 | observed: kept-session-commits-review.spec.ts exact-pair text asserts the before version |
| P33 | The same exact-pair read returns the tip-side version. | slice 1 | observed: kept-session-commits-review.spec.ts exact-pair text asserts the after version |
| P34 | A different pair is refused with 409. | slice 1 | observed: kept-session-commits-review.spec.ts mismatched pair throws RefusedRequest with the previous error and status 409 |
| P35 | After Done, review says changes were not captured when the session’s only commit remains on another branch. | slice 4 | observed: done-kept-session-unavailable.spec.ts side-branch case keeps the Done mark and asserts the exact changes-were-not-captured answer |
| P36 | After Done, review says the session made no commits in the Default main checkout when it edited files and committed nothing. | slice 4 | observed: done-kept-session-unavailable.spec.ts blank default launch and edit case asserts the exact no-commits explanation |
| P37 | When two kept sessions share one checkout and each makes a commit, Done on one yields a review containing commits made while that session was open. | slice 5 | observed: done-kept-session-shared-checkout.spec.ts two-open-launch case reads a two-commit run from the original base to the second commit after either Done |
| P38 | The same review says the checkout was shared. | slice 5 | observed: done-kept-session-shared-checkout.spec.ts two-open-launch case expects session.shared true in both independently read reviews |
| P39 | When a Done session has a kept run and a later Done cannot read its log, the earlier run’s references are gone from the repository. | slice 6 | observed: done-kept-commit-refs-release.spec.ts second case sees the original actual pair disappear after failed recapture and before deletion |
| P40 | At two workers, the moved cases’ summed case time is at most half the same cases’ Playwright time, measured in one session at a stated load. | slice 7 | |
| P41 | `dashboard/backend-tests/README.md` adds the guidance to state checkout work through MakeMe. | slice 7 | |
| P42 | The README adds the guidance to state times against the case’s clock. | slice 7 | |
| P43 | The README adds the guidance to use the store function under a native operation when the kept record is the whole fact the case adds. | slice 7 | |
| P44 | The README carries the rule limiting stored launch document setup to cases exercising the store. | slice 7 | |
| P45 | No callerless methods remain in `DefaultMainSessionWork` and no callerless functions remain in `sessionCheckoutGit.ts` or `adHocReview.ts`. | slice 7 | |
| P46 | New test support is confined to MakeMe builders. | slice 7 | |
| P47 | The deferred cases remain Playwright specs, including the explicit quiet-report example. | slice 7 | |
| P48 | Retained Playwright coverage continues to prove that the developer’s Done reaches capture. | slice 7 | |
| P49 | Retained Playwright coverage continues to prove that a quiet report reaches capture. | slice 1 | observed: ad-hoc-session-commits.spec.ts quiet-report Playwright case observes the report's Done time and captured commit via review |
