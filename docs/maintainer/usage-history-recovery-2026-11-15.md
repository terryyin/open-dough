# Native usage recovery on 2026-11-15

Two full imports on the final interpretation completed successfully, followed by
fresh bounded reads and raw-evidence reconciliation. This receipt accounts for
retained local Codex and Claude Code evidence in the six configured projects.
Counts are not provider-wide or billing totals. No prompts or transcript bodies
are reproduced here. The [record and report definitions](../../dashboard/USAGE-HISTORY.md)
apply; [earlier diagnostics](usage-history-recovery-diagnostics-2026-11-15.md)
preserve the historical capacity and repair observations.

## Reproduction and runtime

The cutoff is `2026-09-16T00:00:00+08:00`, midnight Asia/Singapore
(`2026-09-15T16:00:00Z`). Counts below use recorded in-window activity, not
conversation creation dates. Native inputs were live during each scan, rather
than frozen atomically. Home was `/Users/terryyin`; source roots were
`~/.codex/sessions`, `~/.codex/archived_sessions`, and `~/.claude/projects`.

| Project | Repository | Local checkout | Hidden |
| --- | --- | --- | --- |
| Open Dough | `terryyin/open-dough` | `~/git/open-dough` | no |
| Doughnut | `nerds-odd-e/doughnut` | `~/git/doughnut` | no |
| Pygardon | `terryyin/pygardon` | `~/git/pygardon` | no |
| Terry Talks | `terryyin/terry-talks` | `~/git/terry-talks` | no |
| Lizard | `terryyin/lizard` | `~/git/lizard` | no |
| Clipboard | `terryyin/clipboard` | `/Users/terryyin/git/clipboard` | yes |

Both runs used this exact command from the story checkout:

```sh
caffeinate -s -i /usr/bin/time -lp \
  /opt/homebrew/Cellar/node@24/24.21.0_1/bin/node \
  dashboard/server/importUsageHistory.ts import \
  --since '2026-09-16T00:00:00+08:00'
```

Checkout: `/Users/terryyin/git/open-dough/.worktrees/reconstruct-codex-and-claude-code-usage-history`.
Both used clean published HEAD `be0a53bcd8c2a7208310f7829d834dd0a96bfcb6` and identical executable source
fingerprint `8fb066b9324775e095dfba2a2f4e887c97b8d28f2f1c18dbd73d07c134a55ab1`.
The exact sorted path/SHA-256 manifests cover 938 files: `.ts`/`.tsx` under
`dashboard/server` and `dashboard/src`, plus `package-lock.json` and `.node-version`.
Documentation changes after the scans do not change this fingerprint.

Node was 24.21.0 at the executable above; `NODE_OPTIONS` was unset and the
default heap stayed 4,496,293,888 bytes. Runs were serial under `caffeinate -s -i`
on AC power at 100% charge. Preflight memory was 65% free; disk headroom was
148.66 GiB then 148.13 GiB. The dashboard and unrelated
Claude workload stayed running; no other owned heavy proof ran concurrently.

| Import (UTC interval) | Duration | Maximum RSS | Exit |
| --- | ---: | ---: | ---: |
| `terminal-first`: 2026-11-14T21:32:16.737760Z → 2026-11-14T21:39:37.000460Z | 440.195 s | 4,295,213,056 bytes | 0 |
| `terminal-repeat`: 2026-11-14T21:41:36.740712Z → 2026-11-14T21:48:55.035602Z | 438.244 s | 4,482,842,624 bytes | 0 |

The machine store was `~/.open-dough/dashboard/launch-history/usage.json`, with
immutable bounded pages in `usage.json.pages/`. The final 183,523-byte manifest
referenced 2,316 pages totaling 1,625,082,672 bytes; the largest was 1,048,575 bytes.
Imports used its shared document
lock and atomic manifest replacement. That paged store has since given way to
one history document without response rows: the first write of
[Keep usage history within a small disk budget](../../dashboard/USAGE-HISTORY.md)
carries the tasks, gaps and task totals over and removes `usage.json.pages/`.
Native sources remained read only; no native
session, provider API, scheduler, operational launch or workflow write was made.

Before the live pair, all 47 actual-CLI usage-history cases passed with the default
quiet reporter and dashboard typecheck passed on this executable source. The
unchanged proof was reused for both runs. Each import was followed by a separate
process reading persisted partitions/pages and independently rebuilding scoped
accounting; every compared CLI summary field agreed.

## Recovered work and categorized usage

The final scan read 16,711 native files. Its persisted catalog contains
2,925 entries, including 453 unsupported assignment entries
kept for audit and excluded from human-task counts. Eligible in-window work is
2,403 configured tasks plus 69 unknown-project tasks;
out-of-roster eligible work is zero. Unsupported entries do not erase response evidence.

| Catalog host | Catalog entries | Eligible tasks | Unsupported assignments |
| --- | ---: | ---: | ---: |
| claude | 657 | 657 | 0 |
| codex | 2,268 | 1,815 | 453 |

| Population | Codex tasks | Claude tasks | Codex responses | Claude responses |
| --- | ---: | ---: | ---: | ---: |
| Configured | 1,754 | 649 | 182,153 | 104,934 |
| Unknown project | 61 | 8 | 611 | 696 |
| Out of roster | 0 | 0 | 0 | 0 |
| Unassigned evidence | — | — | 190,440 | 35,610 |

All retained responses: 373,204 Codex and 141,240 Claude
(514,444 unique IDs, 641,591 raw measurements and one association per ID).
The scan excluded 142 unrelated native task candidates and
6,040 unrelated observations; these are scan exclusions, not stored configured work.

The four columns below are disjoint known token subtotals. Missing components
are counted separately in the last column as input/read/write/output responses;
known subtotals do not impute missing values. Reasoning refines output, and
cache lifetimes refine cache writes, so neither is added again.

| Population / host | Uncached input | Cache read | Cache write | Output | Unmeasured I/R/W/O |
| --- | ---: | ---: | ---: | ---: | --- |
| Configured / codex | 528,848,930 | 25,326,211,072 | 0 | 78,912,677 | 0 / 0 / 0 / 0 |
| Configured / claude | 373,873 | 15,314,751,882 | 348,725,777 | 73,395,139 | 0 / 0 / 0 / 7,711 |
| Unknown project / codex | 1,742,767 | 23,630,208 | 0 | 176,388 | 0 / 0 / 0 / 0 |
| Unknown project / claude | 1,403 | 109,702,872 | 1,786,833 | 321,605 | 0 / 0 / 0 / 105 |
| Unassigned / codex | 632,704,228 | 29,797,399,040 | 0 | 91,901,598 | 0 / 0 / 0 / 0 |
| Unassigned / claude | 99,153 | 7,131,335,805 | 135,643,785 | 22,701,986 | 0 / 0 / 0 / 3,394 |

| Response coverage | Measured | Partial | Unavailable |
| --- | ---: | ---: | ---: |
| Configured Codex | 182,153 | 0 | 0 |
| Configured Claude | 97,223 | 7,711 | 0 |
| Unknown project | 1,202 | 105 | 0 |
| Unassigned | 222,656 | 3,394 | 0 |

Configured task coverage is 2,336 measured,
49 partial and 18 unavailable. A task with no attributable response
has unavailable usage even when its activity time is known. All retained response
timestamps are dated; outside-window and unresolved-window eligible task counts are 0 and 0.

## Earliest recovered evidence

| Host, configured work | Genuine task start / first in-window activity | First native response usage |
| --- | --- | --- |
| codex | `2026-09-16T02:45:27.104Z` | `2026-09-16T02:45:33.882Z` |
| claude | `2026-10-08T02:48:58.379Z` | `2026-10-08T02:49:00.098Z` |

The earliest retained native usage globally is `2026-09-16T01:01:20.297Z`;
it is unassigned evidence, not an earlier supported human task. The initial
Codex wrapper-only session has no genuine user assignment; its audit entry has
unknown start and its responses remain unassigned. The next session’s genuine
row supplies the configured Codex start above. The Claude date is the earliest
recovered configured evidence, not a claim about when actual Claude use began.

## Raw evidence, phase correction and replay

The first final-code snapshot retained all 514,228 prior IDs and
all 641,375 raw measurements from the saved successful pre-phase snapshot. Only newly
added `completion` metadata was ignored when comparing old raw properties;
numeric values, sources, settings, native rows and lineage were compared exactly.
It enriched 268,387 existing measurements without increasing their count,
added 174 actual Codex IDs (172 configured, 2 unassigned),
and lost no observation, task source or association candidate. No attribution
was withdrawn or retargeted. One task gained live activity/source evidence;
its project, workflow, identity, title, start, origin and outcome stayed unchanged.

All 270 formerly configured Claude output conflicts settled from explicit
native terminal measurements, including the independently inspected partial
3/8/4 → terminal 690/843/1083 examples. The complete assessment, not an
extrapolation from those three, was in `terminal-first-evidence-audit.json`.
Across all populations, 11,598 old normalized output values changed;
input/cache counters did not. Each change is explained by completion metadata:
progressive-only values become unknown final output, and terminal evidence
settles progressive snapshots. No old raw measurement was added or lost.

| Claude evidence population | Terminal present | Progressive only | Unclassified only |
| --- | ---: | ---: | ---: |
| Configured | 97,223 | 7,711 | 0 |
| Unknown project | 591 | 105 | 0 |
| Unassigned | 32,216 | 3,394 | 0 |

Progressive-only output is `null` with `incomplete-output`, never measured zero.
Missing or unsupported phase markers retain legacy unclassified semantics;
no such Claude measurements remain in this retained corpus. Terminal presence
is evidence about an API response, never task/story completion. Codex response
accounting and input/cache selection are unchanged. Truly competing terminal or
unclassified counters remain unknown under the record contract.

The repeat compared all 514,402 first-run response IDs: 0 missing,
0 lost raw measurements, 0 added raw facts on old IDs,
0 phase enrichments, and 0 normalized counter changes.
It added 42 genuine live Codex IDs (42 configured, 0 unassigned);
live evidence accounts for the count increase. Stable response counters never
multiplied, and no old association changed task. Every independently recomputed
normalized counter agreed with storage on both runs, as did every scoped CLI
summary field. Sources, task claims and association candidates survived both.

The first capacity baseline’s 513,761 IDs/640,908 measurements were already
preserved exactly by the saved pre-phase comparison. The new full raw-subset
comparison preserves that chain; a direct 512-ID/730-measurement baseline check
across all partitions also found no missing raw facts or association candidates.
Original manifests and immutable pages were retained at the time and are removed
as described under Reproduction and runtime and below; no corpus-wide string
or cloned history was built. Earlier streamed CLI export exceeded V8’s string
limit successfully; that historical capacity observation is linked above.

## Material gaps and interpretation limits

Configured work includes 1,021 retained launches and 1,382 recovered tasks.
Origin is dashboard for 1,148, native for 0, and unknown for
1,255; native skill presence alone does not establish a dashboard launch.
Configured missing fields are workflow 1,152, identity 1,286,
title 1,264, outcome 1,479, and task start 0.
Retained competing task claims include outcome 80, title 57 and workflow 1.
Requested settings remain unknown for 1,486 tasks. Observed response settings
and their provenance remain distinct from requested launch settings.

Bounded source inspection covered 12 metadata representatives and the earliest
configured Claude context. Wrapper-only context does not supply an assignment.
An explicit archived execute-plan 50 resolves the pinned historical quick plan’s
`Source` to SEED-013; later argless workflows keep identity unknown despite prior
context or incidental file reads. Unknown-project samples include notebook and
non-repository contexts without a supported project join. Outcome absence is not
filled from narrative completion or native response stop reasons. These are
evidence limits, rather than a claim that every available fact is undecodable.

| Current scan gap provenance | Count |
| --- | ---: |
| `malformed-native-row` | 3,312 |
| `unrelated-project-excluded` | 288 |
| `auxiliary-usage-not-covered` | 647 |
| `missing-root-transcript-usage` | 5 |
| `unsupported-response-counters` | 1,073 |
| `incomplete-worker-evidence` | 1,242 |
| `no-response-usage-evidence` | 219 |
| `unresolved-worker-evidence` | 172 |
| `ambiguous-worker-evidence` | 5,486 |
| `no-attributable-response-usage` | 478 |

These provenance counts can overlap and are not missing-response or token totals.
Older Codex aggregate/lifetime counters, malformed or unsupported rows, missing
roots/workers, ambiguous lineage and auxiliary usage do not supply invented
response charges. Unassigned usage remains outside configured task totals.
Local retention, unavailable native sources and progressive-only Claude output
limit completeness; no provider-wide, pricing or billing completeness is claimed.

Exact machine-local evidence lived under the store’s `import-reports/2026-11-15/`
(42 MB) and was removed from the machine with the story
“Keep usage history within a small disk budget” (SEED-357), which also ended the
per-response rows and pages that evidence compared. No dashboard code wrote or
read that folder. It held: `terminal-first-*` and `terminal-repeat-*` with
commands, source manifests, UTC boundaries, runtime/resources, scan reports,
immutable snapshot manifests, fresh independent summaries, ID/raw comparisons and
full normalized metadata; `terminal-reconcile.mjs` and
`terminal-evidence-audit.mjs`, the bounded comparison procedures, with
`terminal-first-evidence-audit.json` cited above; and
`slice7-metadata-inspection.json` and
`final-claude-conflict-inspection-summary.json`, source hashes and selected row
metadata without bodies. The figures in this receipt are what remains of it; the
native session files stay the evidence. Historical receipts keep their original
labels.

Only explicit offline recovery ran. Cursor history, collection scheduling,
new usage/history UI, pricing/billing reconciliation and unavailable-source
recovery remain outside this delivery. The historical
[story contract](https://github.com/terryyin/open-dough/blob/be0a53bcd8c2a7208310f7829d834dd0a96bfcb6/.planning/seeds/SEED-358-dashboard-launch-history.md#reconstruct-codex-and-claude-code-usage-history)
defines the scope.
