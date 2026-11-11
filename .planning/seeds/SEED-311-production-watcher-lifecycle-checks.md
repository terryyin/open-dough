---
id: SEED-311
status: active
planted: 2026-11-11
planted_during: Terry's early handoff of SEED-303 into five independent optimization stories
trigger_when: Maintainers select this CI test family for faster trustworthy feedback
scope: story
---

# SEED-311 — Speed up production watcher lifecycle checks

<a id="speed-up-production-watcher-lifecycle-checks"></a>

### Speed up production watcher lifecycle checks

**Identity:** SEED-311#speed-up-production-watcher-lifecycle-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Queued by the early handoff; selected-story refinement and independent saving/proof criteria are unfinished. Prior slice readiness does not transfer and no execution authority is granted."],"basis":{"document":"68f260ddba5a9a2dbfdf15500c82b77054f55d0c60e4064dfa4230f7f174106f"}}
```

#### Goal

Dashboard maintainers get faster local feedback for production watcher deployment and recovery behavior, with the same ordinary CI protection and less repeated staging/support code.

#### Scope to refine

- Cover actual build failure/retry, preview start failure/restoration/retry, unavailable origin/resumption, unchanged and excluded checks, published policy rejection/recovery, selected-commit pinning, native-start drain, shared records/configuration, signals, fatal restoration, preview loss and cleanup.
- Retain real Git, builds, processes and serving where they distinguish a regression. Include every retained or replacement check and all preparation/teardown in one ordinary one-worker measurement.
- Keep the delivered production update-selection owner and three Git cases; do not repeat that completed work. The standalone pinned-deployment proof remains in SEED-303 unless a later evidenced agreement transfers it.
- Choose a new supported strategy before implementation. The archived shared-output experiment is evidence of a rejected strategy, not a measured irreducible floor or an additional mandatory CI suite.

Preserve ordinary CI selection and equivalent behavioral protection. Exclude
local-only archived experiments from the maintained selection. Use shared MakeMe
and existing external fixtures. No new internal mocks, wall-clock sleeps,
retries, skips, timeout inflation or special runner modes to obtain a saving.
Follow [the failure policy](../../AGENTS.md#failing-and-flaky-tests).

#### Key examples to refine

- A candidate fails its build or preview start; the last working revision keeps serving or is restored, and the same candidate remains retryable.
- Main advances during a held build; the selected revision activates only after accepted starts drain, preserving shared records and configuration.
- Shutdown or fatal preview loss stops owned processes and removes deployments without harming development or shared state.

#### Retained planning input — not executable

Former slice 4 supplies provisional planning input; delivered slices 2–3 supply compatible source preparation and update-selection work. Current watcher/pinning selection: 103.32 s for 24 cases. Matched watcher-only comparison: 115.55 s before versus 95.93 s after (median). The rejected local watcher/preview reuse experiment took 44.61 s for an incomplete subset. Refinement must establish a worthwhile family saving and a credible strategy; no inherited eight-second allocation or combined-five-family deadline applies.

This story is queued, not assigned. Refine its goal, measurable saving, scope and
examples before creating or realigning an executable plan. Old slice readiness
does not transfer. It can deliver its own improvement if the other extracted
stories are deferred; no dependency is inferred from priority or shared files.

#### Provenance and evidence

Extracted by Terry's instruction from [SEED-303](SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks),
with the [slice mapping](../evidence/SEED-303-early-handoff/README.md).
Use [watcher-evidence.md](../evidence/SEED-303-early-handoff/watcher-evidence.md) and
[preview-evidence.md](../evidence/SEED-303-early-handoff/preview-evidence.md) as retained evidence, not a new baseline.
