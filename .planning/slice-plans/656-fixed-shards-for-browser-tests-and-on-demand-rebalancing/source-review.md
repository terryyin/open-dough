# Source review

Launch: a fresh general-purpose agent (no conversation inheritance) in the
execution session of 2026-11-16, before slice 1's delegation. Input: only the
story section text of
[SEED-381#fixed-shards-for-browser-tests-and-on-demand-rebalancing](../../seeds/SEED-381-fixed-ci-test-shards.md#fixed-shards-for-browser-tests-and-on-demand-rebalancing)
(Goal, Scope, Scope limits, Key examples, Architecture, Considered, Outcome),
with instructions to read no other file, change nothing, and return numbered
commitments and exclusions. Rows below are its return; exclusions carry their
returned `X` ids.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: maintainers rebalance every CI test group's shards only when they choose to. | slice 8 | |
| 2 | Rebalancing is done from recent CI evidence. | slice 8 | |
| 3 | Every remaining shard is declared as fixed configuration. | slice 8 | |
| 4a.1 | The `e2e` job in `.github/workflows/ci.yml` declares its shards there. | slice 4 | observed: .github/workflows/ci.yml e2e specs block |
| 4a.2 | The `dashboard-integrated` job declares its shards in `ci.yml`. | slice 4 | observed: .github/workflows/ci.yml dashboard-integrated specs block |
| 4a.3 | The `dashboard-frontend` job declares its shards in `ci.yml`. | slice 4 | observed: .github/workflows/ci.yml dashboard-frontend shards [1], no specs; Distribution/tests/support/browser-group-shards.test.mjs reads it |
| 4a.4 | The `dashboard-backend` job declares its shards in `ci.yml`. | slice 4 | observed: .github/workflows/ci.yml dashboard-backend specs block |
| 4b | Shards are declared the way the `distribution-tests` matrix declares them. | slice 4 | observed: .github/workflows/ci.yml caller jobs declare shards+specs read by the same readShareDeclaration as the distribution-tests matrix |
| 4c | Every shard but the last names the spec files it runs as repository-relative folder or file glob patterns. | slice 4 | observed: .github/workflows/ci.yml specs lines: repository-relative folder/file globs for every shard but the last |
| 4d | Patterns apply over the spec files the group's configuration already discovers. | slice 4 | observed: Distribution/tests/support/browser-group-shards.test.mjs every real spec each configuration discovers is in exactly one CI shard |
| 4e | The last shard names no pattern and runs every discovered spec no earlier shard claims. | slice 4 | observed: Distribution/tests/support/browser-group-shards.test.mjs new-area spec lands only in the last E2E shard; every spec in exactly one shard |
| 4f | A one-shard group declares no pattern. | slice 4 | observed: .github/workflows/ci.yml dashboard-frontend declares no specs |
| 4g.1 | Shard counts stay as they are. | slice 4 | observed: .github/workflows/ci.yml shards inputs unchanged |
| 4g.2 | Job names stay as they are. | slice 4 | observed: .github/workflows/ci.yml job ids unchanged |
| 4g.3 | CI proof parts stay as they are. | slice 4 | observed: ci-proof-actions/ci-proof-declaration/distribution-ci-proof tests green, proof parts unchanged |
| 4g.4 | `<group>-times-<shard>` artifact names stay as they are. | slice 4 | observed: .github/workflows/browser-test-group.yml artifact name ${{ inputs.group }}-times-${{ matrix.shard }} unchanged |
| 5a | Loading a group's configuration fails, before any test is selected, when a spec file matches the patterns of two shards. | slice 3 | observed: Distribution/tests/support/dashboard-declared-shards.test.mjs overlap refusal with and without a split, thrown by dashboardTestMatch/dashboardTestProjects before selection (real configurations: slice 4) |
| 5b | That overlap failure names the file and the shards. | slice 3 | observed: Distribution/tests/support/dashboard-declared-shards.test.mjs overlap refusal exact message names the spec and shares 1 and 2 |
| 5c | Loading a group's configuration fails, before any test is selected, when a pattern matches no spec file. | slice 3 | observed: Distribution/tests/support/dashboard-declared-shards.test.mjs unmatched-pattern refusal with and without a split |
| 5d | That unmatched-pattern failure names the pattern. | slice 3 | observed: Distribution/tests/support/dashboard-declared-shards.test.mjs unmatched-pattern exact message names the pattern |
| 5e | This is the same rule and the same check the Distribution shares use. | slice 3 | observed: dashboard/tests/support/testFiles.mjs declaredShardFiles calls readShareDeclaration/shareOfSplit/selectShare, the Distribution runner's rule |
| 6a | A shard is reproducible locally by its number through the group's existing `<prefix>_SPLIT=i/n`. | slice 4 | observed: slice 4 return: OPEN_DOUGH_E2E_SPLIT=2/6 playwright --list → 70 files = sessions/agent-* + stories/**; Distribution/tests/support/browser-group-shards.test.mjs per-shard selection from the real ci.yml |
| 6b | A run without `<prefix>_SPLIT` runs every spec of the group. | slice 4 | observed: Distribution/tests/support/browser-group-shards.test.mjs a run without a split takes every spec |
| 7a | The starting shards come from recent `main` timing through the rebalancing script. | slice 4 | observed: PLAN.md Learnings slice 4: ci-shard-balance.mjs totals for each group on the working tree |
| 7b | Starting shards use folder patterns first. | slice 4 | observed: .github/workflows/ci.yml backend and e2e shards are folder patterns except where a folder outweighs an even shard |
| 7c | File-name globs are used only where one folder outweighs an even shard. | slice 4 | observed: .github/workflows/ci.yml file-name globs only for e2e launches/sessions (over an even shard) and integrated navigation (516 s vs even 179 s) |
| 7d | Starting shards are tuned once from the story's own CI runs. | slice 5 | observed: PLAN.md Learnings slice 5: runs 43805225551 and 43806607572 kept the starting shards after both story runs fit their bounds |
| 8a | Each shard keeps uploading its `<group>-times-<shard>` artifact. | slice 4 | observed: .github/workflows/browser-test-group.yml Keep per-spec times step unchanged |
| 8b | That artifact is now retained for 90 days, as the Distribution `test-times-<i>` artifacts are. | slice 4 | observed: .github/workflows/browser-test-group.yml retention-days: 90 |
| 9a.1 | Remove `e2e/longest-first*`. | slice 6 | observed: e2e/longest-first* deleted; slice 6 proof grep (git grep -i longest-first\|share-deal\|share-preview\|test-shares\|duration.list\|durations:) leaves only CHANGELOG, .planning/done, this story, historical finding/evidence records |
| 9a.2 | Remove `dashboard/*.longest-first*`. | slice 6 | observed: dashboard/*.longest-first* deleted; slice 6 proof grep (git grep -i longest-first\|share-deal\|share-preview\|test-shares\|duration.list\|durations:) leaves only CHANGELOG, .planning/done, this story, historical finding/evidence records |
| 9a.3 | Remove the deal code. | slice 6 | observed: scripts/share-deal.mjs deleted; testFiles.mjs has no deal |
| 9a.4 | Remove duration-list reading code. | slice 6 | observed: scripts/duration-list.mjs reading code gone; only scripts/spec-times-format.mjs formatTimes remains |
| 9a.5 | Remove preview code. | slice 6 | observed: scripts/share-preview.mjs deleted |
| 9a.6 | Remove refresh code. | slice 6 | observed: refresh passages and code gone; slice 6 proof grep (git grep -i longest-first\|share-deal\|share-preview\|test-shares\|duration.list\|durations:) leaves only CHANGELOG, .planning/done, this story, historical finding/evidence records |
| 9a.7 | Remove `scripts/share-deal.mjs`. | slice 6 | observed: scripts/share-deal.mjs deleted |
| 9a.8 | Remove `scripts/share-preview.mjs`. | slice 6 | observed: scripts/share-preview.mjs deleted |
| 9a.9 | Remove `scripts/test-shares.mjs`. | slice 6 | observed: scripts/test-shares.mjs deleted |
| 9a.10 | Remove what of `scripts/duration-list.mjs` only those scripts use. | slice 6 | observed: scripts/duration-list.mjs reduced and renamed to scripts/spec-times-format.mjs (formatTimes for specTimes.ts) |
| 9a.11 | Remove their tests and fixtures. | slice 6 | observed: Distribution/tests/support/{share-deal,share-preview,test-shares,duration-list}.test.mjs, job-duration-list.mjs, jobDurationTestData.mjs, makeMe jobDurations deleted |
| 9b.1 | Remove the deal, preview and refresh passages of `dashboard/tests/shards.md`. | slice 6 | observed: dashboard/tests/shards.md The split section describes ci.yml declarations and refusals; preview section deleted |
| 9b.2 | Remove every other passage referring to them in group READMEs. | slice 6 | observed: dashboard/tests/README.md, backend/frontend READMEs, e2e/README.md corrected; slice 6 proof grep (git grep -i longest-first\|share-deal\|share-preview\|test-shares\|duration.list\|durations:) leaves only CHANGELOG, .planning/done, this story, historical finding/evidence records |
| 9b.3 | ... in configuration comments. | slice 6 | observed: dashboard/tests/fixtures/observed-runs-ci.yml comments corrected; configurations and workflows carry no deal comments |
| 9b.4 | ... in maintainer timing documents. | slice 6 | observed: docs/maintainer/dashboard-test-timings.md refresh sentence removed; dashboard-weight-timings.md deleted |
| 9b.5 | ... in queued stories' seeds and plans. | slice 6 | observed: SEED-300, SEED-334, plans 617, 648 and 621 evidence corrected |
| 9c | Remove maintainer findings entries that describe the deal or a refreshed duration list as the current response. | slice 6 | observed: ProjectFindings.md and docs/maintainer/project-test-findings.md DD-279 removed; DD-529 preview sentence removed |
| 10a | Add a private maintainer skill under `.agents/skills/`. | slice 8 | |
| 10b | The skill is not distributed by the installer. | slice 8 | |
| 10c | The skill is backed by one script. | slice 8 | |
| 10d | The script works for a chosen group: any of the four browser groups or the Distribution suite. | slice 2 | observed: Distribution/tests/ci/ci-shard-balance.sh e2e/backend/distribution cases; scripts/ci-shard-balance.mjs parseArguments groups |
| 10e | The script reads that group's times artifacts from the last successful `ci.yml` runs on `main`. | slice 2 | observed: Distribution/tests/ci/ci-shard-balance.sh gh stand-in asserts the successful main ci.yml run listing (--limit 5) and per-run downloads; real distribution-tests run in Learnings |
| 10f | The script takes each file's median seconds across those runs. | slice 2 | observed: Distribution/tests/ci/ci-shard-balance.sh e2e case: even-count median of a file timed twice; ci-shard-times.mjs median |
| 11a | The script prints each shard's total seconds under the patterns currently in `ci.yml`. | slice 2 | observed: Distribution/tests/ci/ci-shard-balance.sh expect_report per-shard totals under the fixture ci.yml patterns; real run in Learnings |
| 11b | The script lists apart the files the runs did not time. | slice 2 | observed: Distribution/tests/ci/ci-shard-balance.sh e2e and distribution cases: Untimed files list |
| 11c | The script prints the notably slow files (those that alone carry a large part of an even shard) as candidates for a faster test rather than a move. | slice 2 | observed: Distribution/tests/ci/ci-shard-balance.sh e2e case: Slow files over a tenth of the even total |
| 11d | The script prints the smallest pattern change that brings the slowest shard closest to the even total, as a unified diff to `ci.yml`. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh e2e/backend/distribution cases print one unified diff (git apply --check) and the slowest-shard change |
| 11e.1 | Allowed change form: one existing pattern moved to another shard. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh e2e case moves e2e/moved/** from shard 4 to the last shard; distribution case moves a pattern from shard 2 to 1 |
| 11e.2 | Allowed change form: one new folder or file pattern taken out of the last shard's rest. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh dashboard-backend case gives shard 1 dashboard/backend-tests/runtime/** from the rest |
| 11f | When no single change improves the slowest shard notably, the script says the shards are balanced and prints no diff. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh applied case and ci-shard-balance.sh reports: Balanced line, no diff |
| 12a | The script only reads: it starts no run. | slice 2 | observed: Distribution/tests/ci/ci-shard-balance.sh fixture tree and TMPDIR unchanged after runs; script only lists/downloads via gh |
| 12b | The script changes no file. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh workflow bytes cmp-equal and fixture tree unchanged after every run; real runs left ci.yml md5 unchanged |
| 12c | The maintainer applies the diff. | slice 8 | |
| 12d.1 | The skill says when to use it. | slice 8 | |
| 12d.2 | The skill says how to invoke it. | slice 8 | |
| 12d.3 | The skill says the next `main` runs are the check of an applied change. | slice 8 | |
| 13a | Qualification: `scripts/ci-job-times.sh` stays and keeps deciding how many jobs a group has. | slice 6 | observed: scripts/ci-job-times.sh unchanged |
| 13b | Qualification: the job-count rule in `dashboard/tests/shards.md` stays and keeps deciding how many jobs a group has. | slice 6 | observed: dashboard/tests/shards.md job-count rule kept |
| 14 | Qualification: shards are declared by spec patterns only. | slice 4 | observed: .github/workflows/ci.yml shards declared only by specs patterns |
| 15 | Qualification: the `chromium-deployments` and `chromium` Playwright projects keep queueing the serial production chains first inside whichever shard their files belong to. | slice 4 | observed: Distribution/tests/support/browser-group-shards.test.mjs E2E's two projects split each shard with production chains first |
| 16a | Qualification: the per-spec times reporter is kept. | slice 6 | observed: dashboard/tests/support/specTimes.ts reporter kept; intent/spec-times.spec.ts green |
| 16b | Qualification: the times form of the artifacts is kept (they are the rebalancing input). | slice 6 | observed: intent/spec-times.spec.ts asserts the <seconds><TAB><file> times form |
| 17a | Qualification: the script proposes one change per invocation. | slice 7 | observed: scripts/ci-shard-proposal.mjs proposeChange returns one change; Distribution/tests/ci/ci-shard-proposal.sh one diff per run |
| 17b | A maintainer wanting more applies it and invokes the script again. | slice 8 | |
| 18a | Example: adding `e2e/new-area/first.spec.ts` and nothing else → CI runs it once, in the last E2E shard. | slice 4 | observed: Distribution/tests/support/browser-group-shards.test.mjs new-area/first.spec.ts lands only in shard 6 |
| 18b | Example: no list or preview step precedes that push. | slice 6 | observed: dashboard/tests/shards.md has no preview step; scripts/share-preview.mjs deleted |
| 19 | Example: adding `dashboard/backend-tests/launches/new-case.spec.ts` → CI runs it once, in the backend shard whose pattern names that folder. | slice 4 | observed: Distribution/tests/support/browser-group-shards.test.mjs backend-tests/launches/new-case.spec.ts lands only in the launches/** shard |
| 20a | Example: one E2E shard has `e2e/sessions/**`, another `e2e/sessions/agent-*` → `npm run test:e2e` fails before any test starts. | slice 4 | observed: Distribution/tests/support/browser-group-shards.test.mjs overlapping e2e patterns throw from dashboardTestMatch/dashboardTestProjects with no split, which e2e/playwright.config.ts calls at load before any test |
| 20b | Same example: every E2E shard fails before any test starts. | slice 4 | observed: Distribution/tests/support/browser-group-shards.test.mjs overlap fails every split 1/6..6/6 |
| 20c | Same example: the failure names one overlapping spec file and both shards. | slice 4 | observed: Distribution/tests/support/browser-group-shards.test.mjs overlap message names one spec and shares 1 and 2 |
| 21 | Example: last spec moved out of `dashboard/tests/intent`, pattern left behind → integrated configuration fails naming the pattern that matches no spec file. | slice 4 | observed: Distribution/tests/support/browser-group-shards.test.mjs removing dashboard/tests/intent fails: pattern dashboard/tests/intent/** of share 1 matches no check |
| 22 | Example: `OPEN_DOUGH_E2E_SPLIT=2/6 npm run test:e2e` locally → runs exactly the spec files CI's second E2E shard runs. | slice 4 | observed: Distribution/tests/support/browser-group-shards.test.mjs per-shard selection equals the declared CI shard; slice 4 return --list run for 2/6 |
| 23a | Example: skill invoked for `e2e` with fourth shard 1,050 s, sixth 600 s, even 820 → prints the six totals. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh e2e case runs the 23 fixture (six shards, 4th 1,050, 6th 600, even 820) through the same report; ci-shard-balance.sh asserts the whole printed report (every shard total) |
| 23b | Same example: prints the slow files. | slice 7 | observed: Distribution/tests/ci/ci-shard-balance.sh e2e case asserts the Slow files lines of the same report the proposal follows |
| 23c | Same example: prints a `ci.yml` diff moving one pattern from the fourth shard to the sixth. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh e2e case diff moves one pattern from shard 4 to shard 6 |
| 23d | Same example: `ci.yml` on disk is unchanged. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh e2e case workflow bytes unchanged |
| 24a | Example: invoked again after applying that diff → prints totals, says balanced, no diff. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh applied case: after git apply of the e2e diff, rerun says balanced, no diff |
| 24b | Example: invoked for a group whose shards are already close → prints totals, says balanced, no diff. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh and ci-shard-balance.sh close fixtures say balanced with no diff; real e2e run balanced |
| 25 | Example: a recent run's times artifacts from an older shard layout still count, because totals come from applying current patterns to each file's seconds. | slice 2 | observed: Distribution/tests/ci/ci-shard-balance.sh e2e case: run 302 under an older 2-shard layout counts under current patterns |
| 26a | Example: no successful `main` run still holds the group's times artifacts → script fails saying so. | slice 2 | observed: Distribution/tests/ci/ci-shard-balance.sh unusable case: no run holds the artifacts, exit 1 with reason |
| 26b | Same example: script proposes nothing. | slice 7 | observed: Distribution/tests/ci/ci-shard-balance.sh unusable case exits 1 before any proposal |
| 27 | Example: skill invoked for the Distribution suite → same report and proposal over the `distribution-tests` matrix and its `test-times-<i>` artifacts. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh distribution-tests matrix case: report and tests: diff |
| 28a | Architecture: `ci.yml` is the one owner of shard membership for all five groups. | slice 4 | observed: .github/workflows/ci.yml comment and declarations: ci.yml owns membership for all five groups |
| 28b | The module that reads the `distribution-tests` matrix for the Node runner becomes the one reader for every group. | slice 4 | observed: dashboard/tests/support/testFiles.mjs and scripts/test-jobs.sh both select through test-share-matrix.mjs/test-share-declaration.mjs |
| 28c | Each browser configuration asks that module for its shard's spec files and is told only the shard number. | slice 4 | observed: dashboard/tests/support/runnerConfig.mjs prepareFocusedRun passes job + split variable; configurations name only their job |
| 28d | The rebalancing script asks that module for every shard's files. | slice 2 | observed: scripts/ci-shard-balance.mjs shardReport uses readShareDeclaration + selectShare |
| 28e | The selection and overlap rules exist once. | slice 6 | observed: scripts/test-share-matrix.mjs selectShare is the only selector; share-deal.mjs deleted |
| 28f | Each group's shard declaration stays in a form that module reads (no YAML parser in the repository). | slice 1 | observed: scripts/test-share-declaration.mjs readShareDeclaration line reader (matrix and caller `shards`/`specs: \|` forms); Distribution/tests/support/test-share-workflow.test.mjs |
| 28g | The called `browser-test-group.yml` turns each group's declaration into its matrix. | slice 4 | observed: .github/workflows/browser-test-group.yml matrix from shards input; specs input declared |
| 28h | No Accepted ADR constrains this. | slice 1 | observed: slice 1 return: docs/adrs 0000-0010 searched for shard/yaml/ci.yml/test-share/split; only 0001:79 and 0007:97, unrelated |
| 29a | Architecture: shard balance has no automatic owner. | slice 6 | observed: no deal or refresh remains; dashboard/tests/shards.md names ci-shard-balance.mjs on request |
| 29b | The rebalancing script is the only place per-file seconds are read. | slice 6 | observed: only scripts/ci-shard-balance.mjs/ci-shard-times.mjs read per-file seconds, from CI artifacts |
| 29c | Nothing in the repository records per-file seconds. | slice 6 | observed: longest-first lists deleted; no per-file seconds file in the repository |
| 29d | A shard that grows past its deadline fails that shard. | slice 5 | observed: .github/workflows/browser-test-group.yml per-shard browser run deadline (450 s) unchanged; runs fail only the late shard |
| 29e | Drift before then is visible through `scripts/ci-job-times.sh`, the job durations, or the script. | slice 8 | |
| 30a | Context: folder and file-name patterns can carry the current load. | slice 5 | observed: PLAN.md Learnings slice 5: runs 43805225551 and 43806607572 every group within bound under folder and file-name patterns |
| 30b | E2E totals about 4,940 s over six shards (~820 each); only `sessions` (1,120) and `launches` (1,094) exceed an even shard, each dividing at its `agent-*` files (555 and 732). | slice 5 | observed: PLAN.md Learnings slice 4: e2e even 780 over six shards, launches/sessions divided at agent-* |
| 30c | Backend totals about 3,210 s over three shards; its nine folders group into about 1,060, 1,055 and 1,090. | slice 5 | observed: PLAN.md Learnings slice 4: backend folders grouped into 739, 707, 647 |
| 30d | Integrated's `navigation` divides by file-name prefix. | slice 4 | observed: .github/workflows/ci.yml integrated navigation divided by board-/source-/story-/side-/notification- prefixes |
| 30e | Frontend is one shard. | slice 4 | observed: .github/workflows/ci.yml dashboard-frontend shards [1] |
| 30f | The longest single spec file is about 150 seconds. | slice 5 | observed: slice 4 ci-shard-balance reports: one slow file (over a tenth of the even total) each in e2e and backend |
| 31 | Considered (rejected): declaring a shard as a Playwright project — a pattern says the same in the one form all five groups share; E2E projects already queue production chains independently of shard membership. | slice 4 | observed: .github/workflows/ci.yml no Playwright project per shard; Distribution/tests/support/browser-group-shards.test.mjs E2E projects keep chain queueing |
| 32 | Considered (rejected): folding the job-count report into the rebalancing script — different questions from different data; the job-count rule has its own readers. | slice 8 | |
| 33a | Outcome: no duration list or dealing code remains in the repository. | slice 6 | observed: slice 6 proof grep (git grep -i longest-first\|share-deal\|share-preview\|test-shares\|duration.list\|durations:) leaves only CHANGELOG, .planning/done, this story, historical finding/evidence records |
| 33b | Outcome: CI runs every browser spec file exactly once across each group's fixed shards. | slice 5 | observed: PLAN.md Learnings slice 5: runs 43805225551 and 43806607572 times artifacts name every discovered spec exactly once in all four groups |
| 33c | Outcome: each group's slowest shard is no slower than under the deal. | slice 5 | observed: PLAN.md Learnings slice 5: runs 43805225551 and 43806607572 slowest shard per group within the recorded deal-era bound in both runs |
| 33d | Outcome: a maintainer can rebalance any group by invoking the skill and reviewing its proposed `ci.yml` change. | slice 8 | |
| X1 | Exclusion: shard counts are not changed. | slice 5 | observed: .github/workflows/ci.yml shards inputs unchanged |
| X2 | Exclusion: deadlines are not changed. Deadline headroom on slow runners belongs to SEED-382. | slice 5 | observed: .github/workflows/browser-test-group.yml deadlines unchanged |
| X3 | Exclusion: `scripts/ci-job-times.sh` and the job-count rule in `dashboard/tests/shards.md` are not removed or replaced. | slice 6 | observed: scripts/ci-job-times.sh and shards.md job-count rule kept |
| X4 | Exclusion: shards are not declared as Playwright projects or by any means other than spec patterns. | slice 4 | observed: .github/workflows/ci.yml shards declared only by specs patterns |
| X5 | Exclusion: the per-spec times reporter and the times artifact form are not removed. | slice 6 | observed: specTimes.ts reporter and browser-times.txt form kept |
| X6 | Exclusion: the script does not propose more than one change per invocation. | slice 7 | observed: scripts/ci-shard-proposal.mjs proposes a single change |
| X7 | Exclusion: the script does not start runs, change files, or apply its own diff. | slice 7 | observed: Distribution/tests/ci/ci-shard-proposal.sh no writes; script prints the diff only |
| X8 | Exclusion: the script does not record per-file seconds in the repository, and nothing gives shard balance an automatic owner. | slice 8 | |
| X9 | Exclusion: released `CHANGELOG.md` entries and the done-story catalog stay unedited. | slice 6 | observed: CHANGELOG.md and .planning/done untouched by slice 6 |
| X10 | Exclusion: the job-count report is not folded into the rebalancing script. | slice 2 | observed: scripts/ci-shard-balance.mjs has no job-count reporting; ci-job-times.sh unchanged and green |
| X11 | Exclusion: the maintainer skill is not distributed by the installer. | slice 8 | |
