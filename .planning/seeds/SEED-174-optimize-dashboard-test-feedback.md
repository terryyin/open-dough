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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/376-optimize-dashboard-test-feedback/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9ef7328d4ec3b10995f7f67847362b23168f8557594e150b346ba4d111c6af7a","plan":"aaf0a48cc536bfe680550d73e17fb314021f42a9e3fe80a33ad479c308d97349"}}
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
A recent CI shard-allocation experiment was already rejected; that path is not
reopened unless new evidence shows it shortens the ordinary local command.

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

- Terry's explicit request on 2026-10-29 to queue this item first, directly on
  main, and synchronize with origin.
- [Dashboard test guidance](../../dashboard/tests/README.md).
- [Test optimization skill](../../src/skills/dough-test-optimization/SKILL.md).
- Prior measured work that closed without local-suite gain: rejected dashboard
  allocation experiment (`91756ccd`) and production-policy test optimization
  (`7e687acd`).
