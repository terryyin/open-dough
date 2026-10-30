---
id: SEED-196
status: active
planted: 2026-10-30
planted_during: Terry's dough-test-optimization dashboard test request with top-40% scope
trigger_when: A developer runs the dashboard test suite and waits for local feedback
scope: dashboard test feedback, top 40% cost contributors
---

# SEED-196: Optimize dashboard test feedback (top 40%)

## Why This Matters

Developers changing the dashboard need prompt, trustworthy test feedback.
Terry invoked `dough-test-optimization` on the dashboard tests and asked to
extend the investigation scope to the top 40% of cost contributors. Profile
the current suite before choosing changes so any claimed improvement reflects
measured waiting time. SEED-174, SEED-176, SEED-177, SEED-180, SEED-191,
SEED-193, SEED-194, and SEED-195 already closed earlier passes; this is a
fresh pass against the current suite with that wider cost band.

## Selected Stories

<a id="optimize-dashboard-test-feedback"></a>

### Reduce dashboard test feedback time with measured optimization

**Identity:** SEED-196#optimize-dashboard-test-feedback
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Beneficiary:** A developer running the dashboard tests during local work.

**Goal:** Shorten the wait for trustworthy local dashboard test results while
preserving behavioral coverage and confidence.

**Scope:** Run measured test optimization against the ordinary local command
`npm run test:dashboard`, covering browser journeys, boundary tests, and their
shared setup. Profile before choosing experiments. Seed investigation from the
tests and files that make up the top 40% of suite cost by recorded duration
contribution under that profile; follow related families across files and
tiers when they share responsibility or setup cost with those contributors.
Retain only changes supported by comparable wall-time measurements under like
runner conditions. Follow the project's dashboard test guidance when
simplifying tests or moving proof between tiers. Establish replacement proof
before removing or narrowing cases. Re-run the same local command under
comparable conditions after experiments and report before/after wall time and
executed case count, retained behavioral proof, rejected experiments, and
remaining candidates. Update `.planning/TEST-OPTIMIZATION-CANDIDATES.md` with
the latest-pass summary and current candidate state, including removing any
transferred obligation whose receiving story has already closed with its work
done. Preserve accepted necessary costs unless new evidence supports
reopening them. Leave pending candidates unless a wall-improving approach
appears. A demonstrated absence of worthwhile improvement, with that
evidence recorded, satisfies the story.

**Scope limits:** Do not change product behavior to make tests faster. Do not
expand into non-dashboard suites. Do not claim speedup from fewer cases or
lines alone, from focused timings without a comparable full local re-run, or
from CI-only allocation changes that leave the selected local wait unchanged.
Do not thin journeys already recorded as accepted necessary costs without new
evidence.

**Key examples:**

1. Baseline at a recorded revision runs `npm run test:dashboard` under named
   runner conditions and records wall time, executed case count, and the
   ranked top 40% cost contributors. After retained experiments on families
   rooted in that band, the same command under comparable conditions finishes
   sooner with behavioral coverage preserved and replacement proof in place for
   any removed cases.
2. An experiment that fails to improve comparable wall time, or that weakens
   coverage or confidence, is undone or left out; the report names it among
   rejected experiments.
3. Profiling and credible experiments find no worthwhile saving within the
   top-40% band: the suite is left unchanged, and the report records that
   outcome with its measurements and remaining candidates.
4. A journey that only repeats a variant the boundary tier can answer has that
   proof moved or dropped per dashboard test guidance, with the cheaper
   surviving check retaining the behavior and the local suite wall time
   improving or the change rejected when it does not.

## Breadcrumbs

- Terry's explicit `/dough-test-optimization dashboard test, extend the scope
  to top 40%` invocation on 2026-10-30.
- [Dashboard test guidance](../../dashboard/tests/README.md).
- [Test optimization skill](../../src/skills/dough-test-optimization/SKILL.md).
- [Test optimization candidates](../TEST-OPTIMIZATION-CANDIDATES.md).
- Prior closed passes: SEED-174, SEED-176, SEED-177, SEED-180, SEED-191,
  SEED-193, SEED-194, and SEED-195, and
  [dashboard test timings](../../docs/maintainer/dashboard-test-timings.md).
