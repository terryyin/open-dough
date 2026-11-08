# Source-only review

Launch: fresh general-purpose reviewer (`Task` / `generalPurpose`), no conversation
inheritance; input was only SEED-267#preserve-large-ci-proof-reports Goal, Scope,
key examples and exclusions from
`.planning/seeds/SEED-267-preserve-large-ci-proof-reports.md` (no plan, product,
proof, or slice scope).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developers reviewing CI proof in Intent can see complete reports with file-level timings. | slice 1 | observed: intent-ci-proof-adapter.spec.ts: by-file 1213-file summary shows tests row and is remembered |
| 2 | Developers reviewing CI proof in Intent immediately recognize when a size limit prevents the proof from being read. | slice 2 | observed: intent-ci-proof-adapter-reasons + GHA reasons: too-large problem lines |
| 3.1 | An adapter's `proof` answer is read up to the collector contract's existing 1 MiB summary read limit. | slice 1 | observed: ciAdapterProof.ts passes SUMMARY_READ_LIMIT_BYTES via readCommandProof answerBytes |
| 3.2 | That proof read limit is the same limit GitHub Actions summaries already have. | slice 1 | observed: ci-proof-contract.mjs SUMMARY_READ_LIMIT_BYTES comment: either proof source; same constant as GHA |
| 3.3 | Discover, diagnose, and every other adapter answer keep 64 KiB. | slice 1 | observed: ci-command-adapter-proof.test.mjs: discover keeps 64 KiB maxBuffer; runAdapter default adapterResponseBytes |
| 3.4 | The proof 1 MiB / other-answer 64 KiB split applies in the dashboard and the execution observer alike. | slice 1 | observed: custom-ci.md per-call limit names proof 1 MiB exception; observer/discover keep default 64 KiB |
| 4.1 | When a proof is over the 1 MiB limit, from either source, Intent shows it under the affected attempt's or run's Proof as an error. | slice 2 | observed: IntentCiProof + readers: too-large under Proof as error |
| 4.2 | That size-failure presentation is styled as an evidence problem rather than the quiet line of "published no CI proof summary". | slice 2 | observed: intent-ci-proof-problem / --problem styling; quiet none line unchanged |
| 4.3 | The error line says the proof is too large. | slice 2 | observed: ciProofAbsenceWording tooLargeLine: larger than the proof limit |
| 4.4 | The error line names the limit. | slice 2 | observed: wording names 1 MiB proof limit via proofSizeWords(limitBytes) |
| 4.5 | The error line names the actual size when the reader knows it. | slice 2 | observed: GHA reasons spec: names 1.3 MiB when size known |
| 4.6 | The same wording reaches every place that shows why a build's proof cannot be used (for example the Story Branch comparison). | slice 2 | observed: intent-ci-comparison-adapter-gaps: build cells show too-large words |
| 4.7 | Check again reads the size-failure case anew. | slice 2 | observed: adapter-reasons: Check again re-reads oversized; not remembered |
| 5.1 | The adapter read stops as soon as the answer passes the limit. | slice 1 | observed: ci-command-adapter-proof.test.mjs: proof answer above answerBytes refused with maxBuffer |
| 5.2 | A failed or partial read is never displayed as proof. | slice 2 | observed: too-large unavailable; no counts shown in reasons specs |
| 5.3 | A failed or partial read is never remembered as proof. | slice 2 | observed: too-large path does not remember; Check again re-asks |
| 5.4 | The existing rule that only a valid, matching summary is remembered stays. | slice 1 | observed: intent-ci-proof-adapter.spec.ts: Check again keeps remembered summary without second proof ask |
| 6.1 | Adapter guidance for writing `proof` and publishing the summary says a successful answer carries the complete summary as the collector wrote it. | slice 1 | observed: custom-ci-proof.md: successful answer carries complete summary as collector wrote it |
| 6.2 | When the summary is too large, the adapter still answers it whole so Intent reports the size failure. | slice 2 | observed: custom-ci-proof.md: answer whole so Intent reports size failure |
| 6.3 | The adapter never trims entries or breakdowns for size. | slice 1 | observed: custom-ci-proof.md: never trim entries or breakdowns for size |
| 6.4 | The adapter never substitutes `unavailable` for size. | slice 1 | observed: custom-ci-proof.md: never substitute unavailable because summary is large |
| 6.5 | Adapter guidance allows adding `--by-file` freely within the 1 MiB proof limit. | slice 1 | observed: custom-ci-proof.md / ci-proof-summary.md: --by-file within 1 MiB |
| 6.6 | The "mind 64 KiB" advice is removed. | slice 1 | observed: custom-ci-proof.md: 64 KiB --by-file advice removed |
| 6.7 | The per-call 64 KiB statement names the proof exception. | slice 1 | observed: custom-ci.md: 64 KiB stdout limit except dashboard proof 1 MiB |
| 7.1 | No change to the proof summary schema. |  | G1 |
| 7.2 | No change to the proof summary collector. |  | G2 |
| 7.3 | No change to how proof sources are chosen. |  | G3 |
| 7.4 | Other unavailable reasons keep their current presentation. |  | G4 |
| 7.5 | Pygardon's own adapter change to stop stripping belongs to that project, after it updates its Open Dough guidance. |  | G5 |
| 8.1 | The 1 MiB summary read limit has one owner, the collector contract. | slice 1 | observed: ci-proof-contract.mjs owns SUMMARY_READ_LIMIT_BYTES; dashboard imports it |
| 8.2 | Both proof readers use that collector-contract 1 MiB limit. | slice 1 | observed: ciAdapterProof.ts and ciProofArtifact.ts both use SUMMARY_READ_LIMIT_BYTES |
| 8.3 | The adapter runner takes its answer limit per operation instead of one fixed limit. | slice 1 | observed: ci-command-run.mjs runAdapter answerBytes per call |
| 8.4 | A size failure is one proof-unavailability fact shared by both sources, carrying the limit and the size when known. | slice 2 | observed: ciProof.ts too-large with limitBytes/sizeBytes shared by both readers |
| 8.5 | Size-failure presentation is written once. | slice 2 | observed: ciProofAbsenceWording.ts single tooLarge helpers for status/adapter/build |
| 8.6 | Missing, unreadable, and too-large evidence stay distinct from "no proof published" (ADR 0008). | slice 2 | observed: distinct too-large vs none; quiet none line keeps no problem styling |
| 8.7 | Remembered proof stays bounded at 256 entries per source. | slice 1 | observed: rememberedByKey.ts default limit 256 unchanged; ciAdapterProof uses rememberedByKey() |
| 8.8 | That bound keeps worst-case memory matching what GitHub Actions summaries already allow. | slice 1 | observed: rememberedByKey default 256; same bound as GHA proof memory path |
| 8.9 | Adapter guidance stays written for the agent working in that project (ADR 0006). | slice 1 | observed: custom-ci-proof.md / custom-ci.md written for the agent in the project |
| 9 | An adapter answers a valid, matching 157 KiB summary carrying file breakdowns for 1,213 files → Intent shows its entries, totals and a selected entry's file figures, and Check again uses the remembered summary. | slice 1 | observed: intent-ci-proof-adapter.spec.ts over-64-KiB by-file case: 1213 passed checks, Check again remembered |
| 10 | An adapter answers a summary that passes 1 MiB → the read stops at the limit; under Proof an error line says this attempt's CI proof is larger than the 1 MiB proof limit, distinct from "gave no CI proof summary"; no counts are shown and the verdict is unchanged. | slice 2 | observed: intent-ci-proof-adapter-reasons oversized case |
| 11 | A GitHub Actions run's summary file is 1.3 MiB → under Proof an error line says the run's CI proof summary is 1.3 MiB, larger than the 1 MiB proof limit. | slice 2 | observed: intent-ci-proof-reasons 1.3 MiB case + ZipEntryTooLarge.sizeBytes |
| 12 | An adapter's `discover` answer passes 64 KiB → it is rejected as today. | slice 1 | observed: ci-command-adapter-proof.test.mjs: discover over 64 KiB still maxBuffer |
| 13 | An adapter answers `{"unavailable": "no summary retained"}` → the quiet "gave no CI proof summary" line, unchanged. | slice 2 | observed: intent-ci-proof-adapter-reasons: no summary retained quiet line without problem class |
