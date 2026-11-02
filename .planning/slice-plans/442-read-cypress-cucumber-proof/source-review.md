# Source review — SEED-192#read-cypress-cucumber-proof

Launch: fresh general-purpose reviewer after 2026-11-02 story amendments
(successful-only example 3; retries enablement in scope). Source-only inputs
from `.planning/seeds/SEED-192-review-product-intent.md#read-cypress-cucumber-proof`.
No plan, return, product, or proof supplied. Returned 2026-11-02
(agent 02fba67b-b001-4481-8864-d99882db5cb2).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Beneficiary: Doughnut developer reviewing Cypress-Cucumber protection in Intent | slice 3 | observed: story goal delivered for Intent read of Doughnut proof |
| 2 | Ordinary Cypress Cucumber runs record the same compact latest-observation Proof Intent reads for Pygardon | slice 2 | observed: Doughnut SEED-096 + follow-up proof on origin/main |
| 3 | Selecting a Doughnut feature in Intent shows each scenario/outline row's latest committed observation beside Purpose | slice 3 | observed: intent-doughnut-cucumber-proof.spec.ts note_creation + outline + retry |
| 4 | Tests whether first Cucumber evidence meanings survive a second real runner (ADR 0010) | slice 3 | observed: Doughnut Cypress→compact + Intent read path |
| 5 | Doughnut owns the Proof recorder | slice 2 | observed: Doughnut e2e_test/config/cucumberProof*.mjs |
| 6 | Intent reader unchanged unless format-compatible fix | slice 3 | observed: no Open Dough reader schema change |
| 7 | Proof recording uses the Messages path | slice 2 | observed: Doughnut Messages→compact recorder |
| 8 | Compact proof identity includes feature path | slice 2 | observed: feature paths in committed proof files |
| 9 | Compact proof identity includes scenario name | slice 2 | observed: scenario names in committed proof |
| 10 | Compact proof identity includes outline example cells | slice 3 | observed: account_control outline examples + Intent test |
| 11 | Only last finished attempts recorded | slice 2 | observed: SEED-096 mapper + attempts fields |
| 12 | Focused run updates only observed cases | slice 3 | observed: note_creation + account_control + retry proof files coexist |
| 13 | Declare proof on Gherkin location | slice 2 | observed: open-dough.json proof on e2e_test/features |
| 14 | Preserve runner exit | slice 2 | observed: SEED-096 preserve-runner; cy:run exit 0 for outline/retry |
| 15 | Preserve runner diagnostics | slice 2 | observed: SEED-096 preserve-runner |
| 16 | Intent shows outcome | slice 3 | observed: Passed / Passed after retry rows |
| 17 | Intent shows attempts | slice 3 | observed: retry Intent row (2 attempts) |
| 18 | Intent shows duration | slice 3 | observed: duration cells in Intent regressions |
| 19 | Intent shows time | slice 3 | observed: Observed column in Intent regressions |
| 20 | Intent shows commit | slice 3 | observed: commit short SHAs in Intent regressions |
| 21 | Intent shows file-version match | slice 3 | observed: This file version cells |
| 22 | Unobserved cases explicit (Not observed) | slice 3 | observed: note_deletion Not observed step |
| 23 | Missing Proof distinct | slice 3 | observed: intent-cucumber-proof-absent.spec.ts |
| 24 | Empty Proof distinct | slice 3 | observed: intent-cucumber-proof-absent.spec.ts |
| 25 | Malformed/unreadable Proof distinct | slice 3 | observed: intent-cucumber-proof-absent.spec.ts truncated/retry |
| 26 | Verify with real Cypress selection | slice 3 | observed: Doughnut pnpm cy:run outline + retry on main |
| 27 | Cover outline rows where runner can produce them | slice 3 | observed: account_control outline proof + Intent |
| 28 | Cover retry-assisted outcome where runner can produce them | slice 3 | observed: cypress_retry proof attempts:2 + Intent |
| 29 | Enabling ordinary Cypress retries for retry-assisted successful proof is in scope | slice 3 | observed: Doughnut common.ts retries runMode:1 (PR #1652) |
| 30 | Terry evaluates usefulness | slice 3 | |
| 31 | Never treat mixed older/newer as full-suite green | slice 3 | observed: Intent regressions forbid green/all passed/suite phrasing |
| 32 | Never key by generated IDs | slice 2 | observed: feature/scenario/example identity only |
| 33 | Never present missing as pass | slice 3 | observed: absent-proof + Not observed journeys |
| 34 | Never present empty as pass | slice 3 | observed: intent-cucumber-proof-absent.spec.ts |
| 35 | Never present unreadable as pass | slice 3 | observed: intent-cucumber-proof-absent.spec.ts |
| 36 | Example 1: declare proof; two scenarios → one file; exit unchanged; third absent | slice 2 | observed: SEED-096 recording + committed run files |
| 37 | Example 2: Intent shows outcomes/time/commit/file-version; never observed → Not observed | slice 3 | observed: intent-doughnut-cucumber-proof.spec.ts |
| 38 | Example 3 amended: focused later failure clears successful proof for that identity; other pass remains; do not show Failed as latest |  | G2 |
| 39 | Example 4: outline name + example cells | slice 3 | observed: outline Intent test |
| 40 | Example 5: retry-assisted pass with attempt count | slice 3 | observed: retry Intent test Passed after retry (2 attempts) |
| 41 | Example 6: before proof declared → absent-proof copy naming reference | slice 3 | observed: intent-cucumber-proof-absent.spec.ts Ex 8 |
| 42 | Example 7: outside Git / no Messages → prior proof unchanged; Cypress not failed for that | slice 3 | observed: cucumberProofRecorder/Runner tests; note_creation still readable |
| 43 | Exclusion: CI corroboration deferred (story 7) |  | X1 |
| 44 | Exclusion: folder-level Proof summaries (story 9) |  | X2 |
| 45 | Exclusion: committing Messages ndjson as Proof |  | X3 |
| 46 | Exclusion: committing screenshots as Proof |  | X3 |
| 47 | Exclusion: committing videos as Proof |  | X3 |
| 48 | Exclusion: committing traces as Proof |  | X3 |
| 49 | Exclusion: committing step logs as Proof |  | X3 |
| 50 | Exclusion: recording outside declared Gherkin location |  | X4 |
| 51 | Exclusion: changing Cypress tags |  | X5 |
| 52 | Exclusion: changing isolation |  | X5 |
| 53 | Exclusion: changing CI selection |  | X5 |
| 54 | Exclusion: shared Open Dough Cypress recorder |  | X6 |
| 55 | Exclusion: second Intent proof format |  | X6 |
| 56 | Exclusion: non-Cypress Doughnut families |  | X7 |
