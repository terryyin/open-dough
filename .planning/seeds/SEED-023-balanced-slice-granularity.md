---
id: SEED-023
status: active
planted: 2026-09-22
planted_during: Maintainer observation of over-granular slice plans
trigger_when: Slice planning or refinement turns meaningful work into too many trivial slices
scope: small
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

**Status:** Refined on 2026-09-22; execution planning is not authorized.

**Goal:** A developer planning work with Open Dough gets a proportionate set of
executable slices: enough separation to manage risk and preserve useful stopping
points, without extra slices whose only effect is to fragment cohesive work and
increase execution overhead.

**Scope:** Rephrase the existing shared slice-decomposition guidance and the
`dough-slice-plan-refinement` skill so agents choose proportionate boundaries
instead of treating smaller slices as the default refinement result.

- Keep the shared slice-decomposition reference authoritative for both initial
  planning and later refinement. Replace its over-splitting cues; do not add a
  second balancing rule to `dough-slice-planning`.
- Define a useful slice boundary by cohesive progress: one working change can
  be implemented, proved, and cleaned up together, with a meaningful result or
  safe decision point. Split independent outcomes, proof loops, risks, or
  recoverable stopping points; keep tightly coupled work together when a split
  would leave no useful result or learning.
- Make plan refinement explicitly able to consolidate, split, or retain slices.
  Remove wording that frames refinement only as subdivision, including the
  discovery description and Ready/Refine decision language.
- Preserve Behavior/Structure distinctions, outside-in proof ownership,
  cumulative-design review, supplied sizing limits and overrun handling, story
  escalation, and execution-authorization boundaries.
- Replace and shorten affected runtime wording. Add no new instruction file or
  rule section, and do not increase the combined word count of the changed
  instruction passages.

**Excluded:** A universal slice count, duration, or effort target; a minimum
slice size; automatic consolidation based on count alone; changes to story
decomposition, execution, workspace, publication, installation, or release
behavior; and retroactive rewriting of existing plans such as Plan 075.

**Key examples:**

- Given one user-visible change whose success and error observations use the
  same implementation path and proof loop, planning keeps them in one slice
  when separating them would create no independently useful result.
- Given two outcomes that can be implemented, proved, and acted on separately,
  planning keeps two slices even if they touch the same component.
- Given an over-split plan whose file-, layer-, or setup-oriented slices become
  useful only together, refinement consolidates them around the working outcome
  and retains the proof and safe stopping point that matter.
- Given a credible integration risk, independent proof loop, supplied hard
  limit, or execution overrun, refinement still splits or escalates rather than
  using consolidation to hide the concern.

**Evaluation:** A representative initial-planning use keeps one cohesive change
together, and a representative refinement use consolidates an intentionally
over-split plan. A counterexample with independent outcomes or proof loops stays
split. In each result, the agent explains remaining boundaries through useful
progress, proof, risk, learning, or recovery rather than step count. Source
review confirms that the shared decomposition rule remains the single authority,
the refinement skill no longer presumes subdivision, no new guidance section or
file was added, and the changed runtime passages contain no more words than
before.

**Existing solution / PFE:** The authoritative solution already exists in
`src/skills/dough-story-decomposition/references/problem-decomposition.md` under
slice decomposition, which `dough-slice-planning` and refinement both consume.
Change that shared rule and the refinement skill's directional wording rather
than duplicating a counter-rule in planning. The current Plan 075 review is a
representative signal: it assessed twelve slices and considered only whether
further subdivision was needed; twelve is evidence of the directional bias,
not a new numeric threshold.

**Effort hypothesis:** S, medium confidence. The product change is a bounded
wording reduction in two authoritative sources; confidence depends on whether
representative agent use demonstrates the intended balance without weakening
real split and escalation signals.

**Depends on:** No product prerequisite. Use the existing representative skill
behavior review; cross-tool discovery or delivery verification is unnecessary
because this story does not change skill layout or delivery mechanics.

**Safe stopping point:** Planning and refinement express one concise,
proportionate boundary rule. Existing proof, sizing, escalation, and authority
safeguards remain intact, and no existing plan must be migrated.

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

## Open Decisions

None blocking refinement. Exact replacement sentences belong to execution;
their behavior and concision constraints are fixed above.
