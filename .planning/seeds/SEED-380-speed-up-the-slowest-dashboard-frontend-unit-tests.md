---
id: SEED-380
status: active
planted: 2026-11-16
planted_during: Developer request to prioritize dashboard frontend test speed
trigger_when: selected from the product backlog
scope: story
---

# SEED-380 — Speed up the slowest dashboard frontend unit tests

<a id="speed-up-the-slowest-dashboard-frontend-unit-tests"></a>

### Speed up the slowest dashboard frontend unit tests

**Identity:** SEED-380#speed-up-the-slowest-dashboard-frontend-unit-tests

**Goal:** Dashboard contributors get faster local frontend test feedback while
keeping the same behavioral protection.

**Scope:** Use retained CI case timings to rank individual cases in
[Dashboard Frontend Test](../../dashboard/frontend-tests/README.md)
(`npm run test:dashboard:frontend`). Focus on the slowest 10% of cases by
duration, rounding the case count up. Use a complete, comparable baseline and
prioritize the cases with the most removable cost within that group.

**Tactics:** Follow the
[test optimization tactics](../../.agents/skills/dough-test-optimization/references/optimization-tactics.md)
and try other approaches when measurements expose a better opportunity.
Try disabling animations in the test harness where they only delay the
assertion. Check the same observable result and keep real motion or timing in
cases that test it.

**Outcome:** Keep changes that show a worthwhile gain in comparable before and
after measurements and preserve behavioral proof. Report the gain for the
affected cases and measure suite wall time separately when claiming faster
feedback for the whole suite.
