# Source review: SEED-238#remove-local-proof

Launch: fresh general-purpose reviewer (no conversation inheritance) during slice 1 delegation, 2026-11-05. Input: only the selected story section's Goal, Scope, Key examples and Architectural context, pasted verbatim; told to read no files and change nothing. Returned table reproduced below with allocations.

Reviewer notes: 3c/3d overlap 3b.2; E2 sets no new rule for unknown keys; E6 names examples of kept hits, not an exhaustive list; E1/E3 locations and commands are examples.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | An Open Dough developer maintains a smaller repository and published payload. | slice 5 | |
| G2 | CI is the only source of published execution observations. | slice 5 | |
| G3 | The local proof feature is deleted completely: its committed records, its collection and persistence, the dashboard's reading of them, its published guidance, and everything that exists only to produce, consume, test or explain it. | slice 5 | |
| G4 | Purpose of the change: keep Open Dough's product and guidance focused on capabilities that are maintained and used. | slice 5 | |
| 1a | Delete the committed local proof store `tests/proof`. | slice 3 | |
| 1b | Delete the committed local proof store `dashboard/tests/proof`. | slice 3 | |
| 1c | Delete local-proof-only copies and fixture records. | slice 3 | |
| 1d | Keep no archive or replacement history store. | slice 3 | |
| 2a.1 | Delete local collection and persistence: recorders | slice 3 | |
| 2a.2 | Delete local collection and persistence: reporters | slice 3 | |
| 2a.3 | Delete local collection and persistence: stores | slice 3 | |
| 2a.4 | Delete local collection and persistence: refresh and merge code | slice 3 | |
| 2a.5 | Delete local collection and persistence: locking | slice 3 | |
| 2a.6 | Delete local collection and persistence: the `RECORD_NODE_TEST_PROOF` opt-in | slice 3 | |
| 2a.7 | Delete local collection and persistence: the `RECORD_PLAYWRIGHT_PROOF` opt-in | slice 3 | |
| 2a.8 | Delete local collection and persistence: commands | slice 3 | |
| 2a.9 | Delete local collection and persistence: runner wiring | slice 3 | |
| 2a.10 | Delete local collection and persistence: configuration | slice 3 | |
| 2b | Remove the Intent location `proof` setting. | slice 2 | |
| 2c | Remove the Intent location `proofGeneration` setting. | slice 2 | |
| 2d | Remove this repository's entries for those settings in `.planning/open-dough.json`. | slice 2 | |
| 2e | Remove the code, schemas and documentation that read or explain `proof` / `proofGeneration`. | slice 2 | |
| 2f | Follow exclusive dependencies through helpers, packages and lockfiles until no orphaned local-proof support remains. | slice 5 | |
| 3a | Remove the dashboard's reading of committed local proof. | slice 2 | |
| 3b.1 | Remove dashboard UI that exists solely for local proof | slice 2 | |
| 3b.2 | Remove dashboard summaries that exist solely for local proof | slice 1 | observed: slice 1: dashboard/src/IntentSummary.tsx renders path, file count, location explanation and children only; IntentProofSummary, IntentSummarySlowest, intentSummaryCoverage, intentSummaryProofCost deleted; intent-entry-folder-summaries*.spec.ts, intent-summary-drill-down.spec.ts pass (121 Intent specs) |
| 3b.3 | Remove dashboard duration/cost views that exist solely for local proof | slice 1 | observed: slice 1: dashboard/src/IntentSummary.tsx renders path, file count, location explanation and children only; IntentProofSummary, IntentSummarySlowest, intentSummaryCoverage, intentSummaryProofCost deleted; intent-entry-folder-summaries*.spec.ts, intent-summary-drill-down.spec.ts pass (121 Intent specs) |
| 3b.4 | Remove dashboard endpoints that exist solely for local proof | slice 2 | |
| 3b.5 | Remove dashboard parsers that exist solely for local proof | slice 2 | |
| 3b.6 | Remove dashboard data models that exist solely for local proof | slice 2 | |
| 3b.7 | Remove dashboard configuration paths that exist solely for local proof | slice 2 | |
| 3c | This includes proof generation prompts. | slice 2 | |
| 3d | This includes last-successful-proof summaries. | slice 1 | observed: slice 1: dashboard/src/IntentSummary.tsx renders path, file count, location explanation and children only; IntentProofSummary, IntentSummarySlowest, intentSummaryCoverage, intentSummaryProofCost deleted; intent-entry-folder-summaries*.spec.ts, intent-summary-drill-down.spec.ts pass (121 Intent specs) |
| 3e | Per-case views based only on local snapshots go with their source. | slice 2 | |
| 4a | Remove dedicated tests, fixtures, mocks and test helpers. | slice 5 | |
| 4b | Delete the feature rather than switching it off. | slice 5 | |
| 4c | Do not hide it. | slice 5 | |
| 4d | Do not keep compatibility readers. | slice 5 | |
| 4e | Do not replace its tests with assertions that it is absent. | slice 5 | |
| 5a.1 | Remove the published Cucumber proof reference under `src/skills/dough-test-optimization/references/` | slice 4 | |
| 5a.2 | Remove the published pytest proof reference | slice 4 | |
| 5a.3 | Remove the published Vitest proof reference | slice 4 | |
| 5a.4 | Remove the published `node:test` proof reference | slice 4 | |
| 5a.5 | Remove the published Playwright proof reference | slice 4 | |
| 5b | Remove their links, rules, examples and templates in other skills. | slice 4 | |
| 5c | Remove their installer/update manifest entries. | slice 4 | |
| 5d | Remove their payload-test entries. | slice 4 | |
| 5e.1 | Released installation and update remove the retired managed files on Codex | slice 4 | |
| 5e.2 | Released installation and update remove the retired managed files on Cursor | slice 4 | |
| 5e.3 | Released installation and update remove the retired managed files on Claude Code | slice 4 | |
| 6a | Remove local-proof documentation. | slice 5 | |
| 6b | Remove local-proof comments. | slice 5 | |
| 6c | Remove obsolete local-proof planning material. | slice 5 | |
| 6d | Drop `SEED-233#consolidate-proof-recording-guidance` completely. | slice 5 | |
| 6e | Drop that story's backlog entry. | slice 5 | |
| 6f | Drop SEED-192's local-proof-only parts. | slice 5 | |
| 6g | This includes the queued `SEED-192#read-shell-check-proof`, because its retained shell-check evidence would be a new local producer. | slice 5 | |
| 6h | Maintained code, guidance, docs and finding records describe the resulting product directly. | slice 5 | |
| 6i | No tombstones. | slice 5 | |
| 6j | No historical feature narrative. | slice 5 | |
| 6k | No migration guide. | slice 5 | |
| 7a | Ordinary local test execution keeps its diagnostics. | slice 3 | |
| 7b | It keeps its timing. | slice 3 | |
| 7c | It keeps its selection. | slice 3 | |
| 7d | It keeps its strict failure semantics. | slice 3 | |
| 7e.1 | CI proof keeps working end to end: fragments | slice 3 | |
| 7e.2 | CI proof keeps working end to end: summaries | slice 3 | |
| 7e.3 | CI proof keeps working end to end: artifacts | slice 3 | |
| 7e.4 | CI proof keeps working end to end: run/attempt/revision identity checks | slice 3 | |
| 7e.5 | CI proof keeps working end to end: CI adapters | slice 3 | |
| 7e.6 | CI proof keeps working end to end: the dashboard's **Intent → CI status → Proof** reading | slice 2 | |
| 7f | Where a report serves CI as well as local proof, keep only the responsibility that CI or surviving test execution needs. | slice 3 | |
| 7g | The dashboard run record (`OPEN_DOUGH_DASHBOARD_PROOF_RECORD`, `dashboard/tests/proof-record.md`) feeds CI's Playwright fragments and survives. | slice 3 | |
| 7h | The dashboard run record is described as the CI input it is. | slice 3 | |
| 7i.1 | Purpose/test-source browsing stays | slice 2 | |
| 7i.2 | story selection stays | slice 2 | |
| 7i.3 | shard scheduling from CI test times stays | slice 3 | |
| 7i.4 | longest-first scheduling from CI test times stays | slice 3 | |
| 7i.5 | the shared test-optimization responsibility stays | slice 4 | |
| 7i.6 | the CI proof publication responsibility stays | slice 4 | |
| 8a | Project-owned implementations in Donut, Pygardon and Lizard are out of scope; each has its own removal story. | slice 5 | |
| 8b | No new proof archive. | slice 5 | |
| 8c | No CI history product. | slice 5 | |
| 8d | No added CI per-case detail. | slice 5 | |
| 8e | This repository's installed copies under `.agents/skills/` and `.claude/skills/` change only through a released payload, never by hand. | slice 5 | |
| 8f | No permanent removal checker. | slice 5 | |
| 8g | A one-time whole-product sweep is an acceptance reading, separate from tests of surviving behavior. | slice 5 | |
| 8h | Spent removal planning is cleaned up at story close. | landing | |
| E1.T | Setup: a developer opens Intent for `tests` or `dashboard/tests`. | slice 2 | |
| E1.R1 | Purpose and test source still browse. | slice 2 | |
| E1.R2 | The **CI status → Proof** tab shows the run's CI proof. | slice 2 | |
| E1.R3 | No last-successful-proof summary, duration/cost view or proof generation prompt appears. | slice 2 | |
| E1.R4 | The read returns no local proof field. | slice 2 | |
| E2.T | Setup: a project's `open-dough.json` location still contains an old `proof` or `proofGeneration` key. | slice 2 | |
| E2.R1 | The key is treated like any other unrecognized location key. | slice 2 | |
| E2.R2 | No documentation, schema or compatibility reader names it. | slice 2 | |
| E3.T | Setup: a developer runs `bash scripts/test.sh <file>` or `npm run --silent test:dashboard -- <spec>` with `RECORD_NODE_TEST_PROOF=1` or `RECORD_PLAYWRIGHT_PROOF=1` set. | slice 3 | |
| E3.R1 | The run behaves exactly as it would without the variable: same output and same exit. | slice 3 | |
| E3.R2 | No proof directory is written. | slice 3 | |
| E4.T | Setup: CI runs on a published revision. | target CI | |
| E4.R1 | The test shares still write `test-outcomes.txt`. | slice 3 | |
| E4.R2 | Dashboard shards still write their run record. | slice 3 | |
| E4.R3 | The `ci-proof` job publishes a summary the dashboard reads, as before. | target CI | |
| E5.T | Setup: a project at the previous release updates to the release that contains this removal, on Codex, Cursor or Claude Code. | slice 4 | |
| E5.R1 | The five runner proof references disappear from its installed `dough-test-optimization`. | slice 4 | |
| E5.R2 | `ci-proof-summary.md` and the rest of the skill remain. | slice 4 | |
| E6.T | Setup: the acceptance sweep finds `proof` in `tests/proof-scheduling-native.sh` and `tests/support/dough-adr-awareness-proof.sh`. | slice 5 | |
| E6.R1 | These hits are verification vocabulary, not the local proof feature, so they stay. | slice 5 | |
| E6.R2 | A hit in a CI proof module is kept once its consumer is confirmed to be CI. | slice 5 | |
| A1 | ADR 0008 distinguishes verification procedures from observed results and leaves proof storage and representation open. | slice 5 | |
| A2 | Tests and CI proof remain maintained product capabilities. | slice 5 | |
| A3 | That decision does not require repository snapshots, so removing them is consistent with it. | slice 5 | |
