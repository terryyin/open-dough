---
id: SEED-004
status: active
planted: 2026-09-06
planted_during: Parallel exploration of extracting existing project guidance
trigger_when: A real task benefits from reusable project guidance
scope: medium
---

# SEED-004: Extract useful guidance and use it on real work

## Goal

Turn one useful project practice into shared guidance, then use it on an actual
task. Keep source review and project-specific fixes manual. Shared skill behavior
follows the established Codex, Cursor, and Claude Code conventions.

## Stories

<a id="continue-test-optimization-plans"></a>

### 24. Continue test optimization plans into execution or the backlog

**Identity:** SEED-004#continue-test-optimization-plans
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Bounded scope is aligned; story refinement and execution approach selection remain."],"basis":{"document":"56590af07155530af2547b7db55cd7e5c2bd7d4e5f8d38cd912c70d5de161cf6"}}
```

**Status:** Captured; unrefined.

**Goal:** A developer who asks Open Dough to optimize tests gets durable forward
progress after profiling and planning: the optimization plan either proceeds
directly into authorized execution or becomes the next explicitly queued work,
rather than being left as an inactive planning artifact.

**Scope candidate:** Clarify the shared `dough-test-optimization` lifecycle at
the point where its executable plan is complete. When the original request and
resolved project context authorize implementation, continue through
`dough-execute-plan` without requiring a second request merely to begin the
planned optimization. When execution is not authorized or cannot start, use
`dough-product-backlog` to queue the planned work before ending. Link the plan
directly when it is the canonical active home for a bounded correction; when an
existing feature story owns the work, queue that story and preserve its plan
link according to the backlog contract.

Preserve explicit profile-only requests, which produce findings rather than an
executable optimization plan. Do not treat creating a plan as starting
execution, move work to **Taken** before execution actually starts, invent a
backlog when the project has none, or silently discard a plan whose execution
prerequisites are missing.

**Key examples:**

- Given a developer asks to optimize a selected test scope and the resulting
  plan is authorized and executable, test optimization invokes
  `dough-execute-plan` and continues the work instead of stopping after writing
  the plan.
- Given the invocation authorizes planning but not implementation, test
  optimization adds the planned work as the highest-priority queued item using
  the project's canonical story or bounded-correction identity, and reports
  that handoff.
- Given a profile-only request, test optimization reports its findings and does
  not manufacture a plan or backlog entry solely to satisfy the lifecycle
  handoff.

**Evaluation:** Representative default and planning-only invocations leave each
created optimization plan in exactly one actionable state: execution has
started through `dough-execute-plan`, or the work appears once in the product
backlog with a valid canonical link. A profile-only invocation remains
unchanged, and neither route duplicates the work across **Taken** and **Backlog
list**.

**Git context:** Reuse a suitable owned workspace and carry identity, mode,
and publication authority into the existing preparation/execution workflow.
Retained source must be published through the authorized preparation path before
[shared startup](../../src/skills/dough-execute-plan/SKILL.md#take-or-admit-work)
can consume it. Taken settles on remote trunk in either mode. This handoff adds
no separate freshness check, Git publication recipe, or CI setup; it consumes
those shared operations as they are delivered. A planning-only request does
not grant execution authority.

**Depends on:** Existing executable-plan, execution, and product-backlog
contracts supply the two handoff destinations. Installed execute-plan
publication guidance owns their shared publication behavior; this story owns
continuation and queue placement at the optimization handoff.

**Safe stopping point:** Every created optimization plan is either being
executed or is recoverable as explicitly prioritized product work; existing
profile-only behavior and backlog ownership rules remain intact.

<a id="preserve-rules-from-story-sections"></a>

### Preserve lasting rules from every record wrap-up deletes

**Identity:** SEED-004#preserve-rules-from-story-sections
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/134-preserve-rules-from-story-sections/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"39358067be37e765e7fac3febb68e9093fff1c109dc07646f2801ba6b167eb95","plan":"9079ce6a41b9b77fe923c066a799b17073e066202b91ece68876690eb30360b1"}}
```

**Goal:** An agent wrapping up keeps a still-needed rule written only in the
completed story's section or seed, not only in a plan, execution record,
review, or North Star topic.

**Scope:** Correction of "Strengthen architectural review after using the
lightweight guidance" (story section
`.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` at `29d0c909`)
from its execution retrospective (implementation commit `29d0c909`, Take
`848db9fd`). Wrap-up's Assimilate step triggers the shared preservation rule
only before deleting "a spent plan, execution context, review, or North Star
topic", while its Delete spent history step also deletes the canonical story
section and a spent seed. Make the trigger cover every record wrap-up deletes,
and keep one enumeration of record kinds, in the rule. Excludes changes to the
rule's destinations, stops, deletion steps, and any new record kinds.

**Plan:** [Preserve lasting rules from every record wrap-up deletes](../slice-plans/134-preserve-rules-from-story-sections/PLAN.md).
