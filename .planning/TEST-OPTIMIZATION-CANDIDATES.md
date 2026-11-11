# Test Optimization Candidates

## Live candidates

### dashboard-shared-output-budget

- **Affected proof:** SEED-303 watcher, deployment-pinning and preview-lifecycle
  protections, retained in their original ordinary CI selection.
- **Observed cost:** at execution base `f9264268ed39a88c98caa123722d6ff018979748`,
  a normal strict one-worker composition passed 7/7 in 44.61 seconds on AC.
  It paid four deployment installs/build-command attempts, one development
  install, nine preview invocations and two genuine A/B snapshot copies.
  Startup, preparation, native drain/records, transitions and teardown were
  included. This subset excludes origin/HUP/restart, policy/qualification,
  complete pinning distribution/incident protection and all other families.
- **Alternative tried:** the actual CLI's process-only lifecycle owner could
  reuse genuinely built isolated A/B outputs; six focused cases and five
  discriminating fault controls established that seam. The shared composition
  already exceeded the entire story target by 14.61 seconds. This invalidates
  that proposed strategy, not every possible lower bound. The experiment's
  runtime/test edits were parked; original tests remain intact.
- **Decision needed:** choose a supported different strategy, explicitly
  continue independently valuable partial improvements, or revise the target.
  Thirty seconds and equivalent coverage remain binding until a human changes
  the source. Slices 1–3 stay delivered; slice 4 and later execution remain open.
  [Retained evidence and precise gaps](slice-plans/580-speed-up-slowest-dashboard-checks/preview-evidence.md)
  distinguish the paid subset from complete replacement proof.

### auto-refresh-rate-limit-real-waits

- **Affected test or fixture:** `dashboard/tests/observation/auto-refresh-rate-limit.spec.ts`,
  its one case, which has a case-local 45 s timeout allowance, and the
  rate-limited stream case
  `dashboard/tests/observation/revision-stream-lost.spec.ts:84`.
- **Observed cost and conditions:** a CI case time of 26.1 s, 1.4 s of it in
  hooks, against the 30 s default, in run 42588627563 attempt 1 at
  `144981e5f` (2026-11-09; dashboard shard 3 of 12, 4 workers); 25.2 s and
  25.4 s in runs 42372706379 and 42406259249. Locally 21.7 s and 21.5 s at 2
  workers, load about 4–6 (2026-11-07), and 27.5 s at 2 workers, load 15–27
  (2026-11-09). About 20 s of it is real time passing: a 2 s `Retry-After`
  wait, then an `X-RateLimit-Reset` wait of 16–18 s. The stream case took
  10.1 s in run 42588627563, including a 6 s directed wait.
- **Unique protection:** the page asks nothing, even when seen again, before
  GitHub's directed time; the check at that time reads B and clears the
  failure; a reset-time wait longer than the 15 s pace proves the next check
  follows the directed time, not the pace; the steady pace then returns.
- **Alternatives tried:** the page clock is already paused and stepped. The
  server cannot pass the waits sooner, because the request owner
  (`src/skills/dough-execute-plan/scripts/github-request-admission.mjs`, a
  separate released-payload process) holds every read by its real clock. The
  reset wait cannot be shortened below the 15 s pace without losing the
  directed-time-versus-pace distinction. The dashboard server's
  shared-observation clock seam (`dashboard/server/observationClock.ts`) does
  not reach the request owner.
- **Decision or evidence needed:** a developer decision whether the request
  owner, which is released payload code, may take a test-controlled clock, as
  the dashboard server's reuse window does. With that clock the case can drop
  its allowance and real waits, and the stream case its 6 s directed wait.
