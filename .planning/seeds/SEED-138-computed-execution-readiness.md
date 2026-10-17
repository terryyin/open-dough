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

## Alternatives and Decision

Recommended direction: keep the preparing agent's readiness assessment and the
dependency agreement as the two authoritative records they already are, and
let the shared story-state reader derive whether a story may start from both,
so the start command and the dashboard consume one meaning. Preparation never
records a dependency wait as a readiness reason; a supplier's wrap-up agent,
who already rereads each consumer with judgment, reassesses a consumer whose
reasons duplicated the satisfied condition.

Compared against the same goal:

- **Structured dependency reasons** inside the assessment, dropped by the reader
  once the named supplier is satisfied. Rejected: it represents the blocker
  twice, lets the copy drift from the agreement, and still leaves free-text
  reasons already recorded unhandled.
- **Guidance only**, relying on the existing "Changed since readiness review"
  cue to prompt a manual re-review. Rejected: it keeps the manual renewal the
  goal removes and leaves the green badge contradicting an unavailable Start.
- **Borrowed mechanism, status conditions** (as a Kubernetes Pod's Ready is
  computed from independently owned conditions such as scheduled and
  containers ready, each carrying its own reason): the preparation assessment
  and the dependency agreement are the owned conditions, and start eligibility
  is the aggregate. The recommended direction adopts this shape. Where the
  analogy breaks: Kubernetes stores the aggregate as another condition and
  re-probes continuously; here storing it would reintroduce the duplication
  being removed, and nothing probes, so the aggregate exists only at read time
  over published records and never grants permission.

Assumptions: dependency facts and preparation facts live in the same canonical
home, so deriving from both costs one read; a satisfied dependency changes
nothing the preparing agent reviewed.

## Selected Story

<a id="correct-start-eligibility-gaps"></a>

### Correct start-eligibility gaps found in review

**Identity:** SEED-138#correct-start-eligibility-gaps
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/312-correct-start-eligibility-gaps/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"21675d9d41efba1bf859f4e69d5bdd9c6d0da9f71604b35b441bd0731e611be8","plan":"09e2f361e808fe49778988af8a95c33efcd11f78d2bf239161bdfc4c9baad646"}}
```

**Goal:** Developers and agents asking "can this story start?" get the answer
[the completed story](https://github.com/terryyin/open-dough/blob/d874104edfad1fb198f05d003d7ef0b0586c6554/.planning/seeds/SEED-138-computed-execution-readiness.md#compute-execution-readiness) promised, without the gaps
its execution review found: a record assessed before that story keeps an
accurate review indication when only a supplier's resolution changed, the
installed CLI reports start eligibility from the shared derivation, and on
Backlog and Taken cards "Ready for execution" names only start eligibility, so the card,
the story detail, and the Start note never disagree.

**Scope:** a compatible readiness comparison for records assessed before
agreement digests; start eligibility in `read-state` output and its usage
documentation; assessment-level dashboard wording that no longer says "Ready
for execution"; the startup proof that records readiness before its
dependencies. Findings, preserved decisions, proof, and slices live in the
[correction plan](../slice-plans/312-correct-start-eligibility-gaps/PLAN.md).
The Taken card's green badge follows the same start eligibility (Terry,
2026-10-18). Excluded: one-shot and admission start gates and the duplicate
dependency fence scanner.

## Breadcrumbs

- Terry's analysis request and instruction to queue this story first, 2026-10-17.
- [Supplier wrap-up resolution](../../src/skills/dough-product-backlog/references/supplier-dependencies.md).
- [Preparation assessment and execution](../../src/skills/dough-product-backlog/references/record-preparation.md).
- [Published execution source checks](../../src/skills/dough-execute-plan/scripts/execution-source.mjs)
  and [dashboard readiness badge](../../dashboard/src/storyPreparation.ts).
