---
id: SEED-407
status: active
planted: 2026-11-19
planted_during: Terry set a longer-term frontend feedback target during Story Notes refinement
trigger_when: selected from the backlog
scope: one story
---

# SEED-407 — Frontend feedback at about 100 ms per case

<a id="run-the-story-notes-checks-at-about-100-ms-per-case"></a>

### Run the Story Notes checks at about 100 ms per case

**Identity:** SEED-407#run-the-story-notes-checks-at-about-100-ms-per-case
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/717-run-the-story-notes-checks-at-about-100-ms-per-case/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3a7b76e79265c2c1a92468ab7b1475b1b4d1c922fa68b5b0077e45121d1f656a","plan":"fd060aab08d5ab67251008450a0457feb79ef2d37c3170936999e141ab97dc54"}}
```

**Goal.** A developer changing the dashboard gets Story Notes feedback whose
cases average about 100 ms of their own time, with the invocation's fixed
startup shown beside it. Story Notes is the first measurable group toward
frontend feedback at about 100 ms per case across the suite, where startup
is shared by every case as it is in Doughnut.

**Scope.**

- Judge two numbers from the ordinary
  `npm run test:dashboard:frontend -- stories/story-notes` command at the
  usual two-worker local budget, in repeated fresh invocations. Terry chose
  this over a 1.1 s wall-time target on 2026-11-19.
  - *Case time:* the durations the run reports for the eleven original
    cases sum to about **1.1 seconds**, from 3.7 s. A mount, arrangement or
    cleanup a change moves outside the reported durations is added back.
  - *Fixed startup:* elapsed time of a fresh invocation selecting one case,
    less that case's duration, about 1.8 s today. Report it before and
    after, and reduce it where a change is cheap. It has no target.
- Report the case count, each case's duration, their sum, the fixed
  startup and the whole command's elapsed time, with load. Under load,
  compare matched before and after pairs.
- Keep all eleven behaviors, including refusing a write, reopening after a
  stale read, restoring keyboard focus and keeping a live terminal attached.
  Preserve the original case denominator when reorganizing proof.
- Keep the cases in the real browser at a production boundary. A case may
  mount a smaller production boundary when it still proves its card count,
  dialog, focus, context and service requests.
- Scope limits: no runner kept warm between invocations, no whole-command
  wall-time target, and no rollout beyond Story Notes, which the separate
  Dashboard frontend family story owns.
  [Other frontend families](SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-other-frontend-families-at-the-mounted-boundary)

**Key examples.**

- The eleven cases pass in a fresh invocation → their reported durations
  sum to about 1.1 s, and repeated invocations agree.
- The attached-terminal case took 0.94 s → it still shows the terminal
  mounted, connected and printing while notes are open, and its duration
  counts in the sum; the family meets the target on the sum.
- A case's board mount moves into shared preparation → that preparation's
  time is added to the sum, so the move alone shows no gain.
- A case is split in two or merged with another → the sum still divides by
  eleven.
- A startup change is tried → the one-case invocation is timed in matched
  pairs before and after; without a measured gain the change is dropped.
- The sum reaches 1.1 s while the command still takes over 2 s → the story
  is met, and the report shows the startup that remains.

**Baseline (2026-11-19).** At `47cf696e5`, Node 24.21.0, 16 cores, two
workers, load 5.1–6.9:

- The ordinary command took 4.4–5.2 s for eleven cases. Listing the same
  selection, which starts Vitest without a browser, took 1.0 s. One selected
  case with 170 ms of its own time took 2.0 s.
- Through the Vitest API directly: creating Vitest 0.70–0.80 s, the run
  3.1 s, closing 0.02 s. npm and the runner add about 0.4 s.
- The cases' own time sums to 3.7 s: the attached-terminal case 0.94 s, six
  cases 0.29–0.44 s, four 0.08–0.17 s.
- Registering all eleven cases in one scratch file left each case's own time
  unchanged (sum 3.6 s). Two scratch files, one per worker, ran in 2.9–3.0 s
  against 3.1 s for the six files. Six workers gave 3.8 s for the command.
  File count and isolation are not the cost.
- The dependency optimizer reused its cache. The `native` and `bundle`
  configuration loaders both fail on the current test-support sources.
- The preceding story halved the family from the original `e8e01643a`
  (9.7–11.9 s to 4.3–5.4 s in matched A–B–B–A pairs at load 6.4–8.8).
- Doughnut reported 2,573 frontend cases in 65 seconds, about 25 ms per
  case, with headless Chromium, file isolation and half the available
  workers. At `47bf1d9532` a fresh single-file invocation spent 1.25–1.7 s
  before launching its browser, which is not installed outside its Nix
  shell here, so no case ran. Its figure is startup amortised over the
  suite.
  [Doughnut configuration](https://github.com/nerds-odd-e/doughnut/blob/a23441f741486ea5bde7e892038ba33b408d78a4/frontend/vitest.config.ts),
  [drag-rule cases](https://github.com/nerds-odd-e/doughnut/blob/a23441f741486ea5bde7e892038ba33b408d78a4/frontend/tests/lib/book-reading/bookLayoutBlockDragIntent.spec.ts)
  and [reported suite timing](https://github.com/terryyin/open-dough/blob/3977778ddb4e4a4fa6e743d1da7a886c8df53582/.planning/seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md)
