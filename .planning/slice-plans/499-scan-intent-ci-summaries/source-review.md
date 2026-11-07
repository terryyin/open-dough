# Source review: Scan CI summaries in dashboard Intent

Launch: 2026-11-07, a fresh general-purpose subagent (no conversation inheritance) by the execution coordinator before slice 1 delegation.
Input: only the story's Goal, Scope (required behavior, restrictions, scope limits), Key examples and Architecture text from
[SEED-259#scan-intent-ci-summaries](../../seeds/SEED-259-scan-intent-ci-summaries.md#scan-intent-ci-summaries), copied verbatim to a file; told to read no other project file, change nothing, and return numbered commitments.
Returned commitments are recorded below as returned.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: in dashboard Intent, a developer reviewing test evidence can "find the rows they care about" and understand "counts, execution times, and gaps at a glance" across CI status and the entry and folder summaries | slice 5 | |
| 2a | "Every Intent CI figures table sorts by its columns". Listed tables follow. | slice 3 | |
| 2a.1 | The CI status Proof table, with "one row per declared entry" | slice 2 | |
| 2a.2 | The CI status story comparison table | slice 2 | |
| 2a.3 | The entry and folder summary breakdown for a single run | slice 3 | |
| 2a.4 | The entry and folder summary breakdown for a story comparison | slice 3 | |
| 2b | "One shared table owns sorting, so every such table behaves the same" | slice 3 | |
| 2c | Each column header is a "keyboard-operable control" (example: Tab reaches the header, and Enter or Space activates it) | slice 2 | |
| 2d | The first activation sorts that column ascending | slice 2 | |
| 2e | The next activation reverses the order (descending) | slice 2 | |
| 2f | The header carries `aria-sort` | slice 2 | |
| 2g | The header shows a "visible direction mark" | slice 2 | |
| 2h | "Until a header is activated, rows keep today's order": declaration order on CI status and tree order in a summary | slice 3 | |
| 3 | "Sort keys are the figures, not their words". Listed keys follow. | slice 3 | |
| 3.1 | **Scope**/**Entry** sort by path name | slice 2 | |
| 3.2 | **Counts** sorts by the number of counted results | slice 2 | |
| 3.3 | **Counts** puts "failed first among equal totals" | slice 2 | |
| 3.4 | A timing column (**Test execution time**, **Baseline**, **Branch**, **Landed**) sorts by its measured time | slice 2 | |
| 3.5 | **Parts** sorts by the number of gaps | slice 2 | |
| 3b | A row without a measured value for the sorted column (partial, unavailable, no CI result, or an endpoint gap) "follows the measured rows in either direction", in its default order | slice 2 | |
| 3c | "Ties keep default order" | slice 2 | |
| 4a | In a story comparison, the change kind (added, modified, removed, renamed) moves "from trailing words on the name" into a short **Change** column | slice 4 | |
| 4b | The **Change** column sorts by kind | slice 4 | |
| 4c | In a **Change** sort, unchanged rows come last (example: `added` and `modified` rows come together ahead of unchanged rows) | slice 4 | |
| 5a | An entry or folder summary shows the selected scope's own figures in a labelled group above the breakdown table, "not as its first row". These figures are counts, execution time or its comparison times, and parts. | slice 3 | |
| 5b | The table holds only the immediate folders and files | slice 3 | |
| 5c | The table also holds **Not in the rows above** when it applies | slice 3 | |
| 5d | **Not in the rows above** "stays last under any sort, since it is not a child" | slice 3 | |
| 5e | The overall group does not move when the table is sorted (example 2) | slice 3 | |
| 5f | "Child names still select their folder or file as the tree does" | slice 3 | |
| 5g | Sorting is kept while drilling down within the same Intent visit, in memory only, "like the rest of Intent's reading place" (example: opening `invoices/` keeps the **Counts** descending sort) | slice 3 | |
| 5h | A drilled-down summary uses the same layout (example 2) | slice 3 | |
| 5i | "A sorted column the next table lacks falls back to default order" | slice 3 | |
| 6a | Timing gaps read as "short labels instead of sentences". Examples: `Part 2 untimed`, `Part 3 missing`, `4 tests untimed`, `No timings`. | slice 1 | observed: tests/support/intent-ci-proof-timing.test.mjs 'partial timing shows short gap labels…' and 'a summary without durations reads No timings…'; dashboard/tests/intent/intent-ci-status-execution-time.spec.ts untimed/missing/No timings tests read the cells |
| 6b | Timing labels are consistent "in every table and the overall group" | slice 3 | |
| 6c | Measured zero stays `0 ms` | slice 1 | observed: tests/support/intent-ci-proof-timing.test.mjs 'complete timing is measured, and every part timed at zero reads 0 ms'; dashboard/tests/intent/intent-ci-status-execution-time.spec.ts 'an untimed part shows Part 2 untimed while parts timed at zero show 0 ms' (cell 0 ms, no title) |
| 6d | Partial timing shows its gap labels | slice 1 | observed: tests/support/intent-ci-proof-timing.test.mjs partial and scope-gap tests; dashboard/tests/intent/intent-summary-ci-proof-gaps.spec.ts cells 'Part 3 missing', 'Part 3 missing, Part 2 no breakdown'; intent-ci-comparison-entries.spec.ts 'Part 2 untimed' |
| 6e | Unavailable timing (`No timings`, `no CI result`) stays distinct from both measured zero and partial timing | slice 1 | observed: tests/support/intent-ci-proof-timing.test.mjs No timings asserts kind not-recorded; intent-summary-ci-proof-gaps.spec.ts no-CI-result cell has empty accessible description; tests/support/dashboard-ci-comparison-entries.test.mjs 'a summary without durations never becomes zero' |
| 6f | The full explanation stays available to assistive technology (example: "part 2 of 3 has no duration") | slice 1 | observed: toHaveAccessibleDescription in dashboard/tests/intent/intent-ci-status-execution-time.spec.ts (3 tests), intent-summary-ci-proof-gaps.spec.ts, intent-ci-comparison-entries.spec.ts; rendered by TimingCellView title in dashboard/src/CiProofTable.tsx |
| 6g | The full explanation stays available on hover | slice 1 | observed: toHaveAttribute('title', …) in dashboard/tests/intent/intent-ci-status-execution-time.spec.ts, intent-summary-ci-proof-gaps.spec.ts, intent-ci-comparison-entries.spec.ts |
| 7a | The evidence and comparison identity above a summary or above the CI status Proof table reads as "grouped short labels instead of sentences". Listed items follow. | slice 5 | |
| 7a.1 | Run and attempt, linked (example: `Run 41 · attempt 2`) | slice 5 | |
| 7a.2 | Revision (example: `abc1234`) | slice 5 | |
| 7a.3 | Branch (example: `main`) | slice 5 | |
| 7a.4 | A running result's completed ancestor | slice 5 | |
| 7a.5 | CI wall time | slice 5 | |
| 7a.6 | A story comparison's Baseline, Branch and Landed revisions with their status words | slice 5 | |
| 7a.7 | The provisional mark | slice 5 | |
| 7b | Icons appear "where they help recognition" | slice 5 | |
| 7c | Each icon has an accessible name | slice 5 | |
| 7d | The run link and each icon's accessible name still identify the build | slice 5 | |
| 7e | "The facts that change how the figures read stay visible as short labels". Listed facts follow. | slice 5 | |
| 7e.1 | Evidence of another revision than the tree, and that newer files are unproved there (example: `Tree at def5678 — newer files unproved here`) | slice 5 | |
| 7e.2 | A previously retrieved judgment or a failed refresh | slice 5 | |
| 7e.3 | The observed-not-attributed comparison framing | slice 5 | |
| 7e.4 | An entry without a child breakdown | slice 5 | |
| 7e.5 | What **Not in the rows above** holds | slice 5 | |
| 8 | Restriction: measured zero, partial timing and unavailable timing remain distinguishable. "Labels never collapse absence into a number", and "a missing duration must never read as fast". | slice 1 | observed: dashboard/src/ciProofTiming.ts timingCellOf gives ms only for measured; tests/support/intent-ci-proof-timing.test.mjs asserts no ms on non-measured cells; dashboard/tests/intent/intent-ci-status-execution-time.spec.ts partial table does not show '1 min 20 s' |
| 9a | Restriction: shorter wording keeps "one term per fact" across CI status, summaries, and file Proof (which shares the evidence identity) | slice 5 | |
| 9b | The same one-term-per-fact rule extends to Intent's documentation (`docs/dashboard-development-intent.md`) | slice 5 | |
| 9c | The same one-term-per-fact rule extends to the CI timing comparison doc (`docs/dashboard-development-intent-ci-comparison.md`) | slice 5 | |
| 10a | Exclusion: no new figures, including "no lower-bound time for partial scopes" | slice 1 | observed: dashboard/src/ciProofTiming.ts partial/not-recorded cells carry no ms or lower-bound text; tests/support/intent-ci-proof-timing.test.mjs |
| 10b | Exclusion: no totals row on CI status | slice 2 | |
| 10c | Exclusion: no added counts or filters | slice 5 | |
| 11 | Exclusion: no change to what CI evidence is read, judged or compared, or when | slice 5 | |
| 12 | Exclusion: the sort choice is not put on the URL or in storage | slice 3 | |
| 13a | Exclusion: Optimization Candidates is unchanged | slice 5 | |
| 13b | Exclusion: file Purpose is unchanged | slice 5 | |
| 13c | Scope limit: a selected file's Proof changes "only as far as it shares the evidence identity and timing labels" | slice 5 | |
| 14 | Example 1 (sort journey): Proof times are `tests/a` 12.5 s, `tests/b` 340 ms and `tests/c` `Part 2 untimed`. Ascending gives b, a, c and is announced ascending. Descending gives a, b, c with the partial row still last, announced descending. | slice 2 | |
| 15 | Example 2 (folder journey): `features/billing` shows its own `20 tests · 1 failed` (3 tests not in any child row), its time and parts above the table. A **Counts** descending sort gives `refunds.feature`, `invoices/`, then **Not in the rows above**. | slice 3 | |
| 16 | Example 3 (Done story entry summary): the overall Baseline / Branch / Landed sit above the table. A **Change** column groups changed rows ahead of unchanged ones, and a **Landed** sort puts endpoint-gap rows last. | slice 4 | |
| 17 | Example 4 (timing labels): partial shows `Part 2 untimed`, every part timed at zero duration shows `0 ms`, and an older summary without durations shows `No timings`. A screen reader and hover give the full explanation. | slice 1 | observed: dashboard/tests/intent/intent-ci-status-execution-time.spec.ts 'an untimed part shows Part 2 untimed while parts timed at zero show 0 ms' and 'an older summary without durations shows No timings…' with description and title |
| 18 | Example 5 (identity labels): evidence of attempt 2 of run 41 at `abc1234` on `main`, with the tree at `def5678`, reads as compact labels rather than two sentences | slice 5 | |
| 19a | Architecture (as stated): `dashboard/src/CiProofTable.tsx` becomes "the one owner of sortable columns for every Intent CI table" | slice 3 | |
| 19b | Architecture (as stated): callers supply rows whose cells carry sortable values beside their words, plus pinned rows (the outside row) | slice 3 | |
| 19c | Architecture (as stated): timing classification (measured, partial with named gaps, unavailable) has one owner that produces both the short label and its full explanation | slice 1 | observed: dashboard/src/ciProofTiming.ts entryTimingOf/scopeTimingOf → CiTiming → timingCellOf (label, explanation, ms) |
| 19d | Architecture (as stated): that owner replaces the parallel phrasing in `ciProofWording.ts` and `ciScopeComparisonTiming.ts` | slice 1 | observed: ciProofWording.ts and ciScopeComparisonTiming.ts import ciProofTiming.ts; grep 'partial: ' dashboard/src finds only unrelated 'Overall count partial:' |
