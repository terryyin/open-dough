# Source review: SEED-413#split-done-mark-decision-from-store

Reviewer: a fresh general-purpose agent (no conversation inheritance), launched
by the execution coordinator on 2026-11-20 before slice 1 delegation. Input:
the seed section's Goal, Scope, Key examples, Evaluation and Effort hypothesis
verbatim, plus the plan's three exclusions (branch entry, the observation and
landing store reads, the launch-flavor fold). No plan, product, proof or slice
detail was supplied. The reviewer read no files and changed nothing.

Unnumbered context, as returned: the "without a machine home" goal framing;
the three exclusions; the ADR 0010 counts and timing as the measurement
method; "M, one plan"; the `readAncestry` alternative (its result is 12); the
inclusion of observation and publication cases (its result is 11).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Pure Done transition: "Split `setRecordDoneAt` into: a pure Done transition (record, Done time and options → next record)". Marking Done is "a typed decision on the record". | slice 1 | observed: dashboard/server/doneTransition.ts doneTransition; done-transition.spec.ts "marking Done records…", "undoing Done…" (no store, Git or HOME) |
| 2 | Git-only branch-result capture: "a Git-only branch-result capture over a typed place that returns its result". It is "Git-only" in the Goal too. | slice 2 | observed: dashboard/server/sessionBranchCapture.ts captureBranchResult: BranchCapture (Git-only, record + Done time → result); isolated-branch family 42/42 (evidence slice-2-focused-2.log) |
| 3 | Store adapter owns persistence and pinning: "the store adapter that persists and pins". "The store write and pin refs belong to the adapter alone." | slice 2 | observed: withBranchResultAtDone keeps pinning, keepManualLanding and the write; ad-hoc-branch-result-supersession pin cases ("…with only its pins", "deleting a record … leaves no pins") pass unchanged |
| 4 | The `readAncestry` test hook is replaced by the capture's own typed Git collaborator, or dropped if the held-Done race moves to the adapter's own case. | slice 2 | observed: setRecordDoneAt option `capture?: BranchCapture`; `rg readAncestry dashboard` finds nothing |
| 5 | MakeMe steps exist for a Done record with its captured branch result or session commits; review cases start "from an already-Done record". | slice 4 | |
| 6 | Review specs use composed state: "Move every spec whose topic is the review off `keep`, `markDone` and `keptRecords`, and onto composed state passed to the typed review." | slice 7 | |
| 7 | Key example: a review case of a Done isolated branch builds its record with a MakeMe branch result and real Git commits, then reads the typed review, "with no HOME stub and no `markDone`". | slice 6 | |
| 8 | Done marking stays the topic only in specs that prove the capture, the transition rules (expected, automatic, undo) or the adapter's persistence. | slice 7 | |
| 9 | "Cover `madeSince` and run grouping with typed-log unit cases". | slice 3 | observed: dashboard/server/sessionCommitAttribution.ts madeSince/runsOf; done-session-commit-attribution.spec.ts 9 typed-log cases (runs either side of a pull, merge, amended merge, rebased and amended pushes, cherry-pick, pre-session rebase, unplaceable, empty), no Git |
| 10 | "keep one real-Git case for the reflog read". | slice 3 | observed: done-kept-session-commits.spec.ts first case (real-Git reflog read) unchanged, passed in s3-regress.log |
| 11 | Delivery observation and publication cases where Done is a precondition move to composed Done state: `twoDoneBranchesMergedByHand`, `ad-hoc-prepared-landing-done`, `ad-hoc-manual-landing-revision-observation` and the declared publication specs; observation cases keep their composed record in the store. | slice 7 | |
| 12 | Key example: "A held capture still loses to a newer Done, proved once at the adapter." | slice 2 | observed: ad-hoc-branch-result-supersession "a newer Done wins over a held stale capture with only its pins" over aHeldDone capture; skipping the candidate guard fails exactly it (evidence slice-2-break.log) |
| 13 | "Make `doneCaptureReview.ts` take composed records rather than read `keptRecords(source)`." | slice 4 | |
| 14 | Key example: "The Done transition refuses a stale expected Done time", as a plain-value case. | slice 1 | observed: done-transition.spec.ts "a Done time other than the expected one refuses the change"; scratch break fails it (evidence s1-break-expected.log) |
| 15 | Key example: the transition "ignores an automatic Done the record no longer allows", as a plain-value case. | slice 1 | observed: done-transition.spec.ts "an automatic Done the record no longer allows changes nothing" |
| 16 | "Every replaced case keeps its assertions." | slice 7 | |
