---
id: SEED-350
status: active
planted: 2026-11-14
trigger_when: selected from the product backlog
scope: story
---

# SEED-350 — Fewer CI jobs at the same wall time

<a id="run-ci-on-fewer-jobs"></a>

### Run CI on as few jobs as its wall time allows

**Identity:** SEED-350#run-ci-on-fewer-jobs
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer pushing to `main` or a Story Branch gets CI's
  verdict as soon as the slowest test job allows. Today a run can be slowed by
  waiting for a free runner, because it starts more parallel jobs than the
  account can run at once. Keeping each run on few jobs leaves runners free
  for overlapping pushes. Agents also stop treating extra jobs as the way to
  shorten CI.
- **Evidence.** The account runs at most 20 jobs at once. Commit `3069e8b`
  ("Run the repository suite in four CI shares") raised a run to 21 parallel
  jobs: lint, 4 test shares and 6 + 5 + 1 + 4 browser shards. On main, run
  43552321296 took 349 s against 294 s for run 43532089843 (`7fb4234`, 17
  jobs). Its slowest job finished sooner (258 s against 278 s), and total
  runner time was unchanged (3,487 s against 3,513 s). The difference was
  waiting: `test (1/4)` waited 77 s for a runner. `ci-proof` waited 74 s
  because the overlapping branch run 43552606318 took the runners main freed.
  Branch runs 43552606318 and 43553608245 also waited up to 70 s and 79 s.
  The fourth test share cut share times from 145–229 s to 122–138 s, but the
  slowest job is `dashboard-integrated` shard 5/5, so the extra share made no
  run faster. Setup is about 16 s per job. CI history shows job counts only
  growing: 2 browser shards, then 12, 13, and now 16, plus test shares 3 → 4.
- **Evaluation.**
  - Reduce the number of parallel jobs in a CI run as far as possible, with
    no floor of 19 or 18. Every group's job count is open, not only test
    shares (4 → 3, 2 or 1). The browser groups, lint and the per-job time
    limits are open too.
  - Compare each candidate's wall time, alone and while another run
    overlaps, against the current layout. Use matched, concurrent runs and
    keep enough samples to tell the difference from runner noise. Keep a
    reduction only when wall time is no worse. Keep the reductions that pass
    and record those rejected, with their measurements.
  - The story is done when CI runs on the smallest job count that passed
    without a worse wall time, with the measurements recorded.
- **Document the rule.** Write the rule where agents changing the CI layout
  will see it: this repository's test automation guidance in `AGENTS.md`,
  and the shard and share sizing documentation. A job is added only when
  measured wall time, including the wait for a runner under the account's
  concurrency limit, shows that it helps. Shortening the slowest job is not
  enough.
- **Boundary.** Keep every test and its CI proof. Fewer jobs must not mean
  fewer tests or less proof. Speeding up the tests themselves is
  `dough-test-optimization` work, not this story's.
- **Value / learning.** Learn whether CI's current wall time comes from the
  number of jobs or from its slowest group. Stop job counts from growing
  without measurement.
- **Safe stopping point.** The documented rule, together with one measured
  reduction or a measured no-change, is a useful stop.
