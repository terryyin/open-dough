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
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"9c4a4a5e5c2e15d118717223f6fb5d2e91bf1201f4d3a29fcdfa36e25c9dc9c4"}}
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

**Scope:**

- In `agent-launch-cursor-model`, `agent-launch-preparation-{codex,cursor,kept}`
  and `agent-launch-start-{codex,cursor,taken}`, a page wait for the answer to
  Start, whether the session's "First input accepted" or the launch problem,
  waits as long as the start itself may take: the launch wait the spec gives
  its dashboard service. `agent-launch-start-codex` already does this for one
  wait through `launchWaitMs` in `dashboard/tests/support/codexStart.ts`; the other
  waits follow that precedent.
- A start that never answers still fails its spec, at the launch wait instead
  of at 5 s, naming the awaited answer.
- Waits that do not follow a real start or publication keep the default
  expect timeout, so an ordinary page defect still fails in 5 s.
- The suite keeps its current worker count and `retries: 0`. The story
  promises CI's verdict under load, and a retry or a narrower run would hide
  a wrong verdict instead of correcting it.

**Key examples:**

- Loaded machine → run the seven specs with `--repeat-each 4 --workers 16` →
  all 40 tests pass, where 14 fail today.
- Idle machine or CI → run the same specs once → they pass as today, taking
  no longer, because each wait ends when its answer shows.
- A start whose answer never shows → the spec fails at that wait once the
  launch wait elapses, with the awaited text in the failure.
- A page assertion before Start, such as the Model menu's options → a wrong
  value still fails after the default 5 s.

**Deferred promises:** Other dashboard specs that wait on a real start are not
verified under load here; none failed in the evidence. They may share the same
wait where that falls out of the repair.

**Boundary:** This repository's dashboard tests and test support only.

**Refinement evidence (2026-10-04):**

- The seven specs at `--repeat-each 4 --workers 16` failed 14 of 40. Every
  failure was the first page wait after Start, timing out at the default
  5000 ms: `agent-launch-cursor-model.spec.ts:82`,
  `agent-launch-start-cursor.spec.ts:57`,
  `agent-launch-preparation-cursor.spec.ts:64`,
  `agent-launch-preparation-kept.spec.ts:55`,
  `agent-launch-preparation-codex.spec.ts:53` and
  `agent-launch-start-taken.spec.ts:83`.
- The same command with the expect timeout temporarily set to 30 s passed 40
  of 40. The waits watch the right answer and miss no event; they only need
  the launch time. This settles the question left at queueing.
- None of the seven has failed in CI.
