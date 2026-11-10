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
| Watcher failure keeps one live deployment; restart owns SIGHUP; family ≥10 s faster median including moved work | 3: failure + restart (+ policy) journeys pass; standalone C reactivation gone; before/after family median |
| One full retired closure; recovery variants at CLI/HTTP/store; covered browser steps gone | 4: quiet closure + reporting-boundary specs cover promises; recovery journey shortened; three consecutive focused passes |
| Touch reading fits default 30 s; allowance removed | 5: touch reading case under load 20–30 on 2 workers; `setTimeout` gone; reading proof retained |
| Harness costs the probe still supports cut without moving unpaid work out of suite elapsed | 5: focused first-in-worker / fake-`gh` / prep changes as selected; suite elapsed includes moved prep |
| Named allowances removed; suite and slowest shard within previous elapsed; shard weights refreshed | 6: allowances gone after fit; local comparable suite and hosted slowest shard; weights from all 12 artifacts of a complete passing trunk run |

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Touch reading case still carries a 60 s case-local allowance and heavy pane-reading strokes | Slice 5 remove allowance / cut gestures | Read `dashboard/tests/review/story-review-touch.spec.ts` and `dashboard/tests/support/storyReviewTouchJourney.ts` at `673002452f18b7fc7a9427f7a6db662b63c8b0b7` | Settled: `test.setTimeout(60_000)` with SEED-287 comment; journey reads wide line end and back via `readCodePartByTouch` |
| Retired closure recovery still carries a 120 s allowance and combines real Git retirement with unavailable receiver, write fault, and lost ack in one browser journey | Slice 4 consolidation | Read `dashboard/tests/sessions/agent-completion-recovery.spec.ts` at that revision | Settled: `test.setTimeout(120_000)` with SEED-287 comment; one test owns retirement + three recoveries + restart |
| Quiet Land / Story Branch Wrap Up / Trunk Wrap Up already retire real accepted work before installed quiet reporting | Slice 4 reuse Wrap Up | Read `dashboard/tests/sessions/agent-completion-quiet.spec.ts` at that revision | Settled: three closure variants already exercise real retirement + quiet reporting |
| Reporting-boundary backend already covers quiet Done prerequisites and unavailable-receiver reporting-only recovery | Slice 4 move variants | Read `dashboard/backend-tests/sessions/agent-completion-quiet-closure.spec.ts` at that revision | Settled: boundary test uses `unavailableCompletion` and Done/landing/readable-closure rules; full retirement stays in quiet/recovery |
| Failure journey currently stops the live C deployment with SIGHUP, starts a new watcher, then runs failed candidate/restoration | Slice 3 move SIGHUP / keep one deployment | Read `dashboard/tests/runtime/production-watcher-failures.spec.ts` (unavailable-origin + SIGHUP through failed restoration) at that revision | Settled: SIGHUP ends the watcher mid-family; post-hangup start is a separate watcher before D |
| Restart journey already proves restart from current main with same runner/client and SIGINT end | Slice 3 attach SIGHUP | Read `dashboard/tests/runtime/production-watcher.spec.ts` restart test at that revision | Settled: restart path exists without SIGHUP quiet-exit proof |
| Policy-repair and production-deployment still carry temporary allowances | Slice 6 remove after fit | Read `dashboard/tests/runtime/productionUpdatePolicies.ts` and `dashboard/backend-tests/runtime/production-deployment.spec.ts` at that revision | Settled: 60 s and 45 s `test.setTimeout` respectively |
| Which 2026-11-09 harness leads (start-origin/app prep, fake `gh`/`rev-parse`, fixture Git volume, touch strokes) still dominate under current load | Slices 3–5 experiment choice | Cheap: seed + code presence above. Unpaid load timing of the named families under comparable workers/cache/load is not observed in this preparation | Open: early probe slice 1 must record which leads still show material cost before dependent harness cuts; failure revises slices 3–5 |

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
Type: Structure  
Status: planned
Proof: `production-watcher-failures.spec.ts` and `production-watcher.spec.ts` (and policy journey as affected) pass; discriminating checks still detect ignored SIGHUP and reuse of the previously served revision; standalone C reactivation including its install/build/start is gone; watcher-family median elapsed including moved work is at least 10 s faster than the comparable before measurement from slice 1 / retained baseline method.

Structure: Remove the mid-family SIGHUP stop and separate post-hangup watcher from the failure journey; continue unavailable-origin resume into failed candidate and failed restoration on the same live deployment; move real SIGHUP quiet-exit and cleanup onto the existing restart journey while preserving SIGTERM/SIGINT, fatal preview, and cleanup proofs. Enables slice 6 removal of watcher-related allowances once margin holds.

### 4. One full retired closure; recovery variants at the reporting boundary
Type: Structure  
Status: planned
Proof: `agent-completion-quiet.spec.ts` still proves real Git retirement, installed reporting retry without repeating Git/native ops, and visible Done (reuse Story Branch Wrap Up where it can carry this; retain Land and Trunk Wrap Up paths). `agent-completion-quiet-closure.spec.ts` (and extensions) cover unavailable receiver / lost ack, failed and concurrent writes, reserved receipt isolation, message recovery after source deletion, stale receipt across restart, altered payload refusal, and post-deletion rejection as needed. Covered browser steps removed from `agent-completion-recovery.spec.ts`; three consecutive focused passes.

Structure: Keep one full retired-closure browser journey; move recovery variants to the existing CLI/HTTP/store boundary after identifying or adding discriminating proof there. Enables slice 6 removal of the recovery allowance once the retained journey fits the default.

### 5. Touch reading and remaining supported harness costs fit the default
Type: Behavior  
Status: planned
Proof: Touch reading case passes under local load 20–30 on 2 workers inside 30 s with reading proof preserved and its 60 s allowance removed. Apply only harness leads slice 1 still supports (for example cheaper fake `gh` without losing auth/hold/pid/signal/gone-fake behavior, avoiding repeated start-origin/app prep charged to the first case while including moved prep in suite elapsed, cutting gesture cost). Focused before/after for affected first-in-worker and touch selections.

Behavior: Named touch and first-in-worker pressure cases under the probe's load profile → apply the still-supported cost cuts → those cases finish with margin inside the default 30 s and 5 s observations without raising deadlines.

### 6. Named allowances removed; suite and shard margins hold
Type: Behavior  
Status: planned
Proof: Remove remaining named case-local allowances only after their cases fit with margin. Comparable local dashboard suite elapsed and the slowest hosted shard stay within previous elapsed times (keep summed durations separate). Refresh shard weights from all 12 artifacts of a complete passing trunk run after removing work; measure redistribution separately. Default case and shard deadlines unchanged.

Behavior: All prior slices' retained proof is green with margin → delete the named temporary `test.setTimeout` allowances → local comparable suite and hosted slowest shard remain within previous elapsed times with refreshed weights.

## Current decisions

- Prefer consolidating onto existing journey homes over new parallel specs.
- Remove a case-local allowance only after that case fits the default with margin.
- Drop experiments that add cost or leave proof or speedup unestablished.
- Slice 1's probe may revise which harness leads slices 3–5 apply; it does not widen product scope.
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
Disposition: receiving slice 6

### G2. Comparable local suite comparison remains due
Reported: slice 1 — "No completed comparable local baseline was found; the unchanged full-suite baseline is still running."
Story clause: "the comparable local dashboard suite and the slowest hosted shard stay within their previous elapsed times"
Disposition: receiving slice 6

### G3. Hosted margin and shard comparison remain due
Reported: slice 1 — "Only retained baseline CI is available; no implementation speedup or hosted margin has been proved."
Story clause: "on a hosted shard about 1.5× slower overall"
Disposition: receiving slice 6

### G4. Full-baseline budget defects remain owned
Reported: slice 1 — "The unchanged full baseline exposed two Intent comparison and five launch case-budget failures; no repair is claimed."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: receiving slice 5

### G5. Cursor recovery records are not observed before the case deadline
Reported: slice 1 — "Cursor runner helper-survival and replacement-controls both timed out in launchSecondHeldSession while polling absent launch records; diagnosis is pending."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: receiving slice 5

## Plan concern assessment

Slice-plan refinement was not needed: six slices share one common rule (honest
shared proof inside the default budget), with journey-specific Structure only
where the seed already named distinct consolidation homes, and one authorized
early probe for the open harness-cost premise. This review found no remaining
slice-specific concern beyond that probe-bounded premise. No human-owned scope
or ADR decision is pending.

Execution learning: G4 and G5 add independent repair proof loops to the remaining
harness work. Reassess and refine that boundary after the full-baseline
inventory is complete, before delegating dependent implementation. The initial
six-slice assessment above does not dispose of those newly observed defects.

## Execution notes

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
  existing local and hosted dashboard gates for slice 6; ordinary commit hooks.
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
