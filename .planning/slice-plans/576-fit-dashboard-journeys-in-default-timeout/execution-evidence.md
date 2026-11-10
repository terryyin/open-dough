# Execution evidence

## Accepted probe evidence

Slice 1 is records-only; no test or runtime changed. Freshness settlement found
the selected source unchanged at `b57936969`. The coordinator inspected the
strict terminal records and existing touch geometry, deployment isolation,
retirement, and watcher signal/serving assertions. Evidence is retained under
`/tmp/seed287-probe-20261110`; each `*-run.json` carries the literal command,
times, conditions, and terminal exit; `*-proof.json` records exact selection.

- `before-all`: the six named specs at two workers passed all 41 cases;
  143.551 s shell / 143.031 s runner elapsed, load 7.24–11.33. Phone/tablet
  reading 25.725/15.667 s; deployment 13.479 s; recovery 10.329 s; policy
  repair 6.145 s. Spec sums plus hooks are separate in `before-all-times.txt`.
- `before-family-{1,2,3}`: the three watcher specs at two workers passed
  all 32 cases each. Elapsed shell 96.316/155.125/151.214 s, median
  151.214 s; runner 95.979/154.773/150.834 s. Loads 7.88→7.06,
  7.06→11.36, 11.36→17.73. Preserve this variation in the after comparison.
  C reactivation alone cost 6.003 s in run 1 and 15.155 s in run 2;
  deletion alone has not established the required ten-second family saving.
- `before-phone-cold`: phone reading alone passed, 15.760 s case,
  17.899 s runner / 18.715 s shell, load 15.35→13.53. Existing artifact
  traces measured queued origin 1.710 s, app 1.468 s, bundle 0.257 s.
  The broad phone/tablet difference does not prove ten seconds of preparation.
- `harness-costs.json`: twenty-sample medians at load about 8 were fake
  `gh` auth 33.50 ms, HTTP 37.25 ms, `git rev-parse` 13.24 ms.
  Watcher answers use static publishes, so per-answer revision caching is not
  a watcher lead. Git traces show three initial fixture source additions
  totaling 3.182/3.272/5.294 s across the family runs; copying is unmeasured.
- Hosted baseline is preserved at
  `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/open-dough-seed287-baseline.90so09xd/README.md`:
  run 42795867875 attempt 1, all twelve timing artifacts and reports.
  Slowest job 321 s; its suite step 297 s / reporter 295.014 s.
  Complete watcher sums are 390.430 s cases / 437.118 s with hooks;
  the seed's 371.737 s names four case-source groups, not the entire family.
- No earlier comparable local full-suite baseline was found. The unchanged
  two-worker baseline was owned by `/root/slice1_probe`, session `90172`:
  `caffeinate -s -i node /tmp/seed287-probe-20261110/full-suite-measure.mjs before-suite`.
  This retained wrapper measures admission separately and is reused for after.
  It has now terminated with strict failure; complete metrics are below.
  No baseline command remains live. Slice 11 now owns the final comparison.

## Unchanged full-baseline diagnosis (terminal failure)

The original two-worker run ended with nine open failures; no repair or passing
rerun is claimed. Sleep was excluded by the macOS log (latest sleep/wake Nov 7).
Load varied from below 20 to above 40; this is not by itself proof at the
story’s specified load. Runtime and test files remained unchanged during that baseline.

- Intent sort/source: setup and historical reads exhaust the case budget.
  Sort’s first A→B→A loop finishes at 25.378 s; its final review starts at
  27.220 s. Source’s publication ends at 19.600 s; historical review completes
  near 30.134 s. No stale locator or wrong selected story was established.
  A bounded next experiment is immutable clean/conflict histories once per
  worker, using existing shared fixture registration and fresh page answers;
  preserve all source, Proof, drilling, sort-fallback, and restoration checks.
- Five launch cases: publication receipt execution/refinement, second-server
  orphan, second-server non-owner, and Codex start. All advance into their
  final observations around the 30 s boundary. Second-server startup has a
  measured sequential 3.23 s that can overlap accepted-script preparation
  while retaining the held-push and non-owner assertions. Other compaction
  candidates require establishing surviving proof before removing steps.
- Origin preparation in these traces costs only 0.80–1.73 s, dashboard
  preparation 1.33–2.49 s. The launch/publication interval is 9–14 s; the
  particular slow subprocess remains unmeasured. Do not infer a shared cause
  or revive broad prewarming from these observations.
- No exact competing repair owner was established. SEED-286 and the GitHub
  Actions mapping story are now Done on trunk; other active work’s recorded
  repairs do not cover these failures. Preserve their files.
- Raw current artifacts: `dashboard/test-results/2026-11-10T11-23-08.203Z-80127/`.
  Failed artifacts are now preserved at
  `/tmp/seed287-probe-20261110/before-suite-failures/manifest.json`. The two isolated diagnosis returns are retained
  in this execution’s conversation (`baseline_failure_diagnosis` and
  `launch_failure_diagnosis`); they are static/trace findings, not repaired proof.

Two further cases failed at 20:31 Singapore time: Cursor runner helper-survival
and replacement-controls both timed out in `launchSecondHeldSession` while
polling absent `agent-launches.json` records. Artifacts end `4ef88` and `8ed50`;
the `cursor_failure_diagnosis` return now shows total case-budget exhaustion. G5 owns
these separately; no common cause with G4 is assumed. The baseline ended with nine
open failures and no repair retry. First Cursor clients settled at 22.641 and
26.197 s; the second start reached the 30 s boundary before its behavior could
run. Missing-file errors followed origin cleanup and are secondary fallout.

## Full-suite terminal measurement

`before-suite-summary.json` and `before-suite-run.json` under the evidence root
record exit 1 / strict failure: 2,577 selected, 2,567 passed, one existing
expected skip, eight timed out and one failed. Shell elapsed 4,845.851 s,
runner 4,843.154 s, admission 0.107 s separately. Summed spec time including
hooks is 9,520.5 s across 957 specs; it is not elapsed. Sampled one-minute
load ranged 5.39–44.54; no sleep/wake occurred in the run window. This does
not itself establish the specified 20–30 margin or a speedup.

The archive holds report plus nine trace/context pairs (19 files, about 29.9 MB).
Named cases: phone/tablet reading 24.705/21.035 s; retired recovery 23.663 s;
policy repair 15.578 s; pinned deployment 10.777 s. Existing allowances remained.
Reuse `full-suite-measure.mjs after-suite` for the comparable after observation,
including admission separation and moved preparation. Reassess host conditions.

## Slice 2 accepted causal and request proof

The six-spec command is retained verbatim in
`/tmp/seed287-slice2-20261110/run-focused.py` and the implementation return:
`caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-history-lifecycle.spec.ts backend-tests/intent/landed-ci-history-gaps.spec.ts tests/intent/intent-ci-proof-ancestor.spec.ts tests/intent/intent-ci-status-story.spec.ts tests/intent/intent-ci-status-story-gaps.spec.ts tests/sessions/recently-done-sessions-select-ad-hoc.spec.ts --workers=2`.
All nine selected cases passed in three consecutive invocations at retry 0:
shell 23.394/20.194/28.265 s, runner 22.835/19.629/27.706 s, load 4.58–6.91.
The coordinator inspected persisted-summary/unavailable proof barriers, stopped
collector counts, completed first proof/revisit judgment, selected branch/title,
and per-request `[linkedDoneFile]` assertions. No count bound was weakened.
Sibling history collection/scope proof, project selection, and ad hoc check/review
guards were inspected and unchanged. This is lower-load stability proof only;
G1, G2, G3, G4 and G5 remain owned. Consumer traces and strict records are in
that private evidence directory. The sole located spy consumer is an excluded
historical SEED-293 coverage report; no runtime operation changed.

## Refinement after the baseline inventory

Preserved completed slices 1/2. Source meaning is unchanged. The nine baseline
failures form three independent repair proof loops, now slices 3 (comparison
history), 4 (publication/multi-server/retry), and 5 (Cursor preconditions).
Original watcher/closure/touch/final work is now 6–9; obligations and source
allocations moved with their owners. Watcher/closure are expressed as observable
suite-behavior outcomes, with their original structural implementation retained.
PFE and result-bearing premises are in design-and-proof.md. Ready review covers
bounded experiments and their rejection/proof gates, not a repaired result.

G5 traces show first Cursor clients settled at 22.641/26.197 s; second start
work crossed the 30 s boundary, and ENOENT followed origin cleanup. Preserve
actual chosen-model scope and saved story association when using a cheaper
precondition; do not globally replace the execution helper or substitute an
unscoped client. Corresponding execution/model UI owners must be inspected
before any incidental setup is removed.

Refinement split the launch remedies by their independent proof loops: second-
server overlap (4), receipt/orphan initial acceptance/page preparation (5), and
Codex retry observation ownership (6). Cursor preparation is 7; original watcher,
closure, touch and final gates are 8–11. G4 stays interim through 3–6, G5 receives
7, and G1–G3 receive11. No completed proof or original report was discarded.

## Slice 3 bounded experiments (not accepted yet)

Focused before: all three actual primary cases passed; 20.470 s shell /
19.985 s runner. Sort’s two loops share one case (16.684 s); source variants
were 10.689/7.930 s. The earlier “both sort cases” wording was corrected;
no promise or additional test was invented to match the mistaken count.

The first worker-lifetime attempt lost the private HOME checkout, causing
three spawn-git ENOENT failures. G6 retains the original report; a private
clone precondition was restored. An initial temporary reporter loader failure
selected no tests and is not proof; instrumentation context was corrected.
The corrected worker experiment passed three cases but cost 23.800 s shell /
23.301 s runner, worse than before; clean history was built twice. No speedup
or full repair is accepted. The owner is testing the already-supported
run-artifact lifetime with immutable shared graphs and private page state.
All raw experiments remain under /tmp/seed287-slice3-20261110-2107.

## Rejected slice 3 cache approach and revised boundary

At 2026-11-10 21:45 Singapore time, the cache approach was rejected after about
38 minutes from the first focused-before record, with no numeric hard limit
supplied and no CI pause. The failed assumption was that sharing immutable
publication would reduce complete family cost without another lifecycle cost.
Paired baseline/current strict three-case passes cost 19.68/28.84 s shell
(18.989/27.654 runner), a 9.16 s /46.5% growth. Host loads were 3.83→5.74→6.82,
AC16CPUs and53–54%memory free. Case margin alone did not justify retaining it.

Exactly seven declared code paths were preserved at
/tmp/seed287-slice3-20261110-2107/rejected-cache-snapshot/manifest.json with
full source copies and a tracked patch, then reverted to791cce. Original
private preparation and publisher behavior is restored. G6 is independently
settled by this reversion and the matching paired-before exact source/Proof
observations; G4’s original budget defects remain uncorrected. Coordinator
records and all earlier delivered work were preserved. No command remains live.

The plan now selects the stronger simpler original private owner. Its next
bounded observation is one unchanged focused Git Trace2 profile to identify
actual removable cost before a new implementation choice, not another shared
history-cache variant. A fresh implementation owner resumes this same slice.

## Retained transport increment and pressure failure

The original private publisher now preserves all declared commits/authors and
publishes their chain once, removing four redundant pushes per invocation.
Three quiet primary runs passed3/3 each; thirty additional affected specs
passed39/39; typecheck and independent refactor were clean. Median primary
shell19.225s versus paired unchanged19.680s is variable evidence, not a precise
speedup claim. No setup moved out of elapsed. Full details, literal commands,
consumer dispositions and phase traces: /tmp/seed287-slice3-publisher-profile-20261110.

Root’s bounded CPU-pressure check began at load20.38 and ended32.04, overshooting
the declared upper profile. Sort and clean-source timed out; conflict passed
29.667s. It stopped after that one failure, with no retry; all20owned work threads
terminated. Raw proof/log/host samples and wrapper are under
/tmp/seed287-slice3-pressure-20261110 and /tmp/seed287-source-pressure.mjs.
This is not a successful20–30 observation and does not close comparison repair.

Independent original watcher/closure/touch work is now3–5; remaining launch/
Cursor corrections6–9; comparison10; final11. G4 stays interim6,7,8,10, G5receives9,
G7 remains a return in slice 10. Every reported failure stays owned. Reordering changes no goal,
assertion, timeout or story priority. The one-file transport cut is kept as a
validated partial increment with comparison still planned.

## Trunk watcher restart allowance

Trunk `2a2038247e649076fe78c11ec091fcb08ac5f218` (outside the claim ancestry)
adds a 90 s restart/SIGINT allowance after hosted run42781560636 spent27.3s
on real install/build; the comment cites sibling activation32.1s. It names
SEED-287 removal. No runtime behavior changes. Current branch/default30 and
the detached baseline exclude that allowance; their proof remains local.
G8 assigns integration/removal and hosted default margin to final slice11.

[Watcher attempt, parked compatible changes, fault proof and current ownership](watcher-evidence.md)
retain the subsequent split: behavior3, source-ingestion4, closure5, touch6,
launch/Cursor7–10, comparison11 and final12. Earlier numeric mappings above
are retained attempt history; current PLAN/source-review allocations govern.

## Corrected comparison-profile decision before slice 11

The old20-worker controller observed load32.04, outside the source20–30
profile. The new finite adaptive16-worker controller already established valid
20–25.571 on touch. The strongest simpler first check is therefore the retained
one-push private publisher at the corrected profile, before adding more code.
This is a changed-condition observation, not an unchanged failure retry. If
all three source/sort cases fit with margin, keep the existing cut/proof only;
otherwise profile the failed actual phase before another supported in-owner
cut. Preserve private Git, source/Proof/sort promises and prior rejected cache
evidence. No source scope, evaluation or failure obligation changes.
