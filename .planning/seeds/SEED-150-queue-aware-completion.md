---
id: SEED-150
---

# Recover pending CI completion under queue load

<a id="story-queue-aware-completion"></a>
### Complete queued revisions with a recoverable pending handoff

**Identity:** SEED-150#story-queue-aware-completion
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/352-queue-aware-completion/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9bc2ebb9ee61c7eeabdc11a2b36ba89b26c89d7b584f82d50a4bf9c7a9f6b02b","plan":"35d5b965bab087fb6761debe2e1bdad9ca7463f4ee57f86e4cc3ba6c3e9b1ecc"}}
```

**Goal:** A coordinator can distinguish authoritative queue progress from missing
evidence, retain ownership after a bounded foreground wait, and resume completion
without inventing success or renewing the original overall budget.

Implement the owner's coordinated request with Pygardon source story
SEED-148#story-queue-aware-ci. Keep one shared cross-host behavior in src/skills;
never edit installed payload copies. Accept optional separate queue facts from a
custom adapter while preserving attempts, exact failures, current reruns,
integrated-state target/context/ancestry requirements and cleanup gates.

Keep the ten-minute foreground wait. For fresh legitimate queued, running or
retrying evidence, return a durable pending receipt with retained observer and
exact recovery command. Persist a sixty-minute overall completion cap once per
accepted revision before waiting; resuming and coalescing cannot renew it. Stale,
withdrawn, unsupported, foreign or unreadable evidence cannot explain pending
completion or establish success. Worker loss remains explicitly unavailable.
Use fake clocks and real observer/adapter integration boundaries for proof.
Update affected lifecycle consumers and guidance so pending never authorizes
retirement. Release/install only after the maintainer supplies the version.
