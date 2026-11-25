---
id: SEED-443
status: active
planted: 2026-11-26
planted_during: SEED-417 execution follow-up
trigger_when: selected from the product backlog
scope: one story
---

# SEED-443 — Simplify Intent comparison test setup

<a id="simplify-intent-comparison-test-setup"></a>

### Simplify Intent comparison test setup

**Identity:** SEED-443#simplify-intent-comparison-test-setup
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** Dashboard maintainers can read and change Intent comparison specs
without stepping through Files drawer setup that adds no comparison coverage.

**Scope to refine.** Identify the mounted Intent comparison specs that inherit
Vitest's 390 px viewport and open Files only to reach the tree. Mount those
cases at a docked width and remove the now-redundant drawer setup. Retain all
comparison assertions, the default viewport, and the phone-width Files drawer
cases that exercise narrow layout or native input.

**Evaluation.** The migrated comparison specs pass with the tree available at
mount and their comparison assertions intact. The dedicated phone tests still
exercise Files as a drawer, including selection and outside-tap dismissal.

**Source.** The SEED-417 execution report identified this cleanup. The
[frontend Vitest configuration](../../dashboard/frontend.vitest.config.mts)
sets the 390 px default, and the [mounted story comparison helper](../../dashboard/frontend-tests/intent/intent-story-compare-page.ts)
opens Files to reach the tree at that width.
