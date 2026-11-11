# Design and proof basis

## Architecture and reuse

PFE: the responsibility is “keep dashboard journey proof inside the default
budget under load without dropping promises.” Existing owners are the named
Playwright and backend journey homes in the story's proof locations. Reuse and
change those journeys and their shared harnesses; do not add a parallel suite,
raise permanent deadlines, or invent a second proof of the same promise.

No consequential product architecture choice: this is test-suite and harness
optimization within the existing dashboard runtime and reporting boundaries.
No new North Star topic. Accepted ADRs are not implicated beyond ordinary
test-data and flaky-test rules already in `AGENTS.md`.

Common rule: one proof loop per promise at the cheapest honest boundary; share
live setup across consecutive assertions; wait on causal settlement, not the
clock; measure family and suite elapsed separately from summed case time.

## Outside-in proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| Remaining history/request/navigation races wait at their causal boundary | 2: focused specs for remaining reproductions pass three consecutive times under comparable load |
| Watcher failure keeps one live deployment; restart owns SIGHUP; retained lifecycle proof | 3: failure + restart (+ policy) journeys pass; standalone C reactivation gone; preservation and actual fault detection |
| Repeated full-source ingestion reduced; family ≥10 s faster median including first preparation | 4: one existing run-owner snapshot experiment; full-source consumers/isolation; comparable original vs changed complete family |
| One full retired closure; recovery variants at CLI/HTTP/store; covered browser steps gone | 5: quiet closure + reporting-boundary specs cover promises; recovery journey shortened; three consecutive focused passes |
| Touch reading fits default 30 s; allowance removed | 6: touch reading case under load 20–30 on 2 workers; `setTimeout` gone; reading proof retained |
| Harness costs the probe still supports cut without moving unpaid work out of suite elapsed | 6: focused first-in-worker / fake-`gh` / prep changes as selected; suite elapsed includes moved prep |
| Named allowances removed; suite and slowest shard within previous elapsed; shard weights refreshed | 13: allowances gone after fit; local comparable suite and hosted slowest shard; weights from all 12 artifacts of a complete passing trunk run |

## Original preparation premises (history)

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Touch reading case still carries a 60 s case-local allowance and heavy pane-reading strokes | Slice 6 remove allowance / cut gestures | Read `dashboard/tests/review/story-review-touch.spec.ts` and `dashboard/tests/support/storyReviewTouchJourney.ts` at `673002452f18b7fc7a9427f7a6db662b63c8b0b7` | Settled: `test.setTimeout(60_000)` with SEED-287 comment; journey reads wide line end and back via `readCodePartByTouch` |
| Retired closure recovery still carries a 120 s allowance and combines real Git retirement with unavailable receiver, write fault, and lost ack in one browser journey | Slice 5 consolidation | Read `dashboard/tests/sessions/agent-completion-recovery.spec.ts` at that revision | Settled: `test.setTimeout(120_000)` with SEED-287 comment; one test owns retirement + three recoveries + restart |
| Quiet Land / Story Branch Wrap Up / Trunk Wrap Up already retire real accepted work before installed quiet reporting | Slice 5 reuse Wrap Up | Read `dashboard/tests/sessions/agent-completion-quiet.spec.ts` at that revision | Settled: three closure variants already exercise real retirement + quiet reporting |
| Reporting-boundary backend already covers quiet Done prerequisites and unavailable-receiver reporting-only recovery | Slice 5 move variants | Read `dashboard/backend-tests/sessions/agent-completion-quiet-closure.spec.ts` at that revision | Settled: boundary test uses `unavailableCompletion` and Done/landing/readable-closure rules; full retirement stays in quiet/recovery |
| Failure journey currently stops the live C deployment with SIGHUP, starts a new watcher, then runs failed candidate/restoration | Slice 3 move SIGHUP / keep one deployment | Read `dashboard/tests/runtime/production-watcher-failures.spec.ts` (unavailable-origin + SIGHUP through failed restoration) at that revision | Settled: SIGHUP ends the watcher mid-family; post-hangup start is a separate watcher before D |
| Restart journey already proves restart from current main with same runner/client and SIGINT end | Slice 3 attach SIGHUP | Read `dashboard/tests/runtime/production-watcher.spec.ts` restart test at that revision | Settled: restart path exists without SIGHUP quiet-exit proof |
| Policy-repair and production-deployment still carry temporary allowances | Slice 13 remove after fit | Read `dashboard/tests/runtime/productionUpdatePolicies.ts` and `dashboard/backend-tests/runtime/production-deployment.spec.ts` at that revision | Settled: 60 s and 45 s `test.setTimeout` respectively |
| Which 2026-11-09 harness leads (start-origin/app prep, fake `gh`/`rev-parse`, fixture Git volume, touch strokes) still dominate under current load | Slices 3–6 experiment choice | Cheap: seed + code presence above. Unpaid load timing of the named families under comparable workers/cache/load is not observed in this preparation | Open: early probe slice 1 must record which leads still show material cost before dependent harness cuts; failure revises slices 3–6 |

## Reuse choices for execution-owned repairs

PFE searched the dashboard, shared builders and comparison/runtime boundaries.
Canonical/current-client setup preserved every observation in three whole
comparisons, touch4/4, consumers23/23 and independent Git1/1. Full CLI remains
in source. Worst local sort body is about29.020 s, leaving about .980 s.
Removing704 payload files then failed30.265 s; removing four planning-padding
commits passed once with about .990 s headroom but established no useful gain.
Both cuts are parked/discarded, including their provisional data changes.

Reuse the exact preservation-validated nine-path canonical variant with full
payload and all planning history. Its real MakeMe/commitDeclaredRevision
precondition, private HOME, shared facts and serving preserve every observer;
no new graph engine, cache, owner, lifetime or API is needed. Existing full-CLI
CI-cue coverage also remains unchanged. Source supplies no additional numeric
margin threshold. Current local evidence alone leaves the qualitative margin
judgment unsettled; obtain actual hosted case proof of this validated increment
before adding more implementation or changing proof boundaries.

Slice12's remaining bounded operation is independent refactor, guarded progress
publication with G7 open, then exact applicable branch CI and actual case
observations. Passing count alone is insufficient; all local timing qualifiers
remain visible. Settle from the combined evidence or return the specific needed
human decision. Final13 retains broader/named/full/local/trunk gates. See
[comparison proof](comparison-default-evidence.md).

Launch orchestration reuses `agentLaunchBoundary.ts`, existing acceptance and
settlement observations, and `startDashboardServer`; native/publication behavior
stays in its existing owner. Cursor preparation can reuse the real launch
boundary and `runningCursorSessionsPage.holdSession` concepts, but its ad hoc
unscoped form is not a direct replacement for the chosen-model scope and saved
story association. Preserve those real scope facts with canonical MakeMe data;
keep `startScopedCursorExecution` for siblings whose subject is execution/model
UI. No production caching, timeout increase, new scheduler or parallel suite.

## Updated decisive observations

| Premise / consumer | Current observation / bounded operation |
| --- | --- |
| Original harness-cost leads, slices 3–6 | Probe 1 completed: touch gestures and duplicate watcher/closure work remain supported; origin/app preparation about 3–4 s and fake-gh HTTP 37.25 ms at lower load do not establish dominance. Static watcher answers rule out per-answer branch-tip caching. See execution-evidence.md. |
| Comparison publisher, slice 11 | Immutable-lifetime experiments added cost (paired19.68→28.84s) and were reverted. Worker readiness still failed sort30.852s under valid load; the Git diagnostic ruled out history-answer batching. The approved canonical attempt still failed and is parked. New valid-pressure client timing supports the single transport experiment in11; comparison-evidence.md and transport-evidence.md retain all proof limits. |
| Launch preparation, slices 7–9 | Trace shows 9–14 s installed start/publication and 3.23 s sequential second-server startup. Origins 0.80–1.73 s and dashboards 1.33–2.49 s do not establish prewarming as the remedy. Start with overlap; preserve independent observations before any compaction. |
| Cursor preconditions, slice 10 | First clients actually settled at 22.641/26.197 s; second start crossed the case deadline. ENOENT followed cleanup. The bounded cheaper-precondition experiment must retain real clients, model scope and board association; no missing-store repair is justified. |
| Full local comparison, slice 13 | Captured strict-failing baseline 4,845.851 s shell / 4,843.154 s runner, admission separate; variable sampled load 5.39–44.54. Preserve failures and qualify comparability; rerun only for a stated changed-condition hypothesis, never until green. |

## Original CI evidence from the seed

Captured 2026-11-10; retained verbatim from the selected seed’s evidence section.


The two most common observed patterns were state or request assertions made
while asynchronous work was still settling (11 jobs) and exhausted time
budgets (11 jobs). Ten of the latter were dashboard case or shard deadlines
and one was a native job ceiling. The dashboard accounted for 34 of the 45
failed jobs whose logs were available. Among the other 23 jobs were two
collector lock failures, two process leaks, one infrastructure setup failure,
and 18 other dashboard, native, or lint failures. Two more failed runs had no
failed job exposed. [First unavailable job record](https://github.com/terryyin/open-dough/actions/runs/42673489021),
[second unavailable job record](https://github.com/terryyin/open-dough/actions/runs/42674414222).

The latest 24 hours ending at 18:15 Singapore time on 10 November had 29
failures in 112 completed runs (25.9%), against 12 of 152 (7.9%) the day
before. Across the whole 48-hour window the rate was 41 of 264 (15.5%),
against 40 of 212 (18.9%) in the prior 48 hours. These are counts of final
workflow conclusions for runs created in each window across all refs and
triggers, excluding cancellations. Main's five failures in the latest
48 hours were three state or request assertions, one watcher timeout, and
one collector lock failure.

- **State and request failures.** Tests observed extra artifact listings,
  two history reads straddling a collector write, or the previous story
  while navigation was settling. The main history and ad hoc request races
  already have repairs (`ad581992a`, `f1a992a75`, `fa274447d`). The adapter
  restart failure had a different cause. Interrupted ownership changes could
  strand a real JSON store lock. Main has `8756dd712` and its follow-up
  fixture repair `284c47b41`, which observes the actual rename boundary.
  The repair and the subsequent integration both passed CI.
  [History race](https://github.com/terryyin/open-dough/actions/runs/42683691835/job/129384709224),
  [extra artifact listing](https://github.com/terryyin/open-dough/actions/runs/42758943543/job/129639886645),
  [navigation race](https://github.com/terryyin/open-dough/actions/runs/42757731824/job/129635918458),
  [lock failure](https://github.com/terryyin/open-dough/actions/runs/42792228483/job/129748405061),
  [passing fixture repair](https://github.com/terryyin/open-dough/actions/runs/42799957103),
  [passing integration](https://github.com/terryyin/open-dough/actions/runs/42801557845).
- **Deadline failures.** The real watcher policy repair needed about 28 s
  just to activate on the hosted runner. Restart of the watcher while
  preserving the runner and client also reached the default. The retired
  closure trace showed continued progress through Git retirement, write
  faults, Done rendering, and the same-origin restart at about 29 s. Its
  deletion checks crossed the 30 s deadline. Main has temporary allowances
  for the policy repair (`10a795b52`) and retired closure (`476a9c007`).
  The earlier native evidence budget failure (67.8 s against 64 s) was
  addressed by consolidating the capture in `7d62c61b5`.
  [Watcher policy repair](https://github.com/terryyin/open-dough/actions/runs/42789049003/job/129737496338),
  [watcher restart](https://github.com/terryyin/open-dough/actions/runs/42781560636/job/129712572528),
  [retired closure trace](https://github.com/terryyin/open-dough/actions/runs/42789213880/job/129738041809),
  [native evidence ceiling](https://github.com/terryyin/open-dough/actions/runs/42488867557/job/128756624455).
- **Retained baseline.** Passing `main` run 42795867875, attempt 1 at
  `31a826c77`, retains all 12 dashboard parts and all three repository
  shares without proof gaps. CI selected `npm run test:dashboard` across
  its 12 existing Playwright splits and `npm run test` across three runner
  shares. Its four highest case groups were all production watcher groups,
  totaling 371.7 s of summed case time. The three watcher spec timings
  including hooks were 205.6 s for updates, 129.2 s for failures, and
  102.3 s for restart. The slowest dashboard job took 321 s of wall time
  including setup and proof upload. Keep summed durations and elapsed time
  separate. [Passing baseline](https://github.com/terryyin/open-dough/actions/runs/42795867875).

## Watcher source-ingestion decision after the measured miss

Consolidation preserved every behavior but saved only 5.367 s nominally; the
10 s target remains. Whole-product PFE found the existing `runArtifacts.ts`
owner already prepares immutable inputs once on demand and owns cleanup;
`globalSetup.ts` registers them, and `startOriginPreparation.ts` materializes
isolated Git copies. `publishedMainFixture(true)` currently copies the same
live source and hashes its first commit for each fixture (probe: summed initial
adds 3.18/3.27/5.29 s, copy cost extra). Reuse that owner for one source snapshot;
keep private repositories, writable origins, HOME and actual deployment scripts.
A per-worker cache repeats the cost across workers; a new registry or persistent
cache adds an unsupported lifetime. Source truncation/prebuilt deployments do
not preserve the required input. No production architecture choice is added.
The existing publication fixture observes exact unchanged runtime bytes and
requested-only docs changes; watcher refusals observe an initially empty origin.
Both and all direct full-source callers must remain proved. No-owner calls keep
the established private path. If the experiment fails its measured target,
return the gap before another variant. Raw attempts stay at their evidence paths.

The single selected source-snapshot variant retained all fixture boundaries and
observed20.493s complete-family median saving against original, with cold prep
included; [source-ingestion evidence](source-ingestion-evidence.md) retains
comparability, all pairs, preserving assertions and remaining final gates.

## Touch required-input premise after valid pressure failure

Slice6 width alone failed at load21.042–26.039: reading37.715s and rotation
31.504s timeout. First-case hooks15.173s change the earlier quiet premise.
Reuse exact required Claude queued/app/bundle readiness through the existing
run owner in a shared registered worker fixture before private origin setup;
all moved preparation stays in suite elapsed. BeforeAll duplicated a private
hook dashboard and its direct requests were redundant; that attempt is rejected.
Use the existing default worker slot, no new cache or native gesture model. See touch-evidence.md for PFE and the bounded
remaining proof; return before another variant if this one fails.

## Execution decisions

- Prefer consolidating onto existing journey homes over new parallel specs.
- Remove a case-local allowance only after that case fits the default with margin.
- Drop experiments that add cost or leave proof or speedup unestablished.
- Comparison cache experiments were rejected after the paired +46.5% cost result.
  Seven owned paths were preserved and reverted; the private publisher is the
  stronger simpler starting point. Profile before another implementation cut.
- Slice 1's probe may revise which harness leads slices 3–6 apply; it does not widen product scope.
- Probe selection: retain watcher/closure consolidation and touch gesture cuts.
  Probe1 did not establish those earlier preparation/fake-gh leads; later
  readiness and transport measurements now support only their named cuts.
  Watcher consolidation missed the family target; slice 4 now owns the measured
  full-source fixture-ingestion experiment using the existing run-artifact owner;
  real deployment installs, builds, and starts remain required.
  New slice 6 pressure evidence supports exact required-input readiness, despite
  the earlier quiet 3–4 s hypothesis being insufficient; no blanket prewarm.

## Current plan assessment

Earlier proof remains retained. Slice12 preserves the canonical/current-client
setup; three valid pressure/default commands pass, with about .980s worst local
sort body headroom. Two ineffective small-data cuts remain discarded. Actual
hosted comparison cases pass retry0 in two runs; exact full CI5e721503 passes
run42963489603/1 after each exposed transport/shutdown/runner/pacing defect is
repaired. Combined evidence settled12 and G4/G7/G12/G13/G14/G15 at that boundary,
without a numeric exception or waiver. Slice13's C03 continuation now exposes
Sort31.110s under valid pressure; G7 returns while the earlier evidence stays
retained. Thirteen slices and source Goal/Scope unchanged.
Slice13 owns G1/G2/G3/G7/G8/G11/G18, named pressure/default, comparable whole-suite and
trunk gates. Branch validation still uses twelve shards; current trunk's
thirteen-part input is handled at the existing human checkpoint. See
[CI repair evidence](ci-repair-evidence.md).
Current failures, five-second observation audit and selected corrections are in
[final validation](final-validation-evidence.md) and
[observation evidence](final-observation-evidence.md).

## Source goal and scope

Maintainers and agents get the same dashboard suite result under usual parallel
load and in hosted CI without case-local timeout allowances. Named overdue
journeys finish with margin inside the default 30 s and their 5 s observations;
temporary allowances for touch review, production-deployment,
agent-completion-recovery, watcher policy-repair, and retired closure are
removed only after each case fits. The watcher family is at least 10 s faster
in median elapsed time including moved work; the comparable local dashboard
suite and the slowest hosted shard stay within previous elapsed times. Every
distinct behavioral promise stays at an observable boundary; surviving proof is
established before deleting a test, step, or assertion.

Out of scope: SEED-286#fast-intent-ci-comparison-tests; infrastructure
acquisition; unrelated branch defects; the separate collector lock repair;
unnamed case-local allowances (including recently-done ad-hoc session and
Intent timing-history journeys) unless a harness change this story makes must
keep them green; raising default case or shard deadlines; sleeps, retries,
skips, or permanent CI jobs as the margin strategy.
