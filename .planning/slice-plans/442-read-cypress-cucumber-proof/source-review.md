# Source review — SEED-192#read-cypress-cucumber-proof

Launch: fresh general-purpose reviewer after 2026-11-02 trunk absorb
(last-successful wording) plus retries-in-scope developer choice. Source-only
inputs from `.planning/seeds/SEED-192-review-product-intent.md#read-cypress-cucumber-proof`.
No plan, return, product, or proof supplied. Returned 2026-11-02
(agent 7f061922-23cb-453c-87f9-a936c2952a02).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Through Doughnut's ordinary Cypress Cucumber runs, the project records the same compact last-successful Proof that Intent reads for Pygardon. | slice 2 | observed: Doughnut SEED-096 + follow-up proof on origin/main |
| 2 | Selecting a Doughnut feature in Intent shows each scenario and outline row's last successful committed proof beside Purpose. | slice 3 | observed: intent-doughnut-cucumber-proof.spec.ts note_creation + outline + retry |
| 3 | This story tests whether the first Cucumber evidence meanings survive a second real runner (ADR 0010). | slice 3 | observed: Doughnut Cypress→compact + Intent read path |
| 4 | Beneficiary: a Doughnut developer reviewing Cypress-Cucumber protection for a selected feature in Intent (e.g. Terry reviewing Doughnut beside its Gherkin). | slice 3 | observed: story goal delivered for Intent read of Doughnut proof |
| 5 | Recorder ownership: Doughnut owns the Proof recorder. | slice 2 | observed: Doughnut e2e_test/config/cucumberProof*.mjs |
| 6 | Open Dough's Intent reader stays unchanged unless a Cypress observation forces a format-compatible fix. | slice 3 | observed: no Open Dough reader schema change in this story |
| 7 | Intent must not learn a second proof schema for this story. | slice 3 | observed: Intent still reads compact Cucumber proof reference only |
| 8 | Proof recording uses the Cucumber Messages stream / accumulation. | slice 2 | observed: Doughnut Messages→compact recorder |
| 9 | Enabling a Messages file for the recorder's own use is allowed. | slice 2 | observed: SEED-096 Messages enablement for recorder |
| 10 | That ndjson is not committed Proof. | slice 2 | observed: proof files are compact JSON under e2e_test/proof |
| 11 | That ndjson must not carry screenshots, videos, or other bulky attachments into the compact record. | slice 2 | observed: compact proof fields only in committed run files |
| 12a.1 | Each ordinary finished run with at least one passing in-scope scenario writes one uniquely named version-1 proof file under the declared proof directory. | slice 2 | observed: uniquely named committed proof files on Doughnut main |
| 12a.2 | That proof file matches the Cucumber proof reference fields and atomic rewrite rules. | slice 2 | observed: SEED-096 mapper/writer + committed JSON shape |
| 12b.1 | Identify scenarios only by feature path (repo-root, `/` separators). | slice 2 | observed: feature paths in committed proof files |
| 12b.2 | Identify scenarios only by scenario name as written in Gherkin. | slice 2 | observed: scenario names in committed proof |
| 12b.3 | Identify outline rows by outline `example` cell values. | slice 3 | observed: account_control outline examples + Intent test |
| 12c | Record only finished last attempts (`willBeRetried` false) that actually ran. | slice 2 | observed: SEED-096 mapper + attempts fields |
| 12d | Retain only passes with retry counts. | slice 2 | observed: Doughnut successful-only store; retry proof attempts:2 |
| 12e | A final unsuccessful result removes earlier proof for that identity. |  | G2 |
| 12f | A focused or tagged run maintains only the cases it executed; other identities keep earlier proof. | slice 3 | observed: note_creation + account_control + retry proof files coexist |
| 13a | Declare `proof` on Doughnut's Gherkin Intent location in `.planning/open-dough.json`. | slice 2 | observed: open-dough.json proof on e2e_test/features |
| 13b | Record only features under that declared location. | slice 2 | observed: SEED-096 location filter |
| 13c | Install the recorder in every Cypress profile that runs those features so ordinary local and CI runs share one meaning. | slice 2 | observed: Doughnut common Cypress profile wiring |
| 14a | Recording must not change Cypress exit status or non-proof diagnostics for the observed specs. | slice 2 | observed: SEED-096 preserve-runner; cy:run exit 0 for outline/retry |
| 14b.1 | When recording cannot proceed because the run is outside a Git work tree, it records nothing and leaves the run intact. | slice 3 | observed: cucumberProofRecorder.test.mjs silent missing-Git |
| 14b.2 | When recording cannot proceed because the proof destination is unwritable, it records nothing and leaves the run intact. | slice 3 | observed: cucumberProofRecorder.test.mjs silent unwritable |
| 14b.3 | When recording cannot proceed because the run produced no usable Messages for the observed specs, it records nothing and leaves the run intact. | slice 3 | observed: cucumberProofRunner.test.mjs hook-failure exit preserved |
| 15 | With proof committed at a published Doughnut revision, Intent shows that feature's last successful proof the same way as for Pygardon. | slice 3 | observed: intent-doughnut-cucumber-proof.spec.ts |
| 15a.1 | Intent shows per-scenario success. | slice 3 | observed: Passed / Passed after retry rows |
| 15a.2 | Intent shows attempts. | slice 3 | observed: retry Intent row (2 attempts) |
| 15a.3 | Intent shows duration. | slice 3 | observed: duration cells in Intent regressions |
| 15a.4 | Intent shows time. | slice 3 | observed: Observed column in Intent regressions |
| 15a.5 | Intent shows commit. | slice 3 | observed: commit short SHAs in Intent regressions |
| 15a.6 | Intent shows whether the published feature blob matches the observed one. | slice 3 | observed: This file version cells |
| 15b | Scenarios without success stay explicit. | slice 3 | observed: note_deletion explicit absence row (Not observed until SEED-220 wording) |
| 15c.1 | A missing proof declaration remains distinct. | slice 3 | observed: intent-cucumber-proof-absent.spec.ts |
| 15c.2 | Empty proof remains distinct. | slice 3 | observed: intent-cucumber-proof-absent.spec.ts |
| 15c.3 | Unreadable or malformed proof remains distinct. | slice 3 | observed: intent-cucumber-proof-absent.spec.ts truncated/retry |
| 16a | Prove with a real Doughnut Cypress selection that records compact proof. | slice 3 | observed: Doughnut pnpm cy:run outline + retry on main |
| 16b | That proof covers a Scenario Outline row when the runner can produce one. | slice 3 | observed: account_control outline proof + Intent |
| 16c | That proof covers a retry-assisted successful outcome when the runner can produce one. | slice 3 | observed: cypress_retry proof attempts:2 + Intent |
| 16d | Prefer the live Doughnut project in Intent. | slice 3 | observed: live Intent read at Doughnut 6c045cc |
| 16e | Fixtures may pin the same committed proof bytes only as regression guards. | slice 3 | observed: dashboard/tests/fixtures/doughnut-cucumber-proof/ |
| 17 | Enabling ordinary Cypress retries for retry-assisted successful proof is in scope for this story (2026-11-02 developer choice; keep SEED-220 successful-only). | slice 3 | observed: Doughnut common.ts retries runMode:1 (PR #1652) |
| X1 | Exclusion: CI corroboration of Doughnut's local observations (story 7). |  | X1 |
| X2 | Exclusion: folder-level Proof summaries (story 9). |  | X2 |
| X3 | Exclusion: committing Messages ndjson, screenshots, videos, traces, or step logs as Proof. |  | X3 |
| X4 | Exclusion: recording features outside the declared Gherkin Intent location, including throwaway specs. |  | X4 |
| X5 | Exclusion: changing Doughnut's Cypress tags, isolation, or CI selection. |  | X5 |
| X6 | Exclusion: a shared Open Dough-shipped Cypress recorder package. |  | X6 |
| X7 | Exclusion: teaching Intent a second proof format. |  | X6 |
| X8 | Exclusion: Vitest, Node, Playwright, or other Doughnut non-Cypress families. |  | X7 |
| R1 | Never treat mixed older/newer observations as a claim that the full suite is green. | slice 3 | observed: Intent regressions forbid green/all passed/suite phrasing |
| R2 | Never key observations by generated IDs. | slice 2 | observed: feature/scenario/example identity only |
| R3 | Never present missing, empty, or unreadable proof as a pass. | slice 3 | observed: absent-proof journeys |
| E1 | Example: Doughnut declares `proof` for `e2e_test/features`. An ordinary `cy:run` selection that passes two scenarios writes one new compact proof file and leaves Cypress exit and diagnostics unchanged. A third scenario not in the selection is absent from that file. | slice 2 | observed: SEED-096 recording + committed run files |
| E2 | Example: Those two observations are committed. In Intent, at that published revision, selecting feature A shows both scenarios' last successful proof with time, commit, and file-version match; a scenario without success reads No successful proof. |  | G5 |
| E3a | Example: A later focused run re-runs only one scenario and it fails. After commit, its earlier proof is removed; Intent shows No successful proof for that scenario; the other scenario keeps its earlier success. |  | G2 |
| E3b | Example: A later pass restores successful proof. |  | G2 |
| E3c | Example: A mixed-result run retains its passing scenarios. |  | G2 |
| E4 | Example: A Scenario Outline row is observed; Intent names the outline's Gherkin scenario name and that row's example cells, distinct from other rows. | slice 3 | observed: outline Intent test |
| E5 | Example: A scenario passes on a Cypress retry; Intent shows a retry-assisted pass with attempt count, not a clean single-attempt pass. | slice 3 | observed: retry Intent test Passed after retry (2 attempts) |
| E6 | Example: Before `proof` is declared, Intent shows the existing absent-proof copy that names the Cucumber proof reference. | slice 3 | observed: intent-cucumber-proof-absent.spec.ts |
| E7 | Example: A run outside Git, or a spec whose hook failure yields no Messages contribution, leaves prior committed proof unchanged and does not fail Cypress for that reason. | slice 3 | observed: cucumberProofRecorder/Runner tests; note_creation still readable |
| D1 | Done when: Intent at a published Doughnut revision shows last-successful Cypress-Cucumber proof for selected features beside Purpose. | slice 3 | observed: intent-doughnut-cucumber-proof.spec.ts + live Intent read |
| D2 | Done when: Terry judges the Intent view useful beside Cypress output and the editor. | slice 3 | observed: 2026-11-02 Terry confirmed useful under successful-only |
