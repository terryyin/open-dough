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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Maintainers and agents get the same dashboard suite result
  locally, under the machine's usual parallel load, and in hosted CI, without
  case-local timeout allowances.
- **Evaluation.** The touch review case "chooses a comparison and file and
  reads within each pane" passes without its 2026-11-09 allowance, which is
  removed. First-in-worker cases and the eight cases above finish with
  margin inside the default 30 s and their 5 s
  observations on a hosted shard about 1.5× slower overall and locally at
  load 20–30 on 2 workers.
- **Boundary.** Keep every assertion and the default timeout, with no
  wall-clock waits. The Intent CI comparison family is out of scope;
  SEED-286#fast-intent-ci-comparison-tests owns it. Candidate causes from the
  2026-11-09 diagnosis: prepare shared test data (start origin, app build)
  outside the first test's 30 s; answer fake Actions branch tips without a
  synchronous `git rev-parse` per answer (about 46 ms per call); make each
  fake `gh` call cheaper while keeping its auth, hold, pid, signal and
  gone-fake contract (a sh and curl client measured about 3× cheaper); probe
  hosted fixture arrangement cost (about 66 sequential git commands, 60% of
  the failing comparison case's time); and cut the touch review journey's
  gesture cost (31 phone strokes and 186 touch commands, 20 strokes reading a
  3,000 px line to its end and back) without narrowing what it reads.
- **Value / learning.** Removes recurring CI failures on unrelated
  publications and lets local full gates give trustworthy verdicts.
- **Effort driver.** The harness changes reach every dashboard journey.
- **Safe stopping point.** Each kept change measurably widens its cases'
  margin. An allowance goes only when its cases fit without it.
