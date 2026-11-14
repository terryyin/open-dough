---
id: SEED-350
status: active
planted: 2026-11-14
trigger_when: selected from the product backlog
scope: story
---

# SEED-350 — A practical first CI job reduction

<a id="run-ci-on-fewer-jobs"></a>

### Keep a practical first CI job reduction

**Identity:** SEED-350#run-ci-on-fewer-jobs
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/620-fewer-ci-jobs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4937c0d3774785f71d56e8761587ddd9c0ec1f78e86de760888209c5d1d9bcf9","plan":"d56a8c83feaf14e38909fdaed407e0fb9f1251c87de64a69e0e206d519488664"}}
```

#### Goal

Close this effort with a reasonable first reduction from 22 to 17 CI runner
jobs and the meaningful concurrent-report fix, preserving behavioral confidence.

#### Scope — developer-authorized early closure, 2026-11-14

- Adopt the 17-job layout as a reasonable first reduction; do not require proof
  of the smallest count or matched no-worse overlap for this early close.
  Keep 16 initial jobs plus one proof job: Distribution 3, E2E 5, integrated 4,
  frontend 1 and backend 3, with lint/type-check on the frontend host.
- Keep concurrent CI runs' HTML reports separate and settle started child
  processes before cleanup. Reuse the fix already accepted on main.
- Preserve behavioral tests and their CI proof, producer identities, units,
  missing-part reporting and artifacts. This restriction protects the confidence
  the developer receives with the verdict. Verify the adopted code in CI.
- Remove the three new configuration-string assertions from this change.
  Configuration and data alone are not test subjects; retain tests of meaningful
  behavior inferred from them. The project-wide audit belongs to the first follow-up.
- Queue **Remove tests that only assert configuration or data** first and
  **Reconsider further CI job reduction with a different approach** second.
  Do not execute either follow-up during this closure.
- Retain the measurements and their limits. The six-run screen was inconclusive;
  claim neither a minimum nor a proven no-slower overlap result. Do not extend
  the experiment campaign. Finish and land this bounded effort promptly.

#### Key examples

1. The adopted workflow uses 17 total jobs, retains required behavioral checks
   and complete proof, and passes CI.
2. Eight concurrent group probes retain eight separate real HTML reports;
   a failed child cannot cause cleanup while its peers still run.
3. Changing an internal worker count is configuration, not behavior to freeze
   with literal assertions. Protect a meaningful selection/proof behavior when
   it matters; queue the wider unnecessary-test cleanup first.
4. Further reduction and the decision approach remain unfinished product work,
   retained in the second queued story rather than extending this effort.

#### Superseded scope retained for attribution

The original promise, "Use matched concurrent comparisons and repeated samples
to distinguish layout effects from runner noise.", and the exhaustive search
and job-addition guidance are superseded for this early closure by the developer's
explicit practical adoption and transfer to the second follow-up. Original
intent and the full plan remain recoverable from commit e4a24ce97 before cleanup.
