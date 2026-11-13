# Source-only review

**Plan:** [PLAN.md](PLAN.md)

Launched 2026-11-13 by the execution coordinator as a fresh general-purpose
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
| G1 | A developer can run representative Open Dough product workflows with `npm run test:e2e` | slice 3 | |
| G2 | The developer can understand those workflows' purpose and observed results in Intent | slice 6 | |
| G3 | The developer can understand those workflows' purpose and observed results in CI | slice 4 | |
| G4 | A workflow crosses its participating components to an observable product outcome | slice 3 | |
| G5 | The workflows include released Open Dough commands in an installed project | slice 5 | |
| G6 | The dashboard is a common entry point | slice 3 | |
| G7 | The group is product-wide and can also hold a workflow that begins elsewhere when such a workflow exists | slice 3 | |
| T1.1 | Entry **E2E Test**: sources `e2e/`, command `npm run test:e2e` | slice 3 | |
| T1.2 | E2E Test's responsibility: representative product workflows from a supported entry point through the participating components to an observable outcome | slice 3 | |
| T2.1 | Entry **Dashboard Frontend Test**: sources `dashboard/frontend-tests/`, command `npm run test:dashboard:frontend` | slice 1 | observed: package.json test:dashboard:frontend → dashboard/frontend.playwright.config.ts; native --list selects 153 cases, frontend-tests only (coordinator rerun); full run 153/153 strict pass |
| T2.2 | Dashboard Frontend Test's responsibility: focused presentation, interaction and recovery with controlled backend answers | slice 1 | observed: dashboard/tests/support/frontendGlobalSetup.ts registers only app + comparison-mount builds (no dashboard server/fake hosts); moved specs use pageTest.ts controlled DOM rendering; backend-tests/intent/proof-record-entry.spec.ts "Dashboard Frontend Test … records only its own selection under its own settings" |
| T3.1 | Entry **Dashboard Backend Test**: sources `dashboard/backend-tests/`, command `npm run test:dashboard:backend` | slice 2 | |
| T3.2 | Dashboard Backend Test's responsibility: focused server behavior, variants, failures and test-runtime contracts at their stable public boundaries | slice 2 | |
| 1a | Replace `test:dashboard` and its umbrella grouping with independent runners for the three groups, locally | slice 4 | |
| 1b | Replace `test:dashboard` and its umbrella grouping with independent runners for the three groups, in CI | slice 4 | |
| 1c.1 | E2E setup can change independently of the focused groups | slice 4 | |
| 1c.2 | E2E workers can change independently of the focused groups | slice 4 | |
| 1c.3 | E2E shards can change independently of the focused groups | slice 4 | |
| 1c.4 | E2E duration inputs can change independently of the focused groups | slice 4 | |
| 1c.5 | E2E output can change independently of the focused groups | slice 4 | |
| 1c.6 | E2E proof ownership can change independently of the focused groups | slice 4 | |
| 1d | Reuse suitable fixtures | slice 4 | |
| 1e | Reuse suitable proof mechanisms | slice 4 | |
| 1f.1 | Preserve the existing isolation | slice 4 | |
| 1f.2 | Preserve the existing cleanup | slice 4 | |
| 1f.3 | Preserve the existing failure diagnostics | slice 4 | |
| 1f.4 | Preserve the existing local full-suite resource admission across linked worktrees | slice 4 | |
| 2a | Review the inventory by the behavior each case proves | slice 3 | |
| 2b | Keep representative integrations in E2E | slice 3 | |
| 2c.1 | Move detailed UI checks to their focused owner |  | G1 |
| 2c.2 | Move detailed server checks to their focused owner | slice 2 | |
| 2c.3 | Move detailed harness checks to their focused owner | slice 2 | |
| 2d.1 | Account for every maintained spec, naming its destination and surviving proof | slice 4 | |
| 2d.2 | Account for every maintained case, naming its destination and surviving proof | slice 4 | |
| 2d.3 | Account for every test-registering helper, naming its destination and surviving proof | slice 4 | |
| 2e | Splitting or replacing redundant cases must keep their behavior | slice 3 | |
| 2f | Splitting or replacing redundant cases must keep their meaningful integration proof | slice 3 | |
| 3a | Keep working-tree skill journeys for feedback on current changes | slice 5 | |
| 3b | Add one representative dashboard preparation-start journey that uses a real installation from an explicitly pinned, published numeric release tag | slice 5 | |
| 3c | Observe the published assignment at the project's Git origin | slice 5 | |
| 3d.1 | Identify the tag with the proof | slice 5 | |
| 3d.2 | Identify the resolved revision with the proof | slice 5 | |
| 3d.3 | Identify the installed version with the proof | slice 5 | |
| 3e | Never substitute working-tree bytes when the tagged source is unavailable | slice 5 | |
| 4a | Identify each representative journey's real integrations | slice 5 | |
| 4b | Identify each representative journey's simulated external boundaries | slice 5 | |
| 4c | Deterministic native-host protocol and GitHub stand-ins remain valid for these workflows | slice 5 | |
| 4d | Those stand-ins do not become native skill-use acceptance | slice 5 | |
| 4e | Existing native acceptance responsibilities stay with ADR 0005 | slice 5 | |
| 5a.1 | Capture discovery before migration | slice 1 | observed: migration-manifest.jsonl inputs+spec+case records from native JSON at a9ddb54 (1,015 specs / 2,717 cases / 17 registering modules); byte-identical regeneration from detached base worktree |
| 5a.2 | Capture CI shard membership before migration | slice 1 | observed: migration-manifest.jsonl spec.shard (OPEN_DOUGH_DASHBOARD_SPLIT=i/13 deal at base) with longest-first seconds/timingPart |
| 5a.3 | Capture published proof inputs before migration | slice 1 | observed: migration-manifest.jsonl inputs record: ci.yml dashboard entries, report format, expect line, frontend-entry, times/report/frontend-proof artifact names |
| 5b | Verify each new command's selection | slice 4 | |
| 5c | Run the migrated cases | slice 4 | |
| 5d | Preserve behavior coverage | slice 4 | |
| 5e.1 | Check setup changes against the baseline | slice 4 | |
| 5e.2 | Check sharding changes against the baseline | slice 4 | |
| 5e.3 | Check timing changes against the baseline | slice 4 | |
| 5f | Listing alone proves selection, nothing more | slice 4 | |
| 6a.1 | Each group publishes its counts from its own CI runner | slice 4 | |
| 6a.2 | Each group publishes its outcomes from its own CI runner | slice 4 | |
| 6a.3 | Each group publishes its durations from its own CI runner | slice 4 | |
| 6a.4 | Each group publishes its file attribution from its own CI runner | slice 4 | |
| 6b | Update producer jobs, shard counts, proof fragments and summary expectations together | slice 4 | |
| 6c | Keep the frontend proof artifact specific to frontend files | slice 4 | |
| 6d | Missing reports or parts stay distinguishable from passes and from reported zeros | slice 4 | |
| 6e | Verify a hosted run on the migrated revision | slice 4 | |
| 7a | Update Intent locations | slice 3 | |
| 7b.1 | Update affected readers so Project Intent identifies the correct group and source | slice 6 | |
| 7b.2 | Update affected readers so Purpose identifies the correct group and source | slice 6 | |
| 7b.3 | Update affected readers so Proof identifies the correct group and source | slice 6 | |
| 7b.4 | Update affected readers so story CI comparison identifies the correct group and source | slice 6 | |
| 7b.5 | Update affected readers so history identifies the correct group and source | slice 6 | |
| 7c | Use **E2E Test** as the display name wherever that entry is named | slice 6 | |
| 7d | Keep the E2E path as source identity and as useful navigation context | slice 6 | |
| 7e | Registering helpers stay discoverable when their locations own case proof | slice 6 | |
| 8a | Preserve historical observations at their recorded paths and revisions | slice 6 | |
| 8b | `e2e` is a new scope identity | slice 6 | |
| 8c | Old `dashboard/tests` evidence is not relabeled as E2E | slice 6 | |
| 8d | Read historical source and settings where supported | slice 6 | |
| 8e | Compare matching scopes | slice 6 | |
| 8f | Show absent or changed scopes explicitly | slice 6 | |
| 8g | Do not fabricate a numeric timing comparison or a dead link for absent or changed scopes | slice 6 | |
| 9a.1 | Update developer and agent guidance and live story/plan references to the three commands | slice 4 | |
| 9a.2 | Update the same guidance and references to the placement rules | slice 4 | |
| 9a.3 | Update the same guidance and references to the delivery checks | slice 4 | |
| 9a.4 | Update the same guidance and references to proof interpretation | slice 6 | |
| 9b.1 | Cover repository tests (`tests/README.md`) | slice 4 | |
| 9b.2 | Cover dashboard commands (`dashboard/COMMANDS.md`) | slice 4 | |
| 9b.3 | Cover test placement (`dashboard/tests/README.md`) | slice 4 | |
| 9b.4 | Cover local resources (`tests/local-test-resources.md`) | slice 4 | |
| 9b.5 | Cover sharding (`dashboard/tests/shards.md`) | slice 4 | |
| 9b.6 | Cover CI status and proof (`docs/dashboard-development-intent-ci-status.md`) | slice 6 | |
| D1 | This increment adds no future service (deferred) | slice 6 | |
| D2 | This increment adds no new non-dashboard workflow (deferred) | slice 6 | |
| D3 | This increment does not optimize suite speed (deferred) | slice 6 | |
| D4 | This increment does not add native agent acceptance (deferred) | slice 6 | |
| D5 | No new release is needed to test an already published tag | slice 5 | |
| D6 | Naturally supported entry points remain usable; these delivery limits are not rejection rules | slice 6 | |
| R1a | Tagged proof must fail clearly when its pinned release cannot be obtained | slice 5 | |
| R1b | Tagged proof must fail clearly when its pinned release cannot be verified | slice 5 | |
| R2 | ADR 0003: tagged content is immutable, with no branch fallback | slice 5 | |
| R3 | ADR 0008: evidence keeps the unknown, missing and changed scope distinctions | slice 6 | |
| R4 | Apply the project's failing and flaky test policy throughout the migration, including failures attributed to the prior layout | slice 6 | |
| KE1.1 | An isolated project has Open Dough installed from published tag `v0.3.97`, with the resolved revision and installed version recorded | slice 5 | |
| KE1.2 | The developer runs the E2E command and starts story preparation from the dashboard | slice 5 | |
| KE1.3 | The installed preparation command publishes the assignment to the project's bare origin | slice 5 | |
| KE1.4 | The case proof belongs to **E2E Test** | slice 5 | |
| KE1.5 | The case proof names its substituted boundaries | slice 5 | |
| KE2.1 | A frontend recovery or layout case uses controlled answers, and a server refusal case uses its public boundary; the developer runs their focused commands | slice 4 | |
| KE2.2 | Each of those cases runs and reports in its own group | slice 4 | |
| KE2.3 | Changing E2E workers or shard allocation changes neither focused runner's selection nor its settings | slice 4 | |
| KE3.1 | A spec that registers cases through another source module moves to its owning group | slice 3 | |
| KE3.2 | Selection and timing ownership follow the correct sources | slice 4 | |
| KE3.3 | Declared case-file proof follows the correct sources | slice 4 | |
| KE3.4 | Purpose and Proof open those sources | slice 6 | |
| KE4.1 | A hosted run completes all producer matrices and CI publishes the summary | slice 4 | |
| KE4.2 | All three entries receive their actual cases, outcomes and durations | slice 4 | |
| KE4.3 | The frontend artifact names frontend files | slice 4 | |
| KE4.4 | A deliberately missing producer report yields incomplete evidence | slice 4 | |
| KE4.5 | An actual empty share yields a reported zero, not a missing report | slice 4 | |
| KE5.1 | A story comparison spans old `dashboard/tests` and new `e2e` evidence; the developer opens comparison/history and a historical source | slice 6 | |
| KE5.2 | Old evidence stays readable at its revision | slice 6 | |
| KE5.3 | The distinct scopes are explicit | slice 6 | |
| KE5.4 | Only supported scope and unit matches receive numeric comparisons | slice 6 | |
| KE5.5 | The unchanged focused entry identities keep their supported comparisons | slice 6 | |
