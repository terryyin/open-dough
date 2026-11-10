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

### 3. Loaded comparison source and sort journeys fit the case budget
Type: Behavior
Status: planned
Proof: Both source variants and the sort test’s two cross-story loops pass three consecutive two-worker runs, including cold-worker preparation; preserve exact completion-revision reads, later-file exclusion, Purpose/compact Proof, drilling, missing-column fallback and restored sort on return. Add file/renamed/drilldown/scope-history consumers when the shared publisher changes; reuse only demonstrably unchanged proof. Record moved preparation in elapsed, not just case time.

Behavior: A completed-story source or sort journey spends its budget in the established private publisher → profile its actual Git/publication phases, remove only evidenced redundant preparation inside that owner, and retain existing preparationPage/StartOrigin isolation → every original observation completes with margin inside 30 s without family cost growth. The next bounded operation is one Git Trace2 profile of the unchanged three-case selection; choose one supported cut or return the decisive gap. Rejected worker/run-artifact history lifetimes are not a basis for more caching variants. G4 remains owned; no SEED-286 feature promise is added.

### 4. A non-owner server overlaps independent preparation
Type: Behavior
Status: planned
Proof: The complete second-server journey passes three consecutive two-worker selections with its default case budget, retaining live non-owner identity, held push, card protection through reload/project switch, and exactly one claim/worktree/native session. Include worker-handoff/change-wait boundary siblings if orchestration changes.

Behavior: An accepted installed start prepares while a second preview is not yet started → begin the independent second-server startup during preparation, retaining the held-push barrier before observation → the same complete non-owner journey has useful margin. The trace measured 3.23 s of removable sequential startup. Include moved work in elapsed; no product ownership shortcut. This settles one launch member of G4.

### 5. Receipt and orphan recovery avoid redundant initial page setup
Type: Behavior
Status: planned
Proof: Receipt-failure execution/refinement and second-server orphan specs pass three consecutive two-worker selections with default budgets. Preserve actual installed publication/fault, unavailable receipt, Continue recovery, server death/orphan cleanup and exactly-one claim/session. Inspect the original story-card/initial-start owners before moving incidental initial browser setup to real acceptance.

Behavior: A real initial accepted start and page setup consume the recovery budget in sequence → establish the initial action at the existing real launch boundary and overlap independent page work → every recovery/Continue and cleanup observation completes with margin. Reject compaction that supplies the result in setup or loses a distinct browser promise. G4 stays open for later members.

### 6. Codex retry keeps its retained-host progress proof within the budget
Type: Behavior
Status: planned
Proof: The whole Codex start spec and preparation-codex consumer pass three consecutive two-worker selections when their shared retry-progress helper changes. Preserve initial native refusal, retained retry acceptance, first input, one kept session, retained host and the actual fresh-observer/reload promise wherever it is owned; establish surviving proof before removing repetition.

Behavior: A refused native start succeeds through its retained retry near 30 s → remove only independently covered observation/setup repetition at the existing helper boundary → the complete retry outcome and retained-host proof fit with margin. The trace locates late observer work, not a stuck page.evaluate. This is the final G4 member; settle the grouped obligation before done.

### 7. Cursor lifetime journeys reach their actual behavior within the budget
Type: Behavior
Status: planned
Proof: Whole helper-survival and replacement-controls specs plus replacement revival pass three consecutive two-worker runs. Retain real held clients, chosen-model configuration scope, board association, same runner/PID survival, drift handling, finished/never-held/failed revival distinctions and visible Running/Recover states. If the shared recovery helper changes, include its scope/recovery/stop-several consumers. Preparation remains included in elapsed.

Behavior: Two expensive execution starts prevent the runner test reaching its subject before 30 s → establish only the necessary native/session preconditions at the existing real launch boundary → drift/replacement actions and all original observations complete with margin. Bound the first experiment to these two journeys, canonical MakeMe records and actual clients; an unscoped ad hoc client is not a substitute for the scoped precondition. Ordinary execution/model UI proof stays with its inspected owners. G5 owns both failures.

### 8. Watcher failure keeps one live deployment; restart owns SIGHUP
Type: Behavior
Status: planned
Proof: `production-watcher-failures.spec.ts` and `production-watcher.spec.ts` (and policy journey as affected) pass; discriminating checks still detect ignored SIGHUP and reuse of the previously served revision; standalone C reactivation including its install/build/start is gone; watcher-family median elapsed including moved work is at least 10 s faster than the comparable before measurement from slice 1 / retained baseline method.

Behavior: Existing failure and restart chains repeat a C activation → continue unavailable-origin recovery into failed candidate/restoration on the same deployment and move SIGHUP to restart → all signal, serving, fatal-preview and cleanup promises remain observed while median family elapsed improves by at least 10 s. Slice 11 removes watcher-related allowances only after margin holds.

### 9. One full retired closure; recovery variants at the reporting boundary
Type: Behavior
Status: planned
Proof: `agent-completion-quiet.spec.ts` still proves real Git retirement, installed reporting retry without repeating Git/native ops, and visible Done (reuse Story Branch Wrap Up where it can carry this; retain Land and Trunk Wrap Up paths). `agent-completion-quiet-closure.spec.ts` (and extensions) cover unavailable receiver / lost ack, failed and concurrent writes, reserved receipt isolation, message recovery after source deletion, stale receipt across restart, altered payload refusal, and post-deletion rejection as needed. Covered browser steps removed from `agent-completion-recovery.spec.ts`; three consecutive focused passes.

Behavior: Browser recovery repeats full retirement and low-level fault variants → retain real retirement/reporting retry/visible Done once and establish each variant at the existing CLI/HTTP/store boundary before removing covered browser steps → the same closure promises fit the default with margin. Slice 11 removes the recovery allowance after that observation.

### 10. Touch reading and remaining supported harness costs fit the default
Type: Behavior
Status: planned
Proof: Touch reading case passes under local load 20–30 on 2 workers inside 30 s with reading proof preserved and its 60 s allowance removed. Apply only harness leads slice 1 still supports (for example cheaper fake `gh` without losing auth/hold/pid/signal/gone-fake behavior, avoiding repeated start-origin/app prep charged to the first case while including moved prep in suite elapsed, cutting gesture cost). Focused before/after for affected first-in-worker and touch selections.

Behavior: Named touch and first-in-worker pressure cases under the probe's load profile → apply the still-supported cost cuts → those cases finish with margin inside the default 30 s and 5 s observations without raising deadlines.

### 11. Named allowances removed; suite and shard margins hold
Type: Behavior
Status: planned
Proof: Remove remaining named case-local allowances only after their cases fit with margin. Comparable local dashboard suite elapsed and the slowest hosted shard stay within previous elapsed times (keep summed durations separate). Refresh shard weights from all 12 artifacts of a complete passing trunk run after removing work; measure redistribution separately. Default case and shard deadlines unchanged.

Behavior: All prior slices' retained proof is green with margin → delete the named temporary `test.setTimeout` allowances → local comparable suite and hosted slowest shard remain within previous elapsed times with refreshed weights.

## Current decisions

- Prefer consolidating onto existing journey homes over new parallel specs.
- Remove a case-local allowance only after that case fits the default with margin.
- Drop experiments that add cost or leave proof or speedup unestablished.
- Comparison cache experiments were rejected after the paired +46.5% cost result.
  Seven owned paths were preserved and reverted; the private publisher is the
  stronger simpler starting point. Profile before another implementation cut.
- Slice 1's probe may revise which harness leads slices 8–10 apply; it does not widen product scope.
- Probe selection: retain watcher/closure consolidation and touch gesture cuts.
  Current preparation and fake-`gh` costs do not establish their earlier
  dominance. Do not prewarm or replace them on the earlier hypothesis alone.
  If watcher consolidation misses the family target, the measured repeated
  full-source fixture ingestion supports a bounded shared-snapshot experiment;
  real deployment installs, builds, and starts remain required.

## Accepted probe evidence

[Probe observations and full-baseline diagnosis](execution-evidence.md) retain
commands, timing conditions, inspected boundaries, and outstanding proof.

## Story obligations

### G1. Required pressure proof remains due
Reported: slice 1 — "Focused measurements were below the requested load 20–30; that pressure margin is not established."
Story clause: "under local load 20–30 on 2 workers"
Disposition: receiving slice 11

### G2. Comparable local suite comparison remains due
Reported: slice 1 — "No completed comparable local baseline was found; the unchanged full-suite baseline is still running."
Story clause: "the comparable local dashboard suite and the slowest hosted shard stay within their previous elapsed times"
Disposition: receiving slice 11

### G3. Hosted margin and shard comparison remain due
Reported: slice 1 — "Only retained baseline CI is available; no implementation speedup or hosted margin has been proved."
Story clause: "on a hosted shard about 1.5× slower overall"
Disposition: receiving slice 11

### G4. Full-baseline budget defects remain owned
Reported: slice 1 — "The unchanged full baseline exposed two Intent comparison and five launch case-budget failures; no repair is claimed."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: interim until slices 3, 4, 5, 6

### G5. Cursor recovery records are not observed before the case deadline
Reported: slice 1 — "Cursor runner helper-survival and replacement-controls both timed out in launchSecondHeldSession while polling absent launch records; diagnosis is pending."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: receiving slice 7

### G6. Comparison experiment must retain the private local checkout
Reported: slice 3 — "switching to dashboardTest alone made completion recovery return “spawn git ENOENT” because server HOME lacked home/git/open-dough."
Story clause: "Preserve every distinct behavioral promise at an observable boundary."
Disposition: proved by slice 3: rejected cache paths removed; original preparationPage/StartOrigin private checkout restored, with exact source/Proof observations in the paired-before three-case pass at /tmp/seed287-slice3-20261110-2107/pair-before-proof.json

## Plan concern assessment

Execution refinement retains completed slices 1/2 and their proof. The baseline
inventory has five independent repair proof loops: comparison history (3),
non-owner overlap (4), receipt/orphan initial preparation (5), Codex retry proof
(6), and Cursor preconditions (7). Their remedies can succeed independently, so
they are not bundled as one launch optimization. Original watcher/closure/touch/
final outcomes are 8–11. Eleven slices; no numeric size limit, exception, or
resplit is invented. One observable promise stays at its cheapest honest
boundary, with real native/deployment work retained and all preparation measured.
Each repair has one bounded first experiment and default-budget proof. No
production architecture or original story promise changes. The final trunk-only
step has an explicit human checkpoint; earlier work remains executable.

## Trunk measurement checkpoint

After implementation and local/branch proof settle, request approval for
Dough Land `--keep-worktree` before slice 11’s trunk-only timing/weight step.
The plan’s execution authority does not silently grant that checkpoint.
Use all twelve artifacts of a complete passing trunk run after work removal;
refresh weights and measure redistribution separately. Final closure still
uses Story Wrap Up. First trunk publication must receive the launch’s supplied
landing context; later trunk publications omit it.

## Execution notes

- Latest accepted execution branch revision: `791cce4676b283b2eb283bb5d0ea1f6c4032d17a`
  (slice 2); slice 1 was `894b13695766db5ec45c486a30214bce68ca4233`.

- Established execution: Story Branch Mode; identity
  `SEED-287#fit-dashboard-journeys-in-default-timeout`; publisher
  `dashboard-territory.local-open-dough`; agent `chaifeng-chan`; owned checkout
  `/Users/terryyin/git/open-dough/.worktrees/make-dashboard-journeys-fit-the-default-timeout`,
  branch `codex/make-dashboard-journeys-fit-the-default-timeout`; originating
  integration checkout `/Users/terryyin/git/open-dough`; authorized remote
  `origin`, trunk `main`. Starting revision
  `37eed39ace95a8ddafffa96351e999d2898d6806`; accepted claim and first delivery
  base `b57936969b51e7a27f23a4fbba56c70579bc0553` (confirmed on the remote
  execution branch). No second Take. Replanning retains existing authority.
- Checkout setup: locked `npm ci` succeeded; `npm run typecheck:dashboard`
  succeeded on 2026-11-10. Selective formatter: `npm run format`; the
  `.githooks/pre-commit` hook is check-only staged lint plus dashboard typecheck
  when script files are staged.
- CI observer: GitHub Actions `terryyin/open-dough`, execution target
  `codex/make-dashboard-journeys-fit-the-default-timeout`, verified selector
  `ci.yml` / display name `CI` / workflow `351271804`; coordinator
  `seed287-codex`, directory `/tmp/dough-ci-501/watch-ar7mpH`, PID `92304`,
  Codex stream session `82267`, yielded cell `g1081:12`. The trunk claim's
  CI is unobserved by this coordinator; the old unidentified trunk worker
  `/tmp/dough-ci-501/watch-2FVQ6l` is not this execution's branch stream.

- No numeric slice target or hard limit is supplied; judge boundedness by one
  proof loop and the Behavior/Structure gate above.
- Local gates: focused selections named in each slice's proof, then the
  existing local and hosted dashboard gates for slice 11; ordinary commit hooks.
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
