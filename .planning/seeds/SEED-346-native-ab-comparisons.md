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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/621-close-native-comparison-harness-gaps/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ed981a188ab81b735042ff7b5a19d7c50529d36d486eb2d66c48e2c0d9dc8b56","plan":"a1b1874980dd48b823e09e9b7e191eb79b8def003d339b61ad1dfef320b84315"}}
```

#### Goal

An Open Dough maintainer running Native guidance checks gets arm-owned
processes stopped, host selection that names only qualified hosts, and per-turn
command and harness facts the runner records once for every case, so the
harness from the completed native A/B comparisons story
(SEED-346#run-native-ab-comparisons-on-real-work, recoverable at
`caeb237278b6dff869fb08e325d9d435e37e58c0:.planning/seeds/SEED-346-native-ab-comparisons.md`) behaves as that
story promises.

#### Scope

Bounded retrospective correction of that story's delivered harness: stop
arm-owned processes, both the services a case started and the arm's host
session, when a started arm ends before its normal end (failed
materialization, a case refusing its host route, or an interrupted run); make
catalog host selection match qualified hosts only; and let the runner record
each turn's command count and harness inspection, as `unknown` when the
turn's stream cannot show them, instead of each case. Findings, provenance and
proof are in the [correction plan](../slice-plans/621-close-native-comparison-harness-gaps/PLAN.md).
