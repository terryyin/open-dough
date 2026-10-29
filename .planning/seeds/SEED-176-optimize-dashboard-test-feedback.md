---
id: SEED-176
status: active
planted: 2026-10-29
planted_during: Terry's dough-test-optimization dashboard test request from the dashboard
trigger_when: A developer runs the dashboard test suite and waits for local feedback
scope: dashboard test feedback
---

# SEED-176: Optimize dashboard test feedback

## Why This Matters

Developers changing the dashboard need prompt, trustworthy test feedback.
Terry invoked `dough-test-optimization` on the dashboard tests from the
dashboard. Profile the current suite before choosing changes so any claimed
improvement reflects measured waiting time. SEED-174 already closed one
measured pass; this is a fresh pass against the current suite.

## Selected Stories

<a id="optimize-dashboard-test-feedback"></a>

### Reduce dashboard test feedback time with measured optimization

**Identity:** SEED-176#optimize-dashboard-test-feedback
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/378-optimize-dashboard-test-feedback/PLAN.md","assessment":"not-ready","reasons":["Ordinary local npm run test:dashboard fails board-scroll native scrollbar width (clientWidth equals viewport 1152); no successful comparable baseline, so measured optimization slices stay blocked."],"basis":{"document":"551310d1d353a4eda63476bb9dd42bfb5961d5b1dc1d0948a57284e1cd0e5273","plan":"62abffea570d1f223a22b2928fb4b0ed96f32a8eda2bc21e410829fa557a9ff9"}}
```

**Beneficiary:** A developer running the dashboard tests during local work.

**Goal:** Shorten the wait for trustworthy local dashboard test results while
preserving behavioral coverage and confidence.

**Scope:** Run measured test optimization against the ordinary local command
`npm run test:dashboard`, covering browser journeys, boundary tests, and their
shared setup. Profile before choosing experiments; investigate related test
families; retain only changes supported by comparable wall-time measurements
under like runner conditions. Follow the project's dashboard test guidance when
simplifying tests or moving proof between tiers. Establish replacement proof
before removing or narrowing cases. Re-run the same local command under
comparable conditions after experiments and report before/after wall time and
executed case count, retained behavioral proof, rejected experiments, and
remaining candidates. A demonstrated absence of worthwhile improvement, with
that evidence recorded, satisfies the story.

**Scope limits:** Do not change product behavior to make tests faster. Do not
expand into non-dashboard suites. Do not claim speedup from fewer cases or
lines alone, from focused timings without a comparable full local re-run, or
from CI-only allocation changes that leave the selected local wait unchanged.

**Key examples:**

1. Baseline at a recorded revision runs `npm run test:dashboard` under named
   runner conditions and records wall time and executed case count. After
   retained experiments, the same command under comparable conditions finishes
   sooner with behavioral coverage preserved and replacement proof in place for
   any removed cases.
2. An experiment that fails to improve comparable wall time, or that weakens
   coverage or confidence, is undone or left out; the report names it among
   rejected experiments.
3. Profiling and credible experiments find no worthwhile saving within scope:
   the suite is left unchanged, and the report records that outcome with its
   measurements and remaining candidates.
4. A journey that only repeats a variant the boundary tier can answer has that
   proof moved or dropped per dashboard test guidance, with the cheaper
   surviving check retaining the behavior and the local suite wall time
   improving or the change rejected when it does not.

## Breadcrumbs

- Terry's explicit `/dough-test-optimization dashboard test` launch on
  2026-10-29 (dashboard reference `e9e83d7e-8b56-481e-a5ce-23b20d3ffeee`).
- [Dashboard test guidance](../../dashboard/tests/README.md).
- [Test optimization skill](../../src/skills/dough-test-optimization/SKILL.md).
- Prior closed pass: SEED-174#optimize-dashboard-test-feedback and
  [dashboard test timings](../../docs/maintainer/dashboard-test-timings.md).
