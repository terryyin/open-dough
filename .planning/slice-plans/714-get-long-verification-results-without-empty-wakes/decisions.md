# Long verification trial decisions

## Codex release

**Do not deploy.** Keep the current coordinator wait guidance. The candidate
verified the worker's original exit 0 before the +145-second due check. Its
60-second wait still woke the coordinator at +72.809 seconds, while the quiet
proof was running. It used 105,627.40 combined token-index units through
acceptance, up 28.6% from 82,135.00 in the matched control. The quiet wake
decided the comparison. The candidate's overdue, cancellation, and CI routes
remain untested. [Control](control.md) and [candidate](candidate.md).

## Claude Code follow-up

**Drop the Claude Code trial.** The retained native evidence shows one
separable cache-crossing measurement and a warm coordinator. It provides
insufficient evidence to fund a separate trial. This decision rests on
Claude Code's own retained observations.

| Observation | Result |
| --- | --- |
| Original worker | In Claude Code 2.1.327 family `47460e10-ccb0-41b1-abd2-286a85d35572`, worker `a060cb29e175aa014` launched one background command with serial baseline and current whole-group runs at 19:00:13 UTC on 2026-11-18. Its two resumed requests at 19:07:25 and 19:14:03 created 67,327 and 68,407 five-minute cache tokens with zero cache reads. The native completion arrived after 825.306 seconds. The worker read the exact run's terminal evidence and handed back its report. The launch, wakes, terminal observation, and handback are in worker transcript lines 73, 157–170, 178, and 189. |
| Possible alternate owner | The coordinator had a warm one-hour cache and read the worker's report from the same story checkout. Its two observed requests read 309,845 and 311,116 cached inputs. The root transcript records the launch handback at lines 1809–1812 and the final acceptance after the worker's report at lines 1828–1841. Comparable access to the worker's separate baseline checkout and authority to launch and own the exact paired proof were unestablished. |
| Repeat opportunities | A scan of the root transcript and 20 retained workers found three explicit background Bash proof launches. The selected command's two wakes belong to the same paired verification. Workers `a4dc0cdb87f7d7423` and `a62081c14448cc446` resumed with cache reads after 125.036 and 47.015 seconds at lines 211–220 and 140–149, respectively. Neither supplied a second cache-crossing paired comparison. The retained sample provides one historical eligible workload shape and zero established repeat opportunities for an authorized alternate owner. |

The maintained standard-speed `claude-2026-11-15` card prices both owners in
Claude Opus 5.5 input-token equivalents. The two cold worker requests cost
173,300.50 units. The two observed warm coordinator requests cost 45,703.05
units, including receipt and rereading overhead from that owner's existing
role. The retained request totals from launch to the coordinator's initial
acceptance decision are 305,765.70 worker units and 45,703.05 coordinator units.
The totals cover 21 retained requests. Auxiliary usage and idle wakes are
unattributed. A transfer would add its own launch, handoff, reread, and terminal
acceptance effort. Their cost and continued cache warmth under reassignment
are unknown, so the gap between the observed owner costs supports no net
savings estimate. [Versioned rate card](../../../dashboard/server/usageTariffs.ts).

Even a trial bounded to one matched baseline/current comparison per owner
would spend two paid arms and repeat the two-run verification in each. The
observed workload took about 14 minutes for one pair. With zero established
repeat opportunities, the conservative credited saving is zero against that
positive trial cost. The historical saving remains unknown. The product
backlog gains no Claude Code trial on this disposition.
