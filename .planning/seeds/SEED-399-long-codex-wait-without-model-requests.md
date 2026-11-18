---
id: SEED-399
status: active
planted: 2026-11-18
planted_during: Refining SEED-389's Codex story, Terry chose to queue the Codex long-wait correction as its own story
trigger_when: selected from the backlog
scope: one story
---

# SEED-399 — A long Codex wait still wakes the model about once a minute

<a id="let-a-long-codex-wait-run-without-model-requests"></a>

### Let a long Codex wait run without model requests

**Identity:** SEED-399#let-a-long-codex-wait-run-without-model-requests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/698-let-a-long-codex-wait-run-without-model-requests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5cea8f047cc40ebc9bb4b25321caa34a4528f0defafe82395810ee95b6a3904f","plan":"a922d60ae093138e09ff6a27e7b1fee665d788349bc5404cb8fb055947df76cd"}}
```

**Goal:** A developer running Open Dough on Codex can leave a long proof
run, CI completion wait, or paused-supplier watch alone until it has a
result or reaches its deadline. During an unchanged interval, the wait
uses as few model requests as the host allows. Real Codex traces show the
gain against the current wait.

**Scope:**

- Apply the correction at the shared
  [Codex long-wait procedure](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#by-host).
  In code mode, a quiet interval that fits in an observed host window
  needs zero model requests after the wait starts. A longer interval
  needs a continuation only when the host hands control back, using the
  same wait and the existing deadline.
- Return a completed command's terminal result as it becomes available.
  Continue the proof, CI, or supplier workflow from that result, or apply
  its existing deadline procedure. An outer tool yield alone establishes
  neither termination nor expiry.
- Compare distinct model requests inside an unchanged interval in native
  Codex traces. Keep launch and result processing separate from that
  count. Attribute unavoidable wakes to the observed host boundary.
- The separate [supplier-watch evaluation](SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-use)
  owns collecting natural watches across executions. This correction
  leaves the other hosts' waits and the workflow-specific observer,
  result, and deadline rules in their existing homes.

**Key examples:**

- A quiet proof command finishes inside a proven host window → Codex
  waits → the completion result reaches the caller with zero intermediate
  model requests.
- A CI completion command remains pending across a host yield → Codex
  resumes the same wait → the caller gets the original operation's result
  within its existing bounds, with wakes limited to necessary host returns.
- A paused supplier remains unchanged → a qualifying publication arrives
  before the deadline, or the original deadline expires first → the watch
  returns the corresponding receipt and execution continues or stops under
  its existing agreement.

**Architecture:** The shell command owns observation and its terminal
evidence. The Codex procedure owns the outer wait on that command, including
resuming an existing cell in code mode. The distinction matters because the
[historical Codex trace](SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-use)
shows a long inner `write_stdin` poll wrapped in much shorter outer waits.
Keep the host adaptation in the shared procedure under
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
and judge it with native before-and-after evidence under
[ADR 0005 — Native validation and A/B testing](../../docs/adrs/0005-cross-tool-validation-accepted.md)
and [ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).
