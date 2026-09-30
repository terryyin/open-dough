---
id: SEED-056
status: active
planted: 2026-09-30
planted_during: Maintainer review of the slice plan for SEED-052#start-ad-hoc-project-session
trigger_when: A slice planning report names a concern, or skips slice-plan refinement, without saying why
scope: small
---

# SEED-056: Make slice planning's refinement decision visible

## Why This Matters

Slice planning invokes slice-plan refinement itself when a concern about slice
boundaries, cumulative design, proof ownership, or sizing can be resolved
within the story. A plan with no such concern needs no pass. On 2026-09-30 the
plan for SEED-052#start-ad-hoc-project-session (plan 172) skipped refinement
while its report named two "remaining concerns" (the largest slice, and a
launch failure that shows nothing until a later slice) and recorded `ready`.
Each was allowed by the skill's own rules, but the report called them concerns
and treated them as accepted, and nothing said that refinement had been
considered. The maintainer found out only by asking.

This is one incident. The response is a narrow wording change, not new
process, and it stays unexpanded unless the same gap recurs.

## Alternatives and Decision

- **Leave the skill as is:** the skill permitted the outcome, so nothing
  breaks, but a skipped refinement stays invisible and a "concern" can be
  named and tolerated at once.
- **Make refinement always run:** rejected. The skill deliberately spares a
  clean plan the cost, and one incident does not show clean plans need it.
- **State the decision and close the tolerated-concern gap:** selected. Two
  clarifications in `dough-slice-planning`, nothing else.

## Story Decomposition

<a id="state-refinement-decision"></a>

### Slice planning states whether it refined and settles every concern it names

**Identity:** SEED-056#state-refinement-decision
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

- **Goal:** A developer reading a slice planning report can see whether
  slice-plan refinement ran, and if not why, and never receives a plan
  recorded `ready` whose own report names a concern. The strengthening needed
  is small: two clarifications in one skill.
- **Scope:**
  - **The refinement decision is stated.** The report says which of these
    happened, in one line: refinement ran; refinement was not needed, with the
    reason (for example, no concern was identified); or refinement was left to
    a later step on the instruction to do so.
  - **A named concern is settled.** A concern the report names is either
    resolved by refinement or recorded as a `not-ready` reason. A trade-off
    the planner knowingly accepts, such as an interim state whose replacing
    slice is named, is written in the plan as an accepted trade-off with its
    replacing slice, and the report does not call it a concern.
  - **Where.** The source `src/skills/dough-slice-planning/SKILL.md`, in its
    "Resolve fixable plan concerns" and "Report concern evidence and assess
    readiness" sections. Installed copies change only from a released payload.
  - **Not included:** making refinement mandatory, a new gate, threshold or
    numeric size limit, any change to `dough-slice-plan-refinement`, to the
    readiness criteria, to `record-state`, or to other skills, and any
    checking or measuring of whether planners now comply.
- **Key examples:**
  - A written plan has a slice that combines two independent outcomes, fixable
    within the story → refinement runs, and the report says "Refinement: ran",
    with the concern no longer named.
  - A written plan has no concern → the report says "Refinement: not needed,
    no concern identified", and readiness is recorded as before.
  - A written plan keeps an interim state (a failure shown nowhere until slice
    6) on purpose → the plan lists it under accepted trade-offs with slice 6;
    the report names no concern about it; `ready` is recorded.
  - Refinement ran and one concern needs a human decision → the report names
    it, says refinement ran, and readiness is recorded `not-ready` with that
    reason.
  - The developer instructs "leave refinement to a later step" → the report
    says so, and any concern named stays a `not-ready` reason.
- **Depends on:** None.
- **Effort hypothesis:** Small: wording in two sections of one skill, with the
  skill's behavior review walked on the examples above.
- **Capture:** Terry asked on 2026-09-30 to record this as a narrow story,
  without speculation, sized to the strengthening the incident supports.

## Ordering and Scope Reduction

One story. Drop the accepted-trade-off wording first if the reporting line
alone closes the gap.

## When to Surface

When slice planning is next changed, or when another planning report names a
concern without a refinement decision.

## Breadcrumbs

- Slice plan 172 (`.planning/slice-plans/172-start-ad-hoc-project-session/PLAN.md` at
  commit `35b639bfe3773670eebdc51b97cd06f9c2425bbc`), whose report showed the gap.
- [Slice planning skill source](../../src/skills/dough-slice-planning/SKILL.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
