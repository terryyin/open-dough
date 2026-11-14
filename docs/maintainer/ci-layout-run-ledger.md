# CI layout run ledger

Exact-attempt observations for the [prospective comparison](ci-layout-measurements.md).
All old-workload runs below are retained history and cannot fill replacement
workload blocks. Per-run JSON Lines records retain exact per-job timestamps and proof. Each
line is one typed `run`, `proof-entry`, `job` or `artifact` record; parse lines
independently as JSON. The `run` record includes the source manifest hashes,
which stay unchanged when the evidence format changes.

## Original workload history

Raw acquisition root: `/tmp/seed350-ci-layout-20261114`. The pre-dispatch
protocol copy, matching before/after run lists and load snapshot are retained
there. All initial visible runs were completed; account-wide load is unknown.

| Arm / block / context | Revision | Run / attempt | State | Initial / total | Created UTC | Last completion / seconds | Proof / load |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B1 / original solo acquisition | d21aaf78c | [43564792953](https://github.com/terryyin/open-dough/actions/runs/43564792953) / 1 | success | 21 / 22 observed | 2026-11-14 06:07:38 | 06:13:17 / 339 s | all 20 parts present; only this run active in repository view |
| C1 / original operational push | 5ad4219c | [43566037079](https://github.com/terryyin/open-dough/actions/runs/43566037079) / 1 | failure | 20 / 21 observed | 2026-11-14T06:22:41Z | 2026-11-14T06:27:43Z / 302 s | all 19 parts present; budget failure, ineligible |

Keep exact per-job creation/start/completion timestamps, setup, launch offsets,
selected identities and artifacts for every attempt, including unsuccessful
ones. Count only acquired jobs when reporting an observed total; declared
counts above remain predictions until the completed inventory confirms them.

Allocation proof before candidate dispatch: the real discovered 644 check
identities deal as 159/161/161/163 at four shares and 216/214/214 at three.
Sorted unions are equal, with every identity appearing exactly once in either
allocation (`selection-4-vs-3.json` at the raw root). The supported four-check
workflow/proof command in the plan passed on the unchanged baseline under
Bash 5 and `caffeinate -s -i` on AC, exit 0.

## First exact-attempt acquisition

B1 succeeded with 3,596 runner-seconds, maximum job queue 78 s. Its proof
job was created 06:12:52Z, started 06:12:55Z and completed 06:13:17Z:
all 3 s of proof queue plus its 22 s execution remain inside the 339 s verdict.
The 58 listed, unexpired artifacts were all downloaded (20 fragments, 20 time
reports, 16 Playwright reports, summary and frontend proof). Summary metadata
matched repository, SHA, run and attempt, schema validation passed, and every
declared part was present with none missing or ambiguous.

| Entry | Unit / parts | Passed / failed / other | Reported files |
| --- | --- | --- | --- |
| e2e | case / 6 | 561 / 0 / 1 | 307 |
| dashboard/tests | case / 5 | 627 / 0 / 0 | 275 |
| dashboard/frontend-tests | case / 1 | 161 / 0 / 0 | 62 |
| dashboard/backend-tests | case / 4 | 1455 / 0 / 7 | 434 |
| Distribution | file / 4 | 643 / 0 / 0 | 643 |

All 2,812 browser case identities were extracted from the HTML reports’ embedded
report.json, with no duplicated group/file/project/title/path identity: 562 E2E,
627 integrated, 161 frontend and 1,462 backend. Their outcomes were 2,804
expected and eight explicitly skipped (one E2E, seven backend), matching all
eight summary “other” outcomes; none was unfinished or unexpectedly failing.
These existing skips are retained as observed outcomes, not invented passes.
The Distribution entry covers 643 check files; the 644th discovered check is
`scripts/check-self-installation.sh`, outside that declared Intent entry.
The real allocation union still preserves all 644.

Reproduction/acquisition commands: `gh api repos/terryyin/open-dough/actions/runs/43564792953`,
`gh api repos/terryyin/open-dough/actions/runs/43564792953/attempts/1/jobs --paginate`,
`gh api repos/terryyin/open-dough/actions/runs/43564792953/artifacts --paginate`,
and `gh run download 43564792953 --repo terryyin/open-dough --dir DEST`.
Read the attempt-named summary with the maintained `summaryProblems` validator;
check each evidence part’s status independently of the green summary job.
The per-job epochs and setup-step timings are retained in B1-measurements.json
at the raw root; case identities and complete artifact inventory are alongside it.

Local trial preparation changes only the Distribution matrix/declaration and
the proof replay test’s expected missing-part count. With only the YAML edit,
ci-proof-actions.test.mjs failed on its obsolete fourth missing part; the
expectation was adapted to three. The four named contract checks and the reached
test-runner-deadline-cutoff.test.mjs then passed under supported Bash 5, AC
and `caffeinate -s -i`. No test, timeout or budget was removed or relaxed.
At that initial preparation boundary, hosted candidate proof and matched
comparisons were pending; the later attempts below retain their actual outcomes.


## Failed original candidate retained

C1 used 3,715 runner-seconds, maximum job queue 40 s and a 302 s complete
verdict. Its shorter elapsed time establishes no win: three Distribution
execution steps failed budgets. The [diagnosis and concrete repair](ci-budget-calibration.md)
account for every failure. All 56 artifacts were acquired, reusing the already
downloaded summary and three time reports. Exact summary identity, all declared
parts, producer units and all 644 check identities were retained. The 2,812
browser case identities and every expected/skipped outcome exactly match B1.
No selected check, case or proof was discarded to obtain the shorter run.

Durable exact-attempt records: [B1](ci-layout-evidence/43564792953-attempt-1.jsonl)
and [failed C1](ci-layout-evidence/43566037079-attempt-1.jsonl). They retain each
job’s created/start/completion epochs and setup steps, artifact ids/digests,
proof counts and hashes of the acquired case/check manifests. The old pair
consumed one manual run plus one operational push: 7,311 runner-seconds is not
used as an acceptance metric.

## Replacement workload observations

The fixed pair is B `3cc1495fa` / C `567f05894`; old observations above
do not fill these blocks. The replacement operational push is excluded from
paired timing by the prospectively recorded event rule. New manual budget
usage starts separately, with the original manual run included in total cost.

| Block / episode / arm | Run / attempt | Event / state | Created UTC | Last completion UTC | Whole seconds | Initial / total jobs | Proof / identity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| operational / C2 | [43568511716](https://github.com/terryyin/open-dough/actions/runs/43568511716) / 1 | push / success | 2026-11-14T06:53:33Z | 2026-11-14T06:58:39Z | 306 | 20 / 21 | 19 complete parts; 645 checks, 2,828 cases / 8 skips |
| 1 / solo / B | [43569186551](https://github.com/terryyin/open-dough/actions/runs/43569186551) / 1 | dispatch / success | 2026-11-14T07:02:26Z | 2026-11-14T07:07:04Z | 278.0 | 21 / 22 | 20 complete parts; identities/outcomes equal C2 |
| 1 / solo / C | [43569922399](https://github.com/terryyin/open-dough/actions/runs/43569922399) / 1 | dispatch / success | 2026-11-14T07:11:36Z | 2026-11-14T07:18:04Z | 388.0 | 20 / 21 | 19 complete parts; roster/outcomes match; background confounded |
| 1 / mixed / C | [43570694173](https://github.com/terryyin/open-dough/actions/runs/43570694173) / 1 | dispatch / success | 2026-11-14T07:21:08Z | 2026-11-14T07:26:17Z | 309.0 | 20 / 21 | 19 complete parts; roster/outcomes/workers match |
| 1 / mixed / B | [43570694743](https://github.com/terryyin/open-dough/actions/runs/43570694743) / 1 | dispatch / success | 2026-11-14T07:21:09Z | 2026-11-14T07:31:15Z | 606.0 | 21 / 22 | 20 complete parts; roster/outcomes/workers match |
| 1 / BB / launch 1 | [43571554647](https://github.com/terryyin/open-dough/actions/runs/43571554647) / 1 | dispatch / success | 2026-11-14T07:32:13Z | 2026-11-14T07:38:22Z | 369.0 | 21 / 22 | 20 complete parts; roster/outcomes/workers match; background exposure |
| 1 / BB / launch 2 | [43571566922](https://github.com/terryyin/open-dough/actions/runs/43571566922) / 1 | dispatch / success | 2026-11-14T07:32:21Z | 2026-11-14T07:40:30Z | 489.0 | 21 / 22 | 20 complete parts; roster/outcomes/workers match; background exposure |
| 1 / CC / launch 1 | [43572273020](https://github.com/terryyin/open-dough/actions/runs/43572273020) / 1 | dispatch / success | 2026-11-14T07:41:28Z | 2026-11-14T07:45:38Z | 250.0 | 20 / 21 | 19 complete parts; roster/outcomes/workers match |
| 1 / CC / launch 2 | [43572284040](https://github.com/terryyin/open-dough/actions/runs/43572284040) / 1 | dispatch / success | 2026-11-14T07:41:37Z | 2026-11-14T07:49:40Z | 483.0 | 20 / 21 | 19 complete parts; roster/outcomes/workers match |

Exact per-job queues/setup/epochs and artifact identities are linked per run
in `ci-layout-evidence/`. Account-wide competing load remains unknown.

## Worker observations

All 16 browser reports in operational C2 and replacement B solo explicitly
record `metadata.actualWorkers: 4`. Per-artifact values are retained in each
run metadata record. Distribution runs the unchanged CI rule of one slot per
`getconf _NPROCESSORS_ONLN`, with no workflow override; the resulting count is
not emitted in retained successful logs. Its actual slot value is unobserved,
not established by an ubuntu label. Preserve this visibility limit, check
each browser arm and reject any observed worker mismatch as a layout effect.

The [shared fixed-workload roster](ci-layout-evidence/workload-3cc1495fa/index.jsonl)
retains source B run 43569186551/1 at 3cc1495fa: exact 2,828 case identities/outcomes
and 645 checks in 20 existing producer/part partitions. These baseline partitions
are provenance, not an allocation rule. Every matched run verifies the whole
case/check union and references its hashes; candidate counts may differ.

## First replacement solo comparison limit

B was 278 s; C was 388 s (+110 s). Both succeeded with all declared proof,
the exact shared 645-check / 2,828-case roster and unchanged outcomes; all
16 C browser reports also recorded four actual workers. This is no passing
comparison. C’s proof job 132372925900 was created at 07:15:55Z, queued
until 07:17:51Z and completed at 07:18:04Z. All 116 s of queue remain in
its verdict. Another execution’s [run 43570259168](https://github.com/terryyin/open-dough/actions/runs/43570259168)
started at 07:15:43Z on `claude/run-native-a-b-comparisons-on-examples-from-real`.
The initial C snapshot was empty, but the later observed overlap is unmatched
to B and limits causal attribution. The candidate is unkept; the queue is
neither subtracted nor declared a layout-caused regression.

The first mixed pair was created C at 07:21:08Z and B at 07:21:09Z:
C led by one second. Its helper encountered HTTP 502 on one status read and
exited without a verdict. A supported watch of that exact run recovered
terminal success; no CI rerun or extra dispatch occurred. The failed helper
and recovery are retained as acquisition evidence in the C record. The helper
read failure changes neither the run’s exact timestamps nor its CI verdict.

The completed mixed pair was C 309 s / B 606 s (raw C−B = −297 s).
B’s largest queue was 410 s. Both rosters, outcomes, proof completeness and
observed browser workers match. The one-second C launch lead and strong
ordinal queueing prevent a causal layout-win claim from this single pair.
The separate BB/CC episodes, both verdicts and their creation offsets remain
necessary; this diagnostic does not replace equivalent-load comparison.

[Background run 43570857781](ci-layout-evidence/background-43570857781-attempt-1.jsonl)
has exact attempt-job evidence: 21 of its jobs ran during the mixed episode,
from 07:23:44Z onward; its final browser jobs continued through 07:32:56Z.
That also overlaps the start of BB. A run-level “queued” label did not mean
its jobs consumed no runners. Retain this actual third-workflow exposure
as a comparison limit rather than attribute all B queueing to layout/ordinal.

BB completed at 369 s and 489 s by launch position, with an 8 s creation
offset. Its full episode ran 497 s from first creation to final verdict.
Both runs retain complete proof and matching selected identities/outcomes,
with four actual browser workers in every shard. The background workflow
active during BB’s beginning limits comparison with a later quieter CC episode.

CC completed at 250 s and 483 s by launch position,
with an 9 s creation offset and 492 s episode elapsed.
Against BB this is −119 s / −6 s by launch position and −5 s for the episode,
with known unmatched background exposure. It is descriptive, not a passing
no-worse conclusion. The polling helper received SIGTERM (exit 143) before
reporting the second verdict; an exact-run read recovered its actual terminal
success. Cause of helper termination is unestablished. Both outcomes remain
separate in the evidence; no CI rerun or replacement dispatch occurred.

## Block-1 boundary and retained cost

The replacement collection block contains eight manual runs, all successful
with complete proof and the shared fixed-workload roster. Solo and mixed/BB
background exposure prevent an unqualified matched comparison. Three repeated
screening blocks and five passing blocks have not been observed; no candidate
is kept and slice 1 remains unfinished. Stop before block 2 under the current
protocol; the separate proposed campaign is awaiting developer decision.

Retained cost: eight replacement manual runs plus one original manual run
(overall nine of the active 41-manual ceiling), plus two operational pushes:
11 owned workflows, 236 physical jobs and 40,641 runner-seconds.
The original failed workflow remains failed history. Whole-workflow queues
remain in each verdict; runner-seconds are a separate cost diagnostic.
