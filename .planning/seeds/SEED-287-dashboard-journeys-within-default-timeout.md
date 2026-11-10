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

Plan 502 removed the timeout allowances of dashboard cases that cost at most
15 s in hosted CI, but several journeys still run close to the 30 s default
or their 5 s observations. On 2026-11-09 hosted run 42557657479 timed out an
Intent CI comparison case on a dashboard shard that took 1.48× as long
overall (files up to 2.5×). Locally at load 13–36 (a VM plus other
worktrees' suites), the phone touch review journey timed out in 5 of 8
repeats. A final dashboard run at load 17–23 then timed out or missed a 5 s
observation in eight more cases: `agent-launch-preparation-codex(-retry)`,
`responsive-session-access`, `responsive-session-reconciliation`,
`responsive-session-recovery-restart`, `side-panel-content-replacement`,
`production-deployment` (past its 45 s allowance) and
`agent-completion-recovery`. All sixteen tests in those files passed at one
worker. A case that runs first in its worker also pays the run's on-demand
fixture preparation (10.7–26.4 s), and each fake `gh` call starts a Node
process (p50 57–94 ms at load 21–24). Terry authorized a case-local allowance
for the touch review case on 2026-11-09; this story removes the need. Three
test optimization candidates moved here when SEED-284 converted Open Dough's
record on 2026-11-09: `story-review-touch-reading-strokes`,
`production-deployment-pinned-build` and `hosted-margin-dashboard-journeys`.
Their evidence is at `144981e5f:.planning/TEST-OPTIMIZATION-CANDIDATES.md`.
That conversion's run of the commented specs at 2 workers and load 24–27
also timed out `production-watcher.spec.ts`'s first-in-worker `beforeAll`
past 30 s (12.9 s first step alone) and both variants of
`backend-tests/review/story-review-completed.spec.ts:27` at 30.4 s (30.0 s
alone at load 16–18; 14.4 s for its 5 cases in hosted CI); Terry routed both
here. Project findings [DD-473](../../ProjectFindings.md#dd-473)
(`review/story-review-story-branch-landed.spec.ts:27`, 31.7–34.4 s at load
21–27), [DD-476](../../ProjectFindings.md#dd-476) (whole runs at load 13–36)
and [DD-479](../../ProjectFindings.md#dd-479)
(`backend-tests/launches/start-origin-isolation.spec.ts:140`, 30.0 s at load
37) are further cases of the same margin. The Intent CI comparison family
belongs to SEED-286#fast-intent-ci-comparison-tests.

<a id="fit-dashboard-journeys-in-default-timeout"></a>

### Make dashboard journeys fit the default timeout under load

**Identity:** SEED-287#fit-dashboard-journeys-in-default-timeout
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/576-fit-dashboard-journeys-in-default-timeout/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c925c0df0ea24e844d31ae2a2057b5f47529adae8c0ea7d08e0618d6bbaad641","plan":"bce6605366e195d5b168ac56b30066b3152682900b686a5595c4f99ef0cacdf6"}}
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
  problem (`story-review-completed`, DD-473/DD-476/DD-479 routes, and the
  three candidates moved from SEED-284).
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
2. **Named overdue cases under load.** The eight 2026-11-09 cases and
   first-in-worker journeys that previously timed out or missed a 5 s
   observation finish with margin inside the default 30 s and those
   observations on a hosted shard about 1.5× slower overall and locally at
   load 20–30 on 2 workers; production-deployment and
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
   counts remain where avoiding duplicate work is the promise.
6. **Family and suite margins.** The watcher family's median elapsed time,
   including moved work, is at least 10 s faster. The comparable local
   dashboard suite and the slowest hosted shard stay within their previous
   elapsed times. Default case and shard deadlines are unchanged.
7. **Out-of-scope failures stay elsewhere.** An Intent CI comparison timeout
   remains SEED-286's. A collector lock failure or infrastructure setup
   failure is not treated as solved by this story's margin work.

#### CI failure evidence and decisions, 2026-11-10

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

#### Proof locations and measurement

Primary homes for the scope above:
[failure journey](../../dashboard/tests/runtime/production-watcher-failures.spec.ts),
[restart journey](../../dashboard/tests/runtime/production-watcher.spec.ts),
[recovery journey](../../dashboard/tests/sessions/agent-completion-recovery.spec.ts),
[closure journeys](../../dashboard/tests/sessions/agent-completion-quiet.spec.ts),
[reporting boundary](../../dashboard/backend-tests/sessions/agent-completion-quiet-closure.spec.ts),
[touch review](../../dashboard/tests/review/story-review-touch.spec.ts),
[production deployment](../../dashboard/backend-tests/runtime/production-deployment.spec.ts).

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
