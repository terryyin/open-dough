---
id: SEED-023
status: active
planted: 2026-09-22
planted_during: Maintainer observation of over-granular slice plans
trigger_when: Slice planning or refinement turns meaningful work into too many trivial slices
scope: medium
---

# SEED-023: Balance slice granularity around meaningful progress

## Why This Matters

Developers need slice plans that make execution and learning manageable without
turning straightforward work into a long sequence of trivial transitions. The
current slice-planning and slice-plan-refinement guidance can push agents toward
ever-smaller slices even after the slices cease to represent useful behavior,
structural progress, proof, or a safe decision point. The resulting plans add
coordination, review, and bookkeeping complexity without reducing meaningful
risk.

Small increments remain valuable. The problem is unnecessary decomposition,
not granularity itself. The useful balance depends on the work: a slice should
be small enough to prove or expose something consequential, and cohesive enough
that completing it represents meaningful progress.

## Story

<a id="balance-slice-granularity"></a>

### 1. Balance slice granularity without trivializing execution

**Identity:** SEED-023#balance-slice-granularity

**Status:** Captured; unrefined.

**Goal:** A developer planning work with Open Dough gets a proportionate set of
executable slices: enough separation to manage risk and preserve useful stopping
points, without extra slices whose only effect is to fragment cohesive work and
increase execution overhead.

**Scope candidate:** Recalibrate `dough-slice-planning` and
`dough-slice-plan-refinement` so that splitting and consolidation are guided by
meaningful behavior, structural change, proof, learning, and safe stopping
points rather than smallness as an end in itself. Preserve outside-in proof and
the ability to isolate genuinely independent risks. Make refinement able to
combine an over-split plan as well as split a slice that carries too many
distinct outcomes or risks. Do not introduce a universal slice count, line
count, or effort threshold as a substitute for judgment.

**Key examples:**

- A cohesive behavior and its directly supporting structure can remain one
  slice when separating them would create intermediate work with no useful
  observable result or decision point.
- A slice still splits when it combines independent behavior, unresolved design
  choices, or proof that can fail and be acted on separately.
- Refining an already over-granular plan reduces trivial handoffs and repeated
  setup while preserving the evidence and safe stopping points that matter.

**Evaluation:** Representative planning and refinement cases produce fewer
trivial slices without replacing them with oversized, multi-outcome steps. A
reviewer can explain each remaining boundary in terms of independently useful
progress, risk, proof, learning, or recovery—not merely a preference for more
steps—and can identify when consolidation would erase a consequential boundary.

**Architecture alignment:** This story applies the small-increment and
least-complexity principles in
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
without changing them. Runtime changes remain concise and leave situational
judgment where several plans are valid, as required by
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).

## Ordering

This is the first queued story at the maintainer's direction. Although it is
outside the dashboard-focused near-future direction, it addresses recurring
planning overhead that affects subsequent planned work across the product.
