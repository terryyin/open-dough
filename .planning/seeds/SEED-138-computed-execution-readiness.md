---
id: SEED-138
status: active
planted: 2026-10-17
planted_during: Terry's review of dependent-story readiness after supplier wrap-up
trigger_when: A completed prerequisite leaves a dependent story with stale Not ready status
scope: unknown
---

# SEED-138: Execution readiness from current preparation and dependency facts

## Why This Matters

Developers and executing agents need to know which stories can start after a
prerequisite finishes. The current supplier wrap-up resolves and publishes
dependency agreements while preserving the consumer's preparation assessment.
A consumer recorded as Not ready with the reason "Waiting for Story B" therefore
keeps that status even after B's dependency becomes satisfied. The start command
still refuses it. Conversely, the dashboard's Ready for execution badge reflects
the preparation assessment independently of unresolved dependencies.

The review on 2026-10-17 reproduced a transition from one blocking dependency to
zero while the consumer retained Not ready and "Waiting for Story B". Completing
the supplier alone does not establish that its consumer's particular condition
was fulfilled; the existing evidenced resolution remains significant.

## Selected Story

<a id="compute-execution-readiness"></a>

### Compute story readiness from preparation and dependency facts

**Identity:** SEED-138#compute-execution-readiness
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** Developers selecting the next story and agents starting it
after prerequisite work is integrated.

**Goal:** Derive a story's current execution readiness from its preparation
review and dependency facts, so satisfying its final prerequisite makes an
otherwise prepared story eligible to start without manually renewing a
duplicated readiness status.

**Scope:** Align the canonical recording guidance, shared interpretation,
dashboard presentation, and actual start command around the same derived
execution-readiness meaning. Retain preparation judgments, substantive concerns,
and evidenced dependency resolutions as authoritative inputs. Represent a
dependency blocker once, and handle existing duplicated waiting reasons without
erasing independent preparation concerns or inferring fulfillment from reason
text. Execution continues through the existing authorized start flow.

**Key examples / evaluation:**

- A is prepared and depends only on B. B's wrap-up verifies A's condition and
  publishes its satisfaction. A becomes ready to start without a separate
  readiness write; dashboard and start command agree.
- An existing A has Not ready with only a duplicated "Waiting for B" reason.
  Once the evidenced condition is satisfied, that stale reason no longer keeps
  an otherwise prepared A blocked. An unrelated concern, such as unresolved
  acceptance examples, continues to block until genuinely reviewed and resolved.
- A depends on B and C. Satisfying B leaves A blocked by C; satisfying both
  makes A ready only when its preparation review supports execution.
- B is marked done but A's required condition is unfulfilled, needs a developer
  decision, or has not been published as satisfied. A stays dependency-blocked.
- Missing or invalid preparation or dependency evidence is shown as a gap and
  does not manufacture readiness. Readiness becoming true grants no execution
  permission and launches no agent by itself.

**Architectural context:** [ADR 0002, principle 5](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
distinguishes authoritative preparation judgments from derived dashboard views
and execution permission. Keep those meanings explicit while deriving current
execution readiness; this capture does not change the Accepted decision.

**Safe stopping point:** Published prerequisite resolutions are reflected in
the consumer's readiness consistently across display and startup, while genuine
preparation concerns and unresolved conditions remain visible and enforceable.

## Breadcrumbs

- Terry's analysis request and instruction to queue this story first, 2026-10-17.
- [Supplier wrap-up resolution](../../src/skills/dough-product-backlog/references/supplier-dependencies.md).
- [Preparation assessment and execution](../../src/skills/dough-product-backlog/references/record-preparation.md).
- [Published execution source checks](../../src/skills/dough-execute-plan/scripts/execution-source.mjs)
  and [dashboard readiness badge](../../dashboard/src/storyPreparation.ts).
