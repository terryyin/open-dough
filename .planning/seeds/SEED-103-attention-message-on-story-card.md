---
id: SEED-103
status: active
planted: 2026-10-05
planted_during: Terry's request to show attention messages on the story card instead of a separate panel
trigger_when: A developer reads or acknowledges a session's attention message on the dashboard
scope: unestimated
---

# SEED-103: Attention message on the story card

## Story

<a id="attention-message-correction"></a>

### Correct the attention message story's wording and proof

**Identity:** SEED-103#attention-message-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/249-attention-message-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3030f111a662cfef0f7cbe286175c5b6f62d1113dd1ffe981a63109ac0a728b0","plan":"91f50205d0f5fda0f451e92b8abf7afafd58f5ce1c01b4cbef0797ae657f5daf"}}
```

**Goal:** A maintainer of the dashboard can trust its tests and documents to
say what the attention message story delivered: Mark as done is offered
beside a message rather than after reading it, the side panel's final report
is observed as Codex's own, an expansion choice lasts for its report only, and
a host without a native reader is refused in one place.

**Scope:** Correct and prove the four findings in the existing
[plan](../slice-plans/249-attention-message-correction/PLAN.md): Mark as done
is available before and after reading a message; Story B's panel fixture
observes only Codex's native final report; an expansion choice ends at a
newer report; and result admission owns the refusal of a host without a
native reader. Preserve the terminal documentation's already-corrected
wording and all delivered behavior, including the current Mark as done
confirmation. The plan retains the findings, key examples, decisions, and
proof.

Whether Recent sessions should offer Mark as done when a conversation is
unavailable remains a separate decision for Terry, outside this correction;
this delivery adds no rejection rule for those sessions.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Explicit completion and retained attention messages](../../dashboard/AGENT-LAUNCH-COMPLETION.md).
