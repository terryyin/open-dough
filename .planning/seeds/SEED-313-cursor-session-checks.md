---
id: SEED-313
status: active
planted: 2026-11-11
planted_during: Terry's early handoff of SEED-303 into five independent optimization stories
trigger_when: Maintainers select this CI test family for faster trustworthy feedback
scope: story
---

# SEED-313 — Speed up Cursor session checks

<a id="speed-up-cursor-session-checks"></a>

### Speed up Cursor session checks

**Identity:** SEED-313#speed-up-cursor-session-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Queued by the early handoff; selected-story refinement and independent saving/proof criteria are unfinished. Prior slice readiness does not transfer and no execution authority is granted."],"basis":{"document":"2207c8ee95476c01eca492e645378a4a90c0e8a46d8928f68e0e17b154814a98"}}
```

#### Goal

Dashboard maintainers get faster feedback for Cursor runner replacement and scoped session continuation without losing native process, PTY, refusal or visible revival protection.

#### Scope to refine

- Preserve stale-runner holding and replacement, distinct session identities, shared configuration, process identity, fresh reattachment and automatic revival.
- Preserve resumed/recovered recorded scope and refusal without spawning when scope is missing or unreadable.
- Reuse the already delivered heldCursorExecutions helper and corrected real-lifetime setup. Reconcile SEED-287 accepted work instead of duplicating it.
- Include all public-runner, persisted-session and browser proof credited with replacement in the ordinary timed family.

Preserve ordinary CI selection and equivalent behavioral protection. Exclude
local-only archived experiments from the maintained selection. Use shared MakeMe
and existing external fixtures. No new internal mocks, wall-clock sleeps,
retries, skips, timeout inflation or special runner modes to obtain a saving.
Follow [the failure policy](../../AGENTS.md#failing-and-flaky-tests).

#### Key examples to refine

- Existing held sessions remain available through a stale runner until a new launch replaces it; the UI observes actual revival.
- Resume and recovery use the recorded project scope, including non-default scope.
- Missing or unreadable scope refuses a launch with no native client spawn.

#### Retained planning input — not executable

Former slice 8 supplies provisional planning input. Five original cases cost 30.691–33.595 summed local case seconds. Necessary setup corrections and the canonical lifetime helper were already delivered and passed three focused and combined runs; preserve their evidence while refining further launch/setup reduction.

This story is queued, not assigned. Refine its goal, measurable saving, scope and
examples before creating or realigning an executable plan. Old slice readiness
does not transfer. It can deliver its own improvement if the other extracted
stories are deferred; no dependency is inferred from priority or shared files.

#### Provenance and evidence

Extracted by Terry's instruction from [SEED-303](SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks),
with the [slice mapping](../evidence/SEED-303-early-handoff/README.md).
Use [cursor-repair-evidence.md](../evidence/SEED-303-early-handoff/cursor-repair-evidence.md) and
[comparable-baseline.md](../evidence/SEED-303-early-handoff/comparable-baseline.md) as retained evidence, not a new baseline.
