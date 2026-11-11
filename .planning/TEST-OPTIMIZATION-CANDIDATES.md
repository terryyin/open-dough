# Test Optimization Candidates

## Live candidates

### auto-refresh-rate-limit-real-waits

- **Owner:** [SEED-315](seeds/SEED-315-provider-rate-limit-checks.md#speed-up-provider-rate-limit-checks),
  extracted at Terry's early handoff; queued and Not ready, with no agent assigned.
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
