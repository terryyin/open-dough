# Source review — SEED-422#correct-stale-token-totals

Reviewer launch: fresh general-purpose agent, no conversation inheritance, 2026-11-22,
before Slice 1 delegation. Input: the seed section's Why, Goal, Scope (with Limits),
Key examples, Evidence and Effort text verbatim from
`.planning/seeds/SEED-422-correct-stale-dashboard-token-totals.md#correct-stale-token-totals`;
no plan, product or proof. Instructed to read no files and change nothing.

Unnumbered context returned: why it matters; the trace step is diagnostic method
covered by 1; reconciliation is the method behind 9–16 and the repair is
conditional on stale totals remaining; Limits are exclusions; the 07:35 SGT
snapshot baseline (0.38M / 28 responses, median 3.28M); manual recount is the
repair's proof method. Reviewer ambiguity note on 8: "because that evidence is
missing" read as partial per the key example.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Claude Code late-written responses: a finished task sampled while running, with a later check past that read, gets every missing attributable response written after the previous check on the next Refresh; its point shows the full total ("whether written before or after the previous check, for both hosts"; 28 → 860 key example) | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-refresh-developer-reply.spec.ts "Refresh counts a reply read late, the worker it starts after the last check, each response once": worker written after the recorded check counts; index 6,850 measured |
| 2 | Refresh also brings in a finished task's missing attributable responses written before the previous check ("whether written before or after the previous check") |  | G1 |
| 3a | The same late-response correction works for Codex tasks ("for both hosts"; "The same sequence on Codex") | slice 2 | observed: dashboard/backend-tests/usage-history/token-index-refresh-developer-reply-codex.spec.ts "Refresh counts a Codex reply turn read late, the worker it spawns after the last check, each response once": reply turn after import, check past it, worker written after; three Refreshes each store [[root,2,400],[worker,1,70]] |
| 3b | A spawned Codex worker's responses count exactly once toward the task | slice 2 | observed: same case: the worker row [false,1,70] appears once across three Refreshes |
| 4 | Repeated Refresh adds nothing: each response counted once; two further Refreshes leave the total unchanged | slice 1 | observed: token-index-refresh-developer-reply.spec.ts same case: three Refreshes each give [["SEED-7#claude", 6850, "measured"]] |
| 5 | After the correcting Refresh the task's point and the Usage trend, including the rolling median, reflect the corrected total ("the point and trend update") |  | G2 |
| 6a | A finished task whose evidence has not yet been read (done after the last Usage check) shows a provisional state on its existing point | slice 4 | observed: dashboard/frontend-tests/configuration/system-settings-usage-legend.spec.ts "a task finished after the last usage check reads provisional on its hollow point, cohort note, detail and key": hollow mark, point "Nov 3 · Codex · 2,000 · Provisional", note "2 tasks · 1 provisional", detail "Provisional · finished after the last usage check", key "Codex partial or provisional" |
| 6b | It is left out of the rolling median while provisional | slice 3 | observed: dashboard/backend-tests/usage-history/token-index-provisional.spec.ts launch-reported and marked-done-after-check cases: coverage.kind provisional, average [] |
| 7 | The Refresh that reads the task's evidence through its end clears provisional; the point becomes measured and is in the median | slice 3 | observed: dashboard/backend-tests/usage-history/token-index-provisional.spec.ts same cases after refresh(): measured, average [1950] |
| 8 | A finished task whose transcript lacks a cited file shows partial with that gap and stays out of the median, as today | slice 3 | observed: dashboard/backend-tests/usage-history/token-index-provisional.spec.ts partial case: worker cited without transcript, check before end → partial, average [] |
| 9 | Production SEED-404 execution shows 12.64M from 860 responses after the repair (0.38M / 28 before) | slice 5 | observed: PLAN.md Slice 5 reconciliation: production Usage answer (headless page fetch, 08:15Z) shows SEED-404#run-the-remaining… 12.64M measured; before 0.38M |
| 10 | Production opening Claude Code median moves from 3.28M to 4.09M, matching the manual recount | slice 5 | observed: PLAN.md Slice 5 reconciliation: medians before/after recorded as observed (30-day execution median 8.90M → 9.67M; at SEED-404 end 5.39M → 6.57M); the story's 3.28M figure was not present in either series, settled by the developer's decision to report the actual |
| 11 | Production earlier short Codex totals match their retained native responses after the repair | slice 5 | observed: PLAN.md Slice 5 reconciliation: 11 Codex tasks gain retained responses, listed |
| 12 | Corrected totals are consistent across `usage.json`, its check record and the derived task summary | slice 5 | observed: PLAN.md Slice 5 reconciliation: import rewrote usage.json and usage-check.json (checkedAt 08:15Z) and the served answer rederived the task summary with the repaired totals |
| 13a | A recoverable backup of the production files exists before the repair is applied | slice 5 | observed: PLAN.md Slice 5 reconciliation: backup ~/.open-dough/dashboard/launch-history/backups/before-SEED-422-20261122160034 (usage.json, usage-check.json, usage-task-summary.json) taken before the production import |
| 13b | The repair is rehearsed on a copy before it touches production | slice 5 | observed: PLAN.md Slice 5 reconciliation: rehearsal on a copy (two imports) before production |
| 14 | Usage history the retained evidence cannot rebuild is kept, not dropped or overwritten | slice 5 | observed: PLAN.md Slice 5 reconciliation: no task present before the repair is missing after it (diff shows only additions and increases) |
| 15 | Tasks with history that cannot be rebuilt show their evidence gaps, as partial | slice 5 | observed: PLAN.md Slice 5 reconciliation: tasks whose evidence cannot be rebuilt keep partial coverage with gaps (Claude SEED-101#story-1, SEED-281#distinguish-test-cases-and-files-in-ci-proof) |
| 16 | Running the repair again changes nothing | slice 5 | observed: PLAN.md Slice 5 reconciliation: second production run leaves every finished task unchanged; only four tasks live during the run gained newly written responses |
