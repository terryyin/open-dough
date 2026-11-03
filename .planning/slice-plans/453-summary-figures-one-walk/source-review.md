# Source review: SEED-192#summary-figures-one-walk

Launch (2026-11-03): fresh general-purpose agent, no conversation inheritance, instructed to use only the supplied text, read no project files, run no commands, change nothing, and return numbered commitments with compound items split. Input: the correction story's Goal and Scope from [the seed section](../../seeds/SEED-192-review-product-intent.md#summary-figures-one-walk) (links reduced to their labels), plus the plan's correction input — Current findings, Preserved promises and constraints, and the retrospective's Current decision — without slices, proof table, return, product, or proof. The table below is its return with this execution's allocation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reading Intent location and folder summaries can trust every summed-duration wording the summaries can show. | slice 1 | observed: tests/support/intent-summary-proof-cost.test.mjs 'a sum of a minute or more reads in minutes and seconds' (1m 5s sum line); sub-minute sums stay observed by dashboard/tests/intent-summary-proof-cost.spec.ts ex1 |
| 2 | A developer reading Intent location and folder summaries can trust every spread wording the summaries can show. | slice 1 | observed: tests/support/intent-summary-proof-cost.test.mjs at-minute, same-day and different-day tests, each with one commit and several |
| 3 | Example journey: Terry comparing Pygardon or Doughnut proof cost can trust these figures. | slice 1 | observed: tests/support/intent-summary-proof-cost.test.mjs 'observations finishing on different UTC days name both days' (Pygardon-shaped 2026-11-01/02 spread) and minute-or-more sum test |
| 4 | Trust covers observations that finish on different UTC days. | slice 1 | observed: tests/support/intent-summary-proof-cost.test.mjs 'observations finishing on different UTC days name both days' |
| 4.1 | The spread line's multi-day form (for example "between 2026-11-01 23:50 and 2026-11-02 01:05 UTC") is proved. | slice 1 | observed: tests/support/intent-summary-proof-cost.test.mjs 'observations finishing on different UTC days name both days': exact 'between 2026-11-01 23:50 and 2026-11-02 01:05 UTC' with 1 and 2 commits |
| 4.2 | Example trigger: Pygardon's published proof spans runs on 2026-11-01 and 2026-11-02. | slice 1 | observed: tests/support/intent-summary-proof-cost.test.mjs 'observations finishing on different UTC days name both days': observations on 2026-11-01 and 2026-11-02 |
| 5 | Trust covers sums of a minute or more (for example "1m 5s"), and those sums are proved. | slice 1 | observed: tests/support/intent-summary-proof-cost.test.mjs 'a sum of a minute or more reads in minutes and seconds': 40 s + 25 s reads '1m 5s over 2 of 3 scenarios' |
| 6 | The selection and each child derive their summary figures from one rule. | slice 2 |  |
| 6.1 | That one shared rule covers coverage. | slice 2 |  |
| 6.2 | That one shared rule covers the scenario total. | slice 2 |  |
| 6.3 | That one shared rule covers the count line. | slice 2 |  |
| 6.4 | That one shared rule covers the cost line. | slice 2 |  |
| 7 | The selection and each child derive their figures from one matching walk of the read files, at runtime as well as in code (read files are not re-parsed by separate passes for each figure or child on every render or file arrival). | slice 2 |  |
| 8 | Adding the next figure needs one edit. | slice 2 |  |
| 9 | The drill-down spec no longer repeats folder-figure assertions that the proof-cost spec already owns (for example the cli folder's 17.0 s line, three child lines and four slowest names). | slice 2 |  |
| 10 | When a case opens in Side by side, the case's Proof row is kept in view, as the predecessor promised. | slice 3 |  |
| 10.1 | The Proof pane is brought to the opened case, so this does not depend on the Proof table being short. | slice 3 |  |
| 10.2 | A slowest scenario still opens Purpose positioned on its case. | slice 3 |  |
| 11 | Restriction: summary wording stays unchanged. | slice 2 |  |
| 12 | Restriction: summary layout stays unchanged. | slice 2 |  |
| 13 | Restriction: the predecessor story's promises stay otherwise unchanged. | slice 2 |  |
| 13.1 | Wording is preserved. | slice 2 |  |
| 13.2 | Number formats are preserved. | slice 2 |  |
| 13.3 | Placement is preserved. | slice 2 |  |
| 13.4 | Tree order is preserved. | slice 2 |  |
| 13.5 | Unknown is never shown as 0 s. | slice 2 |  |
| 13.6 | Partial labelling is preserved. | slice 2 |  |
| 13.7 | Slowest order is preserved. | slice 2 |  |
| 13.8 | The slowest cap is preserved. | slice 2 |  |
| 13.9 | Drill-down is preserved. | slice 3 |  |
| 14 | Restriction: both visibility gates stay as they are and are not unified. | slice 2 |  |
| 14.1 | The selection shows proof lines when settled or readyCount > 0. | slice 2 |  |
| 14.2 | A child shows proof lines when readyCount > 0 or it is not incomplete. | slice 2 |  |
| 15 | Restriction: the correction changes no visible behavior (apart from restoring the promised Side by side Proof row view). | slice 3 |  |
| 16 | Restriction: figures stay derived in the browser and are not stored (ADR 0008). | slice 2 |  |
| 17 | Restriction: no reads are added (ADR 0008). | slice 2 |  |
