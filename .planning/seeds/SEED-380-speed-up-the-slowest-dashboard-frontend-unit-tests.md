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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/653-speed-up-the-slowest-dashboard-frontend-unit-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4edc06150cb4c01fc9fa22e6dc996a5eb2e09f6078b9c4cb9d38fe982e4df5d8","plan":"9ed6c5859f24d1caa75e01c874eeb9150333b38cbf22fbd830b91aa710675153"}}
```

**Goal:** Dashboard contributors get faster local frontend test feedback while
keeping the same behavioral protection.

**Scope:** Use retained CI case timings to rank individual cases in
[Dashboard Frontend Test](../../dashboard/frontend-tests/README.md)
(`npm run test:dashboard:frontend`). Focus on the slowest 10% of cases by
duration, rounding the case count up. Use a complete, comparable baseline and
prioritize the cases with the most removable cost within that group.

The baseline is the `dashboard-frontend` job's report of CI run 43773156778
(attempt 1, green, at `09e70e926`): 456 cases, 975 s summed case time, so the
group is its 46 slowest cases, each 3.9 s or longer, 240 s together. The
preceding green run 43755447775 timed the same 46 cases at 247 s and ranked 43
of them in its own slowest 46, so about 3% of the group's time is run-to-run
variation. Re-rank from the latest complete green run when execution starts and
cases have changed.

Scope limits: a shared cause found in the group, such as a harness setting or
a helper, is changed once for all its consumers, and cases outside the group
gain from it without being investigated one by one. CI job layout and worker
counts stay as they are.

**Tactics:** Follow the
[test optimization tactics](../../.agents/skills/dough-test-optimization/references/optimization-tactics.md)
and try other approaches when measurements expose a better opportunity.
Try disabling animations in the test harness where they only delay the
assertion. Check the same observable result and keep real motion or timing in
cases that test it.

**Outcome:** Keep changes that show a worthwhile gain in comparable before and
after measurements and preserve behavioral proof. A gain is worthwhile when the
affected cases' time drops by more than repeated unchanged runs of those cases
differ. Report the gain for the affected cases and measure suite wall time
separately when claiming faster feedback for the whole suite.

**Key examples.**

- Given the baseline run's 456 timed cases, ranking by case duration selects
  the 46 slowest. A case such as "scrolling Recently done reaches all 45
  retained sessions" (9.5 s) is in the group; a 2 s median case is outside it.
- Given a group case whose time goes to waiting for the page's next periodic
  read, extra page loads, or repeated arrangement, when that cost is removed
  and the case still checks the same observable result, alternating before and
  after runs of the affected cases show the drop, and the change is kept with
  its measured gain.
- Given cases that only wait for a transition to finish before asserting, when
  the harness disables animations, they assert the same result sooner. Cases
  that prove motion or its reduced-motion alternative, such as the board swipe,
  the keyboard start under reduced motion, and the connection logo, keep real
  motion.
- Given a tried change whose before and after times differ by no more than the
  unchanged cases' own variation, the change is undone and reported as no
  demonstrated gain.
- Given two cases in the group that prove the same rule, one is removed or
  merged only after the surviving case is shown to catch the same failure.
- Given kept changes, the report states the affected cases' summed time before
  and after. It claims a shorter whole-suite wait only with before and after
  wall times of the unfiltered `npm run test:dashboard:frontend`.
