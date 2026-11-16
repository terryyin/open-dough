# Source review

Launch: a fresh general-purpose subagent (no conversation inheritance) on 2026-11-16, given only the story section's Goal through Outcome text from `.planning/seeds/SEED-381-fixed-ci-test-shards.md#fixed-pattern-shards-for-the-distribution-suite`, told to read no other files and change nothing, and to return numbered commitments, qualifications, examples and exclusions. Its returned table follows; Slice and the last column are the coordinator's allocation and observations.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Maintainers run and change the Distribution suite's CI shares by reading one place: the `distribution-tests` matrix in `.github/workflows/ci.yml` | slice 7 |  |
| 2 | Maintainers do this without maintaining duration lists, budgets or a dealing algorithm | slice 7 |  |
| 3 | Each matrix entry keeps its share number | slice 5 |  |
| 4 | Each matrix entry names the tests it runs as repository-relative folder or file glob patterns | slice 5 |  |
| 4.1 | The patterns apply to the checks the runner already discovers for the Distribution intent entry | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs selects from the labels it is given (runner-discovered checks); wiring to discovery is slice 3 |
| 5 | The last entry names no pattern and runs every discovered check that no earlier share claims | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs 'the last share runs every check no earlier share claims, a new folder included' |
| 5.1 | So a new folder or file always runs | slice 5 |  |
| 6 | Some names stay as they are, as listed in 6.1–6.3 | slice 5 |  |
| 6.1 | Job names stay as they are | slice 5 |  |
| 6.2 | CI proof parts stay as they are | slice 5 |  |
| 6.3 | `test-times-<i>` artifact names stay as they are | slice 5 |  |
| 7 | The starting shares are listed in 7.1–7.3 | slice 5 |  |
| 7.1 | Share 1: `Distribution/tests/skills/dough-execute-plan/**` | slice 5 |  |
| 7.2 | Share 2: `Distribution/evaluation/**` | slice 5 |  |
| 7.3 | Share 3: the rest | slice 5 |  |
| 8 | The shares are tuned once from the story's own CI runs and then left alone | slice 6 |  |
| 9 | One small check fails when a check file matches more than one share's patterns | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs 'a check two shares match is refused naming it and both shares' |
| 9.1 | The overlap failure names the file and the shares | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs 'a check two shares match is refused naming it and both shares' asserts label and 'shares 1 and 2' |
| 10 | The same check fails when a pattern matches no check | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs 'a pattern that matches no check is refused naming it, also with no share selected' |
| 10.1 | The no-match failure names the pattern | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs same case asserts the message names the pattern |
| 11 | This check is the only sharding automation that remains | slice 7 |  |
| 12 | A share can be reproduced locally by its number | slice 5 |  |
| 13 | A run that selects no share runs every check | slice 2 | observed: Distribution/tests/test-runner/test-runner-failure-report.sh start-order block: unsplit run starts all five checks |
| 13.1 | It runs them in bytewise path order | slice 2 | observed: Distribution/tests/test-runner/test-runner-failure-report.sh asserts start order 'Zeta alpha beta gamma node-ordered' against durations ordering otherwise |
| 14 | Each CI job keeps three time limits, listed in 14.1–14.3 | slice 4 |  |
| 14.1 | Its plain `timeout-minutes` | slice 4 |  |
| 14.2 | Its 320-second run cutoff | slice 4 |  |
| 14.3 | The 180-second per-check safety deadline | slice 4 |  |
| 15 | The normalized time budget is removed, including the items in 15.1–15.4 | slice 4 |  |
| 15.1 | `time-budget` | slice 4 |  |
| 15.2 | Per-job and total ceilings | slice 4 |  |
| 15.3 | The runner factor | slice 4 |  |
| 15.4 | `OVER BUDGET` failures | slice 4 |  |
| 16 | Each share keeps uploading its `test-times-<i>` artifact | slice 5 |  |
| 16.1 | The artifact is retained for 90 days | slice 5 |  |
| 16.2 | The artifact is the rebalancing input | slice 5 |  |
| 17 | Everything that only the Distribution suite uses is removed completely, as listed in 17.1–17.16 | slice 7 |  |
| 17.1 | `Distribution/tests/longest-first*` | slice 7 |  |
| 17.2 | `Distribution/tests/time-budget` | slice 4 |  |
| 17.3 | The `share` command | slice 5 |  |
| 17.4 | The `runner-factor` command | slice 4 |  |
| 17.5 | The Distribution preview, with its budget headroom | slice 3 | observed: scripts/share-preview.mjs keeps only previewFromOptions over --spec-dir; no budget/headroom code; share-preview.test.mjs Distribution cases removed |
| 17.6 | The preview's trunk inventory | slice 3 | observed: trunkJobLabels and --trunk-labels removed from scripts/share-preview.mjs and test-shares.mjs; share-preview-trunk.test.mjs deleted |
| 17.7 | The preview's stale-list report | slice 3 | observed: formatPreview has no stale banner/notes; share-preview-stale.test.mjs and stale-share-preview fixtures deleted |
| 17.8 | `scripts/test-budget.sh` | slice 4 |  |
| 17.9 | `scripts/time-budget.bash` | slice 4 |  |
| 17.10 | `scripts/ci-test-times.sh` | slice 4 |  |
| 17.11 | The tests for these items | slice 7 |  |
| 17.12 | The fixtures for these items | slice 7 |  |
| 17.13 | `test-shares.md` | slice 7 |  |
| 17.14 | `time-budget.md` | slice 4 |  |
| 17.15 | Every passage that refers to these items | slice 7 |  |
| 17.16 | Maintainer findings entries that describe the deal or the budget as the current response | slice 7 |  |
| 18 | What the dashboard groups still use stays until the next story removes it, as listed in 18.1–18.6 | slice 3 | observed: scripts/share-deal.mjs, scripts/duration-list.mjs unchanged; refresh command and --spec-dir preview kept |
| 18.1 | The deal module | slice 3 | observed: scripts/share-deal.mjs unchanged; share-deal.test.mjs green |
| 18.2 | The duration-list modules | slice 3 | observed: scripts/duration-list.mjs unchanged; duration-list.test.mjs green |
| 18.3 | The list refresh | slice 3 | observed: scripts/test-shares.mjs refresh command unchanged; test-shares.test.mjs green |
| 18.4 | The `--spec-dir` preview | slice 3 | observed: share-preview.test.mjs 'preview lists a browser group's root of its spec directory...' green |
| 18.5 | The tests for these items | slice 3 | observed: browser-group-shards, share-deal, duration-list, dashboard-test-files tests untouched and green |
| 18.6 | `dashboard/tests/shards.md` | slice 7 |  |
| 19 | Between this story and the next, no command reports recent per-check CI seconds | slice 4 |  |
| 19.1 | The retained `test-times-<i>` artifacts are read with `gh run download` | slice 4 |  |
| 19.2 | `scripts/ci-job-times.sh` keeps reporting each share's distance from its run cutoff | slice 4 |  |
| 20 | Released `CHANGELOG.md` entries stay | slice 7 |  |
| 21 | The done-story catalog stays | slice 7 |  |
| 21.1 | Both are release and identity records, not descriptions of current behavior | slice 7 |  |
| 22 | A maintainer adds `Distribution/tests/new-area/first.sh` and changes nothing else → CI runs it once, in the last share | slice 5 |  |
| 23 | A maintainer adds `Distribution/tests/skills/dough-execute-plan/new-case.test.mjs` → CI runs it once, in the share whose pattern names that folder | slice 5 |  |
| 23.1 | No list or preview step comes before the push | slice 5 |  |
| 24 | Share 2 is given `Distribution/tests/skills/**` while share 1 keeps `Distribution/tests/skills/dough-execute-plan/**` → the check fails, naming one overlapping file and both shares | slice 5 |  |
| 24.1 | The overlap check fails before any share's result is trusted | slice 5 |  |
| 25 | `Distribution/evaluation` is renamed and its pattern is left behind → the check fails, naming the pattern that matches no check | slice 5 |  |
| 25.1 | The folder does not silently join the last share | slice 5 |  |
| 26 | A check takes 70 seconds on CI where the removed per-job ceiling was 64 → the share passes | slice 4 |  |
| 26.1 | Only the 180-second safety deadline or the 320-second run cutoff fails a share for time | slice 4 |  |
| 27 | A maintainer moves one folder pattern from the last share to the first in `ci.yml` → the next CI run follows it, with no other file to edit | slice 6 |  |
| 28 | The matrix is the one owner of share membership | slice 5 |  |
| 29 | The runner's selection reads the shares from the workflow file through one small module | slice 5 |  |
| 29.1 | The overlap check reads the shares through that same module | slice 5 |  |
| 30 | The runner is told only which share number to run | slice 5 |  |
| 31 | No Accepted ADR constrains this | slice 5 |  |
| 32 | The repository has no YAML parser, so the matrix entry form must stay readable by that module | slice 1 | observed: scripts/test-share-matrix.mjs readShareMatrix: narrow line parser, refuses unsupported matrix lines |
| 33 | Share balance has no automatic owner | slice 6 |  |
| 33.1 | Wall time per share tracks its job-seconds divided by the runner's four CPUs (main run 43773156778: 927, 947 and 619 job-seconds ran in 233, 238 and 155 s) | slice 6 |  |
| 33.2 | The starting shares total about 743, 845 and 905 job-seconds on that run, so the slowest is predicted near 226 s, against 238 s measured today and the 320-second cutoff | slice 6 |  |
| 34 | A share that grows past its cutoff fails that share | slice 4 |  |
| 34.1 | Drift before that point is visible only through `scripts/ci-job-times.sh` or the job durations | slice 4 |  |
| 35 | Considered and not chosen: first match wins in matrix order, as in a routing table with a default route, which would make overlap impossible and need no check | slice 1 | observed: scripts/test-share-matrix.mjs selectShare refuses any cross-share overlap instead of first-match-wins |
| 35.1 | The developer's overlap check is kept, so each share's patterns say what it runs without reading the earlier entries | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs overlap refusal for share 1, share 3 and unselected |
| 35.2 | Unlike a default route, the last share receives every new folder, so it grows without anyone editing it | slice 6 |  |
| 36 | Outcome: CI runs every Distribution check exactly once across the fixed shares | slice 6 |  |
| 37 | Outcome: total wall time is comparable to the current split | slice 6 |  |
| 38 | Outcome: the Distribution suite's code, tests and documents keep no reference to duration lists, deals or the normalized budget | slice 7 |  |
