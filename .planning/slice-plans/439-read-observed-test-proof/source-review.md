# Source review: SEED-192#read-observed-test-proof

Launch: a fresh general-purpose reviewer (no fork, no inherited conversation),
spawned by the coordinator at slice 1 acceptance on 2026-11-01. Its only input
was one file holding the selected story's Goal, Scope (required behavior,
required restrictions, deferred promises) and Key examples from
[SEED-192 story 6](../../seeds/SEED-192-review-product-intent.md#read-observed-test-proof),
with Terry's 2026-11-01 refinement direction as the one human amendment. It was
told to read no other project file and change nothing, and returned the
numbered commitments below (its wording, kinds dropped). It read no plan,
return, product or proof.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| A.1 | Open Dough publishes a reference document, not a skill, in its installed guidance | slice 3 | observed: PLAN.md slice 3 recorded walk; install.sh managed_files |
| A.2 | A project that follows the reference records Cucumber proof itself | slice 4 |  |
| A.3 | Proof is the latest observation of each test, not a run history | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts expectedRows show one latest row per scenario, no run list |
| A.4 | Every ordinary test run updates the proof of the tests it ran | slice 4 |  |
| A.5 | Nobody runs the whole suite just to collect proof | slice 3 | observed: PLAN.md slice 3 recorded walk runs a, b, e |
| A.6 | A full run simply brings every test's proof up to date | slice 4 |  |
| A.7 | Accumulating observations and consolidating them occasionally is allowed | slice 3 | observed: PLAN.md slice 3 recorded walk run f |
| A.8 | A producer that already keeps a consolidated latest snapshot need not consolidate | slice 3 | observed: PLAN.md slice 3 recorded walk; reference keeps consolidation optional |
| A.9 | The earlier ten-run rolling history is replaced and is not part of this story | slice 1 | observed: dashboard/src/IntentProof.tsx renders only the latest observation; no history read |
| G.1 | A developer reviewing a Pygardon feature file in Intent sees, beside its source, the latest observed result of each scenario | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts "<feature> proof" table beside the source pane |
| G.1.1 | when it was observed | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts expectedRows "1d ago"/"2h ago" Observed column |
| G.1.2 | whether it passed, needed a retry or failed | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts expectedRows Passed / Passed after retry (2 attempts) / Failed |
| G.1.3 | how long it took | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts expectedRows Duration column |
| G.1.4 | whether the feature file has changed since | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts expectedRows "This file version"/"Earlier file version" |
| G.2 | The developer no longer searches console logs or reruns tests to learn this | slice 4 |  |
| G.3 | Pygardon produces that proof as a side effect of its ordinary Cucumber runs | slice 4 |  |
| G.4 | Pygardon produces it by following one published Open Dough reference | slice 4 |  |
| G.5 | That reference becomes the standard that later Cucumber projects (Doughnut, story 8) adopt | slice 4 |  |
| 1.1 | Exactly one reference document exists in the released Open Dough guidance | slice 3 | observed: PLAN.md slice 3 recorded walk; install.sh managed_files |
| 1.2 | It is written for the agent working in the project that adopts it (ADR 0006) | slice 3 | observed: PLAN.md slice 3 recorded walk behavior review |
| 1.3 | It states the rules a project's Cucumber setup follows (1.4–1.10) | slice 3 | observed: PLAN.md slice 3 recorded walk; reference rules |
| 1.4 | Configure proof once in the project's Cucumber configuration, beside its existing formatters | slice 3 | observed: PLAN.md slice 3 recorded walk runs a–c |
| 1.4.1 | So that every run records proof, including each of the following | slice 3 | observed: PLAN.md slice 3 recorded walk runs a–c |
| 1.4.1a | focused runs | slice 3 | observed: PLAN.md slice 3 recorded walk run a |
| 1.4.1b | tagged runs | slice 3 | observed: PLAN.md slice 3 recorded walk run b |
| 1.4.1c | parallel runs | slice 3 | observed: PLAN.md slice 3 recorded walk run c |
| 1.4.1d | retried runs | slice 3 | observed: PLAN.md slice 3 recorded walk run c |
| 1.4.1e | full runs | slice 3 | observed: PLAN.md slice 3 recorded walk run c |
| 1.4.2 | Existing output stays unchanged | slice 3 | observed: PLAN.md slice 3 recorded walk runs a, b, failing, d |
| 1.4.3 | Existing diagnostics stay unchanged | slice 3 | observed: PLAN.md slice 3 recorded walk runs a, b, failing, d |
| 1.4.4 | The command's exit meaning stays unchanged | slice 3 | observed: PLAN.md slice 3 recorded walk runs a, failing, d |
| 1.5 | Declare the proof directory in `.planning/open-dough.json` | slice 3 | observed: PLAN.md slice 3 recorded walk scratch .planning/open-dough.json |
| 1.5.1 | The declaration names the Intent location the directory covers | slice 3 | observed: PLAN.md slice 3 recorded walk scratch .planning/open-dough.json |
| 1.5.2 | The proof directory is committed, not ignored | slice 3 | observed: PLAN.md slice 3 recorded walk proof files committed at each step |
| 1.6 | Each run writes its own uniquely named file | slice 3 | observed: PLAN.md slice 3 recorded walk runs e, f |
| 1.6.1 | Each run rewrites its file after every finished scenario | slice 3 | observed: PLAN.md slice 3 recorded walk run d |
| 1.6.2 | An interrupted run keeps what finished | slice 3 | observed: PLAN.md slice 3 recorded walk run d |
| 1.6.3 | Unique names mean concurrent worktrees never conflict when merged | slice 3 | observed: PLAN.md slice 3 recorded walk run e merge |
| 1.6.4 | Unique names mean repeated runs never conflict when merged | slice 3 | observed: PLAN.md slice 3 recorded walk run e |
| 1.7 | Each observation names its scenario by feature path | slice 3 | observed: PLAN.md slice 3 recorded walk parsed rows |
| 1.7.1 | and by scenario name | slice 3 | observed: PLAN.md slice 3 recorded walk parsed rows |
| 1.7.2 | and, for an outline, by its example row | slice 3 | observed: PLAN.md slice 3 recorded walk run c outline rows |
| 1.7.3 | never by runner-generated IDs | slice 3 | observed: PLAN.md slice 3 recorded walk files hold only the nine fields |
| 1.8 | Each observation records the following fields | slice 3 | observed: PLAN.md slice 3 recorded walk parseProofFile on every file |
| 1.8.1 | the final outcome | slice 3 | observed: PLAN.md slice 3 recorded walk run c and failing |
| 1.8.2 | the attempt count | slice 3 | observed: PLAN.md slice 3 recorded walk run c Flaky queue attempts 2 |
| 1.8.3 | the duration | slice 3 | observed: PLAN.md slice 3 recorded walk parseProofFile |
| 1.8.4 | the finish time | slice 3 | observed: PLAN.md slice 3 recorded walk parseProofFile |
| 1.8.5 | the commit the run started from | slice 3 | observed: PLAN.md slice 3 recorded walk rows' commits |
| 1.8.6 | the Git blob hash of the feature file as tested | slice 3 | observed: PLAN.md slice 3 recorded walk featureBlob equals git hash-object |
| 1.9 | The latest observation of a scenario wins across all files, whatever its outcome | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts Cancel a job newer Failed outranks yesterday's pass |
| 1.9.1 | Scenarios a run did not execute keep their earlier observation | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts List jobs and crash row keep yesterday's commit |
| 1.10 | Consolidation is optional | slice 3 | observed: PLAN.md slice 3 recorded walk; reference keeps consolidation optional |
| 1.10.1 | Consolidation keeps meaning | slice 3 | observed: PLAN.md slice 3 recorded walk run f identical rows |
| 1.10.2 | Consolidation writes the latest observations in the same file format, as a new uniquely named file | slice 3 | observed: PLAN.md slice 3 recorded walk run f |
| 1.10.3 | Consolidation removes the files it consumed | slice 3 | observed: PLAN.md slice 3 recorded walk run f |
| 1.10.4 | Readers never distinguish consolidated files from run files | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts two run files and one consolidated file assert identical expectedRows |
| 1.11 | Records stay compact | slice 3 | observed: PLAN.md slice 3 recorded walk files hold only the nine fields |
| 1.11.1 | no screenshots | slice 3 | observed: PLAN.md slice 3 recorded walk files hold only the nine fields |
| 1.11.2 | no traces | slice 3 | observed: PLAN.md slice 3 recorded walk files hold only the nine fields |
| 1.11.3 | no captured output | slice 3 | observed: PLAN.md slice 3 recorded walk files hold only the nine fields |
| 1.11.4 | no embedded attachments | slice 3 | observed: PLAN.md slice 3 recorded walk files hold only the nine fields |
| 2.1 | Pygardon's ordinary Cucumber.js setup follows the released reference | slice 4 |  |
| 2.2 | Proof from real local runs lands with ordinary commits | slice 4 |  |
| 2.3 | No dashboard run button produces proof | slice 4 |  |
| 2.4 | No service produces proof | slice 4 |  |
| 2.5 | No CI step produces proof | slice 4 |  |
| 3.1 | For a selected feature file, the Proof pane reads proof from the same published revision as Purpose | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts proof published at the pinned revision with the feature; dashboard/server/intentLocationsRead.ts proofOfLocation |
| 3.2 | It lists the file's scenarios and outline rows in source order | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts expectedRows in source order incl. both outline rows |
| 3.3 | Each row shows the following | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts header and expectedRows grid |
| 3.3.1 | its latest outcome | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts Latest outcome column |
| 3.3.2 | passes that needed a retry marked as such | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts "Passed after retry (2 attempts)" |
| 3.3.3 | duration | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts Duration column |
| 3.3.4 | how long ago it was observed | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts Observed column with fixed clock |
| 3.3.5 | the commit it was observed from | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts Commit column short SHAs |
| 3.3.6 | whether the observation was on this version of the file or the file has changed since | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts Observed on column |
| 3.4 | A count line summarizes the latest outcomes | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts "5 scenarios: 2 passed, 1 passed after retry, 1 failed, 1 not observed" |
| 3.4.1 | The count includes scenarios not observed | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts count line "1 not observed" |
| 3.4.2 | The count line is not a "suite green" verdict | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts asserts no green, all passed or suite wording |
| 4.1 | A project without a declared proof directory says so | slice 2 | observed: dashboard/tests/intent-cucumber-proof-absent.spec.ts test Ex 8 not declared: not-recorded sentence |
| 4.1.1 | and names the reference to adopt | slice 2 | observed: dashboard/tests/intent-cucumber-proof-absent.spec.ts test Ex 8 not declared: names dough-test-optimization/references/cucumber-proof.md |
| 4.2 | A declared directory with no observation for this file says nothing has been observed yet | slice 2 | observed: dashboard/tests/intent-cucumber-proof-absent.spec.ts test declared proof with nothing for this file: Nothing has been observed yet |
| 4.3 | An unreadable or malformed proof file is reported as a read failure | slice 2 | observed: dashboard/tests/intent-cucumber-proof-absent.spec.ts truncated and failed-read tests: alert Proof could not be read |
| 4.3.1 | The read failure offers retry | slice 2 | observed: dashboard/tests/intent-cucumber-proof-absent.spec.ts both failure tests click Retry; failed read recovers rows |
| 4.3.2 | It is not shown as "not observed" | slice 2 | observed: dashboard/tests/intent-cucumber-proof-absent.spec.ts truncated test: no Not observed text and no table |
| 4.4 | Purpose stays readable in every case | slice 2 | observed: dashboard/tests/intent-cucumber-proof-absent.spec.ts every test asserts the Purpose source text, including after Retry |
| 5.1 | Proof never claims more than it observed | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts unobserved Archive a job reads Not observed with empty cells |
| 5.2 | Each row shows its own time and basis, because rows come from different runs and commits | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts rows carry differing times and commits |
| 5.2.1 | The latest per-scenario snapshot is the design, not a defect | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts rows from two runs shown side by side |
| 5.3 | Matching the feature file's blob shows only that the Gherkin is unchanged | slice 1 | observed: dashboard/src/IntentProof.tsx compares featureBlob with the published tree sha only |
| 5.3.1 | Product or step changes since then are not detected | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md Reading proof; pane makes no product claim |
| 5.3.2 | The pane does not call such rows current | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts not.toContainText(/current/i) |
| 5.4 | Only committed proof is proof | slice 1 | observed: dashboard/server/intentProofRead.ts reads only the pinned published revision |
| 5.4.1 | Files written in CI or other runs that are never committed do not count | slice 1 | observed: dashboard/server/intentProofRead.ts reads only the pinned published revision |
| X.1 | Purpose/Proof tabbed layout and its layout switch (story 5) — deferred | slice 1 | observed: dashboard/src/IntentBrowser.tsx keeps side-by-side Purpose/Proof, no tabs |
| X.2 | Story-scope preservation (story 5) — deferred | slice 1 | observed: no story-scope change in dashboard/src/IntentBrowser.tsx |
| X.3 | The current side-by-side reader stays | slice 1 | observed: dashboard/src/IntentBrowser.tsx side-by-side sections |
| X.4 | Run history and trends — deferred | slice 1 | observed: dashboard/src/IntentProof.tsx latest only |
| X.5 | Folder totals (story 9) — deferred | slice 1 | observed: no folder totals in dashboard/src/IntentProof.tsx |
| X.6 | CI corroboration (story 7) — deferred | slice 1 | observed: no CI read in dashboard/server/intentProofRead.ts |
| X.7 | Doughnut and other runner families — deferred | slice 1 | observed: Cucumber proof only; dashboard/src/cucumberProof.ts |
| X.8 | Shipping a ready-made formatter from Open Dough — deferred | slice 3 | observed: PLAN.md slice 3 recorded walk; no recorder shipped |
| X.9 | Shipping a consolidation tool from Open Dough — deferred | slice 3 | observed: PLAN.md slice 3 recorded walk; no consolidation tool shipped |
| X.10 | The reference states the rules; Pygardon owns its implementation | slice 3 | observed: PLAN.md slice 3 recorded walk; recorder written by the project |
| X.11 | Automatic consolidation in Pygardon is optional while its proof stays small — deferred | slice 4 |  |
| E.1 | Focused run updates only what it ran: one scenario run today shows observed today on this file version; the others show yesterday's observations with their earlier commit | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts today's rows carry todayCommit and This file version; others yesterdayCommit |
| E.2 | Latest failure wins: Intent shows it failed today, with no green summary hiding it | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts Cancel a job Failed, count line shows 1 failed |
| E.3 | Retry-assisted pass: Intent shows *Passed after retry (2 attempts)*, not a plain pass | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts "Passed after retry (2 attempts)" |
| E.4 | Changed source: each row shows it was observed on an earlier file version, and a newly added scenario shows *Not observed* | slice 1 | observed: dashboard/tests/intent-cucumber-proof.spec.ts Earlier file version rows and Archive a job Not observed |
| E.5 | Interrupted run: after two of five scenarios finish, those two show the new observations and the other three keep their earlier ones | slice 3 | observed: PLAN.md slice 3 recorded walk example 5 rows |
| E.6 | Parallel worktrees: two worktrees' proof files merge without conflict, and Intent shows each scenario's latest observation across both | slice 3 | observed: PLAN.md slice 3 recorded walk example 6 rows |
| E.7 | Consolidation keeps meaning: after an agent consolidates proof files into one, Intent shows exactly the same rows before and after | slice 3 | observed: PLAN.md slice 3 recorded walk example 7 rows |
| E.8a | Not adopted: Doughnut, which declares no proof directory, shows that Proof is not recorded and names the reference | slice 2 | observed: dashboard/tests/intent-cucumber-proof-absent.spec.ts test Ex 8 not declared (Doughnut-like location) |
| E.8b | Unreadable: a truncated Pygardon proof file shows a read failure with retry, while Purpose stays readable | slice 2 | observed: dashboard/tests/intent-cucumber-proof-absent.spec.ts test Ex 8 truncated proof file with Retry, Purpose text kept |
