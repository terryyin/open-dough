---
id: SEED-185
status: active
planted: 2026-10-30
planted_during: SEED-183 delivery, whose branch CI failed only the split time budget
trigger_when: A CI split fails the time budget with no assertion failure
scope: the CI time budget's reliability under runner speed variance
---

# SEED-185: CI Time Budget Holds Under Runner Variance

## Why This Matters

The CI time budget fails a split when its jobs together exceed a fixed number
of job-seconds. Runner speed alone now decides that: a change that adds no
test time can fail, and the rerun passes. The ceiling has already been raised
once for this reason (710 to 750 on 2026-10-28), so another raise only delays
the next failure.

## Selected Stories

<a id="align-refresh-guidance"></a>

### Align duration-list refresh guidance with recorded-speed scaling

**Identity:** SEED-185#align-refresh-guidance
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/417-align-refresh-guidance/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"175a5298312fc75032f5b4da5d93925845c5a7654f3c161495c2752f6e6c88fc","plan":"605686bec3a58f6f28e0b64d7a882f6a221505cc8cf94b5bb4c2f5a92147ab01"}}
```
**Plan:** [417-align-refresh-guidance](../slice-plans/417-align-refresh-guidance/PLAN.md)

**Goal:** A contributor refreshing a duration list from CI artifacts reads
guidance that matches the delivered scaling behavior, so they do not expect
raw runner seconds to be written into the list.

**Scope:**

- Required behavior:
  - `tests/test-shares.md` and `dashboard/tests/shards.md` state that refresh
    scales observed times to the existing list's runner speed and records the
    factor on the `# Source:` line (or that the factor was unavailable).
  - They no longer claim refresh "keeps the seconds" as written observation.
- Scope limits:
  - No change to refresh, deal, budget judgment, or ceilings.
  - No change to existing list headers already on disk beyond what guidance
    describes; code behavior stays as delivered by SEED-185#stable-ci-time-budget
    (before-cleanup `1bc270042dab3a1bb94c11cf31bdf82adaf8c402`).

**Key examples:**

- After a slow-runner refresh, a reader of either guide expects list-speed
  seconds and a source line naming the runner factor, matching
  `tests/support/duration-list.test.mjs`'s 1.3× case.
