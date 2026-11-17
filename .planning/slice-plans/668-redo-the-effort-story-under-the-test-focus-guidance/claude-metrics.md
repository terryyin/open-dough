# Claude continuation measurements

The [original measurement record](refactor-and-metrics.md) defines A/Codex
cutoffs, deduplication, provider buckets, rates and availability limits. Reuse
those frozen receipts; no A rerun or replacement baseline. New raw calculation:
scratch `b-claude-metrics-results.json`, retained beside the native records.

## Common transcript clock

Use the same proxy for every participant: per-thread elapsed time minus the
union of matched blocking tool-call/result spans. Root and child clocks
overlap. Async waiting, background-task gaps and model latency remain in the
proxy. It is **not actual active work**; neither self-reported agent minutes
nor summing overlapping clocks repairs that limitation.

| Execution | Root window UTC | Root proxy minutes | Sum of child proxies |
| --- | --- | --- | --- |
| Fixed A | Nov 16 08:06:11.478–09:12:49.975 | 60.14 | 16.30, nine included children |
| Frozen Codex B | Nov 16 13:26:51.431–14:41:15.440 | 38.56 | 54.59, nine children |
| Claude B | Nov 17 00:04:46.172–01:49:15.741 | 101.93 | 55.04, nine children |

Claude B elapsed is 104.49 minutes, with 153.552 seconds of matched blocking
spans subtracted. Its root endpoint is final assistant :908 in transcript
`a46d7c72…jsonl`; no unmatched tool calls/results in that bounded root window.
The read-only operator's later assessment/probe is outside it. A's later
Intent Coverage and CI/wrap-up are excluded. Codex's extra retrospective
remains separately timed and tokened in the original record; Claude B used
`--skip-retro` and did not perform that extra phase.

This does not show a time saving. Claude B discovers and repairs a wider
E2E consumer set than the Codex diff covers and runs broad local proof.
A publishes and watches hosted CI; private B has local-only authority.
The difference cannot isolate guidance, model latency, proof selection or
context. Actual comparable active-work minutes remain **unavailable**.

## Recorded usage and cost limits

Deduplicate Claude assistant messages by native `message.id`, retaining the
final usage record per id, separately in root and each included child.
Cache-read, five-minute cache-write and one-hour cache-write are distinct
provider buckets, not part of uncached input. Thinking is a subset of output.

Claude B root plus nine children record:

| Model | Uncached input | Output | Cache read | Write 5m | Write 1h |
| --- | --- | --- | --- | --- | --- |
| `claude-opus-5-5` | 681 | 177,063 | 29,459,763 | 835,793 | 170,707 |
| `claude-sonnet-5-5` | 2 | 1,344 | 0 | 36,799 | 0 |

Opus output includes 38,883 recorded thinking tokens. All cache creation is
assigned to a recorded TTL bucket. Root and eight execution/refactor children
use Opus/medium; the source-only reviewer uses Sonnet/medium. Do not describe
every child as Opus merely because the root was launched with `--model opus`.

On A's retained historical Opus rate basis ($4/$20/$0.20/$5/$8 per million,
in table order), the visible **Opus-only** subtotal is **$14.980558**. The
supplied basis does not price this Sonnet model, so its dollar amount and
the exact all-model B bill are **unavailable**. Do not present the subtotal
as a complete bill or invent a Sonnet rate.

A's corresponding selected visible priced subtotal is $12.419683; its exact
scoped bill is unavailable. Its recorded totals are 541 uncached input,
146,776 output, 25,714,157 cache read, 573,504 write 5m and 183,956 write 1h.
The original record retains its per-model receipt and rates.

Codex B records 53,446,965 input, including 52,472,576 cached input, and
168,708 output, including 67,313 reasoning. Its USD remains unavailable;
Claude rates never apply to Codex tokens. These different bucket semantics
and single runs support no cross-provider cost-effect estimate.

## Planning-only P

P is stopped at its permission prompt, not completed. Measure through its
last recorded assistant :842, 01:50:28.356–02:04:15.126 UTC, excluding later
permission waiting. Elapsed 826.770 seconds minus 82.463 matched blocking
seconds gives a **12.41-minute proxy**. The pending readiness Bash call is
unmatched at that endpoint. Async test waiting remains; actual active time
is unavailable. No children, P execution or extra paid native probe enters it.

Native Opus buckets: 155 uncached input, 40,956 output (15,792 thinking
subset), 11,168,119 cache read, zero write 5m, 176,738 write 1h. The same
retained rate basis yields a visible priced subtotal of **$4.467268**;
exact scoped billing is unavailable. Scratch `p-claude-metrics-results.json`
retains deduplication and unmatched-call evidence. Codex P's previously
recorded 5,690,799 input / 28,095 output remains separate and unpriced.
