---
id: SEED-314
status: active
planted: 2026-11-11
planted_during: Terry's early handoff of SEED-303 into five independent optimization stories
trigger_when: Maintainers select this CI test family for faster trustworthy feedback
scope: story
---

# SEED-314 — Speed up landed CI repeat checks

<a id="speed-up-landed-ci-repeat-checks"></a>

### Speed up landed CI repeat checks

**Identity:** SEED-314#speed-up-landed-ci-repeat-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Queued by the early handoff; selected-story refinement and independent saving/proof criteria are unfinished. Prior slice readiness does not transfer and no execution authority is granted."],"basis":{"document":"c0994c0ca7d4b85c17fe4731158e2959fb810d70109b4e114ce6edde0232494a"}}
```

#### Goal

Dashboard maintainers get faster feedback for automatic repeat after landed CI results, while retaining one real receipt-to-collection-to-admission journey and discriminating outcomes.

#### Scope to refine

- Reduce repeated predecessor history preparation and collection across the seven outcome/threshold cases where canonical evidence and real public boundaries preserve the same fault detection.
- Keep exactly-once rerun admission, threshold distinctions, restart persistence, and recovered, failed, cancelled, partial-proof, refused and uncertain outcomes independently observable.
- Reuse the delivered causal POST-arrival wait correction. Preserve existing external-provider fixtures, real receipt ingestion and collection where they establish unique protection.
- Count any credited receipt/admission/verdict checks and all preparation inside the measured family.

Preserve ordinary CI selection and equivalent behavioral protection. Exclude
local-only archived experiments from the maintained selection. Use shared MakeMe
and existing external fixtures. No new internal mocks, wall-clock sleeps,
retries, skips, timeout inflation or special runner modes to obtain a saving.
Follow [the failure policy](../../AGENTS.md#failing-and-flaky-tests).

#### Key examples to refine

- A qualifying accepted landing crosses real receipt ingestion, collection and admission, requests one rerun and survives restart.
- A below-threshold or refused result does not admit a duplicate or misleading rerun.
- Each outcome displays an honest result and has an assertion capable of catching its own regression.

#### Retained planning input — not executable

Former slice 10 supplies provisional planning input. Original seven-case local sum: 30.209–31.979 s. Each case recreated five predecessor landings. The earlier wait defect is repaired; do not relabel an incidental request-count poll as proof of admission. Refine minimal canonical history and retained real journey before planning.

This story is queued, not assigned. Refine its goal, measurable saving, scope and
examples before creating or realigning an executable plan. Old slice readiness
does not transfer. It can deliver its own improvement if the other extracted
stories are deferred; no dependency is inferred from priority or shared files.

#### Provenance and evidence

Extracted by Terry's instruction from [SEED-303](SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks),
with the [slice mapping](../evidence/SEED-303-early-handoff/README.md).
Use [repeat-wait-evidence.md](../evidence/SEED-303-early-handoff/repeat-wait-evidence.md) and
[comparable-baseline.md](../evidence/SEED-303-early-handoff/comparable-baseline.md) as retained evidence, not a new baseline.
