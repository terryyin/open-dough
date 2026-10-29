---
id: SEED-174
status: active
planted: 2026-10-29
planted_during: Terry's request to prioritize dashboard test optimization
trigger_when: A developer runs the dashboard test suite and waits for local feedback
scope: dashboard test feedback
---

# SEED-174: Optimize dashboard test feedback

## Why This Matters

Developers changing the dashboard need prompt, trustworthy test feedback.
Terry requested a new highest-priority backlog item to run the test
optimization skill on the dashboard tests. Profile the current suite before
choosing changes so any claimed improvement reflects measured waiting time.

## Selected Stories

<a id="optimize-dashboard-test-feedback"></a>

### Reduce dashboard test feedback time with measured optimization

**Identity:** SEED-174#optimize-dashboard-test-feedback
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer running the dashboard tests during local work.

**Goal:** Shorten the wait for trustworthy dashboard test results while
preserving behavioral coverage and confidence.

**Scope:** Run `dough-test-optimization` against the dashboard suite, starting
with the ordinary local command `npm run test:dashboard`. Profile browser
journeys, boundary tests, and their shared setup; investigate related test
families and retain only changes supported by comparable measurements.
Follow the project's dashboard test guidance when simplifying tests or moving
proof between tiers.

**Evaluation:** Record the baseline revision, command, runner conditions,
wall time, and executed case count. After experiments, rerun the same local
scope under comparable conditions and report before/after results, retained
behavioral proof, rejected experiments, and remaining candidates. Establish
replacement proof before removing cases. If no worthwhile improvement is
demonstrated, record that outcome and its evidence.

**Open questions for refinement:** Which test families or setup costs dominate
the current local run, and which experiments offer meaningful savings?

## Breadcrumbs

- Terry's explicit request on 2026-10-29 to queue this item first, directly on
  main, and synchronize with origin.
- [Dashboard test guidance](../../dashboard/tests/README.md).
- [Test optimization skill](../../src/skills/dough-test-optimization/SKILL.md).
