# Fit dashboard journeys in the default timeout

**Identity:** SEED-287#fit-dashboard-journeys-in-default-timeout
**Source:** [Refined story](../../seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout)
**Source review:** [Independent commitments](source-review.md)
**Preparation:** owned workspace
`/Users/terryyin/git/open-dough/.worktrees/make-dashboard-journeys-fit-the-default-timeout`,
branch `cursor/make-dashboard-journeys-fit-the-default-timeout`, starting
revision `673002452f18b7fc7a9427f7a6db662b63c8b0b7`. This plan authorizes no
execution.

## Goal and scope

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

## Design and proof basis

[Design, reuse decisions, premises, and proof ownership](design-and-proof.md)
retain the source promises and their current observations.

## Ordered slices

### 1. Recheck which overdue journeys and harness costs still dominate
Type: Behavior
Status: done
Proof: Focused before timings with the same selection, workers, cache conditions, and comparable load for the named allowance cases (touch reading, production-deployment, agent-completion-recovery, watcher policy-repair) plus the watcher failure/restart family and a first-in-worker sample. Record which earlier leads still show material cost. On macOS use the maintained sleep guard. This is an authorized early probe: if dominant costs differ from the seed's leads, revise later slices before implementing them.

Behavior: Preparation workspace at the starting revision → run the focused timing probe under comparable load → the plan records which named journeys still miss the default margin and which harness leads still dominate, or revises dependent slices when they do not.

### 2. Remaining assertion races wait at their causal boundary
Type: Behavior
Status: done
Proof: Focused specs for remaining history-compare, revisit-request-count, and selected-story-render reproductions (and siblings sharing each setup) pass three consecutive times under comparable load; exact counts kept where duplicate avoidance is the promise; no sleeps/retries/skips.

Behavior: A case that previously asserted while async work was settling → wait for the persisted collector result, finished first request, or rendered selected story as applicable → the assertion observes the settled state under load without a case-local timeout allowance.

### 3. Watcher failure keeps one live deployment; restart owns SIGHUP
Type: Behavior
Status: done
Proof: Whole failure/restart/updates family passes; actual ignored-SIGHUP and stale-restart faults are detected before the standalone C activation is removed. Retain origin recovery on the same C PID/page, both fatal-preview outcomes/cleanup, active-build SIGTERM, current-main restart, same runner/client/input, and final SIGINT. Compatible proof and parked code are retained in [watcher evidence](watcher-evidence.md). The measured cost target remains owned by slice 4/G9.

Behavior: Existing failure/restart chains repeat C activation → continue origin recovery into failed candidate/restoration on the same live C, and relocate SIGHUP to the existing restart → all distinct lifecycle promises remain while one real install/build/start is removed. No claim that consolidation alone earns the 10 s saving.

### 4. Repeated full-source ingestion no longer consumes the family saving
Type: Behavior
Status: done
Proof: Profile the supported copy/initial-Git-ingestion cost, then test one immutable source-snapshot variant using the existing run-artifact owner. Every fixture retains current source, private writable repositories/HOME and an empty unpublished origin; real install/build/start remain. Run all full-source consumers, including publication/refusal/deployment and fixture-isolation proof, plus the three-spec watcher family. At least 10 s median family elapsed saving against a comparable original baseline, including first-demand snapshot preparation and moved work; no family growth. Stop with evidence if this one variant misses; no unchanged timing reruns or new cache lifetimes.

Behavior: Several real watcher fixtures ingest the same live source independently → prepare that immutable Git source once in the established run owner and materialize isolated fixtures → original publication/serving/failure boundaries survive and complete-family elapsed meets the original 10 s target. Existing private fallback remains usable without a run owner. This is one supported harness-cost experiment, not a second artifact registry or prebuilt deployment.

### 5. One full retired closure; recovery variants at the reporting boundary
Type: Behavior
Status: done
Proof: `agent-completion-quiet.spec.ts` still proves real Git retirement, installed reporting retry without repeating Git/native ops, and visible Done (reuse Story Branch Wrap Up where it can carry this; retain Land and Trunk Wrap Up paths). `agent-completion-quiet-closure.spec.ts` (and extensions) cover unavailable receiver / lost ack, failed and concurrent writes, reserved receipt isolation, message recovery after source deletion, stale receipt across restart, altered payload refusal, and post-deletion rejection as needed. Covered browser steps removed from `agent-completion-recovery.spec.ts`; three consecutive focused passes.

Behavior: Browser recovery repeats full retirement and low-level fault variants → retain real retirement/reporting retry/visible Done once and establish each variant at the existing CLI/HTTP/store boundary before removing covered browser steps → the same closure promises fit the default with margin. Slice 12 removes the recovery allowance after that observation.

### 6. Touch reading and its required cold inputs fit the default
Type: Behavior
Status: done
Proof: The whole four-case touch spec passes three consecutive two-worker runs at load 20–30 inside default 30 s, with native reading/rotation/geometry assertions retained and the 60 s allowance removed only after fit. Include desktop large-review consumers and all total elapsed preparation. Reuse existing artifact keys, run owner and the shared worker-fixture registration for required Claude queued origin, app and server bundle readiness; retain private case repositories/servers and real gestures. No new artifact lifetime, native gesture rewrite or broad prewarm.

Behavior: A shorter still-overflowing reading line reduces strokes but first-worker setup consumes 15.173 s and rotation times out → request the exact immutable inputs through a worker fixture before private origin setup, within the unchanged default worker budget, then retain real user actions → all four journeys complete with margin and paid total elapsed. Width-only and beforeAll attempts remain unaccepted: the latter duplicated a private dashboard before its redundant requests. Use an explicit origin dependency, not a beforeAll or late callback parameter; return if this supported cut fails. See [touch evidence](touch-evidence.md).

### 7. A non-owner server overlaps independent preparation
Type: Behavior
Status: done
Proof: The complete second-server journey passes three consecutive two-worker selections with its default case budget, retaining live non-owner identity, held push, card protection through reload/project switch, and exactly one claim/worktree/native session. Include worker-handoff/change-wait boundary siblings if orchestration changes.

Behavior: An accepted installed start prepares while a second preview is not yet started → begin the independent second-server startup during preparation, retaining the held-push barrier before observation → the same complete non-owner journey has useful margin. The trace measured 3.23 s of removable sequential startup. Include moved work in elapsed; no product ownership shortcut. This settles one launch member of G4.

### 8. Receipt and orphan recovery avoid redundant initial page setup
Type: Behavior
Status: done
Proof: Receipt-failure execution/refinement and second-server orphan specs pass three consecutive two-worker selections with default budgets. Preserve actual installed publication/fault, unavailable receipt, Continue recovery, server death/orphan cleanup and exactly-one claim/session. Inspect the original story-card/initial-start owners before moving incidental initial browser setup to real acceptance.

Behavior: A real initial accepted start and page setup consume the recovery budget in sequence → establish the initial action at the existing real launch boundary and overlap independent page work → every recovery/Continue and cleanup observation completes with margin. Reject compaction that supplies the result in setup or loses a distinct browser promise. G4 stays open for later members.

### 9. Codex retry keeps its retained-host progress proof within the budget
Type: Behavior
Status: done
Proof: The whole Codex start spec and preparation-codex consumer pass three consecutive two-worker selections when their shared retry-progress helper changes. Preserve initial native refusal, retained retry acceptance, first input, one kept session, retained host and the actual fresh-observer/reload promise wherever it is owned; establish surviving proof before removing repetition.

Behavior: A refused native start succeeds through its retained retry near 30 s → overlap independent native creation with the existing HTTP/card/fresh-page/reload progress proof, retaining the creation barrier before release → the complete retry and saved-host observations fit with margin. No observation is removed; the existing helper owns the cohesive sequencing. The trace locates late observer work, not a stuck page.evaluate. This settles the Codex member of G4; comparison remains in slice 11.

### 10. Cursor lifetime journeys reach their actual behavior within the budget
Type: Behavior
Status: done
Proof: Whole helper-survival and replacement-controls specs plus replacement revival pass three consecutive two-worker runs. Retain real held clients, chosen-model configuration scope, board association, same runner/PID survival, drift handling, finished/never-held/failed revival distinctions and visible Running/Recover states. If the shared recovery helper changes, include its scope/recovery/stop-several consumers. Preparation remains included in elapsed. [Accepted observations](cursor-evidence.md).

Behavior: Two expensive execution starts prevent the runner test reaching its subject before 30 s → establish only the necessary native/session preconditions at the existing real launch boundary → drift/replacement actions and all original observations complete with margin. Bound the first experiment to these two journeys, canonical MakeMe records and actual clients; an unscoped ad hoc client is not a substitute for the scoped precondition. Ordinary execution/model UI proof stays with its inspected owners. G5 owns both failures.

### 11. Loaded comparison reads use required-input readiness
Type: Behavior
Status: planned
Proof: Whole source variants and sort’s two cross-story loops pass three fresh two-worker/default30 runs at load20–30. Preserve exact completion-revision reads, later-file exclusion, Purpose/compact Proof, drilling, missing-column fallback and restored sort. Prove moved touch wrapper’s native reading/readiness and actual cold concurrency before private origins. Include every moved preparation cost in elapsed; no family growth or lost private HOME.

Behavior: Valid pressure still exhausts sort after7.201s serial cold inputs → reuse queuedClaudePreviewReady through one named preparationPage test-fixture wrapper shared by source/sort/touch → all original private Git/publication/reading observations fit with margin. Keep the one-push history unchanged; pageTest registration changes only its comment. No beforeAll, worker option/pool split, new artifact lifetime or completed-history cache. Return if this single supported cut fails. [Profile and selected owner](comparison-evidence.md) retain G4/G7 and prior rejected evidence.

### 12. Named allowances removed; suite and shard margins hold
Type: Behavior
Status: planned
Proof: Remove remaining named case-local allowances, including trunk’s watcher restart allowance, only after their cases fit with margin. Comparable local dashboard suite elapsed and the slowest hosted shard stay within previous elapsed times (keep summed durations separate). Refresh shard weights from all 12 artifacts of a complete passing trunk run after removing work; measure redistribution separately. Default case and shard deadlines unchanged.

Behavior: All prior slices' retained proof is green with margin → delete the named temporary `test.setTimeout` allowances → local comparable suite and hosted slowest shard remain within previous elapsed times with refreshed weights.

## Current decisions

- Prefer consolidating onto existing journey homes over new parallel specs.
- Remove a case-local allowance only after that case fits the default with margin.
- Drop experiments that add cost or leave proof or speedup unestablished.
- Comparison cache experiments were rejected after the paired +46.5% cost result.
  Seven owned paths were preserved and reverted; the private publisher is the
  stronger simpler starting point. Profile before another implementation cut.
- Slice 1's probe may revise which harness leads slices 3–6 apply; it does not widen product scope.
- Probe selection: retain watcher/closure consolidation and touch gesture cuts.
  Current preparation and fake-`gh` costs do not establish their earlier
  dominance. Do not prewarm or replace them on the earlier hypothesis alone.
  Watcher consolidation missed the family target; slice 4 now owns the measured
  full-source fixture-ingestion experiment using the existing run-artifact owner;
  real deployment installs, builds, and starts remain required.
  New slice 6 pressure evidence supports exact required-input readiness, despite
  the earlier quiet 3–4 s hypothesis being insufficient; no blanket prewarm.

## Accepted probe evidence

[Probe observations and full-baseline diagnosis](execution-evidence.md) retain
commands, timing conditions, inspected boundaries, and outstanding proof.
[Source-ingestion proof and complete-family saving](source-ingestion-evidence.md)
retain the subsequent accepted measurement and isolation/consumer observations.
[Closure consolidation proof](closure-evidence.md) retains the full retired retry
and moved reporting variants established before deleting duplicate browser work.

[Launch budget corrections and complete retained observations](launch-evidence.md)
retain the second-server overlap and subsequent recovery repairs.

## Story obligations

### G1. Required pressure proof remains due
Reported: slice 1 — "Focused measurements were below the requested load 20–30; that pressure margin is not established."
Story clause: "under local load 20–30 on 2 workers"
Disposition: receiving slice 12

### G2. Comparable local suite comparison remains due
Reported: slice 1 — "No completed comparable local baseline was found; the unchanged full-suite baseline is still running."
Story clause: "the comparable local dashboard suite and the slowest hosted shard stay within their previous elapsed times"
Disposition: receiving slice 12

### G3. Hosted margin and shard comparison remain due
Reported: slice 1 — "Only retained baseline CI is available; no implementation speedup or hosted margin has been proved."
Story clause: "on a hosted shard about 1.5× slower overall"
Disposition: receiving slice 12

### G4. Full-baseline budget defects remain owned
Reported: slice 1 — "The unchanged full baseline exposed two Intent comparison and five launch case-budget failures; no repair is claimed."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: interim until slices 7, 8, 9, 11

### G5. Cursor recovery records are not observed before the case deadline
Reported: slice 1 — "Cursor runner helper-survival and replacement-controls both timed out in launchSecondHeldSession while polling absent launch records; diagnosis is pending."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: proved by slice 10: cursor-evidence.md; real scoped/Default execution preconditions, surviving UI11/11 and three complete default4/4 lifetime passes after path-alias repair; pressure/hosted/full-suite remain in12

### G6. Comparison experiment must retain the private local checkout (first reported in original slice 3)
Reported: slice 11 — "switching to dashboardTest alone made completion recovery return “spawn git ENOENT” because server HOME lacked home/git/open-dough."
Story clause: "Preserve every distinct behavioral promise at an observable boundary."
Disposition: proved by slice 11: rejected cache paths removed; original preparationPage/StartOrigin private checkout restored, with exact source/Proof observations in the paired-before three-case pass at /tmp/seed287-slice3-20261110-2107/pair-before-proof.json

### G7. Controlled-pressure comparison budgets remain unproved
Reported: slice 11 — "The controlled CPU-pressure run timed out in sort and clean-source; conflict-source passed at 29.667 s, while sampled load rose from 20.38 to 32.04."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: return

### G8. Trunk restart allowance still needs hosted default margin
Reported: slice 3 — "Trunk commit 2a2038247 added a 90 s restart/SIGINT allowance after hosted install/build took 27.3 s before shutdown; the execution branch still uses the default."
Story clause: "the watcher family's first-in-worker `beforeAll` and restart/policy-repair paths"
Disposition: receiving slice 12

### G9. Watcher consolidation alone did not earn the required saving
Reported: slice 3 — "Three alternating pairs passed 32/31 cases, but median shell elapsed 141.456 to 136.089 s saved only 5.367 s nominally, below 10 s and affected by host variance."
Story clause: "the watcher family gets at least 10 s faster in median elapsed time"
Disposition: proved by slice 4: three strict-passing original32/changed31 pairs measured median complete shell156.893714 to136.400577s (20.493137s saving), including cold first-demand preparation3.532/3.352/3.461s; all moved work and load qualifiers retained in source-ingestion-evidence.md

### G10. Touch width alone misses the pressure budget
Reported: slice 6 — "At measured load21.042–26.039, phone reading took37.715s under its60s allowance and default-budget phone rotation timed out at31.504s; width reduction alone does not fit."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: proved by slice 6: touch-evidence.md accepted worker-input implementation; three actual default30s four-case passes at load20.629–25.571 and desktop5/5, all moved setup included; hosted/full-suite proof remains in12

## Plan concern assessment

Completed 1–10 and compatible proof remain accepted. Slice11's corrected
profile failed sort30.616s at valid24.032–26.448 load. No implementation paths
needed parking: the tree was clean before this refinement. Its measured7.201s
cold-input cost supports direct reuse/modularization of the accepted worker
readiness in one shared private-origin wrapper. All original observations and
paid elapsed remain. Remaining11/12 have cohesive gates and proof loops; twelve
slices, no numeric exception/resplit, goal or failure waiver. G4/G7 stay owned;
G1/G2/G3/G8 remain12. The trunk step retains its explicit human checkpoint.
Execution stays Taken; this is readiness for the supported cut, not acceptance.

## Trunk measurement checkpoint

After implementation and local/branch proof settle, request approval for
Dough Land `--keep-worktree` before slice 12’s trunk-only timing/weight step.
The plan’s execution authority does not silently grant that checkpoint.
Use all twelve artifacts of a complete passing trunk run after work removal;
refresh weights and measure redistribution separately. Final closure still
uses Story Wrap Up. First trunk publication must receive the launch’s supplied
landing context; later trunk publications omit it.

## Execution notes

[Execution identity, accepted revision, setup, and CI observer](execution-context.md)

- No numeric slice target or hard limit is supplied; judge boundedness by one
  proof loop and the Behavior/Structure gate above.
- Local gates: focused selections named in each slice's proof, then the
  existing local and hosted dashboard gates for slice 12; ordinary commit hooks.
  For long runs start fully awake: on AC use `caffeinate -s -i`; on battery
  plug in or keep the lid open under `caffeinate -i` and inspect sleep logs
  per [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written to every delegation and repair handoff. Shared `makeMe`
  arranges automated domain data; no sleeps, `test.slow()`, or suite/hook
  timeout overrides. Case-local timeout overrides stay forbidden except as the
  temporary allowances this story removes. Execution owns applicable local and
  published CI repairs.
- Retained hosted baseline for suite comparison: passing `main` run
  42795867875 at `31a826c77` (story CI evidence). Keep wall time and summed
  case time separate.
