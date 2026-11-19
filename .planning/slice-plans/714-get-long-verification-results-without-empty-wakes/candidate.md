# Native Codex candidate

The candidate reached the worker's original exit 0 and independently
verified the terminal evidence before the due check. It still woke the
coordinator during the quiet proof window. The wait overlay fails the
zero-wake release requirement. The success journey also used 28.6% more
combined effort than its matched control.

## Comparison setting

Both success journeys used Codex 0.170.0 app-server with the Dashboard
client identity, GPT-6.2 Sol at xhigh and standard speed, and the default
cache policy. Both used fresh clones of the local bare lineage at
`fad7d53dff7cc6373a16b39969addd1538e8a5de`. The neutral task, command,
120-second fixture, 145-second due check, and worker proof guidance
(blob `604dee835f34`) matched. Both ran sequentially on the same Mac on
AC. Prelaunch loads were 4.27/5.79/8.28 for the control and
7.64/5.92/5.95 for the candidate, with 59% and 75% memory free. Cache
hits and model requests varied in the measured journeys.

The only guidance change was a Codex coordinator paragraph in the
disposable clone's delegation reference (candidate blob
`fcaed41e13860fc1617cdc21b6dbccce6fb7eccd`). It set the wait to the time
remaining to the next actual check, capped by the supported host maximum,
and called for handling earlier events when delivered. The trial left the
worker's foreground continuation in place.

## Deciding observation

Root rollout `01a1f1d4-57e5-7841-a436-32179b77ca70` records the candidate
text at line 21. Lines 47–50 show the 60-second wait and its timeout-only
result at +72.81 seconds from proof launch. The original command remained
quiet until exit 0 at +120.148 seconds. The next actual check was due at
+145 seconds. The native session instructions also advised avoiding
blocking waits longer than 60 seconds. The trace establishes the selected
duration and observed wake, with the API's maximum unmeasured.

The worker `01a1f1d4-d14e-7641-be67-39dbcbaf05d4` ran one original
command. Its run record, exit file and log agreed. A worker message
reached the coordinator at +130.91 seconds and the independent artifact
check finished at +140.49 seconds. The worker also sent its native final
response. The masked first message leaves the count of terminal handoffs
unconfirmed. The coordinator accepted the same receipt once, and its own
final response finished at +145.70 seconds. A quiet worker host-cell
handback occurred at +70.67 seconds. Its avoidability is undetermined. No
empty inner subprocess continuation reached the worker model.

| Success journey | Root units | Worker units | Combined units | Distinct responses |
| --- | ---: | ---: | ---: | ---: |
| Control | 44,752.80 | 37,382.20 | 82,135.00 | 19 |
| Candidate | 52,380.20 | 53,247.20 | 105,627.40 | 16 |

Both rows use `codex-2026-11-19` and count both agents through acceptance.
The observed increase was 23,492.40 token-index units. The comparison is
one matched success journey and gives no estimate for a complete candidate
set or a broader population.

The decisive quiet wake stopped the candidate comparison. Candidate overdue
continuation and recovery, exact assertion failure, cancellation and owned
state, and separately attributed CI action and coverage remain untested.
The [control](control.md) exercised the overdue continuation, assertion,
cancellation, and controlled exact-revision CI route. No candidate guidance
was applied to the execution checkout.
