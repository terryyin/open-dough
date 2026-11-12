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
