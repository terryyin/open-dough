---
id: SEED-093
status: active
planted: 2026-10-03
planted_during: Maintainer request to group project retrospective findings and queue the two highest priorities
trigger_when: A change proved locally fails CI for a reason the local proof could not show
scope: unknown
---

# SEED-093: Local checks agree with CI

## Why This Matters

Executing agents and maintainers publish Open Dough work on the strength of
this repository's local checks. The
[project findings](../../ProjectFindings.md#priority-assessment) show those
checks repeatedly disagreeing with CI: tests that race under CI's load, and
checks whose result depends on the directory they start in. Each failed CI run
pauses the slices in progress for a stash, diagnosis, repair, and publication
cycle, and each false local failure costs a diagnosis and a rerun.

## Stories

<a id="launch-card-waits-hold-under-load"></a>

### Launch-card specs give CI's verdict on a loaded machine

**Identity:** SEED-093#launch-card-waits-hold-under-load
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** The agent running the dashboard suite on a developer machine
that also runs other work needs the launch-card specs to give CI's verdict,
so a passing change does not cost a diagnosis and a rerun before it can be
published.

**Goal:** The launch-card specs that wait for a real start or publish pass on
a loaded developer machine as they do in CI and on an idle machine.

**Findings:**
[tests whose verdict depends on timing or machine load](../../ProjectFindings.md#tests-whose-verdict-depends-on-timing-or-machine-load-first-priority-queued)
(DD-222).

**Evidence:**

- `agent-launch-cursor-model`, `agent-launch-preparation-{codex,cursor,kept}`
  and `agent-launch-start-{codex,cursor,taken}` failed 7 times in one full
  local run under load and 18 of 40 at `--repeat-each 4 --workers 16`, and
  passed at `--workers 2`. None has failed in CI.
- `agent-launch-cursor-model.spec.ts:82` waits the default 5 s for "First
  input accepted" after Start; one full run from outside the repository
  failed it there, then it passed 15 of 15 when repeated.
- Each spec allows its test 120 s, but the page wait uses the default expect
  timeout.

**Open question for refinement:** the earlier race repairs waited for events
and did not lengthen deadlines. Whether these waits miss an event or only
need the launch time the specs already allow decides the repair.

**Boundary:** This repository's dashboard tests and test support only.
