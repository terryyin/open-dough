# Source review — SEED-185#align-refresh-guidance

## Launch and input

Fresh general-purpose reviewer with no conversation inheritance. Inputs were
only the correction's Goal, Scope (required behavior and scope limits), and
Key examples from
`.planning/seeds/SEED-185-stable-ci-time-budget.md` section
`### Align duration-list refresh guidance with recorded-speed scaling`.
No plan, return, product, proof, or current-slice scope was supplied. The
reviewer was told to use only those inputs, read no other project files, and
change nothing.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| J1 | A contributor refreshes a duration list from CI artifacts and reads the duration-list guidance. | slice 1 | observed: tests/test-shares.md and dashboard/tests/shards.md refresh procedure sections |
| 1 | Guidance in `tests/test-shares.md` and `dashboard/tests/shards.md` matches the delivered scaling behavior for refresh. | slice 1 | observed: tests/test-shares.md:57-68 and dashboard/tests/shards.md:56-68,91-93 state list-speed scaling and Source factor |
| 2 | A reader of that guidance does not expect raw runner seconds to be written into the list. | slice 1 | observed: both guides teach scaled list-speed seconds, not raw kept seconds |
| 3 | Both guides state that refresh scales observed times to the existing list's runner speed. | slice 1 | observed: tests/test-shares.md:57-59; dashboard/tests/shards.md:56-59,93 |
| 4 | Both guides state that refresh records the factor on the `# Source:` line, or that the factor was unavailable. | slice 1 | observed: tests/test-shares.md:67-68; dashboard/tests/shards.md:67-68 |
| 5 | Both guides no longer claim that refresh "keeps the seconds" as the written observation. | slice 1 | observed: neither guide contains "keeping the seconds" |
| E1.1 | After a slow-runner refresh, a reader of either guide expects list-speed seconds, matching duration-list.test.mjs's 1.3× case. | slice 1 | observed: both guides state scaling to list runner speed; focused duration-list.test.mjs 1.3× case still green |
| E1.2 | After a slow-runner refresh, a reader of either guide expects a source line naming the runner factor, matching duration-list.test.mjs's 1.3× case. | slice 1 | observed: both guides name runner factor or unavailable on `# Source:`; duration-list.test.mjs Source factor cases still green |
| X1 | No change to refresh behavior. | slice 1 | observed: git diff only tests/test-shares.md and dashboard/tests/shards.md; focused refresh proof exit 0 |
| X2 | No change to deal behavior. | slice 1 | observed: git diff only the two guides; share-deal-recorded-runs.test.mjs exit 0 |
| X3 | No change to budget judgment. | slice 1 | observed: git diff only the two guides |
| X4 | No change to ceilings. | slice 1 | observed: git diff only the two guides |
| X5 | No change to existing list headers already on disk beyond what the guidance describes. | slice 1 | observed: no list files in git diff |
| X6 | Code behavior stays as delivered by SEED-185#stable-ci-time-budget (before-cleanup `1bc270042dab3a1bb94c11cf31bdf82adaf8c402`). | slice 1 | observed: no scripts or support code in git diff; focused refresh/deal proof exit 0 |
