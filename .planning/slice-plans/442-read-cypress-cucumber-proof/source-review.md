# Source review — SEED-192#read-cypress-cucumber-proof

Launch: fresh general-purpose reviewer (no conversation inheritance),
source-only inputs: Goal, Scope, key examples, exclusions from
`.planning/seeds/SEED-192-review-product-intent.md#read-cypress-cucumber-proof`.
No plan, return, product, or proof supplied. Returned 2026-11-02
(agent 419b86f2-8dd2-4aae-a252-28c1ea45ea78).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Doughnut implements and maintains the Cypress Cucumber recorder in Doughnut’s repository | slice 2 | observed: Doughnut SEED-096#cucumber-proof on origin/main (e87c86c692; e2e_test/config/cucumberProof*.mjs) |
| 2 | Open Dough’s Intent reader and compact proof format stay as they are unless a Cypress observation forces a format-compatible fix | slice 3 | observed: no Open Dough reader change; live Intent + intent-doughnut-cucumber-proof.spec.ts read existing format |
| 3 | No generic multi-runner adapter framework is added (ADR 0002) | slice 3 | observed: no adapter framework added in Open Dough or this story’s Doughnut landing |
| 4 | The recorder records from Doughnut’s existing @badeball/cypress-cucumber-preprocessor Messages stream / accumulation | slice 2 | observed: Doughnut SEED-096 recorder on Messages path (cucumberProofRecorder.mjs / landing) |
| 5 | Enabling a Messages file for the recorder’s own use is allowed | slice 2 | observed: SEED-096 Messages wiring on Doughnut main |
| 6 | That Messages ndjson is not committed Proof | slice 2 | observed: committed Proof is e2e_test/proof/*.json only on Doughnut main |
| 7 | That Messages ndjson must not carry screenshots, videos, or other bulky attachments into the compact record | slice 2 | observed: compact proof JSON observations only (landed proof file) |
| 8 | Each ordinary finished run that observes at least one in-scope scenario writes one uniquely named version-1 proof file under the declared proof directory | slice 2 | observed: e2e_test/proof/20261102T030305438Z-d4182692-ae90-4ae0-981d-a993fec40c59.json version 1 |
| 9 | That proof file matches the Cucumber proof reference fields and atomic rewrite rules | slice 2 | observed: version/observations fields parse via dashboard cucumberProof; SEED-096 writer |
| 10.1 | Scenarios identified by feature path (repo-root, / separators) | slice 2 | observed: feature e2e_test/features/.../note_creation.feature in landed proof |
| 10.2 | Scenarios identified by scenario name as written in Gherkin | slice 2 | observed: scenario names match feature scenarios in landed proof |
| 10.3 | Scenarios identified by outline example cell values | slice 3 | G1 |
| 11 | Record only finished last attempts (willBeRetried false) that actually ran | slice 2 | observed: SEED-096 mapper/tests + landed attempts:1 finished observations |
| 12 | A focused or tagged run updates only the cases it observed; other identities keep earlier observations | slice 3 | G2 |
| 13 | Declare proof on Doughnut’s Gherkin Intent location in .planning/open-dough.json | slice 2 | observed: proof: e2e_test/proof on e2e_test/features on Doughnut origin/main |
| 14 | Record only features under that declared location | slice 2 | observed: landed observations under e2e_test/features/... |
| 15 | Install the recorder in every Cypress profile that runs those features so focused, tagged, and full runs all record | slice 2 | observed: SEED-096 ordinary Cypress profiles record on Doughnut main |
| 16 | Existing Cypress output stays unchanged | slice 2 | observed: SEED-096 preserve-runner proof / closed story |
| 17 | Existing Cypress diagnostics stay unchanged | slice 2 | observed: SEED-096 preserve-runner proof / closed story |
| 18 | Existing Cypress tags stay unchanged | slice 2 | observed: SEED-096 scope; tags policy unchanged |
| 19 | Existing Cypress isolation stays unchanged | slice 2 | observed: SEED-096 scope; isolation unchanged |
| 20 | Existing composition of plugin event handlers stays unchanged | slice 2 | observed: composeCypressPluginEvents still used; SEED-096 after:run registration |
| 21 | Existing command exit meaning stays unchanged | slice 2 | observed: SEED-096 preserve-runner / recorder never fails run |
| 22 | The recorder prints nothing | slice 2 | observed: SEED-096 silent recorder contract |
| 23 | The recorder never fails the run | slice 2 | observed: SEED-096 silent best-effort contract |
| 24 | When it cannot record, it records nothing and leaves the run intact | slice 3 | G3 |
| 25.1 | Intent shows per-scenario outcome | slice 3 | observed: live Intent note_creation Proof + intent-doughnut-cucumber-proof.spec.ts Passed rows |
| 25.2 | Intent shows attempts | slice 3 | observed: live + intent-doughnut-cucumber-proof.spec.ts Passed rows imply single-attempt display |
| 25.3 | Intent shows duration | slice 3 | observed: live + intent-doughnut-cucumber-proof.spec.ts duration cells |
| 25.4 | Intent shows time | slice 3 | observed: live + intent-doughnut-cucumber-proof.spec.ts Observed column |
| 25.5 | Intent shows commit | slice 3 | observed: live + regression commit d648487 |
| 25.6 | Intent shows whether published feature blob matches observed | slice 3 | observed: live + regression This file version |
| 26 | Unobserved scenarios stay explicit | slice 3 | observed: live note_deletion + intent-doughnut-cucumber-proof.spec.ts Not observed |
| 27 | Missing proof declaration, empty proof, and unreadable or malformed proof remain distinct | slice 3 | observed: intent-cucumber-proof-absent.spec.ts Ex 8 / truncated / retry paths |
| 28 | Prove with a real Doughnut Cypress selection that records and a published revision Intent can read | slice 3 | observed: Doughnut published proof e87c86c692+; live Intent at 6c045cc |
| 29 | Cover outline rows where Doughnut’s runner can produce them | slice 3 | G1 |
| 30 | Cover a retry-assisted outcome where Doughnut’s runner can produce one | slice 3 | G4 |
| 31 | Apply the repository’s failing and flaky test policy | slice 3 | observed: focused Intent proof specs green; policy in AGENTS.md |
| 32 | Terry evaluates usefulness against today’s Cypress output + editor workflow | slice 3 | |
| 33 | Never treat a mixture of older and newer case observations as one current full-suite green result; a focused run claims only what it ran | slice 3 | observed: intent-doughnut-cucumber-proof.spec.ts asserts no green/all passed/suite phrasing; note_creation count line only |
| 34 | Never key observations by Cypress or preprocessor generated IDs across runs | slice 2 | observed: landed proof keys by feature/scenario only |
| 35 | Never present missing, empty or unreadable Doughnut proof as an observed pass | slice 3 | observed: intent-cucumber-proof-absent.spec.ts + unobserved Not observed |
| 36 | Example: declare proof; cy:run two scenarios → one compact file; exit/diagnostics unchanged; third absent from file | slice 2 | observed: SEED-096 recording + one committed run file for observed scenarios |
| 37 | Example: committed observations; Intent shows outcomes/time/commit/file-version; never observed → Not observed | slice 3 | observed: live Intent + intent-doughnut-cucumber-proof.spec.ts |
| 38 | Example: later focused run fails one scenario; Intent shows failure and keeps earlier other | slice 3 | G2 |
| 39 | Example: Scenario Outline row → Intent names outline name + example cells | slice 3 | G1 |
| 40 | Example: pass on Cypress retry → Intent shows retry-assisted pass with attempt count | slice 3 | G4 |
| 41 | Example: before proof declared, Intent absent-proof copy naming Cucumber proof reference | slice 3 | observed: intent-cucumber-proof-absent.spec.ts Ex 8 undeclared proof |
| 42 | Example: outside Git or hook failure / no Messages → prior proof unchanged; Cypress not failed for that | slice 3 | G3 |
| 43 | Deferred: CI corroboration (story 7) |  | X1 |
| 44 | Deferred: folder-level Proof summaries (story 9) |  | X2 |
| 45 | Deferred: committing Messages ndjson, screenshots, videos, traces or step logs as Proof |  | X3 |
| 46 | Deferred: recording features outside declared Gherkin location |  | X4 |
| 47 | Deferred: changing Doughnut Cypress tags, isolation, retries policy, or CI selection |  | X5 |
| 48 | Deferred: shared Open Dough Cypress recorder package or second Intent proof format |  | X6 |
| 49 | Deferred: Vitest, Node, Playwright or other Doughnut non-Cypress families |  | X7 |
