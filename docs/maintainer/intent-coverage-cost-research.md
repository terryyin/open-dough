# Intent Coverage cost at wrap-up

## Findings from 11–12 November 2026

Across 48 matched wrap-ups (17 Codex and 31 Claude Code), the median worker
used 3.4% of the execution's uncached input plus output tokens. The median
rose to 4.5% with identifiable coverage coordinator requests. That combined
interval used a median 2.41 million tokens including cache reads. The available
Cursor records did not support the same attribution. Pricing the attributed
requests put the median at 14.27 Standard credit equivalents for Codex and
about $0.99 at Claude API rates. The token shares and rate estimates describe
the sampled executions. Included subscription usage requires its own measure.

| Intervention | Measured outcome | Disposition |
| --- | --- | --- |
| Start a fresh Codex worker with a small handoff | Two matched proof pairs used 61% fewer raw tokens and about 10% more Standard-rate credits in aggregate. Uncached input and extra responses outweighed cache-read savings. | Keep the existing context selection. |
| Batch an already-prepared proof into two worker shell calls | Two verified workers fell from 8.76 to 2.74 estimated Standard credits. Three fuller replays cost 18.66, 22.89, and 36.83 including preparation and coordinator work. The coordinator accounted for 72% of the replay total. | Reuse existing proof setup when it fits. The worker-only comparison excluded driver preparation and does not establish full savings. |
| Collect a completion notification during ordinary wrap-up | Two of three live wrap-ups received the result during independent work and issued zero waits. The third made 16 waits, including 13 timeouts, at an estimated 9.91 credits for wait-only responses. | Use the notification when available and bound any remaining wait by the expected proof window. |

## Same-story waiting comparison

Doughnut SEED-122, “Prefer note titles in wiki links,” was replayed twice at
`e257b144d1e9120528922da0f5dc045acb6c9d6d`. Each arm used GPT-6.1 Sol at
standard speed, one fresh native worker, and the same batched backend proof.
The fault in `WikiLinkNoteCandidates.titleOrAlias` combined title and alias
matches. `selectsTitleBeforeAliasesAcrossAuthoredLinkForms` failed on the
destination ID, the independent controller witness saw six ambiguous links,
and the maintained proof passed again after restoration in both arms.

| Measure | Repeated 60-second waits | One wait with a 25-minute deadline |
| --- | ---: | ---: |
| Coordinator wait calls | 7 | 1 |
| Wait-only Standard credit equivalents | 0.91 | 0.15 |
| Coordinator, including preparation and follow-up | 5.22 | 4.63 |
| Worker | 7.27 | 6.71 |
| Combined estimated credits | 12.49 | 11.33 |
| Weekly account quota meter | 50% → 50% | 50% → 51% |

The single wait returned on the final report after 6 minutes 55 seconds. Workers
sent no interim notifications in either arm. Estimated combined cost fell 9.3%,
with 0.76 of the 1.16 credit difference attributable to wait-only responses.
One setup attempt failed before the tests and is excluded. Another session made
two model requests during the blocking arm, and the monitoring chat made two in
each arm. Whole-point, account-wide readings cannot attribute the observed
movement or verify an included-quota saving.

The useful comparison is equivalent proof and follow-up with fewer coordinator
requests. The existing fallback for overdue or failed workers still protects
closure. Any context-default change based on quota needs attributable usage at
enough resolution to distinguish the expected saving. Keep cost estimates and
included-quota measurements separate. [ADR 0010](../adrs/0010-definition-of-improvement-accepted.md)

## Value of automatic checks, 12–14 November 2026

This retrospective evaluation is exploratory. It covers 37 wrap-up reports
saved in Done records for Open Dough, Doughnut, Pygardon and Lizard: 14 Claude
Code runs, 17 Codex runs and 6 Cursor runs. The worker used 0.97% of Claude
Code spend in the window ($11.41 of $1,174) and 0.75% of Codex tokens. Coordinator
turns that dispatched or disposed of the check cost at most $19.68 and 1.3% of
Codex tokens. These upper bounds were larger than the worker itself, because
each turn rereads the whole wrap-up context. Cursor recorded no local token use.
The median report took 4.8 minutes of elapsed time.

The verdicts were 33 Caught and 4 Confirmed missing test path. No report found a
delivered defect. Three reports led to maintained proof that landed:

- a deleted adapter case's no-rerun behavior was added to a queued story and
  proven the same day;
- an assertion that a test-simplification story had shortened to a prefix was
  restored before closure;
- an optional end-to-end failed-build mark was folded into a queued correction
  and proven.

Two queued Pygardon corrections only move detection ahead of CI. For one of
them, the faulted ordinary entry already exits nonzero. One gap restated a fault
that its follow-up plan had already planned. The other Caught reports only gave
assurance. That assurance mattered most for stories that cut or rewrote tests.

Wrap-up now requests the check only for test removal or rewriting, or for a
promise whose proof review or execution questioned. A report whose next proof
action needs no new proof gets a one-line disposition. A gap whose fault
already fails the ordinary entry or CI is recorded without queued work. Before
keeping this change, compare the next comparable window on the same measures:
reports that lead to landed proof, worker and coordinator share, and any
skipped story whose later regression a check would have caught.
