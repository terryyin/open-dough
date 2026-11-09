# Test Optimization Candidates

## Pending candidates

### auto-refresh-rate-limit-real-waits

- **Locations / scope:** `dashboard/tests/observation/auto-refresh-rate-limit.spec.ts`,
  the one case, with its case-local `test.setTimeout(45_000)`.
- **Observed cost:** 25.2s in hosted run 42372706379; 21.7s locally before
  SEED-260 slice 2 and 21.5s after it (2 workers, load about 4–6,
  2026-11-07). About 20s is real time passing: a 2s `Retry-After` wait, then
  a `X-RateLimit-Reset` wait of 16–18s.
- **Unique protection:** the page asks nothing, even when seen again, before
  GitHub's directed time; the check at that time reads B and clears the
  failure; a reset-time wait longer than the 15s pace proves the next check
  follows the directed time, not the pace; the steady pace then returns.
- **Alternatives attempted:** the page clock is already paused and stepped.
  The server cannot pass the waits sooner because the request owner
  (`src/skills/dough-execute-plan/scripts/github-request-admission.mjs`,
  a separate released-payload process) holds every read by its real clock.
  The reset wait cannot be shortened below the 15s pace without losing the
  directed-time-versus-pace distinction. The shared-observation clock seam
  added in the same slice (`dashboard/server/observationClock.ts`) does not
  reach the request owner.
- **Disposition / rationale:** pending — the case keeps the smallest
  measured allowance until the request owner's clock can be controlled.
- **Date:** 2026-11-07
- **Human decision needed:** whether the request owner, which is released
  payload code, may take a test-controlled clock, as the dashboard server's
  reuse window now does.
- **Evidence / follow-up:** hosted run 42406259249 measured 25.4s. With that
  seam the case can drop the allowance and the real waits, and the 6s
  directed-wait span left in `revision-stream-lost.spec.ts` (rate-limited
  stream case) can go too.

### production-deployment-pinned-build

- **Locations / scope:** `dashboard/tests/runtime/production-deployment.spec.ts`,
  the pinned install, build and serve case, with its case-local
  `test.setTimeout(45_000)`.
- **Observed cost:** 32.1s in hosted run 42372706379. Locally 10.4s before
  SEED-260 slice 6 and 7.3s after it (2 workers, load about 2–4); 15.5–28.5s
  in a six-worker repeated family run at load about 14 (2026-11-08).
- **Unique protection:** the pinned commit, not the later main, is fetched,
  installed with `npm ci`, built and served from its own checkout outside
  development, with local cartoons and supplied icons, the preview boundaries,
  and a clean preview stop recorded in its incident record.
- **Alternatives attempted:** the full-source fixture now adds its copy in one
  pack (`core.bigFileThreshold=1`), which removed most of its contended
  `git add` cost. The remaining cost is the real dependency install (about
  11,000 files) and Vite build the case proves; a substitute or shared build
  would lose that proof, and moving staging into a shared hook would only
  move the cost there.
- **Disposition / rationale:** pending — the case keeps the smallest
  allowance above its measured hosted cost until hosted timing after the
  fixture change shows whether it is still needed.
- **Date:** 2026-11-08
- **Evidence / follow-up:** hosted run 42406259249 measured 17.4s, against
  32.1s before the fixture change. Hosted cases vary by up to about 2x between
  runs. Remove the allowance once two or more hosted runs keep it at 15s or
  less; otherwise decide whether a cheaper dependency set may stand in for the
  full install.

### hosted-margin-dashboard-journeys

- **Locations / scope:** dashboard cases that have no allowance and took
  20–25s in hosted run 42406259249, against the 30s default. Watcher steps:
  `production-watcher-updates.spec.ts` (held commit, next-commit
  replacement); `production-watcher-failures.spec.ts` (preview ended, restart
  after hang-up, failed preview start); `productionUpdatePolicies.ts`
  (accumulated range, policy repair, next commit after failure). Other cases:
  `responsive-session-reconciliation.spec.ts:46`,
  `agent-completion-recovery.spec.ts:26`,
  `cursor-runner-replacement.spec.ts:84`, `sessions-sidebar.spec.ts:56`,
  `agent-launch-attention.spec.ts` (Taken card).
- **Observed cost:** 20.3–23.9s each in that run, with 35 further cases at
  15–20s. Across 2,122 cases matched with run 42372706379, the median ratio
  was 1.02 and p90 was 1.53. One unchanged case went from 13.8s to 26.5s. Two
  cases that had passed at 25s timed out in runs 42395811294 and 42399373902
  before being split.
- **Unique protection:** each case's own journey; watcher steps keep one real
  install, build and preview staging each.
- **Alternatives attempted:** journeys that reached 22–28.5s were split or had
  real costs removed. Single-staging watcher steps cannot be split further.
  The suite-wide cost is fake `gh` and `claude` Node process starts plus
  tracing. Locally, one journey used about 10.5s of CPU for 6.4s of wall time.
- **Disposition / rationale:** pending — they pass with margin in most runs,
  but hosted variance can push them to the default.
- **Date:** 2026-11-08
- **Evidence / follow-up:** judge margins across several hosted runs, or
  against a 16–24-worker local stand-in with tracing on. Reduce the shared
  per-journey cost, such as fake-host process starts and trace capture, before
  splitting more journeys. Repair any case that times out under the failing
  and flaky test policy. Related: explicit waits over 30s outside the
  watcher files, such as `recentlyDoneRefresh.ts` `toPass` 45s and
  `responsive-session-recovery-verification.spec.ts` 60s. About 40 short
  elapsed waits, such as absence windows and settle delays, still break the
  rule against waiting for wall-clock time.

  Local follow-up on 2026-11-08 at `fd3c59811` used two workers and the strict
  reporter with a second reporter for step timing. A 34-case selection across
  14 specs passed in 34.81s and 32.96s with the default trace and in 31.25s
  between those runs with `--trace=off`. All 12 integrated cases still took
  over 1s each with tracing off, excluding shared hooks. The sample focused on
  sessions, with additional backend runtime and browser navigation checks.
  Machine load varied and another worktree was running tests. Evaluate lighter
  capture with failure evidence preserved and measure subprocess costs
  separately.

### intent-ci-comparison-two-read-journeys

- **Locations / scope:** four cases, each with a case-local
  `test.setTimeout(60_000)`. In
  `dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts`:
  "a cancelled landing names the proofless build before a running build and
  reads again when it finishes" and "a cancelled landing at the read trunk
  head waits for a later trunk build and uses it once pushed". In
  `dashboard/tests/intent/intent-ci-comparison-retry.spec.ts`: "a Baseline
  listing that failed once is listed again on the next read, then
  remembered" and "Check again recovers a done Story Branch Baseline that
  failed once, then asks GitHub nothing".
- **Observed cost:** in hosted runs 42545962329, 42547299886, 42548594053 and
  42557657479, in that order: reads again 17.9, 14.7 and 13.1s, then timed
  out at 30.7s; trunk head 18.0, 15.7, 13.9 and 19.0s; Baseline listing 13.3,
  12.6, 12.4 and 11.2s; Check again 14.3, 13.9, 11.9 and 11.6s. In
  42557657479 dashboard shard 5 took 1.48× as long as in 42548594053 (742s
  to 1,099s; files up to 2.5×, median 1.38×), and two single-read cases of
  the reads-again file 3.1–3.4× as long. The timed-out case spent 18.2s
  arranging its Git history and 7.6s on its first read, and had not finished
  its second. Locally on 2026-11-09, at two
  workers on a 16-core Mac at load 14–30, the four took 18.9–27.6s. As a
  worker's first case, a case also paid the run's on-demand fixture
  preparation: 10.7, 11.3 and 26.4s against 0.5–2.8s otherwise, about
  47–51s in all at load 22–25. Each read asks 16–31 sequential `gh` calls,
  such as 22 head_sha listings of 13 revisions in the reads-again case's
  first read, and runs about 77 Git processes in the dashboard server. At
  load 21–24 a call took p50 131–175ms, p90 255–293ms, of which the fake
  `gh` Node start was p50 57–94ms. Under the full local suite a call took
  0.3–1.1s.
- **Unique protection:** each case's second read. A cancelled landing's
  answer is read again once its running build finishes. A trunk-head landing
  uses the later trunk build once it is pushed. A failed Baseline listing is
  listed again, then remembered. Check again recovers the Baseline and then
  asks GitHub nothing.
- **Alternatives attempted:** waiting for each Check again read to finish
  instead of 5s removes the retry cases' assertion races, not their read
  cost; the sibling SEED-261 Intent story's commit `acfd70db4`, now on
  trunk, owns that repair (`checkComparisonAgain`). Splitting a case would
  drop the second read it proves. A branch-tip read from the fake origin's
  ref files removes a `git rev-parse` per fake Actions answer, about 46ms of
  each call at load 21. It cuts only part of each call and does not give
  these cases the 2–3× hosted margin or the first-case headroom they need.
- **Disposition / rationale:** pending — 60s is the smallest measured
  allowance. It covers the worst observed need, about 51s locally as a
  worker's first case and about 33s hosted on the slow shard, with about 9s
  to spare. 45s would not cover the first-case need.
- **Date:** 2026-11-09
- **Human decision needed:** Terry authorized these four allowances on
  2026-11-09. They stay until SEED-286#fast-intent-ci-comparison-tests,
  queued on trunk the same day, makes the family sub-second without raised
  timeouts.
- **Evidence / follow-up:** the harness speedups B, C, D and F below are
  queued as
  [SEED-287#fit-dashboard-journeys-in-default-timeout](seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout).
  B, take the run's on-demand fixture preparation
  out of the first case's 30s: a worker-scoped readiness fixture, which has
  its own timeout slot as `launchJourney` does, or background preparation in
  global setup as the story-columns history has. C, a cheaper fake `gh` per
  call: a `sh` and `curl` client measured p50 26–66ms against 75–193ms for
  the Node one, at load about 45. D, answer fake Actions requests without
  starting Git: about 46ms per call to about 0 in a trial. E, share each
  revision's head_sha listing across one read's Baseline, Branch and Landed
  walks, as attempt jobs already are in
  `dashboard/server/baseCiGithubRevisionLookup.ts`: 9 of the reads-again
  case's 31 calls; `acfd70db4`, now on trunk, makes this change, so measure
  again once it is integrated. F, a hosted probe of the arrangement:
  fixture Git without fsync, and fewer pushes. Locally, fsync made no
  difference. After those
  land, measure again and remove each allowance once its case keeps 2.5×
  headroom under the 30s default in two or more hosted runs and in a loaded
  local run, including as a worker's first case. Two single-read cases of
  the reads-again file, at its lines 30 and 52, also reached 29.1s and
  27.2s on the slow shard without an allowance.

### story-review-touch-reading-strokes

- **Locations / scope:** `dashboard/tests/review/story-review-touch.spec.ts`,
  "chooses a comparison and file and reads within each pane", with a
  case-local `test.setTimeout(60_000)` in its one body. The phone and tablet
  describes both run that body, so the allowance covers both cases.
- **Observed cost:** locally on 2026-11-09, at two workers on a 16-core Mac,
  17.2–27.6s at load 10–28. Repeated four times at load 21–36, 5 of 8 runs
  timed out: the phone case all four times at 30.6–33.5s and the tablet case
  once at 32.4s, otherwise 19.9–27.2s. As a worker's first case it timed out
  at 31.4s, with 11.3s of fixture preparation. Hosted runs 42548594053 and
  42557657479 took 15.6–18.6s. The phone case makes 31 native touch strokes,
  186 CDP touch commands at 55–250ms each under load. Twenty of the strokes,
  two of them corrections, read the roughly 3,000px `wideLine` to its end and
  back. The tablet case makes 22 strokes.
- **Unique protection:** the real touch path through a large comparison on
  phone and tablet. Tap-sized controls choose All changes and a file. Native
  touch scrolling reads the long added line's beginning and end and the long
  file within the diff pane, while the file browser, fixed headers and page
  stay put.
- **Alternatives attempted:** trunk commit 818481d9f cut each stroke from
  ten moves to four. That took the phone case from 370 touch commands to 186.
  Shortening the shared `wideLine` fixture was considered and declined on
  2026-11-09. The `scrollend` settle added the same day costs 7–128ms per
  stroke, and only on the case's last 1,000px gesture.
- **Disposition / rationale:** pending — 60s on the same basis as
  `intent-ci-comparison-two-read-journeys`. The slowest local run at load up
  to 28, 27.6s, plus the largest first-case fixture preparation, 26.4s, is
  about 54s. A run at load 36 went past 33.5s. 45s would not cover a
  worker's first case.
- **Date:** 2026-11-09
- **Human decision needed:** Terry authorized this allowance on 2026-11-09.
  It stays until
  [SEED-287#fit-dashboard-journeys-in-default-timeout](seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout)
  lands.
- **Evidence / follow-up:** with the allowance, the touch spec repeated twice
  at two workers at load 8.8–15.0 passed 8 of 8. The phone case took 30.5s
  as its worker's first case and 24.2s otherwise; the tablet case took 18.4s
  and 19.1s. The per-command cost and first-case preparation that SEED-287
  targets would shrink this case. Fewer strokes for the wide line would too.
  Remove the allowance once the case keeps 2.5× headroom under the 30s
  default in two or more hosted runs and in a loaded local run, including as
  a worker's first case.

## Accepted necessary costs

### story-review-completed-journey-landed-runs-tail

- **Locations / scope:** `dashboard/tests/review/story-review-completed.spec.ts` trailing
  `keepUnusableCompletedCapture` + Landed runs radio + gap copy; gaps boundary
  already owns the same server-answer variant.
- **Observed cost:** focused journey wall ≈9.69–10.00s (1 case) under default
  workers on the SEED-196 host (2026-10-30).
- **Unique protection:** the real Published completion → Landed runs →
  Published completion radio round trip and restoration of the published file
  list after an unusable capture; server fallback proof cannot show this UI.
- **Alternatives attempted:** end journey before unusable-capture / Landed
  runs; focused wall 11.07–11.51s — no wall gain; undone.
- **Disposition / rationale:** accepted necessary cost — retain the one
  integrated selection path. Prior truncation gave no gain and removed unique
  control/restore proof. This accepts the marginal tail, not all fixture cost;
  reopen with concrete cheaper proof or fresh setup evidence. No skip/exclusion.
- **Date:** 2026-11-01
- **Evidence / follow-up:** [source comparison and ROI](../docs/maintainer/dashboard-test-value-review.md#4-completed-reviews-landed-runs-tail);
  SEED-196 slice 2 measurements remain in the recorded local timing evidence.

### agent-launch-poles

- **Locations / scope:**
  `dashboard/tests/terminals/agent-launch-ad-hoc-terminal.spec.ts` and the remaining
  integrated journey in `dashboard/tests/launches/agent-launch-second-server.spec.ts`.
- **Observed cost:** the second-server case measured 64.6s before the
  SEED-176 change-wait boundary move and 52.5s / 51.2s after on the developer's
  Mac. Whole-suite runs had unlike or contended load, so these case timings
  establish no comparable suite-wall gain. No separate ad-hoc-terminal
  timing was retained in the legacy disposition. After SEED-221 removed the
  close/reopen races' poll waits, focused runs of the ad-hoc-terminal spec
  took 1.7–1.9s per race against a 16.4–17.0s baseline (local, load 4.7–5.4,
  2026-11-02). SEED-260 slice 4 passed the second-server page's reads with
  the paused page clock and gave the second server its own short slow-start
  threshold: 48.9s → 6.3s locally (load 4–6), from 55.6s in CI, at the
  default case timeout.
- **Unique protection:** dual-preview page protection through reload and
  project switch, and immediate terminal attachment after an ad hoc launch.
- **Alternatives attempted:** cheaper server-only refusal and non-owner
  change-wait checks already moved to boundary tests in SEED-176; SEED-177
  subsequently shortened the boundary's configured bound. No further cheap
  replacement for the remaining integrated protection was established.
- **Disposition / rationale:** accepted necessary cost — preserve the unique
  multi-step journeys. SEED-208 slice 7 reduced the terminal input matrix to
  one text journey; the races now pass their launch-records read with the
  paused page clock instead of a poll wait. Acceptance excludes nothing;
  normal verification and CI continue running them. The project has no
  profile-exclusion mechanism. Reopen only with new evidence.
- **Date:** 2026-10-30
- **Evidence / follow-up:** [SEED-176 local measurements](../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-2026-10-29--2026-10-30);
  accepted triage at `03424649`, with its final ownership clarification at
  `fd5303c0`. These decisions survive SEED-176/SEED-177 cleanup.

### long-integrated-journeys

- **Locations / scope:** `dashboard/tests/sessions/agent-completion-attention.spec.ts`
  and the production-watcher chains in `dashboard/tests/runtime/production-watcher.spec.ts`,
  `dashboard/tests/runtime/production-watcher-updates.spec.ts`, and
  `dashboard/tests/runtime/production-watcher-failures.spec.ts`.
- **Observed cost:** the SEED-177 local baseline recorded an approximately
  39.6s attention case. Earlier hosted production-update chains, including
  shared hooks, varied from 116.84s to 194.81s on Ubuntu 24.04 with twelve
  shards and four workers per shard. These are case/chain timings, not
  additive local suite-wall savings; the chain showed no reliable elapsed
  improvement. After SEED-221 removed the attention journey's two poll waits,
  focused runs took 6.1–7.0s against a 36.1–36.2s baseline (local, load
  12.6–13.3, 2026-11-02). SEED-260 slice 6 added the full-source fixture in one
  pack and moved the first activation from the lifecycle and update hooks into
  the first test that asserts it. Their hooks went from 24.1s and 28.6s in CI
  (13.9s and 13.5s locally) to 4.5s and 5.4s locally, and the failure file's
  hook from 10.5s to 7.5s, all at the default timeout. The failure file's
  first activation then also moved from its hook into its first test, since
  hosted CI showed a single staging costs about 11–15s, so each failure-file
  test stages at most one deployment. The two-build held
  update and the policy case were split into serial steps. Slice 7 split the
  82.1s CI recovery case (27.0s locally) into five serial steps, each at most
  6.1s locally. Its documentation-only commit now reaches main while the
  failing commit's build is held, and that build consumes its one-shot cause
  as it fails, so the failed commit is not retried and the next commit does
  not fail first; the steps assert both. The failure file's two-build cases became
  serial steps with a separate restart step. Every case override in these
  files was removed.
- **Unique protection:** attention reporting remains durable and readable
  through column changes, retirement, restart, Mark as read, and Mark as done;
  production-watcher journeys retain real activation, published-policy,
  failure/recovery, serving, and cleanup protection across steps.
- **Alternatives attempted:** earlier policy consolidation moved detailed
  qualification proof to a real-Git boundary case and removed two successful
  activations while retaining the watcher journey. SEED-177 closed without
  further narrowing these long journeys.
- **Disposition / rationale:** accepted necessary cost — retain unique
  integrated protection, preserving the accepted coverage decision. SEED-208
  slice 8 moved the raw refusal rows to `boundary/agent-completion-identity`;
  the attention journey now passes its launch-records reads with the paused
  page clock instead of poll waits. Any further variant removal or boundary
  move needs separately authorized scope
  and established replacement proof; acceptance grants no coverage reduction
  or profile exclusion. Normal verification and CI keep these tests.
- **Date:** 2026-10-30
- **Evidence / follow-up:** accepted triage at `03424649`; SEED-177 baseline
  analysis in
  `7732299ae62a72d8a292f6dbfc854eb08e10037d:.planning/slice-plans/413-optimize-dashboard-test-feedback/PLAN.md`;
  [production-policy proof and measurements](../docs/maintainer/production-policy-test-timings.md).
  Plan 413 explicitly excludes thinning these necessary-cost journeys.

## Profile-only exclusions

None.

## Transferred obligations

### card-attention-launch-and-origin-setup

- **Locations / scope:** `dashboard/tests/sessions/agent-launch-attention.spec.ts`
  and its shared story-column origin and launch helpers.
- **Observed cost:** two ordinary focused runs at `fd3c59811` passed in 13.01s
  and 12.02s wall with two workers on macOS, Node 24.21.0 and Playwright 1.63.0.
  The cases took 3.19s and 4.72s excluding shared hooks. A separate step profile
  measured about 3s per worker in `beforeAll` and 1.7s per case opening the
  board and launching its first three sessions. Seven launches and six full
  page loads drain real reads. The eight 15s advances took 13ms to step on
  the paused page clock, with about 0.42s separately spent on session answers.
  A one-worker profile shared the origin build, observed 116 synthetic GitHub
  CLI API calls, and took 14.27s wall with the cases running sequentially.
- **Repository baseline:** on macOS with Node 24.21.0 and two workers, both
  attention cases passed in 11.38 and 8.36 s before fixture migration and
  7.28 and 6.75 s after. Host load differed. With the same completion clock,
  story-columns setup took 2.35–2.44 s before and about 0.60 s after, with
  matching Git bytes, refs, and commit identities. The five-case preparation
  owned-context selection passed in 5.91 s before and 5.25 s after on the
  same upstream base. Its first fixture took 272.9 and 245.6 ms respectively,
  and warm fixtures took 125.9–128.2 and 21.0–21.7 ms respectively.
  With the run preparing the story-columns history once at its start and each
  worker copying it (2026-11-08, two workers, interleaved runs under load
  7–8), the attention and recent-sessions selection passed in 9.14–9.42 s
  against 9.75–10.21 s with per-worker builds; each worker's fixture
  construction fell from 0.92–1.07 s to 0.41–0.46 s, and the prefix build
  took 0.53–0.56 s overlapping the app build.
- **Unique protection:** visible attention counts across published columns,
  failed or missing native observations, Mark as done, project switching and
  reload, and the local entry after a story leaves all published lists.
- **Alternatives attempted:** profiled the original journey. Existing helpers
  can seed native listings and persisted open launch records. The launch-dialog
  journey already owns coverage of starting from a card.
- **Disposition / rationale:** the shared repository description and
  materializer supplied the baseline for the reuse work, which now prepares
  the story-columns history once per run (`tests/support/repository-snapshot.mjs`).
  The launch cost is gone: both cases now open with their sessions already
  kept and listed (`dashboard/tests/storyCardOpenSessions.ts`), sending no
  Start and launching nothing. That arrangement measured 0.59–0.61s per case
  against 1.77–2.20s before.
- **Date:** 2026-11-08
- **Evidence / follow-up:** run the named spec with `npm run test:dashboard --`
  and the repository-relative path. Compare default two-worker wall time,
  shared hook time, and both cases' durations.
