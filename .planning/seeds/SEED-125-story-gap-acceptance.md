---
id: SEED-125
status: active
planted: 2026-10-09
planted_during: Authorized retrospective-findings runbook
trigger_when: Reported gaps or provisional behavior survive acceptance and later slices contradict the story
scope: story
---

# SEED-125: Reported gaps remain owned until the whole story accepts them

## Why This Matters

Developers expect a delivered story to satisfy its goal across all slices.
Coordinators currently accept a reported gap against a narrower plan, file it
as a learning, or lose its promised later check. The released acceptance
response has not prevented delivered omissions and wrong-result behavior.

## Story

<a id="keep-reported-gaps-owned"></a>

### Keep reported gaps owned through the story's remaining slices

**Identity:** SEED-125#keep-reported-gaps-owned
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer receiving a complete story, and the coordinator
accepting work across its slices.

**Outcome:** A reported gap or interim behavior stays tied to the canonical
story outcome until sufficient proof accepts it, the owner explicitly changes
the promise, or the receiving slice implements and proves it. A narrower plan
or learning note cannot silently close that obligation.

**Bounded scope:** Reconsider the failed acceptance response and the existing
handoff/acceptance path for named gaps, provisional behavior and later-slice
obligations. Cover the moment later edits change an earlier interim's
consequence. Preserve explicitly accepted exclusions and independent accepted
proof. Do not add a new product dashboard, general history system, or unrelated
planning/refactor changes. Response mechanism remains for refinement; another
wording-only reminder is not an assumed remedy.

**Evaluation:** Replay the linked Pygardon holdings source omission against the
whole story; a later-slice fault outcome omitted from its delegation; and the
Doughnut Record-during-Stop interim whose later result status makes it unsafe.
Observe each obligation reach the right implementation/acceptance step before
completion; a genuinely excluded gap remains excluded. Evaluate the actual
response through the executing host rather than accepting phrase presence.

**Supporting findings:** [ODF-139](../../docs/maintainer/finding-names.md#odf-139),
[ODF-156](../../docs/maintainer/finding-names.md#odf-156), and
[ODF-185](../../docs/maintainer/finding-names.md#odf-185). Execution evidence
stays in those records. `b7930baf` first shipped in 0.3.48; exact false-scope
and learning-only omissions are reported on 0.3.56 after it.

**Completion criterion:** Delivery demonstrates the bounded outcome and records
the actual response commits and verified first containing release on every
addressed finding in the catalog. Queueing is not resolution; a new watch starts
only from verified relevant use of that later response.

**Depends on:** None. The unreleased planning-premise response addresses a
separate preparation boundary.

**Safe stopping point:** Named gaps and interim obligations have truthful
ownership through story acceptance even if other process work is deferred.
