# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 539. Removed numbers are never reused.
- Recovery: `face6fd05b3f5c4f20159db9b41480afbe90d592:DearDough.md` holds the exact pre-maintenance log and its earlier recovery chain. The [catalog](docs/maintainer/finding-names.md) retains reconciled occurrences. The [project findings](ProjectFindings.md) and [review history](docs/maintainer/project-findings-history.md#review-and-recovery) retain the local CI issues (DD-529, DD-537, DD-539).
- Occurrence history is partial.

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. [Evidence and current response](docs/maintainer/findings/ODF-154.md).

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259. [Meaning, evidence and response](docs/maintainer/findings/ODF-150.md).

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
