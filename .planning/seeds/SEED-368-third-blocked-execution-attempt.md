---
id: SEED-368
status: active
planted: 2026-11-15
planted_during: Terry closed the second blocked-execution attempt and requested its successor
trigger_when: selected from the product backlog
scope: story
---

# SEED-368 — Reduce model work during prolonged supplier waiting (third try)

<a id="reduce-model-work-during-prolonged-supplier-waiting"></a>

### Reduce model work during prolonged supplier waiting (third try)

**Identity:** SEED-368#reduce-model-work-during-prolonged-supplier-waiting
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/635-wait-silently-for-a-paused-supplier/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"467dc9e6d05b2aea5145d1ad1b9470642ff9e0a43f4765452a74e4e9c307d599","plan":"4d541de3819d5f0eac0fd115902cfcdf497886a9a61a9f77e86325662b125937"}}
```

#### Goal

For a developer who tells a blocked execution to watch its paused supplier, the
unchanged wait costs almost no model work: the model re-enters when the supplier
publishes, when the host ends its longest wait, or at the watch deadline, and
at no other time. This is the third try; the
[maintained findings](../../docs/maintainer/blocked-execution-experiment-findings.md)
retain the first two.

#### Scope

- **The watch is one silent wait.** On a watch request for a paused supplier,
  the coordinator starts one maintained command that prints nothing while the
  supplier's published revisions are unchanged and ends with one result on a
  publication or at the deadline. It replaces the watcher each session
  improvised. The coordinator awaits it under the existing
  [long proof run wait](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md)
  and its host rules: the host's notification where one exists, otherwise the
  longest wait the host accepts.
- **A publication ends the wait once.** The coordinator then judges the
  publication against the exact supplier agreement as it does today: a
  nonqualifying one keeps the hold and the watch continues to the same
  deadline; a qualifying one continues the execution once.
- **The watch has a deadline:** 60 minutes from the watch request, or the
  duration the developer names. At the deadline the execution stops with its
  recorded resume condition, as a paused-supplier hold without a watch does
  today. Reason: on a host without notification every wait that ends re-reads
  the whole context, so an unbounded watch keeps spending for as long as the
  supplier stays paused.
- **Everything outside the unchanged wait keeps its current behavior:** partial
  work, accepted proof, supplier judgment, one continuation, publication and
  CI rules, and a hold that receives no watch request.

Scope limits: host adapters, a watcher agent, a dashboard or daemon resume, and
phase-loading or general verification efficiency belong to other work.

#### Evaluation

Decided by Terry on 2026-11-15, replacing the earlier whole-task bar and
matched native comparison: no paid run.

- Deterministic checks prove the wait command: silent while unchanged, one
  result on publication, one result at the deadline.
- The guidance change takes the maintainer behavior review.
- The benefit is predicted until observed. The findings document records the
  check for the next real supplier watch, judged from its session trace: keep
  when the unchanged wait shows at most one model re-entry per five minutes on
  Codex, none on Claude Code, and at least 90% cached input on the re-entries;
  otherwise remove the added guidance.

#### Architecture

No responsibility is added: the wait rule's existing owner gains one more wait.
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) §1 and §3
apply (guidance edit with deterministic checks, native observation recorded as
pending); Terry chose this over the §4 matched comparison under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md), because
that comparison costs more model work than the wait it measures.

#### Evidence

Observed locally on 2026-11-15 without a paid run:

- In the second try's watch trace the session wrote its own watcher, which
  printed `unchanged` every 30 seconds, and polled it with a 30-second wait;
  each poll re-read the whole context.
- Codex 0.169.0 accepts an empty poll of up to 300 seconds. Across 2,873 local
  Codex sessions, responses after a 270–330 second gap were 97.7% cached, 89.0%
  after 330–600 seconds, and about 74% beyond ten minutes.
- The saving grows with the length of the wait, so a short benchmark cannot
  show it (11.92% ceiling with 180-second windows) and a long one pays for the
  waste in its baseline arm.
- The native supplier-watch profile is retired.

#### Key examples

- Paused supplier, developer says “you watch it”, supplier stays unchanged →
  one silent wait runs; on Codex the model re-enters at most once per 300
  seconds, on Claude Code not until the wait ends; no clock, status, or log
  call runs in between.
- A nonqualifying publication arrives during the watch → the wait ends once,
  the hold and partial work stay, and the watch continues to the same deadline.
- A qualifying publication arrives → the wait ends, and the execution
  reassesses the exact agreement and continues once with preserved proof.
- 60 minutes pass unchanged and no duration was named → the watch ends and the
  execution stops with its recorded resume condition. “Watch it for three
  hours” → the deadline is three hours.
- Paused supplier and no watch request → the execution stops with its resume
  condition as today; no wait starts.
- Supplier qualifies at entry → no wait starts and the path reads no watch
  guidance.
