---
id: SEED-046
status: active
planted: 2026-09-27
planted_during: Wrap-up of SEED-037#fourfold-local-suite (plan 107)
trigger_when: The integrated CI workflow's median wall time exceeds 120 s, or a CI job nears its budget ceiling
scope: 1 story
---

# SEED-046: Keep the CI verdict fast as the suite grows

## Why This Matters

An agent waits for trunk's CI verdict at its completion points: execution
handoff, wrap-up, and trunk integration. Slice deliveries do not wait; CI
repair is asynchronous. A faster verdict therefore saves each story a few
waits, and, with several agents publishing to trunk, it shortens how long
others build on a broken trunk before repair starts.

SEED-037 brought CI's `Run test` step from 174 s to 115 s on its branch, but
trunk's tests grew meanwhile. On `main` after SEED-037 landed (`bfdf893`,
`15362af`, `2b18837`, `199ae44`), `Run test` took 110, 140, 140, and 143 s,
and the whole workflow 154–163 s. The `test` job sets the verdict; the
`dashboard` job follows at 131–137 s (21 s installing Playwright Chromium,
98 s in the browser suite).

## Alternatives and Decision

The runner already keeps CI's four cores busy: `199ae44` ran 569.5
job-seconds in 143 s, about 569.5 / 4. The 45 s
`tests/git-publication-native.sh` starts first and is not on the critical
path, so shortening it saves about 6 s. Reaching 120 s by cutting work would
mean removing about 90 job-seconds across many checks, each needing a
coverage-map approval.

Refinement on 2026-09-27 chose instead to split the work across parallel CI
jobs. The repository is public, so extra standard runners cost nothing, and
no check is removed or weakened. The trade-off is accepted: total work is not
reduced, so growth returns later as longer split jobs, and reducing work
remains test optimization's concern for local feedback. Raising the budget alone keeps CI green but lets
the wait creep back.

Judge progress by CI, not local wall time: local job-seconds on a shared,
loaded machine mostly measure contention. GitHub assigns runner classes up to
about 1.5× apart, so use at least five runs per measurement.

## Stories

<a id="ci-verdict-round-2"></a>

### Bring the integrated CI verdict back under 120 s by splitting CI's checks across parallel jobs

**Identity:** SEED-046#ci-verdict-round-2
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/122-ci-verdict-parallel-jobs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c6a785b720a4eedede4d7857d3f1d42dbedf48ad6a5aa8b1c043feb77f355437","plan":"90fdb395a2d5ac71eb3b21566c1a1cc3c4b718fef61010ffd523706c1d862208"}}
```

**Goal:** Every revision published to trunk gets its CI verdict — the whole
CI workflow finishing — at a median of at most 120 s over at least five runs,
from about 155–163 s now, with every check still running on CI exactly as
strictly as before. Agents at completion points wait less, and a red trunk
shows sooner to every agent publishing to it.

**Scope:**

1. **Checks split across parallel CI jobs.** CI runs the shell and node
   checks as several jobs on separate runners, two expected. Every check the
   runner discovers, including the self-installation check, runs in exactly
   one of them, without a hand-maintained list, so a new check file is
   covered automatically. A local `npm test` still runs every check.
2. **The dashboard job no longer sets the verdict.** The browser suite
   finishes within the target too, by Playwright's own sharding across CI
   jobs, or within one job when using the runner's cores is enough.
3. **The time budget belongs to CI.** `tests/time-budget` applies to each
   split job and is recalibrated from the split runs by its existing rule
   (1.5× the largest observed values). A breach still fails CI. Local runs no
   longer print the budget report: its ceilings describe CI's runner, and
   local times on a loaded machine measure contention. CI keeps each split
   job's `test-times`, and the `longest-first` refresh instructions cover
   them.

**Key examples:**

1. A revision reaches `main` → CI runs lint, the split test jobs, and the
   dashboard in parallel → across at least five runs the workflow's median
   wall time is at most 120 s, and every discovered check appears in exactly
   one split job's `test-times`.
2. A maintainer adds `tests/new-check.sh` → next CI run → it runs in exactly
   one split job, with no list edited; a local `npm test` runs it too.
3. A check fails in one split job → that job fails naming the check, as the
   `test` job does today, and the verdict is red.
4. A split job's total exceeds its ceiling on CI → that job fails with the
   budget report. The same over-ceiling times in a local `npm test` on a
   loaded laptop print nothing and exit 0 when every check passes.

**Rejection constraints:** no retries, loosened assertions, skips, or longer
timeouts to gain speed; no check is removed or merged away (removing a run
needs another run that observes the same promise at the same boundary, with
the maintainer's approval of the coverage map).

**Out of scope:** reducing test work, including profiling
`tests/git-publication-native.sh`; fewer `git fetch` calls per
`execution-start` (that changes remote-state freshness, a product decision
for its own story); tightening the per-job ceiling or a per-check time
target; local test speed; larger or paid runners; the native adapter check's
silent `run_selected` failure and the copied result-path parse, now
[SEED-049#native-result-path-diagnosis](SEED-049-native-result-path-diagnosis.md#native-result-path-diagnosis).

## When to Surface

Now: second in the product backlog, after SEED-048, per the maintainer on
2026-09-27.

## Breadcrumbs

- SEED-037 plan 107 and its measurements are recoverable at
  `e67796d:.planning/quick/107-cut-test-work-and-ci-wait/PLAN.md`; the
  earlier leftovers list is at
  `f10d52e:.planning/slice-plans/117-observer-stop-and-test-infrastructure-cleanup/PLAN.md`.
- SEED-048#explicit-test-environment (recoverable at
  `8de2d7f:.planning/seeds/SEED-048-explicit-test-environment.md`) also
  changed `scripts/test.sh` (chosen checks, Git environment).
- Tests README "Installation and update coverage gaps" lists four installer
  promises no check observes yet.
