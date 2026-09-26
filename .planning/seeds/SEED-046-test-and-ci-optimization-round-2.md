---
id: SEED-046
status: active
planted: 2026-09-27
planted_during: Wrap-up of SEED-037#fourfold-local-suite (plan 107)
trigger_when: The integrated CI `Run test` median exceeds 120 s, or a job nears the committed per-job ceiling
scope: 1 story
---

# SEED-046: Keep the CI verdict fast as the suite grows

## Why This Matters

Agents publishing to trunk wait for each revision's CI verdict, and that wait
is the feedback loop parallel agents repeat most. SEED-037 brought the CI
`Run test` median from 174 s to 115 s on its own branch, but trunk's own
tests grew from about 174 s to about 200 s during the same period, so the
suite as integrated on `main` runs at a median of about 130 s (seven runs of
`146c373` and `bfdf893`: 97, 101, 119, 136, 138, 139, 139 s). The committed
time budget (`tests/time-budget`) had to be recalibrated to 70 s per job and
840 job-seconds in total, mostly because `tests/git-publication-native.sh`
takes 44–46 s on CI.

## Alternatives and Decision

Judge progress by CI, not by local wall time. SEED-037 showed that local
job-seconds on a shared, loaded machine mostly measure CPU contention, while
CI's `test-times` artifact gives per-job times on a dedicated runner. GitHub
assigns runner classes up to about 1.5× apart, so compare job sums within
one class and use several runs per candidate. The strongest simpler
alternative is to raise the budget as the suite grows; that keeps CI green
but lets the verdict wait creep back.

## Stories

<a id="ci-verdict-round-2"></a>

### Bring the integrated CI verdict back under 120 s and clear SEED-037's leftovers

**Identity:** SEED-046#ci-verdict-round-2
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Every revision published to trunk gets its CI verdict at a median
of at most 120 s again, with no single job near the per-job ceiling, and the
test-infrastructure leftovers from SEED-037 no longer cause silent failures
or duplicated mechanics.

**Realistic targets (to confirm in refinement):**

- CI `Run test` median at most 120 s over at least five runs of the
  candidate, from about 130 s now: roughly 10% less CI work.
- No job above 30 s on CI, so the per-job ceiling can return from 70 s to
  about 45 s through the ordinary calibration rule (1.5× the largest job).
- No local total-work target: local runs are judged only for correctness and
  silence.

**Candidate work:**

- `tests/git-publication-native.sh` (44–46 s on CI): profile it, then cut its
  per-run cost or split it into independent checks so the suite's parallel
  slots stay busy.
- Fewer `git fetch` calls per `execution-start` (seven per start now); this
  changes how fresh remote state is, so the freshness rule needs the
  maintainer's decision.
- Re-profile CI's longest jobs from the latest `test-times` artifact.

**Cleanup carried from SEED-037** (not covered by correction plan
`slice-plans/117-observer-stop-and-test-infrastructure-cleanup/PLAN.md`, which
stays separate):

- `tests/support/native-updated-use-adapter-assert.sh`'s `run_selected` can
  still fail silently when the wrapper prints no result path; the
  updated-use check gained a diagnostic for this, the adapters check did not.
  The same result-path `awk` parse is copied in about six test scripts.
- Fixture repositories exposed to Git's background maintenance and the
  Git-version-dependent `ci-repair-stash.test.mjs` moved to
  [SEED-048#explicit-test-environment](SEED-048-explicit-test-environment.md#explicit-test-environment).
- The local budget report prints on most local runs, because the ceilings
  are CI-calibrated; decide whether to keep it, make the check CI-only, or
  compare local times against a local ceiling.

**Rejection constraints:** no retries, loosened assertions, skips, or longer
timeouts to gain speed; removing a test run needs another run that observes
the same promise at the same boundary, with the maintainer's approval of the
coverage map.

## Open Decisions

- The fetch-freshness rule, if fewer fetches per start is pursued.
- The local budget report's behavior.

## When to Surface

Now: first in the product backlog, per the maintainer on 2026-09-27.

## Breadcrumbs

- SEED-037 plan 107 and its measurements are recoverable at
  `e67796d:.planning/quick/107-cut-test-work-and-ci-wait/PLAN.md`.
- Tests README "Installation and update coverage gaps" lists four installer
  promises no check observes yet.
