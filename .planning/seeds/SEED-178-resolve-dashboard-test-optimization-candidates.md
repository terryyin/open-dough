---
id: SEED-178
status: active
planted: 2026-10-30
planted_during: Terry's dough-test-optimization --resolve launch from the dashboard
trigger_when: Recorded test-optimization candidates need triage without a new profiling pass
scope: resolve recorded dashboard test optimization candidates
---

# SEED-178: Resolve dashboard test optimization candidates

## Why This Matters

Earlier measured dashboard test optimization left remaining candidates in
`docs/maintainer/dashboard-test-timings.md`. Resolve-only triage decides each
candidate's disposition without profiling or optimizing, so later work has an
explicit exclusion, replacement plan, or human decision instead of an open
list.

## Selected Stories

<a id="resolve-dashboard-test-optimization-candidates"></a>

### Resolve recorded dashboard test optimization candidates

**Identity:** SEED-178#resolve-dashboard-test-optimization-candidates
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/413-resolve-dashboard-touch-viewport-candidates/PLAN.md"}
```

**Beneficiary:** A developer deciding what to do with recorded dashboard test
optimization candidates.

**Goal:** Triage every recorded remaining candidate for local dashboard test
feedback so each has a disposition—profile-only exclusion or necessary-cost
finding, a replacement plan for cheaper surviving proof, or an explicit human
decision—without profiling or implementing optimizations in this pass.

**Scope:** Read the project's candidate record in
`docs/maintainer/dashboard-test-timings.md` (Remaining candidates) and any
candidate entries in an applicable optimization plan. Inspect related test
families and surviving proof. Record dispositions, update the candidate
record, and plan replacement work when cheaper proof preserves protection.
Do not profile or optimize. Do not invent candidates or an exclusion mechanism
the project lacks.

**Scope limits:** No new baseline measurement in this pass. No implementation
of replacement experiments. No product behavior changes. SEED-177's Taken
measured-optimization claim remains separate; this pass only triages the
recorded candidates.

**Key examples:**

1. A candidate whose remaining cost is inherent to unique multi-step proof
   gets a necessary-cost finding recorded and is removed from Remaining
   candidates; without a project profile-exclusion mechanism, no exclusion tag
   is invented.
2. A candidate where cheaper proof can preserve fault detection and clarity
   is moved into a replacement plan for this pass; the Remaining candidates
   entry is removed once that plan holds the obligation.
3. A candidate that needs a product, architecture, or confidence trade-off
   stays pending with the concrete trade-off cited for a human decision.
