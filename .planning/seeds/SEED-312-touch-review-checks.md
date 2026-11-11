---
id: SEED-312
status: active
planted: 2026-11-11
planted_during: Terry's early handoff of SEED-303 into five independent optimization stories
trigger_when: Maintainers select this CI test family for faster trustworthy feedback
scope: story
---

# SEED-312 — Speed up touch review checks

<a id="speed-up-touch-review-checks"></a>

### Speed up touch review checks

**Identity:** SEED-312#speed-up-touch-review-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Queued by the early handoff; selected-story refinement and independent saving/proof criteria are unfinished. Prior slice readiness does not transfer and no execution authority is granted."],"basis":{"document":"6b565fbfbd458941c2f26dd7bb8d1c1eaf1d4f8e92758b5b2a5a8ad25f6ae60c"}}
```

#### Goal

Dashboard maintainers get faster trustworthy feedback for touch-based story review while retaining actual touch input, independent pane scrolling and reading-position protection.

#### Scope to refine

- Reduce incidental comparison size, gestures and repeated preparation while preserving line overflow, correct pane/file selection, phone/tablet differences and context retention through rotation and controls.
- Keep native touch at the boundary where it supplies distinct proof. Do not substitute assigned scroll positions or layout-only assertions for gestures.
- Reconcile SEED-287 ownership and accepted changes before editing overlapping touch/comparison fixtures; preserve its active work. Queue order is not a blocking dependency.

Preserve ordinary CI selection and equivalent behavioral protection. Exclude
local-only archived experiments from the maintained selection. Use shared MakeMe
and existing external fixtures. No new internal mocks, wall-clock sleeps,
retries, skips, timeout inflation or special runner modes to obtain a saving.
Follow [the failure policy](../../AGENTS.md#failing-and-flaky-tests).

#### Key examples to refine

- Real touch reaches the end of an overflowing line in the intended pane without moving the other pane.
- The selected file and reading positions survive rotation and the viewport-specific panel or Maximize/Restore controls.
- Refresh and comparison navigation retain the context that the existing four cases protect.

#### Retained planning input — not executable

Former slice 7 supplies provisional planning input. Original four-case local baseline: 33.083–52.069 summed case seconds (representative 51.362 s); fixtures used a 64-file comparison. Refine the smallest comparison and meaningful viewport distinctions, then declare a worthwhile saving before an experiment.

This story is queued, not assigned. Refine its goal, measurable saving, scope and
examples before creating or realigning an executable plan. Old slice readiness
does not transfer. It can deliver its own improvement if the other extracted
stories are deferred; no dependency is inferred from priority or shared files.

#### Provenance and evidence

Extracted by Terry's instruction from [SEED-303](SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks),
with the [slice mapping](../evidence/SEED-303-early-handoff/README.md).
Use [comparable-baseline.md](../evidence/SEED-303-early-handoff/comparable-baseline.md) and
[coverage-map.md](../evidence/SEED-303-early-handoff/coverage-map.md) as retained evidence, not a new baseline.
