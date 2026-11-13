# Source-only review

**Plan:** [PLAN.md](PLAN.md)

Replaced 2026-11-13 after Terry's owner-change amendment (interim Dashboard Integrated UI Test group). Launched by the execution coordinator as a fresh general-purpose
sub-agent (no conversation inheritance, fork or resume). Its only input was the
story's Goal, Scope and Key examples, extracted verbatim from
[SEED-334](../../seeds/SEED-334-product-wide-end-to-end-tests.md#run-and-observe-product-wide-end-to-end-tests)
(`#### Goal` through the end of `#### Key examples`). It was told to read no other
project file, change nothing, and return numbered individual commitments with
compound items separated. The table below is its return, with the
coordinator's slice allocation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | A developer can run representative Open Dough product workflows with `npm run test:e2e` | slice 3 | observed: package.json test:e2e → e2e/playwright.config.ts (prefix OPEN_DOUGH_E2E, setup dashboard/tests/support/e2eGlobalSetup.ts); native list 301 specs / 560 cases under e2e/; full run executed 560 cases |
| G2 | …and understand their purpose and observed results in Intent | slice 6 |  |
| G3 | …and understand their purpose and observed results in CI | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1: entries e2e (559 passed/1 other, 6 parts), dashboard/tests 611/5, frontend 153/1, backend 1,404+7 other/4, each with its own durations and file attribution |
| G4 | A workflow crosses its participating components to an observable product outcome | slice 3 | observed: migration-purpose.json: each of the 301 e2e specs read and classified "workflow" with its real integrations (preview server, Git origins, launched hosts) and simulated boundaries |
| G5 | …including released Open Dough commands in an installed project | slice 5 |  |
| G6 | The dashboard is a common entry point | slice 3 | observed: e2e/README.md "The dashboard page is the common entry point"; migration-purpose.json entry points |
| G7 | The group is product-wide and can also hold a workflow beginning elsewhere when that workflow exists | slice 3 | observed: e2e/ at repository root; e2e/README.md admits workflows beginning elsewhere; e2e/review/one-shot-landing-recovery.spec.ts drives CLI and server without the page |
| T1.1 | **E2E Test** entry: sources `e2e/`, command `npm run test:e2e` | slice 3 | observed: .planning/open-dough.json location e2e, label "E2E Test", includes **/*.spec.ts + 4 registering modules; package.json test:e2e; test-entry-rules resolves e2e specs makeMe+pageObjects |
| T1.2 | E2E Test owns representative product workflows from a supported entry point through the participating components to an observable outcome | slice 3 | observed: e2e/README.md opening paragraph and "Real and substituted" section; 301 workflow specs moved by purpose (migration-purpose.json) |
| T2.1 | **Dashboard Frontend Test** entry: sources `dashboard/frontend-tests/`, command `npm run test:dashboard:frontend` | slice 1 | observed: package.json test:dashboard:frontend → dashboard/frontend.playwright.config.ts; native --list selects 153 cases, frontend-tests only (coordinator rerun); full run 153/153 strict pass |
| T2.2 | Dashboard Frontend Test owns focused presentation, interaction and recovery with controlled backend answers | slice 1 | observed: dashboard/tests/support/frontendGlobalSetup.ts registers only app + comparison-mount builds (no dashboard server/fake hosts); moved specs use pageTest.ts controlled DOM rendering; backend-tests/intent/proof-record-entry.spec.ts "Dashboard Frontend Test … records only its own selection under its own settings" |
| T3.1 | **Dashboard Backend Test** entry: sources `dashboard/backend-tests/`, command `npm run test:dashboard:backend` | slice 2 | observed: package.json test:dashboard:backend → dashboard/backend.playwright.config.ts; native list 414 specs / 1,399 cases, backend-tests only (sameMultiset with umbrella, migration-reconciliation-slice-2.json); full run 1,398 passed + 1 opt-in skip; backend-tests/runtime/runner-ownership.spec.ts "Dashboard Backend Test {normal npm\|direct config from another working directory} records only its own selection under its own settings" |
| T3.2 | Dashboard Backend Test owns focused server behavior, variants, failures and test-runtime contracts at their stable public boundaries | slice 2 | observed: dashboard/tests/support/backendGlobalSetup.ts registers only server bundle, app build, start origins, published main sources, story-columns; runArtifacts.ts 404 "this run's setup does not register it"; dashboard-artifact-demand.spec.ts "Dashboard Backend Test's setup registers no comparison mount, so a spec asking for one fails naming it"; backend-tests/README.md names real collaborators vs substitutes |
| I1 | Owner change by Terry, 2026-11-13: detailed UI checks that still need new controlled backend answers stay in `dashboard/tests/` as the interim **Dashboard Integrated UI Test** group | slice 3 | observed: migration-reconciliation-slice-3.json — 264 specs remain in dashboard/tests (tests root 611 cases), each selected once; migration-conversion-batches.json lists them |
| I2 | The interim group runs by `npm run test:dashboard:integrated` | slice 4 | observed: package.json test:dashboard:integrated → dashboard/integrated.playwright.config.ts; native list 264 specs / 611 cases; local gate 611/611 |
| I3 | The interim group has its own runner and CI producer | slice 4 | observed: dashboard/integrated.playwright.config.ts + integratedGlobalSetup.ts; ci.yml caller dashboard-integrated (5 shards) of browser-test-group.yml; hosted run 43411925055 on da25819 ci-proof-summary-attempt-1 dashboard/tests 5 parts present |
| I4 | This story still retires `test:dashboard` and its umbrella grouping | slice 4 | observed: package.json has no test:dashboard; dashboard/playwright.config.ts deleted; ci.yml has no umbrella dashboard job |
| I5 | Moving those checks to Dashboard Frontend Test and removing the interim group belongs to "Focus detailed dashboard UI checks on controlled answers" | slice 3 | observed: seeds/SEED-334-product-wide-end-to-end-tests.md#focus-detailed-dashboard-ui-checks queued first in PRODUCT-BACKLOG.md "## Backlog list" |
| 1a.1 | Replace `test:dashboard` and its umbrella grouping with independent runners for these groups locally | slice 4 | observed: four package.json group commands; runner-ownership.spec.ts runs each group by npm and direct config; umbrella config deleted |
| 1a.2 | …and in CI | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1 jobs: e2e x6, dashboard-integrated x5, dashboard-frontend x1, dashboard-backend x4; no umbrella job |
| 1b.1 | E2E setup can change independently of the focused groups | slice 4 | observed: tests/support/ci-browser-groups.test.mjs: each group's command/settings/root/shards/duration list come only from its own ci.yml caller inputs and the shared workflow holds no group value; e2e/playwright.config.ts and e2e/longest-first are E2E-only; backend-tests/runtime/runner-ownership.spec.ts runs each runner with every other group's split/record/times/deadline set and records only its own selection |
| 1b.2 | E2E workers can change independently of the focused groups | slice 4 | observed: tests/support/ci-browser-groups.test.mjs: each group's command/settings/root/shards/duration list come only from its own ci.yml caller inputs and the shared workflow holds no group value; e2e/playwright.config.ts and e2e/longest-first are E2E-only; backend-tests/runtime/runner-ownership.spec.ts runs each runner with every other group's split/record/times/deadline set and records only its own selection |
| 1b.3 | E2E shards can change independently of the focused groups | slice 4 | observed: tests/support/ci-browser-groups.test.mjs: each group's command/settings/root/shards/duration list come only from its own ci.yml caller inputs and the shared workflow holds no group value; e2e/playwright.config.ts and e2e/longest-first are E2E-only; backend-tests/runtime/runner-ownership.spec.ts runs each runner with every other group's split/record/times/deadline set and records only its own selection |
| 1b.4 | E2E duration inputs can change independently of the focused groups | slice 4 | observed: tests/support/ci-browser-groups.test.mjs: each group's command/settings/root/shards/duration list come only from its own ci.yml caller inputs and the shared workflow holds no group value; e2e/playwright.config.ts and e2e/longest-first are E2E-only; backend-tests/runtime/runner-ownership.spec.ts runs each runner with every other group's split/record/times/deadline set and records only its own selection |
| 1b.5 | E2E output can change independently of the focused groups | slice 4 | observed: tests/support/ci-browser-groups.test.mjs: each group's command/settings/root/shards/duration list come only from its own ci.yml caller inputs and the shared workflow holds no group value; e2e/playwright.config.ts and e2e/longest-first are E2E-only; backend-tests/runtime/runner-ownership.spec.ts runs each runner with every other group's split/record/times/deadline set and records only its own selection |
| 1b.6 | E2E proof ownership can change independently of the focused groups | slice 4 | observed: tests/support/ci-browser-groups.test.mjs: each group's command/settings/root/shards/duration list come only from its own ci.yml caller inputs and the shared workflow holds no group value; e2e/playwright.config.ts and e2e/longest-first are E2E-only; backend-tests/runtime/runner-ownership.spec.ts runs each runner with every other group's split/record/times/deadline set and records only its own selection |
| 1c.1 | Reuse suitable fixtures | slice 4 | observed: shared serviceRunSetup.ts/runLifecycle.ts/prepareFocusedRun and dashboard fixtures reused by all four runners |
| 1c.2 | Reuse suitable proof mechanisms | slice 4 | observed: shared quietReporter proof record, ci-proof-fragments action (producer input) and ci-proof-summary reused per group |
| 1d.1 | Preserve existing isolation | slice 4 | observed: runner-ownership.spec.ts concurrent case: 8 runs across groups keep their own run directories and records |
| 1d.2 | Preserve existing cleanup | slice 4 | observed: run-processes.spec.ts teardown sweeps and dashboard-artifact-demand.spec.ts interruption cleanup for all four setups |
| 1d.3 | Preserve existing failure diagnostics | slice 4 | observed: quiet reporter failure output and retained failed-run directories per group root (runner-ownership, proof-record-entry); lifecycle 33/33 |
| 1d.4 | Preserve existing local full-suite resource admission across linked worktrees | slice 4 | observed: tests/support/local-test-suite-focused-runners.test.mjs: each of four runners admits unfiltered runs, -g/--list stay focused |
| 2a | Review the inventory by the behavior each case proves | slice 3 | observed: migration-purpose.json: all 566 integrated specs read in full and classified (301 e2e, 204 frontend detailed UI, 59 split, 2 backend) with per-case splits in migration-conversion-batches.json |
| 2b | Keep representative integrations in E2E | slice 3 | observed: migration-moves.json: 301 workflow specs + 7 registering/journey modules moved to e2e/<feature>/; reconciliation-slice-3 every base case once |
| 2c.1 | Move detailed UI checks to their focused owner (qualified by I1 for checks needing new controlled answers) | | G1 |
| 2c.2 | Move server checks to their focused owner | slice 2 | observed: migration-moves.json + migration-case-moves.json: 3 whole server specs to backend-tests/sessions, feedbackMaintenanceLaunchEligibilityCases.ts to backend-tests/launches, 29 server-boundary cases split from 17 integrated specs into focused backend specs (assertions unchanged, e.g. agent-launch-start-taken-refused.spec.ts); 63/63 backend + 38/38 trimmed integrated |
| 2c.3 | Move harness checks to their focused owner | slice 2 | observed: quiet-reporter, page-teardown-drain, settled-page, observation-measurements moved to backend-tests/runtime/ and run under test:dashboard:backend (full run pass) |
| 2d.1 | Account for every maintained spec | slice 4 | observed: migration-reconciliation-slice-4.json (exit 0): all 2,717 base cases once at named destinations across four runners, 18 added proof cases, registering modules attributed per entry; migration-purpose.json/migration-conversion-batches.json name surviving proof |
| 2d.2 | Account for every maintained case | slice 4 | observed: migration-reconciliation-slice-4.json (exit 0): all 2,717 base cases once at named destinations across four runners, 18 added proof cases, registering modules attributed per entry; migration-purpose.json/migration-conversion-batches.json name surviving proof |
| 2d.3 | Account for every maintained test-registering helper | slice 4 | observed: migration-reconciliation-slice-4.json (exit 0): all 2,717 base cases once at named destinations across four runners, 18 added proof cases, registering modules attributed per entry; migration-purpose.json/migration-conversion-batches.json name surviving proof |
| 2e.1 | Name each accounted item's destination | slice 4 | observed: migration-reconciliation-slice-4.json (exit 0): all 2,717 base cases once at named destinations across four runners, 18 added proof cases, registering modules attributed per entry; migration-purpose.json/migration-conversion-batches.json name surviving proof |
| 2e.2 | Name each accounted item's surviving proof | slice 4 | observed: migration-reconciliation-slice-4.json (exit 0): all 2,717 base cases once at named destinations across four runners, 18 added proof cases, registering modules attributed per entry; migration-purpose.json/migration-conversion-batches.json name surviving proof |
| 2f.1 | Splitting or replacing redundant cases must retain their behavior | slice 3 | observed: migration-reconciliation-slice-3.json: no case split or replaced in slice 3; every base case selected exactly once; redundancy recorded only as candidates with surviving proof |
| 2f.2 | Splitting or replacing redundant cases must retain meaningful integration proof | slice 3 | observed: migration-reconciliation-slice-3.json + migration-purpose.json: integration proof kept unchanged in moved e2e specs (only import paths changed) |
| 3a | Keep working-tree skill journeys for feedback on current changes | slice 5 |  |
| 3b | Add one representative dashboard preparation-start journey using a real installation from an explicitly pinned published numeric release tag | slice 5 |  |
| 3c | Observe the published assignment at the project's Git origin | slice 5 |  |
| 3d.1 | Identify the tag with the proof | slice 5 |  |
| 3d.2 | Identify the resolved revision with the proof | slice 5 |  |
| 3d.3 | Identify the installed version with the proof | slice 5 |  |
| 3e | Never substitute working-tree bytes when the tagged source is unavailable | slice 5 |  |
| 4a.1 | Identify each representative journey's real integrations | slice 5 |  |
| 4a.2 | Identify each representative journey's simulated external boundaries | slice 5 |  |
| 4b.1 | Deterministic native-host protocol stand-ins remain valid for these workflows | slice 5 |  |
| 4b.2 | Deterministic GitHub stand-ins remain valid for these workflows | slice 5 |  |
| 4c | These stand-ins do not become native skill-use acceptance | slice 5 |  |
| 4d | Existing native acceptance responsibilities remain with ADR 0005 | slice 5 |  |
| 5a.1 | Capture discovery before migration | slice 1 | observed: migration-manifest.jsonl inputs+spec+case records from native JSON at a9ddb54 (1,015 specs / 2,717 cases / 17 registering modules); byte-identical regeneration from detached base worktree |
| 5a.2 | Capture CI shard membership before migration | slice 1 | observed: migration-manifest.jsonl spec.shard (OPEN_DOUGH_DASHBOARD_SPLIT=i/13 deal at base) with longest-first seconds/timingPart |
| 5a.3 | Capture published proof inputs before migration | slice 1 | observed: migration-manifest.jsonl inputs record: ci.yml dashboard entries, report format, expect line, frontend-entry, times/report/frontend-proof artifact names |
| 5b | Verify each new command's selection | slice 4 | observed: native --list JSON per group: E2E 302/560, integrated 264/611, frontend 52/153, backend 415/1,411, zero errors |
| 5c | Execute the migrated cases | slice 4 | observed: local gate full runs of all four groups (frontend 153/153, integrated 611/611, backend, E2E) and hosted run 43411925055 all producers passed |
| 5d | Preserve behavior coverage | slice 4 | observed: migration-reconciliation-slice-4.json every base case selected once; hosted summary totals per entry |
| 5e.1 | Check setup changes against the baseline | slice 4 | observed: per-group setups registering only requested artifacts (runArtifacts 404 naming unregistered); lifecycle 33/33 |
| 5e.2 | Check sharding changes against the baseline | slice 4 | observed: browser-group-shards.test.mjs per-group deal from hosted durations (largest shard e2e 642 s, integrated 692 s, frontend 175 s, backend 636 s vs old 1,015 s); every spec in exactly one shard of its group |
| 5e.3 | Check timing changes against the baseline | slice 4 | observed: migration-duration-rows.json: 960 old rows mapped to per-group lists with seconds unchanged; times labels match list labels per group (292/255/38/374) |
| 5f | Listing alone proves selection | slice 4 | observed: reconciliation uses native lists for selection only; execution observed separately in full runs and hosted CI |
| 6a.1 | Publish each group's counts | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1: each entry's passed/failed/other, durationMs and files from its own producer's parts (e2e 6, dashboard/tests 5, frontend 1, backend 4), files outside entry 0 |
| 6a.2 | Publish each group's outcomes | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1: each entry's passed/failed/other, durationMs and files from its own producer's parts (e2e 6, dashboard/tests 5, frontend 1, backend 4), files outside entry 0 |
| 6a.3 | Publish each group's durations | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1: each entry's passed/failed/other, durationMs and files from its own producer's parts (e2e 6, dashboard/tests 5, frontend 1, backend 4), files outside entry 0 |
| 6a.4 | Publish each group's file attribution | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1: each entry's passed/failed/other, durationMs and files from its own producer's parts (e2e 6, dashboard/tests 5, frontend 1, backend 4), files outside entry 0 |
| 6b | …from its own CI runner | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1: each entry's passed/failed/other, durationMs and files from its own producer's parts (e2e 6, dashboard/tests 5, frontend 1, backend 4), files outside entry 0 |
| 6c.1 | Update producer jobs together with the rest | slice 4 | observed: ci.yml callers + browser-test-group.yml + fragments producer input + expect e2e=6 dashboard/tests=5 dashboard/frontend-tests=1 dashboard/backend-tests=4 in one change (da25819); hosted run 43411925055 on da25819 ci-proof-summary-attempt-1 all parts present |
| 6c.2 | Update shard counts together with the rest | slice 4 | observed: ci.yml callers + browser-test-group.yml + fragments producer input + expect e2e=6 dashboard/tests=5 dashboard/frontend-tests=1 dashboard/backend-tests=4 in one change (da25819); hosted run 43411925055 on da25819 ci-proof-summary-attempt-1 all parts present |
| 6c.3 | Update proof fragments together with the rest | slice 4 | observed: ci.yml callers + browser-test-group.yml + fragments producer input + expect e2e=6 dashboard/tests=5 dashboard/frontend-tests=1 dashboard/backend-tests=4 in one change (da25819); hosted run 43411925055 on da25819 ci-proof-summary-attempt-1 all parts present |
| 6c.4 | Update summary expectations together with the rest | slice 4 | observed: ci.yml callers + browser-test-group.yml + fragments producer input + expect e2e=6 dashboard/tests=5 dashboard/frontend-tests=1 dashboard/backend-tests=4 in one change (da25819); hosted run 43411925055 on da25819 ci-proof-summary-attempt-1 all parts present |
| 6d | Keep the frontend proof artifact specific to frontend files | slice 4 | observed: frontend-test-proof-attempt-1 of run 43411925055 names only dashboard/frontend-tests files (57) |
| 6e.1 | Missing reports or parts remain distinguishable from passes | slice 4 | observed: tests/support/ci-proof-actions.test.mjs + ci-proof-action-replay.mjs: a part with no record is reported missing, not passed |
| 6e.2 | Missing reports or parts remain distinguishable from reported zeros | slice 4 | observed: tests/support/ci-proof-actions.test.mjs: an empty completed record is a reported zero, distinct from missing |
| 6f | Verify a hosted run on the migrated revision | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1 on the migrated revision da25819: verdict success, all producer parts present |
| 7a | Update Intent locations | slice 3 | observed: .planning/open-dough.json e2e location (label E2E Test) added beside the kept dashboard/tests entry; ci.yml entries/expect include e2e=13:case |
| 7b.1 | Affected readers make Project Intent identify the correct group and source | slice 6 |  |
| 7b.2 | …Purpose identifies the correct group and source | slice 6 |  |
| 7b.3 | …Proof identifies the correct group and source | slice 6 |  |
| 7b.4 | …story CI comparison identifies the correct group and source | slice 6 |  |
| 7b.5 | …history identifies the correct group and source | slice 6 |  |
| 7c | Use **E2E Test** as the display name wherever that entry is named | slice 6 |  |
| 7d.1 | Retain its path as source identity | slice 6 |  |
| 7d.2 | Retain its path as useful navigation context | slice 6 |  |
| 7e | Registering helpers remain discoverable when their locations own case proof | slice 6 |  |
| 8a | Preserve historical observations at their recorded paths and revisions | slice 6 |  |
| 8b | `e2e` is a new scope identity | slice 6 |  |
| 8c | Old `dashboard/tests` evidence is not relabeled as E2E | slice 6 |  |
| 8d.1 | Read historical source where supported | slice 6 |  |
| 8d.2 | Read historical settings where supported | slice 6 |  |
| 8e | Compare matching scopes | slice 6 |  |
| 8f.1 | Show absent scopes explicitly | slice 6 |  |
| 8f.2 | Show changed scopes explicitly | slice 6 |  |
| 8g.1 | …without a fabricated numeric timing comparison | slice 6 |  |
| 8g.2 | …without a dead link | slice 6 |  |
| 9a.1 | Update developer guidance | slice 4 | observed: tests/README.md group table + delivery check, dashboard/COMMANDS.md, dashboard/tests/README.md, shards.md, writing-journeys.md, tests/native-setup.md, group READMEs; plans 586–588 commands per group (Taken plans listed for coordination) |
| 9a.2 | Update agent guidance | slice 4 | observed: tests/README.md group table + delivery check, dashboard/COMMANDS.md, dashboard/tests/README.md, shards.md, writing-journeys.md, tests/native-setup.md, group READMEs; plans 586–588 commands per group (Taken plans listed for coordination) |
| 9a.3 | Update live story/plan references | slice 4 | observed: tests/README.md group table + delivery check, dashboard/COMMANDS.md, dashboard/tests/README.md, shards.md, writing-journeys.md, tests/native-setup.md, group READMEs; plans 586–588 commands per group (Taken plans listed for coordination) |
| 9a.4 | Updates cover the three commands | slice 4 | observed: tests/README.md group table + delivery check, dashboard/COMMANDS.md, dashboard/tests/README.md, shards.md, writing-journeys.md, tests/native-setup.md, group READMEs; plans 586–588 commands per group (Taken plans listed for coordination) |
| 9a.5 | Updates cover placement rules | slice 4 | observed: tests/README.md group table + delivery check, dashboard/COMMANDS.md, dashboard/tests/README.md, shards.md, writing-journeys.md, tests/native-setup.md, group READMEs; plans 586–588 commands per group (Taken plans listed for coordination) |
| 9a.6 | Updates cover delivery checks | slice 4 | observed: tests/README.md group table + delivery check, dashboard/COMMANDS.md, dashboard/tests/README.md, shards.md, writing-journeys.md, tests/native-setup.md, group READMEs; plans 586–588 commands per group (Taken plans listed for coordination) |
| 9a.7 | Updates cover proof interpretation | slice 6 |  |
| 9b.1 | Cover repository tests guidance (`tests/README.md`) | slice 4 | observed: tests/README.md group table and delivery check |
| 9b.2 | Cover dashboard commands (`dashboard/COMMANDS.md`) | slice 4 | observed: dashboard/COMMANDS.md four group commands |
| 9b.3 | Cover test placement (`dashboard/tests/README.md`) | slice 4 | observed: dashboard/tests/README.md placement across e2e, integrated, frontend, backend |
| 9b.4 | Cover local resources (`tests/local-test-resources.md`) | slice 4 | observed: tests/local-test-resources.md admission and per-group test-results |
| 9b.5 | Cover sharding (`dashboard/tests/shards.md`) | slice 4 | observed: dashboard/tests/shards.md rewritten per producer |
| 9b.6 | Cover CI status/proof (`docs/dashboard-development-intent-ci-status.md`) | slice 6 |  |
| D1 | This increment adds no future service | slice 6 |  |
| D2 | This increment adds no new non-dashboard workflow | slice 6 |  |
| D3 | This increment does not optimize suite speed | slice 6 |  |
| D4 | This increment does not add native agent acceptance | slice 6 |  |
| D5 | No new release is needed to test an already published tag | slice 5 |  |
| D6 | Naturally supported entry points remain usable | slice 6 |  |
| D7 | These delivery limits are not rejection rules | slice 6 |  |
| R1a.1 | Tagged proof must fail clearly when its pinned release cannot be obtained | slice 5 |  |
| R1a.2 | Tagged proof must fail clearly when its pinned release cannot be verified | slice 5 |  |
| R1b | ADR 0003 requires immutable tagged content without branch fallback | slice 5 |  |
| R2a.1 | Evidence must retain the unknown scope distinction under ADR 0008 | slice 6 |  |
| R2a.2 | Evidence must retain the missing scope distinction under ADR 0008 | slice 6 |  |
| R2a.3 | Evidence must retain the changed scope distinction under ADR 0008 | slice 6 |  |
| R3a | Apply the project's failing and flaky test policy throughout the migration | slice 6 |  |
| R3b | …including failures attributed to the prior layout | | G2 |
| KE1.1 | An isolated project has Open Dough installed from published tag `v0.3.97`, with resolved revision and installed version recorded | slice 5 |  |
| KE1.2 | The developer runs the E2E command and starts story preparation from the dashboard | slice 5 |  |
| KE1.3 | The installed preparation command publishes the assignment to the project's bare origin | slice 5 |  |
| KE1.4 | The case proof belongs to **E2E Test** | slice 5 |  |
| KE1.5 | The case proof names its substituted boundaries | slice 5 |  |
| KE2.1 | A frontend recovery/layout case uses controlled answers | slice 4 | observed: frontend recovery cases (frontend-tests) and backend refusal cases (backend-tests) run under their own commands; runner-ownership.spec.ts each group records only its own selection; hosted entries per group |
| KE2.2 | A server refusal case uses its public boundary | slice 4 | observed: frontend recovery cases (frontend-tests) and backend refusal cases (backend-tests) run under their own commands; runner-ownership.spec.ts each group records only its own selection; hosted entries per group |
| KE2.3 | The developer runs their focused commands | slice 4 | observed: frontend recovery cases (frontend-tests) and backend refusal cases (backend-tests) run under their own commands; runner-ownership.spec.ts each group records only its own selection; hosted entries per group |
| KE2.4 | Each runs and reports in its own group | slice 4 | observed: frontend recovery cases (frontend-tests) and backend refusal cases (backend-tests) run under their own commands; runner-ownership.spec.ts each group records only its own selection; hosted entries per group |
| KE2.5 | Changing E2E workers or shard allocation does not change either focused runner's selection | slice 4 | observed: runner-ownership.spec.ts: focused runners ignore E2E split/record/times/deadline settings and select only their own roots; ci-browser-groups.test.mjs: E2E shards/workers live only in the e2e caller and e2e config |
| KE2.6 | Changing E2E workers or shard allocation does not change either focused runner's settings | slice 4 | observed: ci-browser-groups.test.mjs: shared workflow holds no group value; each focused config reads only its own prefix (runnerConfig.mjs prepareFocusedRun) |
| KE3.1 | A spec registers cases through another source module | slice 3 | observed: feedbackMaintenanceDueHeldCases.ts, productionUpdateJourney.ts, productionUpdatePolicies.ts, agentSessionCursorUnavailableCases.ts moved with their specs to e2e/; produced proof record and CI fragment attribute 305 files (301 specs + 4 modules) under e2e/ |
| KE3.2 | It moves to its owning group | slice 3 | observed: feedbackMaintenanceDueHeldCases.ts, productionUpdateJourney.ts, productionUpdatePolicies.ts, agentSessionCursorUnavailableCases.ts moved with their specs to e2e/; produced proof record and CI fragment attribute 305 files (301 specs + 4 modules) under e2e/ |
| KE3.3 | Selection/timing ownership follows the correct sources | slice 4 | observed: per-group times → own duration list labels matched (292/255/38/374); spec timing by enclosing spec under its group root |
| KE3.4 | Declared case-file proof follows the correct sources | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1: registering modules attributed under their own entries (e2e 4 modules in 306 files); local transformed fragments name no file outside the group's entry |
| KE3.5 | Purpose and Proof open those sources | slice 6 |  |
| KE4.1 | A hosted run completes all producer matrices | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1: all producer matrices completed, summary published with e2e, dashboard/tests, frontend and backend actual cases, outcomes, durations |
| KE4.2 | CI publishes the summary | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1: all producer matrices completed, summary published with e2e, dashboard/tests, frontend and backend actual cases, outcomes, durations |
| KE4.3 | All three entries receive their actual cases, outcomes and durations | slice 4 | observed: hosted run 43411925055 on da25819 ci-proof-summary-attempt-1: all producer matrices completed, summary published with e2e, dashboard/tests, frontend and backend actual cases, outcomes, durations |
| KE4.4 | The frontend artifact names frontend files | slice 4 | observed: frontend-test-proof-attempt-1 names only dashboard/frontend-tests files |
| KE4.5 | A deliberately missing producer report yields incomplete evidence | slice 4 | observed: ci-proof-actions.test.mjs replay: a deliberately missing producer report leaves the entry incomplete |
| KE4.6 | An actual empty share yields reported zero rather than a missing report | slice 4 | observed: ci-proof-actions.test.mjs replay: an actual empty share yields reported zero rather than missing |
| KE5.1 | A story comparison spans old `dashboard/tests` and new `e2e` evidence | slice 6 |  |
| KE5.2 | The developer opens comparison/history and a historical source | slice 6 |  |
| KE5.3 | Old evidence stays readable at its revision | slice 6 |  |
| KE5.4 | The distinct scopes are explicit | slice 6 |  |
| KE5.5 | Only supported scope/unit matches receive numeric comparisons | slice 6 |  |
| KE5.6 | The unchanged focused entry identities retain their supported comparisons | slice 6 |  |
