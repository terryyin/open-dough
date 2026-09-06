---
id: SEED-006
status: dormant
planted: 2026-09-06
planted_during: Scope correction after first native Codex ADR replacement
trigger_when: Continue beyond the first bounded ADR-guidance replacement
scope: large
---

# SEED-006: Extend ADR-guidance adoption after the first successful replacement

## Why This Matters

For the Open Dough maintainer, the first bounded Codex replacement now works,
but the original plan mixed that learning with post-cleanup use, generic edge
cases, fresh installation, release updates, and a live three-tool Donut
migration. Those are independently valuable outcomes and should not be paid for
before they are needed.

The near-term purpose is practical: make the released guidance usable in Open
Dough through SEED-001 and in Donut through a few explicit follow-up stories.
Manual repair is an acceptable fallback for failure and ambiguity cases.

## Alternatives and Decision

| Option | Decision |
| --- | --- |
| Keep the original 40-slice plan | Rejected: it hides several outcomes and creates unsafe pressure to finish edge cases before the first useful adoption. |
| Stop after the first native Codex cleanup and repair failures manually | Selected baseline: the completed result remains useful even if every follow-up is cancelled. |
| Continue only the next real adopter journey | Selected ordering: prove post-cleanup Codex use, then prepare and finish Donut. |
| Generalize every install/update/error case now | Deferred until a concrete failure or another adopter makes it valuable. |

## Story Decomposition

<a id="prove-codex-use-after-replacement"></a>

### 1. Prove a completed Codex ADR replacement is usable

- **Status:** Planned, not executed. [Plan](../quick/014-prove-codex-adr-use/PLAN.md).
- **Goal:** As an adopting developer, explicitly use the installed shared ADR
  skill and see architecture-triggered guidance after the original is gone.
- **Scope:** One disposable Codex target produced by completed Plan 013. Exclude
  fresh installation, other tools, error cases, releases, and real Donut edits.
- **Key examples:** Explicit `$dough-adr-awareness` use cites the applicable
  current ADR; an architecture request without a skill hint reaches the same
  guidance automatically.
- **Effort hypothesis:** S, medium confidence; two focused native observations.
- **Depends on:** Completed Plan 013.

<a id="prepare-donut-adr-adoption"></a>

### 2. Prepare Donut to use released ADR guidance

- **Status:** Planned, not executed. [Plan](../quick/015-prepare-donut-adr-adoption/PLAN.md).
- **Goal:** As the Donut maintainer, have the published replacement installed
  and independently usable in Codex, Cursor, and Claude Code while the original
  remains available.
- **Scope:** Reassess the live target, retain required context, and make each
  native integration ready. Do not retarget callers or remove the original.
- **Key examples:** Each tool invokes its own installed shared skill using
  retained Donut context; a gap leaves the original untouched and that tool
  unready.
- **Effort hypothesis:** L, low confidence because native sessions and live
  target drift are external waits.
- **Depends on:** Story 1 and a published release containing Plan 013 behavior.

<a id="finish-donut-adr-adoption"></a>

### 3. Finish Donut's ADR-guidance replacement

- **Status:** Planned, not executed. [Plan](../quick/016-finish-donut-adr-adoption/PLAN.md).
- **Goal:** As the Donut maintainer, remove the redundant original after all
  three tools are ready, with every caller repaired and ADR behavior still
  effective.
- **Scope:** Reinspect the assessed paths, retarget callers, remove the original
  and obsolete discovery link, then verify explicit and automatic use in each
  tool. Do not add generic migration or failure recovery.
- **Key examples:** All three tools use the released skill after removal; ADR
  0001 remains Accepted despite its filename, Proposed ADR 0002 is not binding,
  and unrelated concurrent work remains untouched.
- **Effort hypothesis:** L, low confidence; six independent native observations
  follow one bounded live cleanup.
- **Depends on:** Story 2.

<a id="preserve-donut-adr-adoption-on-update"></a>

### 4. Keep Donut's ADR adoption intact during updates

- **Status:** Planned, not executed. [Plan](../quick/017-preserve-donut-adr-adoption/PLAN.md).
- **Goal:** As the Donut maintainer, run an ordinary current or newer Open Dough
  update without recreating the retired original or breaking repaired callers.
- **Scope:** One no-write/current or ordinary-newer update observation per tool.
  Exclude recurring discovery of new matches and general rollback machinery.
- **Key examples:** Payload/version behavior remains truthful, callers and local
  context remain unchanged, and the old skill/link do not reappear.
- **Effort hypothesis:** M, medium confidence; existing updater evidence is
  reusable where this story leaves it unchanged.
- **Depends on:** Story 3.

<a id="generalize-fresh-adr-adoption"></a>

### 5. Generalize fresh-install ADR adoption beyond Donut

- **Status:** Candidate, unqueued, and unplanned.
- **Goal:** Let a new adopter combine installation and optional ADR cleanup in
  one successful journey across Codex, Cursor, and Claude Code.
- **Scope:** The old generic fresh-install and post-install update cases. It does
  not block Open Dough or Donut adoption.
- **Effort hypothesis:** L, low confidence.
- **Depends on:** A concrete third adopter or repeated manual cost.

<a id="automate-adr-adoption-exceptions"></a>

### 6. Handle ambiguous and failed ADR replacements automatically

- **Status:** Candidate, unqueued, and unplanned.
- **Goal:** Preserve effective guidance automatically when equivalence,
  installation, shared-source readiness, or renamed mixed guidance is uncertain.
- **Scope:** The old refusal, failed-install, shared-original, and renamed-match
  cases. Manual diagnosis and repair remain the accepted current fallback.
- **Effort hypothesis:** L, low confidence.
- **Depends on:** A real failure whose repeated cost justifies automation.

## Mapping from the former 40-slice plan

| Former slices | New home |
| --- | --- |
| 1-4a | Completed Plan 013 / SEED-004 Story 4 |
| 5-6 | Story 1 / Plan 014 |
| 7-9 and 11-12 | Story 6, unplanned |
| 10 and 13-21 | Story 5, unplanned |
| 22-29 | Story 2 / Plan 015 |
| 30-37 | Story 3 / Plan 016 |
| 38-40 | Story 4 / Plan 017 |

## Ordering and Scope Reduction

Story 1 closes the cheapest remaining uncertainty. Stories 2 and 3 then deliver
the requested real Donut application while keeping removal behind three-tool
readiness. Story 4 is independently droppable after successful migration.
Stories 5 and 6 are first to drop and remain out of the backlog until concrete
experience makes them valuable.

Open Dough self-adoption stays in SEED-001. No story here duplicates or gates
that work. Native Cursor and Claude Code behavior introduced by future changes
must still be verified independently under the repository acceptance guard;
missing evidence remains pending rather than inferred from Codex.

## Open Decisions

None for ordering. Selecting a queued story authorizes planning review, not
execution, release publication, or mutation of Donut.

## When to Surface

Surface Story 1 after Plan 013 merges. Surface Story 2 only when an inspected
published release contains the completed replacement behavior. Surface the
candidate stories only after the named real-world trigger.

## Breadcrumbs

- Completed source plan: `.planning/quick/013-adopt-adr-awareness/PLAN.md`.
- Owner scope correction, 2026-09-06: prefer one or two practical adopter
  successes; manually repair failure cases; split the 40-slice remainder.
- Existing Open Dough self-adoption home:
  `SEED-001-install-and-update-open-dough.md#adopt-version-aware-updater`.
