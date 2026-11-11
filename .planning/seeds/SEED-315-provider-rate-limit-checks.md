---
id: SEED-315
status: active
planted: 2026-11-11
planted_during: Terry's early handoff of SEED-303 into five independent optimization stories
trigger_when: Maintainers select this CI test family for faster trustworthy feedback
scope: story
---

# SEED-315 — Speed up provider rate-limit checks

<a id="speed-up-provider-rate-limit-checks"></a>

### Speed up provider rate-limit checks

**Identity:** SEED-315#speed-up-provider-rate-limit-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Queued by the early handoff; selected-story refinement and proof/saving criteria are unfinished, and the reserved request-owner clock decision remains unanswered. No execution authority is granted."],"basis":{"document":"b055a100b3b1917e5a6e18377b4519efaa0c0a51a0d3392af86989acf97afefa"}}
```

#### Goal

Dashboard maintainers verify provider-directed pacing quickly without waiting out real deadlines, while preserving the actual request-admission and visible recovery behavior.

#### Scope to refine

- Prove no upstream read immediately before each directed deadline, recovery at the deadline and return to steady cadence, including reset beyond normal cadence.
- Include the rate-limit page case, affected stream case and any actual request-owner admission proof credited with replacement in the same ordinary measurement.
- The browser/observation clock does not control the separate released request-owner process. The earlier question about an opt-in clock-file seam remains unanswered; this extraction grants no clock, runtime-contract, release or installation authority.
- Preserve default production time, routing, credentials and process ownership. Source/payload functional checks and release/promotion remain separate if a change is later authorized.

Preserve ordinary CI selection and equivalent behavioral protection. Exclude
local-only archived experiments from the maintained selection. Use shared MakeMe
and existing external fixtures. No new internal mocks, wall-clock sleeps,
retries, skips, timeout inflation or special runner modes to obtain a saving.
Follow [the failure policy](../../AGENTS.md#failing-and-flaky-tests).

#### Key examples to refine

- Retry-After and reset directives prevent upstream reads until their exact deadlines, even if the page is seen again.
- Advancing controlled time to a reset later than normal cadence admits the read and restores the expected snapshot.
- Subsequent observations return to normal pace without an early upstream request.

#### Retained planning input — not executable

Former slice 5 and unresolved G5 supply provisional planning input. The original page case cost 20.450–21.624 local case seconds, mostly approximately 20 seconds of real waiting; the related stream case also has a directed wait. Refinement must first resolve the reserved request-owner clock decision, then choose a proportionate real-boundary experiment.

This story is queued, not assigned. Refine its goal, measurable saving, scope and
examples before creating or realigning an executable plan. Old slice readiness
does not transfer. It can deliver its own improvement if the other extracted
stories are deferred; no dependency is inferred from priority or shared files.

#### Provenance and evidence

Extracted by Terry's instruction from [SEED-303](SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks),
with the [slice mapping](../evidence/SEED-303-early-handoff/README.md).
Use [comparable-baseline.md](../evidence/SEED-303-early-handoff/comparable-baseline.md) and
[proof-context.md](../evidence/SEED-303-early-handoff/proof-context.md) as retained evidence, not a new baseline.
