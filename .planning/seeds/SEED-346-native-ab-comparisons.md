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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/621-close-native-comparison-harness-gaps/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"042e3ef0221def916e3348f1ca5b3332f5216886f517e6cbad42c2f770124674","plan":"d2e97f85671d661bc9ea272d383db6fbde513c94a851e50ec863b1faa5e25773"}}
```

#### Goal

An Open Dough maintainer running native comparison cases gets arm services
cleaned up, free pair checks that test the working tree they are about to
commit, and host selection that names only qualified hosts, so the comparison
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
catalog host selection match qualified hosts only. Findings, provenance and
proof are in the [correction plan](../slice-plans/621-close-native-comparison-harness-gaps/PLAN.md).
