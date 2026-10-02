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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/221-visible-refinement-decision/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a44ddc95373bbe7a77a7bb62a639607149f90f6a7804f2848e8986ccd3d1df81","plan":"fadcf81755383c20a4044ccf4867416d40998bdc9b65f2507e44f4b2932f349d"}}
```

- **Goal:** A developer reading a slice planning report can see whether
  slice-plan refinement ran, and if not why, and never receives a plan
  recorded `ready` whose own report names a remaining concern. The strengthening needed
  is small: two clarifications in one skill.
- **Scope:**
  - **The refinement decision is stated.** The report says which of these
    happened, in one line: refinement ran; refinement was not needed, with the
    reason (for example, no concern was identified); or refinement was left to
    a later step on the instruction to do so.
  - **A named concern is settled.** A concern the report names is either
    resolved by refinement or recorded as a `not-ready` reason. The report may
    explain a resolved concern and its resolution; every concern it still
    describes as remaining must be a `not-ready` reason. A trade-off
    the planner knowingly accepts, such as an interim state whose replacing
    slice is named, is written in the plan as an accepted trade-off with its
    replacing slice, and the report does not call it a remaining concern.
    Acceptance must be supported by the existing planning rules; relabeling a
    blocking concern does not settle it. Neither a refinement pass nor an
    accepted trade-off establishes readiness by itself: the existing shared
    readiness criteria still apply.
  - **Where.** The source `src/skills/dough-slice-planning/SKILL.md`, in its
    "Resolve fixable plan concerns" and "Report concern evidence and assess
    readiness" sections. Installed copies change only from a released payload.
  - **Concision.** Add minimal wording without diluting either the new or
    existing intentions. Prefer replacing or shortening existing prose;
    making the skill shorter while preserving its guidance is a plus.
  - **Not included:** making refinement mandatory, a new gate, threshold or
    numeric size limit, any change to `dough-slice-plan-refinement`, to the
    readiness criteria, to `record-state`, or to other skills, and any
    checking or measuring of whether planners now comply.
- **Key examples:**
  - A written plan has a slice that combines two independent outcomes, fixable
    within the story → refinement runs, and the report says "Refinement: ran",
    with the concern resolved rather than listed as remaining.
  - A written plan has no concern → the report says "Refinement: not needed,
    no concern identified", and readiness is recorded as before.
  - A written plan deliberately keeps an interim state (a launch failure has
    no user-facing display until slice 6), permitted by the existing planning
    rules, with all readiness criteria otherwise satisfied → the plan records
    the accepted trade-off and slice 6 as its replacement; the report explains
    it as accepted rather than remaining; `ready` is recorded.
  - Refinement ran and one concern needs a human decision → the report names
    it, says refinement ran, and readiness is recorded `not-ready` with that
    reason.
  - The developer instructs "leave refinement to a later step" → the report
    says so, and any concern named stays a `not-ready` reason.
  - A proof-ownership gap remains after review, even though the planner calls
    it an accepted trade-off → the gap remains a concern and a `not-ready`
    reason; changing its label does not permit `ready`.
- **Boundary assumptions:** The existing slice-planning and shared readiness
  rules remain authoritative. The decision line need not use the examples'
  exact wording; it must state the outcome and the reason when refinement did
  not run. Reports describe the review actually performed.
- **Open decisions:** None for this bounded wording change.
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
