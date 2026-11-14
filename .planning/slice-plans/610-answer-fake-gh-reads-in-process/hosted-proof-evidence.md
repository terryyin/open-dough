# Historical published progress and hosted proof

The unfinished slice2 increment265635d945cf11c8786dbe7476016c0a541f06f5 was
accepted on the recorded execution branch, suffix base92613de41c977d5c82cfd7ce7093005b0150eb6f.
No rewrite or trunk publication occurred. Receipt:
`/tmp/seed332-slice2-progress-delivery-attempt5.json`. All89owned paths committed
through normal formatting, staged whitespace, hook lint and dashboard typecheck.
The plan stayed planned; all125source promises and16open returns were preserved.

## Exact accepted attempt

The retained observer2aAGk3 registered265635d9. Its owned await-revision command
17535 reached terminal0; `/tmp/seed332-slice2-progress-ci-await.json` reports
exact success for [run43542287307, attempt1](https://github.com/terryyin/open-dough/actions/runs/43542287307)
at that full SHA and execution-branch target. All18jobs succeeded: thirteen
dashboard shards, three repository shares, lint and CI proof. This is execution
branch evidence, not trunk integration or execution completion.

The actual schema2 CI summary names the same repository/run/attempt/revision.
Browser journeys1336passed/1other, frontend63passed, backend1387passed/7other:
2786passed/8other overall. All13parts are present in each dashboard entry;
all27loaded files/67cases passed. Repository proof has292test files plus336skill
files passed across three parts, with no failures or missing parts. Case counts
and file counts are different units and are not added together.

The eight others match the baseline exactly: three macOS notifier-tool cases,
four separate-node-pty-helper cases whose helper is absent on Linux, and the
explicit opt-in sessions measurement. Inspected skip predicates remain unchanged.
The three platform/helper sources passed all9cases in the retained macOS full;
its sole skip was the opt-in measurement. No skipped measurement is claimed
observed. Equivalent functional session proof remains in the consumer mapping.

## Retained measurements and comparison

Baseline [run43336803436, attempt1](https://github.com/terryyin/open-dough/actions/runs/43336803436)
names15377f89304821fdb8bc29c71b45e1d30926e0a7. GitHub connector downloaded all
thirteen timing ZIPs and both CI summaries; every archive's GitHub SHA256 and
ZIP integrity matched. Retained bytes and metadata:
`/tmp/seed332-hosted-baseline/`, `/tmp/seed332-hosted-proof/`.
Connector job summaries omit timestamps, so documented `gh run view RUN_ID
--repo terryyin/open-dough --json jobs` supplied both complete18-job records at
`/tmp/seed332-hosted-{baseline,candidate}-jobs.json`.
`/tmp/seed332-hosted-comparison.json` retains every per-spec pair, counts,
added/retired paths and exact shard measurements.

The workflow file is byte-identical between baseline and candidate: thirteen
shards, CPU-derived workers,180s prerequisite/320s total deadline and six-minute
job bound remain. Playwright still uses availableParallelism() in CI, retries0
and the default30s case budget. Its only configuration delta is the separately
accepted disable-smooth-scrolling browser argument, another comparison confound.
No runner headroom, controlled speedup or transport-only causal saving is inferred.

| Shard | Browser step baseline/current seconds | Whole job baseline/current seconds |
| --- | --- | --- |
| 1 | 209 / 160 | 237 / 182 |
| 2 | 235 / 207 | 256 / 233 |
| 3 | 243 / 161 | 264 / 181 |
| 4 | 205 / 165 | 235 / 201 |
| 5 | 196 / 159 | 220 / 180 |
| 6 | 276 / 240 | 300 / 266 |
| 7 | 225 / 206 | 247 / 230 |
| 8 | 199 / 169 | 221 / 191 |
| 9 | 160 / 183 | 180 / 210 |
| 10 | 189 / 190 | 208 / 217 |
| 11 | 263 / 190 | 293 / 212 |
| 12 | 238 / 194 | 273 / 223 |
| 13 | 174 / 164 | 198 / 186 |

Per-spec seconds below sum test durations and executed beforeAll/afterAll hooks,
not a single case or elapsed shard wall time. A dash means absent at that path.
Case columns expose moved/new workload rather than equating different files.

| Loaded spec | Cases baseline/current | Seconds baseline/current |
| --- | --- | --- |
| landed-ci-adapter-repeat-comparability.spec.ts | 17 / 17 | 99.5 / 90.6 |
| landed-ci-adapter-repeat-rejections.spec.ts | 10 / 10 | 88.9 / 72.3 |
| landed-ci-adapter-repeat.spec.ts | 4 / 4 | 19.4 / 14.9 |
| landed-ci-automatic-repeat.spec.ts | 4 / 1 | 9.7 / 4.1 |
| landed-ci-collector-lifetime.spec.ts | — / 1 | — / 4.8 |
| landed-ci-repeat-accepted-request.spec.ts | 1 / 1 | 3.1 / 2.7 |
| landed-ci-repeat-admission.spec.ts | 3 / 3 | 11.2 / 9.7 |
| landed-ci-repeat-eligible-receipt.spec.ts | — / 2 | — / 4.8 |
| landed-ci-repeat-reconciliation.spec.ts | 4 / 4 | 25.1 / 13.2 |
| landed-ci-repeat-verdict.spec.ts | 1 / 2 | 2.9 / 2.4 |
| landed-ci-server-lifetime.spec.ts | — / 1 | — / 0.9 |
| start-origin-isolation.spec.ts | 3 / 3 | 10.2 / 10.5 |
| intent-ci-comparison-drilldown-relative.spec.ts | 1 / 1 | 15.9 / 8.4 |
| intent-ci-follow-up-custom.spec.ts | 1 / 1 | 9.7 / 8.1 |
| intent-ci-follow-up-proof.spec.ts | 1 / 1 | 4 / 4.3 |
| intent-ci-follow-up-return.spec.ts | 2 / 2 | 14.8 / 11.3 |
| intent-ci-follow-up.spec.ts | 1 / 1 | 9.3 / 5.8 |
| intent-done-default-answer-selection.spec.ts | 1 / 1 | 11.3 / 8.6 |
| intent-project-scope-timing-refresh.spec.ts | 2 / 2 | 22.4 / 13.2 |
| intent-scope-collected-file-timing-gaps.spec.ts | 1 / 1 | 20.1 / 12 |
| intent-scope-collected-file-timing-history.spec.ts | 1 / 1 | 21.8 / 15.4 |
| intent-scope-collected-timing-history.spec.ts | 1 / 1 | 18.5 / 13.3 |
| intent-scope-glance.spec.ts | — / 1 | — / 6.6 |
| intent-scope-prior-build-states.spec.ts | 1 / 1 | 12.6 / 7.8 |
| intent-story-changes-landed-run.spec.ts | 2 / 2 | 22.8 / 15.1 |
| intent-summary-story-comparison-sort.spec.ts | 1 / 1 | 10.8 / 12.3 |
| recently-done-ci-automatic-repeat.spec.ts | 1 / 1 | 8.5 / 6.9 |

Actual timed files rose1015→1044:31added paths and two retired paths. Dashboard
cases rose2717→2794, preserving the same eight conditional/opt-in skips. Added
work includes transport/native contracts, collector/server lifetime, real Git
history, scheduler/staging tests and accepted session/history UI coverage.
Automatic-repeat4→1, verdict1→2 and new eligible-receipt2 retain their compound
journeys across paths; canonical glance replaces prior-build-average. The other
retired scroll-completion source was explicitly removed by SEED-300's f806ed7b:
Terry accepted instant programmatic reveals, making its in-motion-only scenario
obsolete. The done-reference source independently gained a disclosure case3→4.
Neither difference is an in-process transport effect or a timing match.
The JSON retains all31additions/two retirements and ten changed file-case counts.
These different workloads, shard assignments, browser configuration and runners
prevent attributing the observed durations solely to this change.

## Earlier handoff acceptance

Hosted proof and timing comparison are observed; three consecutive local family
passes at natural CPU-bound load30–50 are not. A fresh published-source host
snapshot at01:50:45UTC recorded load5.24,69%free memory, AC100%,81.85%idle.
No burner or artificial contention was used and no loaded test was admitted.
Earlier original failure/stability judgment remains open under the project's
[failure policy](../../../AGENTS.md#failing-and-flaky-tests); green diagnostic and
hosted runs do not waive it. G12alone remains proved, other16returns open.
The developer may amend the source evaluation or retain it for a qualifying
natural window; silence and retry instructions are not such an amendment.
Preserve the execution branch/worktree and existing SEED324/334ownership.
No done mark, retrospective, wrap-up, trunk integration or retirement is inferred.

Terry's later2026-11-14 priority direction and the [controlled conclusion](controlled-conclusion-evidence.md)
supersede this earlier waiting gate. The actual136/136controlled pass and final
resource/input/cleanup audit settled the original load/functional gaps. Accepted
SEED334 subsequently changes the applicable final profile as recorded below.

## Current accepted profile and open receiving CI

Accepted main0dd89b9ce includes SEED334's E2E6/integrated5/frontend1/backend4;
subsequent accepted main3069e8b47 raises repository Node shares3→4:
16browser shards plus4Node shares, lint and proof-summary (22concrete jobs).
The four current commands/settings remain separate; CPU-derived CI workers,
local default2/local production cap1, default30s/retry0,180s prerequisite and
320s total job-start deadlines within6minutes remain. See
[main-composition evidence](main-composition-evidence.md) for actual current
receiving proof and the fresh source qualifiers056/056.1/056.2.

The13-shard tables above describe only exact265635d9/run43542287307/attempt1
against baseline15377f89. They remain valid historical measurements; neither
static16-job selection nor backend59/E2E26receiving passes are a new hosted pass.
Current composed-revision CI has not been observed. PLAN610 G18 owns clause060,
`require the changed suite to pass`, in planned slice2. Publish progress and
observe its exact final applicable CI through the root-owned stream; no
completion, clean final CI or restored obsolete layout is claimed here.
