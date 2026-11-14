---
id: SEED-346
status: active
planted: 2026-11-14
planted_during: Terry asked for runnable A/B comparisons using labeled examples from the session-efficiency audit
trigger_when: selected from the product backlog for refinement
scope: story
---

# SEED-346 — Run native A/B comparisons on examples from real work

<a id="close-native-comparison-harness-gaps"></a>

### Close native comparison harness gaps

**Identity:** SEED-346#close-native-comparison-harness-gaps
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/621-close-native-comparison-harness-gaps/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"74f4f34454c1adc7fae61eefa64bc86a18bd8a3eb84fc8e079d14fa5a4eb62c8","plan":"caf6709f2ebcfd553ef758cebdcd8cc427a2afd975cfb77b6883d80bef85df56"}}
```

#### Goal

An Open Dough maintainer running native comparison cases gets arm services
cleaned up, free pair checks that test the working tree they are about to
commit, host selection that names only qualified hosts, and per-turn command
and harness facts the runner records once for every case, so the comparison
harness from the completed native A/B comparisons story
(SEED-346#run-native-ab-comparisons-on-real-work, recoverable at
`caeb237278b6dff869fb08e325d9d435e37e58c0:.planning/seeds/SEED-346-native-ab-comparisons.md`) behaves as that
story promises.

#### Scope

Bounded retrospective correction of that story's delivered harness: stop
arm-owned processes, both the services a case started and the arm's host
session, when materialization fails or a run is interrupted;
make the credential-free pair, refresh and incomplete journeys install payloads
from the working tree rather than the checkout's committed HEAD; and make
catalog host selection match qualified hosts only; and let the runner record
each turn's command count and harness inspection, as `unknown` when the
turn's stream cannot show them, instead of each case. Findings, provenance and
proof are in the [correction plan](../slice-plans/621-close-native-comparison-harness-gaps/PLAN.md).
