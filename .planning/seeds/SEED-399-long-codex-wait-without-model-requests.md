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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer running Open Dough on Codex pays for a model request about once
a minute while a long proof run, CI wait, or supplier watch is unchanged,
although
[wait for a long proof run](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#by-host)
intends none until the command ends. Correct the Codex wait so an unchanged
long wait makes as few model requests as the host allows, and show the
change in real Codex traces.

The
[observation of 2026-11-18](SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-use)
records the starting point: the guidance names `write_stdin` with the
longest yield, while in Codex's code mode that poll runs inside an `exec`
cell that yields early and the model re-enters through `wait`. Whether
`wait` or the `exec` cell accepts a yield near 300 seconds is unobserved,
and settling it takes a native Codex call.
