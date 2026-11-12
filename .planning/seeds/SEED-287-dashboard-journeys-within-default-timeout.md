---
id: SEED-287
status: active
planted: 2026-11-09
planted_during: SEED-261#map-project-configuration-test-data execution, whose branch CI and local full gates timed out dashboard journeys under load
trigger_when: A dashboard case needs a case-local timeout allowance, or times out under local load or hosted runner variance
scope: story
---

# SEED-287: Dashboard journeys fit the default timeout under load

## Why this matters

Plan502 removed allowances from cases costing at most15s in hosted CI, but
remaining journeys approach the30s case and5s observation budgets. Hosted run
42557657479 had a shard1.48× slower overall (files up to2.5×). On2026-11-09,
local load13–36 caused the phone reading journey to fail5of8 repeats; a later
load17–23 gate missed the eight cases named below. Their sixteen tests passed
at one worker. Cold first-worker preparation cost10.7–26.4s, and each fake gh
call cost57–94ms at load21–24. Terry's temporary touch allowance is to be removed.

SEED284 moved the touch-reading, pinned-deployment and hosted-margin candidates
here; evidence remains at144981e5f:.planning/TEST-OPTIMIZATION-CANDIDATES.md.
Its two-worker load24–27 run also exceeded30s in watcher beforeAll and both
completed-review variants. DD-473/DD-476/DD-479 route the same margin problem.
The [original diagnostic inventory](../slice-plans/576-fit-dashboard-journeys-in-default-timeout/design-and-proof.md#original-ci-evidence-from-the-seed)
and Git7305433's original Why retain their exact observations and source links.
SEED286 owns the separate Intent CI comparison family.

<a id="fit-dashboard-journeys-in-default-timeout"></a>

### Make dashboard journeys fit the default timeout under load

**Identity:** SEED-287#fit-dashboard-journeys-in-default-timeout
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/576-fit-dashboard-journeys-in-default-timeout/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4a37f4d7d837cf16bc0361c68e89de2da0cb63c038abbdd5ea1b57cbb9805dd4","plan":"57c79322b3afd24a48a10b284d94a8af59629fdaea90c302045ce90e1e807355"}}
```

#### Goal

Maintainers and agents get the same dashboard suite result under the machine's
usual parallel load and in hosted CI, without case-local timeout allowances.
Dashboard journeys finish with margin inside the default 30 s case budget and
their 5 s observations, so local full gates and hosted shards give trustworthy
verdicts without stretching deadlines.

#### Scope

- Make the overdue dashboard journeys finish with margin inside the default
  30 s and their 5 s observations under local load 20–30 on 2 workers and on a
  hosted shard about 1.5× slower overall. Named pressure includes the touch
  review reading case; first-in-worker preparation cost; the eight 2026-11-09
  cases (`agent-launch-preparation-codex` and its retry,
  `responsive-session-access`, `responsive-session-reconciliation`,
  `responsive-session-recovery-restart`, `side-panel-content-replacement`,
  `production-deployment`, `agent-completion-recovery`); the watcher family's
  first-in-worker `beforeAll` and restart/policy-repair paths; the retired
  closure journey; and the routed findings/cases that share this margin
  problem (`story-review-completed`, DD-473/DD-476/DD-479 routes including
  `story-review-story-branch-landed.spec.ts:27`,
  `story-review-completed-conflicts.spec.ts:73`,
  `story-review-one-shot-choice-races.spec.ts:12`,
  `story-review-one-shot-choice.spec.ts:13`,
  `story-review-completed-merge-edits.spec.ts:11`, and the three candidates
  moved from SEED-284).
- Remove each temporary case-local timeout allowance only after that case fits
  the default with margin. Allowances named for this story include touch
  review, production-deployment, agent-completion-recovery, and the temporary
  watcher policy-repair and retired-closure allowances on main.
- Preserve every distinct behavioral promise at an observable boundary.
  Establish surviving proof before deleting a test, step, or assertion.
- Cut repeated setup and redundant proof so the watcher family gets at least
  10 s faster in median elapsed time, including moved work, while the
  comparable local dashboard suite and the slowest hosted shard stay within
  their previous elapsed times.
- Consolidate the failure watcher journey onto one real deployment: prove that
  the unavailable origin leaves C serving and that checks resume after the
  origin returns, then continue into the failed candidate and failed
  restoration on that same live deployment. Move the real SIGHUP and its
  quiet-exit and cleanup assertions to the existing restart journey, which
  must still restart from current main, serve the expected page, preserve the
  same runner and client, and accept input after restart. Keep the active
  build SIGTERM and final SIGINT proofs, both fatal preview outcomes, and
  their cleanup. Prove the relocated check detects a watcher ignoring SIGHUP
  and the restart check detects using the previously served revision. Only
  then delete the standalone C reactivation, including its real
  install/build/start.
- Keep one full retired closure journey that still proves real Git worktree
  retirement, installed reporting retry without repeating Git or native
  operations, and visible Done. Reuse the existing Story Branch Wrap Up
  journey where it can carry this proof; retain the different Land and Trunk
  Wrap Up paths. Carry recovery variants (unavailable receiver and lost
  acknowledgement, failed writes and concurrent writers, reserved receipt
  isolation, message recovery after source deletion, stale receipt preserving
  newer or manual Done across restart, altered payload refusal, and
  post-deletion rejection) at the existing real CLI, HTTP, and store
  boundary. Identify which checks already prove these promises, add missing
  proof there, then remove covered browser steps.
- Fix remaining assertion races at their causal boundary: wait for persisted
  collector results before comparing history reads; let the first request
  finish before counting requests for a revisit; wait for the selected story
  to render before checking its state. Keep exact counts where avoiding
  duplicate work is the promise. Inspect siblings that share each setup and
  use the landed fixes as examples.
- Make the landed CI repeat admission cases hold their 5 s observations at
  local load 20–30 on 2 workers, with their assertions kept. In
  [landed-ci-repeat-admission.spec.ts](../../dashboard/backend-tests/intent/landed-ci-repeat-admission.spec.ts),
  "an unspent eligible receipt disabled while original jobs are unavailable
  stays old on re-enable" and "eligible105-second receipt prepared before
  enablement stays old after acceptance" each poll for 5 s after the receipt
  for a card or a collected history. On unchanged main at `f9ed9f52b` on
  2026-11-11, in two two-worker runs at load 19–23, the first missed that
  observation in both and the second in one. Terry routed them here that day.
  Two more cases missed a 5 s history poll once each beside a scratch fixture
  change, and in no run of main: the admission sibling "an otherwise eligible
  receipt for Taken work does not authorize a Done follow-up" and
  `landed-ci-history-no-proof-recovery.spec.ts:36`. The automatic-repeat and
  verdict specs belong to
  [SEED-314](https://github.com/terryyin/open-dough/blob/4eb1f6a74f42111c185be8521dbbd6d36f411d5f/.planning/seeds/SEED-314-landed-ci-repeat-checks.md#speed-up-landed-ci-repeat-checks).
- Use MakeMe for domain data. Synchronize on observable events or a controlled
  clock. Refresh existing shard weights from all 12 artifacts of a complete
  passing trunk run after removing work; measure any shard redistribution
  separately from summed test durations.

Required restrictions and reasons: keep the project default case timeout and
shard deadlines; do not raise them permanently for these journeys. Do not use
sleeps, retries, skips, or permanent CI jobs to absorb load variance. A flaky
or environment-dependent timeout remains a defect under the project's
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests) until
it is stable locally and in CI. These protect trustworthy gate meaning rather
than treating omitted examples as rejections.

Scope limits: SEED-286#fast-intent-ci-comparison-tests owns the Intent CI
comparison family. Infrastructure acquisition, unrelated branch defects, and
the separate collector lock repair are outside. Other case-local allowances
not named above (including recently-done ad-hoc session journeys and Intent
timing-history journeys) stay outside unless a harness change this story makes
must keep them green. Causal attribution of every remaining CI flake beyond
the patterns above is outside once the named journeys fit.

Safe stopping: each retained change preserves its proof and measurably widens
the affected cases' margin. Remove a case allowance only after the case fits
the default with margin. Drop experiments that add cost or leave their proof
or speedup unestablished.

#### Key examples

1. **Touch review without allowance.** Under local load 20–30 on 2 workers,
   the case "chooses a comparison and file and reads within each pane" passes
   inside the default 30 s; its 2026-11-09 case-local allowance is removed.
2. **Named overdue cases under load.** The eight 2026-11-09 cases,
   first-in-worker journeys, and the SEED-312 review-family cases
   (`story-review-completed-conflicts.spec.ts:73`,
   `story-review-one-shot-choice-races.spec.ts:12`,
   `story-review-one-shot-choice.spec.ts:13`,
   `story-review-completed-merge-edits.spec.ts:11`, alongside
   `story-review-story-branch-landed.spec.ts:27`) that previously timed out
   or missed a 5 s observation finish with margin inside the default 30 s
   and those observations on a hosted shard about 1.5× slower overall and
   locally at load 20–30 on 2 workers; production-deployment and
   agent-completion-recovery allowances are removed after they fit.
3. **One live watcher failure deployment.** The failure journey proves that
   an unavailable origin leaves C serving and that checks resume when the
   origin returns, then continues into failed candidate and failed restoration
   on that same live deployment. The standalone C reactivation and its real
   install/build/start are gone. The restart journey still restarts from
   current main, serves the expected page, preserves the same runner and
   client, accepts input, and detects both an ignored SIGHUP and reuse of the
   previously served revision.
4. **One full retired closure, recovery at the boundary.** One retained
   journey still proves real worktree retirement, installed reporting retry
   that does not repeat Git or native operations, and visible Done. Recovery
   variants hold at the existing CLI/HTTP/store boundary; covered browser
   steps are gone; the temporary closure allowance is removed after the
   journey fits the default.
5. **Causal assertion waits.** A history comparison waits for persisted
   collector results; a revisit request count waits for the first request to
   finish; a story state check waits for the selected story to render. Exact
   counts remain where avoiding duplicate work is the promise. At local load
   20–30 on 2 workers the five cases of `landed-ci-repeat-admission.spec.ts`
   pass in three consecutive runs with their 5 s observations.
6. **Family and suite margins.** The watcher family's median elapsed time,
   including moved work, is at least 10 s faster. The comparable local
   dashboard suite and the slowest hosted shard stay within their previous
   elapsed times. Default case and shard deadlines are unchanged.
7. **Out-of-scope failures stay elsewhere.** An Intent CI comparison timeout
   remains SEED-286's. A collector lock failure or infrastructure setup
   failure is not treated as solved by this story's margin work.

#### Original CI evidence

The [original failure inventory and retained baseline](../slice-plans/576-fit-dashboard-journeys-in-default-timeout/design-and-proof.md#original-ci-evidence-from-the-seed)
retain the 2026-11-10 diagnosis and source links unchanged.

#### Proof locations and measurement

Primary homes for the scope above:
[failure journey](../../dashboard/tests/runtime/production-watcher-failures.spec.ts),
[restart journey](../../dashboard/tests/runtime/production-watcher.spec.ts),
[closure journeys](../../dashboard/tests/sessions/agent-completion-quiet.spec.ts),
[reporting boundary](../../dashboard/backend-tests/sessions/agent-completion-quiet-closure.spec.ts),
[touch review](../../dashboard/tests/review/story-review-touch.spec.ts),
[story-branch landed](../../dashboard/tests/review/story-review-story-branch-landed.spec.ts),
[completed conflicts](../../dashboard/backend-tests/review/story-review-completed-conflicts.spec.ts),
[one-shot choice](../../dashboard/tests/review/story-review-one-shot-choice.spec.ts),
[one-shot choice races](../../dashboard/tests/review/story-review-one-shot-choice-races.spec.ts),
[completed merge edits](../../dashboard/tests/review/story-review-completed-merge-edits.spec.ts),
[production deployment](../../dashboard/backend-tests/runtime/production-deployment.spec.ts).

Human execution amendment, 2026-11-12: Terry asks, “I think you will have to
proceed with this average load because the other tasks are likely to finish
anytime soon. So please adjust things proportionally.” For remaining local
proof, use the contemporaneous natural host load instead of waiting for20–30.
Adjust planning estimates proportionally to observed conditions; retain actual
load and raw elapsed times. Keep two workers, real default30s cases and5s
observations, all coverage and failure duties. Do not turn a load ratio into
an observed speedup or a substitute for comparable before/after conditions.

Compare focused before and after runs with the same selection, workers, cache
conditions, and comparable load. Include the replacement proof in the family
measurement. Check three consecutive focused passes for changed
synchronization, then use the existing local and hosted gates. On macOS, run
the full local gate from an awake machine on AC with `caffeinate -s -i`
under the [maintained sleep guard](../../tests/local-test-resources.md#machine-sleep-on-macos).
Check the slowest hosted shard and the local full-suite elapsed time
separately from summed test durations. The audit used retained CI evidence
and did not run an experiment or measure a saving.

#### Earlier leads that still apply

Recheck which costs from the 2026-11-09 diagnosis still occur before choosing
another experiment.

- Avoid repeating start-origin and app build preparation. Include any work
  moved outside the first case's 30 s in the suite elapsed measurement.
- Answer fake Actions branch tips without a synchronous `git rev-parse` per
  answer (about 46 ms per call). Make fake `gh` calls cheaper while keeping
  auth, hold, pid, signal, and gone-fake behavior. A shell and curl client
  measured about 3× cheaper.
- Check whether the hosted fixture's roughly 66 sequential Git commands
  also affect in-scope cases. They took 60% of the comparison case's time in
  the earlier diagnosis.
- Cut the touch review journey's gesture cost while preserving its reading
  proof. It used 31 phone strokes and 186 touch commands, with 20 strokes
  reading a 3,000 px line to its end and back.
