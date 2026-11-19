# Source review

Launch: a fresh general-purpose reviewer with no conversation inheritance, given
only the selected story section of
[SEED-404](../../seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-story-notes-checks-in-a-third-of-their-time)
(Goal, Scope, Key examples and supporting sections, verbatim, without the state
block) and told to read nothing else and change nothing. Returned on 2026-11-19.

Unnumbered context returned: split and rescope history; deferrals to the 100 ms
follow-up and the rollout story; the 10.12/10.49 s baselines and the A–B–B–A
method; the scratch-variant table; CI shard details; architecture rationale;
ruled-out proof approaches; correction history and decision rationale.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | In a matched alternating session against `e8e01643a` at comparable load, at the usual two-worker local budget, each run of the story-notes specs takes at most half of its paired baseline run, timed from invocation through exit of the focused command. | slice 3 |  |
| 2 | Every original product assertion is kept, and the same eleven case titles still pass. | slice 3 |  |
| 2.1 | In the edit case, a keyboard save still shows the saved text, returns focus to Edit and records the same change request. | slice 2 |  |
| 3 | Later mounted families inherit the cheaper settling, because it lives in the shared mounted support rather than only in story-notes code. | slice 2 |  |
| 4 | The attached-terminal case runs on the mounted board, its socket answered through `installAttachedTerminalSubstitute` and `directedApplication`; Story notes opens beside it, and the terminal stays connected and shows output printed while notes was open. | slice 1 | observed: dashboard/frontend-tests/stories/story-notes-terminal.mounted.spec.ts "Story notes leaves an attached terminal mounted and connected": both lines, isConnected, one attachment, Notes focus; passed in slice-1 gate run |
| 5 | The story-notes command runs all eleven cases in mounted Chromium, with no Playwright phase. | slice 1 | observed: slice-1 family proof record: 11 selected titles, all mounted-chromium, phase completed, no Playwright phase |
| 6 | A dialog close finishes on that dialog's native `close` event, observed inside `act`. | slice 2 |  |
| 7 | `actSettled` keeps its task and frame rounds wherever timer advances, released reads or layout callbacks can still update the page. | slice 2 |  |
| 8 | The revision stream is still answered as unreachable. | slice 2 |  |
| 9 | A held notes answer is still abandoned at cleanup. | slice 2 |  |
| 10 | A page still changing after 20 settle rounds still fails with `UnsettledPageError`. | slice 2 |  |
| 11 | A run of the mounted story-notes specs prints no "not wrapped in act" line. | slice 2 |  |
| 12 | Reopening Story notes after a project read still opens the dialog. | slice 2 |  |
