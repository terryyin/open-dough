# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 542. Removed numbers are never reused.
- Recovery: `face6fd05b3f5c4f20159db9b41480afbe90d592:DearDough.md` holds the exact pre-maintenance log and its earlier recovery chain. The [catalog](docs/maintainer/finding-names.md) retains reconciled occurrences. The [project findings](ProjectFindings.md) and [review history](docs/maintainer/project-findings-history.md#review-and-recovery) retain the local CI issues (DD-529, DD-537, DD-539).
- Occurrence history is partial.

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. [Evidence and current response](docs/maintainer/findings/ODF-154.md).

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259. [Meaning, evidence and response](docs/maintainer/findings/ODF-150.md).

### Occurrences

- Execution: SEED-371#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool (first implementation 47478eacb64f35121d5cfafce24a87f391645db7; retained execution records at 3163559cf0f13169f136b0a195aeb4754bd63499:.planning/slice-plans/638-distribution-evaluation-tool/)
  - Timestamp: 2026-11-15T21:39:28.632625Z (full-gate finish)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at claim deba676495b2eb1b8c1f3d3f96b7a44cb1122eb4; no release inferred from product VERSION)
  - Evidence: slice8 repair 4856382 added a public retention check reading raw turn.completed. Mac/Linux public-entry and identity/retention consumer proof passed, but omitted the repository-wide native-stream guard. Slice9 full gate then failed that guard after 1099.8 s, with 640 of 641 jobs and all 2226 Node cases passing; slice9 evidence at 3163559 retains its exact verdict. Repair 33736a7 uses native_host_stream status, passes targeted full replay/public-entry on Mac and public-entry on Linux, then passes 641/2226 in the renewed full gate.
  - Observed effect: a new observation reached an unchanged global stream invariant outside the selected retention consumer checks; one later full-gate failure/correction cycle was required. Earlier same-execution stale fixture/cache-guard misses also required reached consumer repairs.
  - Inference: matches ODF-150's missed affected-consumer proof, including global validators. Earlier selection of the existing shared-stream guard could have exposed this before the whole gate; isolated time/token saving is unmeasured, and the required final full gate is not classified as waste.

## ODF-229 — Interrupted Cursor implementation loses its proof return <a id="odf-229"></a>

Former local code: DD-265. [Meaning, evidence and response](docs/maintainer/findings/ODF-229.md).

## ODF-158 — Disproportionate required reference reads <a id="odf-158"></a>

Former local code: DD-128. [Meaning, evidence and response](docs/maintainer/findings/ODF-158.md).

## ODF-264 — Broad startup reads lose required context to truncation <a id="odf-264"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-264.md).

### Occurrences
- Execution: SEED-010#review-independently-observable-promises (first implementation `8ac10364f82362f3dac2504304a52645ed661456`)
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: 0.3.101 (checkout-bound installed guidance at Take `7bb9992277410f6b5c3ba8da0b461c3c61939a84`)
  - Evidence: launch `44215ad1-8e39-454e-8b40-11990aced97d`, 2026-11-15 execution / 2026-11-16 automatic retrospective conversation and tool results. Initial coordinator batches reported 12,315 and 16,450 original tokens with truncation; this retrospective also batched long finding-search/replay reads beyond its output bound before retrieving the needed passages narrowly.
  - Observed effect: repeated context retrieval while execution and review continued. Narrow reads recovered the relevant guidance, source and process-record passages; no product or proof loss was established.
  - Inference: the installed boundary/targeted-retrieval instructions were available, but batching and broad single-line metadata results still exceeded the visible output budget. Total time and token cost of the recovery were not measured.


- Execution: SEED-334#move-intent-reading-and-review-checks (first implementation `cd02f6a5171cf066ef111a467e12fd7492339171`)
  - Timestamp: unknown (2026-11-16 +08:00, retrospective correction planning and wrap-up reads; exact tool-call times unavailable)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at `7d8f624816ca582126fbba760075163a0d2b3993`)
  - Evidence: dashboard launch `9503957a-a6a0-4b7b-9756-82de8bd4979c`; coordinator tool responses `cfcebc` and `77b299` truncated combined planning/reference reads, then repeated targeted premise, proof and workspace passages. A later whole-file catalog match read (`ca9cf5`) reported 26,091 original tokens and truncation.
  - Observed effect: requested passages were omitted and reread during correction planning and review. This is the same over-batching deviation; the record does not establish a missing guidance rule.
  - Inference: bound retrieval to the next required passages and account for the combined tool response budget before batching. No elapsed or total-token saving was measured. Earlier execution transcripts were unavailable in this continuation; no process claims about those turns are reconstructed from summaries.

- Execution: SEED-374#see-stale-test-duration-estimates; first implementation `02705787579d078863b1f7db65cc2616774cab54`
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: coordinator execution/closure tool record, 2026-11-15–16; the whole consumer trace `/tmp/dough-slice3-consumer-trace.md` and batched closure-reference reads returned truncated output. Later bounded section reads recovered the needed context.
  - Observed effect: repeated reads were required; some reference text was still unavailable after the first read. Closure itself repeated broad batches after a context handoff.
  - Inference: reading the selected section and returning bounded fields would reduce repeated retrieval; token savings and active-agent cost were not measured.

- Execution: SEED-371#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool (first implementation 47478eacb64f35121d5cfafce24a87f391645db7; retained execution records at 3163559cf0f13169f136b0a195aeb4754bd63499:.planning/slice-plans/638-distribution-evaluation-tool/)
  - Timestamp: unknown (2026-11-15/16 execution and wrap-up; exact read-event times not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at claim deba676495b2eb1b8c1f3d3f96b7a44cb1122eb4)
  - Evidence: coordinator launch a6f339d0-f7b7-4741-81af-665f3195db73 combined CI/delivery/fresh-increment guidance with runtime files in a tool result reporting 14823 original tokens and truncation; a later combined backlog/record-preparation/closure-publication result reported 11701 and truncation. Targeted code/reference reads subsequently recovered affected decisions. The automatic discovery probe independently caught the complete-root omission and restored cleanly (469635 ms invocation-to-report; 7.715 s all focused commands; agent/human effort unavailable).
  - Observed effect: broad outputs omitted requested passages and required bounded recovery, including in the closing review. Command handles, rejected measurements, exact reversion, CI completion and probe restoration remained recoverable.
  - Inference: recurrence of known output-scoping deviation under existing targeted-reading guidance. Mandatory reviews themselves are not called waste; the avoidable share and isolated elapsed/token saving are unmeasured.

## DD-540 — A strict all-runs keep rule cannot resolve a mid-size test speed-up under local noise

A test-optimization plan kept a change only when, over three alternating pairs at one worker, every after-run beat every before-run. Unchanged runs of the affected cases spread wider than the change's likely effect, so a consistent pairwise drop was undone.

### Occurrences

- Execution: SEED-380#speed-up-the-slowest-dashboard-frontend-unit-tests (first implementation 3b8848a2ab182d34b1b0034090ea2a2d8430fe74; retained execution records at 7bb49ed863be027a9cdb054c749ca4f95e714ab6:.planning/slice-plans/653-speed-up-the-slowest-dashboard-frontend-unit-tests/)
  - Timestamp: unknown (2026-11-16, slice 2)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at claim d9c35d51faedbdcd77f4ce68d833132d2a28d164)
  - Evidence: plan 653 slice 2 Result in 7bb49ed. 19 cases at `--workers=1`: before 33.2, 44.1, 35.7 s, after 29.4, 33.5, 28.8 s (−19% summed, every pair lower), refused because 33.5 > 33.2. The planning probe showed the same direction (every changed run lower).
  - Observed effect: the change (61 → 20 page round trips per revision check) was undone. It stays a live candidate in `.planning/TEST-OPTIMIZATION-CANDIDATES.md`.
  - Inference: with an 11 s spread among unchanged runs, "every after below every before" over three pairs rejects effects near 10–20%. A pairwise or more-pairs criterion might have kept it. Whether the gain is real stays unmeasured.

## DD-541 — Bounding removable cost from a trace before editing settles a speed experiment without an edit

A test-speed slice that first traced the unchanged cases, grouped by call, could bound the most the tactic could remove. When that bound was under the keep threshold, the slice ended without building or timing a change.

### Occurrences

- Execution: SEED-380#speed-up-the-slowest-dashboard-frontend-unit-tests (first implementation 3b8848a2ab182d34b1b0034090ea2a2d8430fe74; retained execution records at 7bb49ed863be027a9cdb054c749ca4f95e714ab6:.planning/slice-plans/653-speed-up-the-slowest-dashboard-frontend-unit-tests/)
  - Timestamp: unknown (2026-11-16, slices 3 and 5)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at claim d9c35d51faedbdcd77f4ce68d833132d2a28d164)
  - Evidence: plan 653 slice 3 Result (reads at most about 1 s against a 3.1 s bar, no edit) and slice 5 Result (waits about 0.35 s of 9.4 s; a trial measured −1.4%) in 7bb49ed.
  - Observed effect: slice 3 made no edit and was delivered as a records-only finding. Slice 5's measured trial matched its bound.
  - Inference: a useful practice for planned speed experiments. Slices 1 and 2 timed without such a bound first; whether one would have avoided their work is not established.

## DD-542 — A trunk-wide CI failure owned by another story holds a finished story's final CI

The story was delivered with every dashboard, e2e and integrated job green, but its final completion receipt failed. The only failure was the Distribution suite's total time budget, red on `main` since before the story began, which another Taken story was removing. The execution stopped for the developer and resumed after that story landed.

### Occurrences

- Execution: SEED-380#speed-up-the-slowest-dashboard-frontend-unit-tests (first implementation 3b8848a2ab182d34b1b0034090ea2a2d8430fe74; retained execution records at 7bb49ed863be027a9cdb054c749ca4f95e714ab6:.planning/slice-plans/653-speed-up-the-slowest-dashboard-frontend-unit-tests/)
  - Timestamp: unknown (2026-11-16, final completion)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at claim d9c35d51faedbdcd77f4ce68d833132d2a28d164)
  - Evidence: CI runs 43786112787, 43788508552, 43789763452 and 43792139474 failed only Distribution Tests on `OVER BUDGET` (933–1003 s against 926 s), as `main` runs did from 43774458324 on. SEED-381 closed at c4882f0c3 and removed the budget.
  - Observed effect: four failure notifications were classified as another owner's, then a developer stop and a watch for the other story's landing before wrap-up could resume.
  - Inference: the failure policy correctly avoided a duplicate repair. The cost was waiting, not rework.
