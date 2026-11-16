# Source review

Launch: a fresh general-purpose subagent (no conversation inheritance) on 2026-11-16, given only the story section's Goal through Outcome text from `.planning/seeds/SEED-381-fixed-ci-test-shards.md#fixed-pattern-shards-for-the-distribution-suite`, told to read no other files and change nothing, and to return numbered commitments, qualifications, examples and exclusions. Its returned table follows; Slice and the last column are the coordinator's allocation and observations.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Maintainers run and change the Distribution suite's CI shares by reading one place: the `distribution-tests` matrix in `.github/workflows/ci.yml` | slice 7 | observed: Distribution/tests/runner-settings.md names the distribution-tests matrix in ci.yml as the one owner of shares |
| 2 | Maintainers do this without maintaining duration lists, budgets or a dealing algorithm | slice 7 | observed: Distribution/tests/longest-first* and test-shares.md deleted; no Distribution list, budget or deal remains |
| 3 | Each matrix entry keeps its share number | slice 5 | observed: .github/workflows/ci.yml matrix keeps share: [1, 2, 3] with include entries by share number |
| 4 | Each matrix entry names the tests it runs as repository-relative folder or file glob patterns | slice 5 | observed: .github/workflows/ci.yml include tests: repository-relative globs; Distribution/tests/test-runner/test-runner-split.sh fixture workflow selections |
| 4.1 | The patterns apply to the checks the runner already discovers for the Distribution intent entry | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs selects from the labels it is given (runner-discovered checks); wiring to discovery is slice 3 |
| 5 | The last entry names no pattern and runs every discovered check that no earlier share claims | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs 'the last share runs every check no earlier share claims, a new folder included' |
| 5.1 | So a new folder or file always runs | slice 5 | observed: Distribution/tests/test-runner/test-runner-split.sh: new-area/first.sh runs once in share 3 |
| 6 | Some names stay as they are, as listed in 6.1–6.3 | slice 5 | observed: .github/workflows/ci.yml job name, part/parts and test-times-${{ matrix.share }} unchanged; ci-proof checks green |
| 6.1 | Job names stay as they are | slice 5 | observed: .github/workflows/ci.yml name: Distribution Tests (${{ matrix.share }}/${{ strategy.job-total }}) unchanged |
| 6.2 | CI proof parts stay as they are | slice 5 | observed: .github/workflows/ci.yml part/parts unchanged; ci-proof-*.test.mjs and distribution-ci-proof.test.mjs green |
| 6.3 | `test-times-<i>` artifact names stay as they are | slice 5 | observed: .github/workflows/ci.yml upload name test-times-${{ matrix.share }} unchanged |
| 7 | The starting shares are listed in 7.1–7.3 | slice 5 | observed: .github/workflows/ci.yml include entries for shares 1 and 2; share 3 takes the rest |
| 7.1 | Share 1: `Distribution/tests/skills/dough-execute-plan/**` | slice 5 | observed: .github/workflows/ci.yml share 1 tests: Distribution/tests/skills/dough-execute-plan/**; real-repo 1/3 lists 244 dough-execute-plan checks |
| 7.2 | Share 2: `Distribution/evaluation/**` | slice 5 | observed: .github/workflows/ci.yml share 2 tests: Distribution/evaluation/**; real-repo 2/3 lists 70 evaluation checks |
| 7.3 | Share 3: the rest | slice 5 | observed: real-repo 3/3 lists the other 328 checks; three shares equal the 642 unsplit, none repeated (test-runner-selection.sh) |
| 8 | The shares are tuned once from the story's own CI runs and then left alone | slice 6 | observed: PLAN.md Learnings slice 6: two moves read from runs 43789276896 and 43790894501; final shares kept |
| 9 | One small check fails when a check file matches more than one share's patterns | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs 'a check two shares match is refused naming it and both shares' |
| 9.1 | The overlap failure names the file and the shares | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs 'a check two shares match is refused naming it and both shares' asserts label and 'shares 1 and 2' |
| 10 | The same check fails when a pattern matches no check | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs 'a pattern that matches no check is refused naming it, also with no share selected' |
| 10.1 | The no-match failure names the pattern | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs same case asserts the message names the pattern |
| 11 | This check is the only sharding automation that remains | slice 7 | observed: scripts/test-share-matrix.mjs refusals are the only Distribution sharding automation (git grep slice 7) |
| 12 | A share can be reproduced locally by its number | slice 5 | observed: Distribution/tests/runner-settings.md: OPEN_DOUGH_TEST_SPLIT=<i>/3 npm test; Distribution/tests/test-runner/test-runner-split.sh expect_share per share |
| 13 | A run that selects no share runs every check | slice 2 | observed: Distribution/tests/test-runner/test-runner-failure-report.sh start-order block: unsplit run starts all five checks |
| 13.1 | It runs them in bytewise path order | slice 2 | observed: Distribution/tests/test-runner/test-runner-failure-report.sh asserts start order 'Zeta alpha beta gamma node-ordered' against durations ordering otherwise |
| 14 | Each CI job keeps three time limits, listed in 14.1–14.3 | slice 4 | observed: .github/workflows/ci.yml distribution-tests keeps timeout-minutes: 6 and the 180/320 s deadline step |
| 14.1 | Its plain `timeout-minutes` | slice 4 | observed: .github/workflows/ci.yml:35 timeout-minutes: 6 unchanged |
| 14.2 | Its 320-second run cutoff | slice 4 | observed: .github/workflows/ci.yml OPEN_DOUGH_TEST_DEADLINE_MS started+320000 unchanged; test-runner-deadline-* green |
| 14.3 | The 180-second per-check safety deadline | slice 4 | observed: per-check safety deadline unchanged; test-runner-deadline-* checks green |
| 15 | The normalized time budget is removed, including the items in 15.1–15.4 | slice 4 | observed: scripts/test.sh budget step removed; Distribution/tests/test-runner/test-runner-selection.sh full CI run passes with a slow check |
| 15.1 | `time-budget` | slice 4 | observed: Distribution/tests/time-budget deleted |
| 15.2 | Per-job and total ceilings | slice 4 | observed: scripts/test-budget.sh (per-job and total ceilings) deleted |
| 15.3 | The runner factor | slice 4 | observed: runner-factor command and formatRunnerFactorLine removed from scripts/test-shares.mjs and scripts/share-deal.mjs |
| 15.4 | `OVER BUDGET` failures | slice 4 | observed: Distribution/tests/test-runner/test-runner-selection.sh full-run step asserts exit 0 with empty log under CI=true; scratch break printed OVER BUDGET against 2acd3d1418 |
| 16 | Each share keeps uploading its `test-times-<i>` artifact | slice 5 | observed: .github/workflows/ci.yml Keep per-job test times step uploads test-times-<i> |
| 16.1 | The artifact is retained for 90 days | slice 5 | observed: .github/workflows/ci.yml retention-days: 90 |
| 16.2 | The artifact is the rebalancing input | slice 5 | observed: .github/workflows/ci.yml artifact comment and Distribution/tests/README.md name it the input for moving a pattern |
| 17 | Everything that only the Distribution suite uses is removed completely, as listed in 17.1–17.16 | slice 7 | observed: slices 3, 4, 5, 7 removals; final git grep leaves only dashboard-group files, CHANGELOG.md and records |
| 17.1 | `Distribution/tests/longest-first*` | slice 7 | observed: Distribution/tests/longest-first, -ci, -execution, -skills, -suite, -support deleted |
| 17.2 | `Distribution/tests/time-budget` | slice 4 | observed: Distribution/tests/time-budget deleted |
| 17.3 | The `share` command | slice 5 | observed: scripts/test-shares.mjs share command removed; test-shares.test.mjs 'a command other than preview or refresh is refused naming it' |
| 17.4 | The `runner-factor` command | slice 4 | observed: runner-factor command removed from scripts/test-shares.mjs |
| 17.5 | The Distribution preview, with its budget headroom | slice 3 | observed: scripts/share-preview.mjs keeps only previewFromOptions over --spec-dir; no budget/headroom code; share-preview.test.mjs Distribution cases removed |
| 17.6 | The preview's trunk inventory | slice 3 | observed: trunkJobLabels and --trunk-labels removed from scripts/share-preview.mjs and test-shares.mjs; share-preview-trunk.test.mjs deleted |
| 17.7 | The preview's stale-list report | slice 3 | observed: formatPreview has no stale banner/notes; share-preview-stale.test.mjs and stale-share-preview fixtures deleted |
| 17.8 | `scripts/test-budget.sh` | slice 4 | observed: scripts/test-budget.sh deleted |
| 17.9 | `scripts/time-budget.bash` | slice 4 | observed: scripts/time-budget.bash deleted |
| 17.10 | `scripts/ci-test-times.sh` | slice 4 | observed: scripts/ci-test-times.sh and Distribution/tests/ci/ci-test-times.sh deleted |
| 17.11 | The tests for these items | slice 7 | observed: list fixtures removed from test-runner-interrupt.sh, test-runner-deadline-continuation.test.mjs, test-runner-failure-report.sh |
| 17.12 | The fixtures for these items | slice 7 | observed: job-duration-list.mjs CLI mode removed (module kept for dashboard-group tests) |
| 17.13 | `test-shares.md` | slice 7 | observed: Distribution/tests/test-shares.md deleted |
| 17.14 | `time-budget.md` | slice 4 | observed: Distribution/tests/time-budget.md deleted |
| 17.15 | Every passage that refers to these items | slice 7 | observed: dashboard/tests/shards.md and scripts/share-deal.mjs links into deleted passages reworded; git grep clean of test-shares.md outside records |
| 17.16 | Maintainer findings entries that describe the deal or the budget as the current response | slice 7 | observed: DD-537 entry and Node-suite budget/deal parts of DD-279 removed from docs/maintainer/project-test-findings.md and ProjectFindings.md |
| 18 | What the dashboard groups still use stays until the next story removes it, as listed in 18.1–18.6 | slice 3 | observed: scripts/share-deal.mjs, scripts/duration-list.mjs unchanged; refresh command and --spec-dir preview kept |
| 18.1 | The deal module | slice 3 | observed: scripts/share-deal.mjs unchanged; share-deal.test.mjs green |
| 18.2 | The duration-list modules | slice 3 | observed: scripts/duration-list.mjs unchanged; duration-list.test.mjs green |
| 18.3 | The list refresh | slice 3 | observed: scripts/test-shares.mjs refresh command unchanged; test-shares.test.mjs green |
| 18.4 | The `--spec-dir` preview | slice 3 | observed: share-preview.test.mjs 'preview lists a browser group's root of its spec directory...' green |
| 18.5 | The tests for these items | slice 3 | observed: browser-group-shards, share-deal, duration-list, dashboard-test-files tests untouched and green |
| 18.6 | `dashboard/tests/shards.md` | slice 7 | observed: dashboard/tests/shards.md kept; only its two links into deleted files changed |
| 19 | Between this story and the next, no command reports recent per-check CI seconds | slice 4 | observed: scripts/ci-test-times.sh deleted; no remaining per-check seconds command |
| 19.1 | The retained `test-times-<i>` artifacts are read with `gh run download` | slice 4 | observed: Distribution/tests/README.md and ci.yml artifact comment: read test-times-<i> with gh run download |
| 19.2 | `scripts/ci-job-times.sh` keeps reporting each share's distance from its run cutoff | slice 4 | observed: scripts/ci-job-times.sh behavior unchanged; Distribution/tests/ci/ci-job-times.sh green |
| 20 | Released `CHANGELOG.md` entries stay | slice 7 | observed: CHANGELOG.md untouched |
| 21 | The done-story catalog stays | slice 7 | observed: .planning/done/ untouched |
| 21.1 | Both are release and identity records, not descriptions of current behavior | slice 7 | observed: CHANGELOG.md and .planning/done/ left as records |
| 22 | A maintainer adds `Distribution/tests/new-area/first.sh` and changes nothing else → CI runs it once, in the last share | slice 5 | observed: Distribution/tests/test-runner/test-runner-split.sh: Distribution/tests/new-area/first.sh runs once in share 3 |
| 23 | A maintainer adds `Distribution/tests/skills/dough-execute-plan/new-case.test.mjs` → CI runs it once, in the share whose pattern names that folder | slice 5 | observed: Distribution/tests/test-runner/test-runner-split.sh: dough-execute-plan/new-case.test.mjs runs only in share 1 |
| 23.1 | No list or preview step comes before the push | slice 5 | observed: scripts/test-jobs.sh reads only the workflow matrix; no list or preview input |
| 24 | Share 2 is given `Distribution/tests/skills/**` while share 1 keeps `Distribution/tests/skills/dough-execute-plan/**` → the check fails, naming one overlapping file and both shares | slice 5 | observed: Distribution/tests/test-runner/test-runner-split.sh expect_refused overlap: '<file> matches the patterns of shares 1 and 2.' |
| 24.1 | The overlap check fails before any share's result is trusted | slice 5 | observed: Distribution/tests/test-runner/test-runner-split.sh overlap refusal for 1/3, 2/3, 3/3 and unsplit with no record (no check started) |
| 25 | `Distribution/evaluation` is renamed and its pattern is left behind → the check fails, naming the pattern that matches no check | slice 5 | observed: Distribution/tests/test-runner/test-runner-split.sh expect_refused: 'pattern Distribution/evaluation/** of share 2 matches no check.' |
| 25.1 | The folder does not silently join the last share | slice 5 | observed: Distribution/tests/test-runner/test-runner-split.sh unmatched refusal in 3/3 and unsplit before any check starts |
| 26 | A check takes 70 seconds on CI where the removed per-job ceiling was 64 → the share passes | slice 4 | observed: Distribution/tests/test-runner/test-runner-selection.sh full CI run: a check slower than a per-job ceiling passes (scaled 0.3 s vs 0.1 s; break shown against old runner) |
| 26.1 | Only the 180-second safety deadline or the 320-second run cutoff fails a share for time | slice 4 | observed: scripts/test.sh has only the deadline/cutoff time failures; test-runner-deadline-* green |
| 27 | A maintainer moves one folder pattern from the last share to the first in `ci.yml` → the next CI run follows it, with no other file to edit | slice 6 | observed: commits 3a77b873d and 10ddc5901 change only ci.yml's share 2 tests line (plus plan); the next runs followed (244/100/298, then 244/70/328) |
| 28 | The matrix is the one owner of share membership | slice 5 | observed: scripts/test-jobs.sh selects split membership only from .github/workflows/ci.yml via scripts/test-share-matrix.mjs |
| 29 | The runner's selection reads the shares from the workflow file through one small module | slice 5 | observed: scripts/test-jobs.sh calls scripts/test-share-matrix.mjs with the runner root's workflow |
| 29.1 | The overlap check reads the shares through that same module | slice 5 | observed: overlap/unmatched refusals come from selectShare in scripts/test-share-matrix.mjs |
| 30 | The runner is told only which share number to run | slice 5 | observed: OPEN_DOUGH_TEST_SPLIT=<i>/<n> is the runner's only share input; shareOfSplit refuses n != declared |
| 31 | No Accepted ADR constrains this | slice 5 | observed: no Accepted ADR in docs/adrs/ covers shards, shares or the CI matrix (implementer search) |
| 32 | The repository has no YAML parser, so the matrix entry form must stay readable by that module | slice 1 | observed: scripts/test-share-matrix.mjs readShareMatrix: narrow line parser, refuses unsupported matrix lines |
| 33 | Share balance has no automatic owner | slice 6 | observed: no balancing automation added; ci.yml matrix is static |
| 33.1 | Wall time per share tracks its job-seconds divided by the runner's four CPUs (main run 43773156778: 927, 947 and 619 job-seconds ran in 233, 238 and 155 s) | slice 6 | observed: PLAN.md Learnings: job-seconds/wall ratio ~3.9 per run, varying 1.4-1.7x across runners |
| 33.2 | The starting shares total about 743, 845 and 905 job-seconds on that run, so the slowest is predicted near 226 s, against 238 s measured today and the 320-second cutoff | slice 6 | observed: PLAN.md Learnings slice 6: measured 217/157/236 and 135/226/167 s vs 238 s before |
| 34 | A share that grows past its cutoff fails that share | slice 4 | observed: 320 s run cutoff kept; test-runner-deadline-cutoff.test.mjs green |
| 34.1 | Drift before that point is visible only through `scripts/ci-job-times.sh` or the job durations | slice 4 | observed: scripts/ci-job-times.sh kept as the only drift report; README points to it |
| 35 | Considered and not chosen: first match wins in matrix order, as in a routing table with a default route, which would make overlap impossible and need no check | slice 1 | observed: scripts/test-share-matrix.mjs selectShare refuses any cross-share overlap instead of first-match-wins |
| 35.1 | The developer's overlap check is kept, so each share's patterns say what it runs without reading the earlier entries | slice 1 | observed: Distribution/tests/support/test-share-matrix.test.mjs overlap refusal for share 1, share 3 and unselected |
| 35.2 | Unlike a default route, the last share receives every new folder, so it grows without anyone editing it | slice 6 | observed: last share has no pattern in ci.yml; new folders join it (test-runner-split.sh new-area case) |
| 36 | Outcome: CI runs every Distribution check exactly once across the fixed shares | slice 6 | observed: runs 43788295624 and 43790894501 test-times artifacts: 642 checks across shares, none repeated, equal to unsplit count |
| 37 | Outcome: total wall time is comparable to the current split | slice 6 | observed: run 43790894501: slowest test step 236 and 226 s vs 238 s for the dealt split in run 43773156778 |
| 38 | Outcome: the Distribution suite's code, tests and documents keep no reference to duration lists, deals or the normalized budget | slice 7 | observed: git grep -i 'longest-first\|time-budget\|test-shares.md\|runner factor\|OVER BUDGET' hits only dashboard groups, CHANGELOG.md, records |
