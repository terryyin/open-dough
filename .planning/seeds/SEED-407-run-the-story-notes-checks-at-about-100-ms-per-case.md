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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer changing the dashboard wants frontend feedback at about 100 ms
per case. Use Story Notes as the first measurable group. Time the ordinary
`npm run test:dashboard:frontend -- stories/story-notes` command from
invocation through exit at the usual two-worker local budget. Divide elapsed
time by the number of original cases that completed successfully. Eleven
cases today would return in about **1.1 seconds**. Report the actual count,
elapsed time and average in repeated fresh invocations. Keep individual
case durations alongside them to locate costs. A fast edit case alone
cannot establish the family result.

Keep all eleven behaviors, including refusing a write, reopening after a
stale read, restoring keyboard focus and keeping a live terminal attached.
Preserve the original case denominator when reorganizing proof. Count setup
and teardown, including any preparation introduced by the proposed change.
The preceding story delivered about half the baseline on 2026-11-19: in
matched A–B–B–A pairs at load 6.4–8.8, the original `e8e01643a` took 9.7–11.9 s
and the mounted family 4.3–5.4 s, ratios 0.41–0.50. In a 5.0 s run at load
8.4, about 0.9 s was runner startup before Vitest, 0.2 s npm and 3.9 s Vitest:
tests 65%, import 27% (about 1.1 s, rising to about 2.5 s at load 12) and
worker 9%. The attached-terminal case was slowest at about 1.1 s; the others
took 100–900 ms. Above load 11 the same pairs reached 0.51–0.54. The one-third
milestone moved here on 2026-11-19 with its untried experiments: mount the
three edit cases at the smallest production boundary that proves their card
count, dialog, focus, context and service requests, and make configuration
loading and dependency preoptimization distributable on the supported Node
range. Vitest attributed 30 to 43% of the mounted phase to imports. The
separate Dashboard frontend family story owns rollout beyond Story Notes.
[Other frontend families](SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-other-frontend-families-at-the-mounted-boundary)

Doughnut reported 2,573 frontend cases in 65 seconds, about **25 ms per
case** across the suite. Its Vitest configuration runs headless Chromium
through Playwright, preserves file isolation and allows parallel files
locally with half the available workers. Six drag decisions exercise a
production layout rule directly. During refinement compare the same
wall-time metric and investigate how much of Doughnut's speed comes from
amortizing browser startup and choosing a small production boundary for
each assertion. Record worker count and case mix for each comparison.
[Doughnut configuration](https://github.com/nerds-odd-e/doughnut/blob/a23441f741486ea5bde7e892038ba33b408d78a4/frontend/vitest.config.ts),
[drag-rule cases](https://github.com/nerds-odd-e/doughnut/blob/a23441f741486ea5bde7e892038ba33b408d78a4/frontend/tests/lib/book-reading/bookLayoutBlockDragIntent.spec.ts)
and [reported suite timing](https://github.com/terryyin/open-dough/blob/3977778ddb4e4a4fa6e743d1da7a886c8df53582/.planning/seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md)
