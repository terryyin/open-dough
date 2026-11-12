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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/593-speed-up-cursor-session-checks/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"88837eadce1c005a1ec279c7dea2985c9e3acc0601736ee9364fefec3a391441","plan":"a02f95b29ce6ba749485806839efa67040b6c18f0d2489e677e9c9edac309394"}}
```

#### Goal

Dashboard maintainers get substantially faster local feedback on Cursor runner
replacement and scoped session continuation. Ordinary CI continues to catch the
same native process, PTY, refusal and visible revival regressions.

#### Scope

- Keep the five maintained promises: sessions remain available through a stale
  runner until a new launch replaces it; unfinished last-held sessions revive
  automatically without Recover; resume, recovery and cannot-load replacement
  use the recorded project scope, including a deliberate non-default scope;
  Default continuations still carry no scope; missing or unreadable scope
  refuses Recover and Open terminal with an explanation and spawns nothing
  against shared Cursor configuration.
- Reduce repeated full launches and incidental setup while observing those
  promises at the real public runner, persisted-session and browser boundaries
  that catch their faults. Keep one end-to-end journey for live PTY and visible
  revival. Establish scope and refusal variants at cheaper real boundaries only
  when those boundaries still discriminate the same faults.
- Reuse the delivered `heldCursorExecutions` helper and corrected real-lifetime
  setup. Reconcile accepted SEED-287 Cursor lifetime work instead of duplicating
  it. SEED-287's unfinished other ownership and this story's queue position are
  not blocking dependencies; this family can improve on its own.
- Include every public-runner, persisted-session and browser check credited with
  replacement in the ordinary timed family. Preserve ordinary CI selection and
  equivalent behavioral protection. Exclude local-only archived experiments.
- Use shared MakeMe and existing external fixtures. No new internal mocks,
  wall-clock sleeps, retries, skips, timeout inflation or special runner modes
  to obtain a saving. Follow
  [the failure policy](../../AGENTS.md#failing-and-flaky-tests).

#### Key examples

- Existing held sessions remain available through a stale runner until a new
  launch replaces it. The replacement revives the unfinished last-held sessions
  without Recover, preserves their identities, timestamps, scope and workspace,
  and shows them running in the UI.
- After a scoped client ends, Recover and a fresh Open terminal both resume
  through the recorded chosen scope and workspace, leave a deliberate shared
  Cursor default change untouched, send no model flag, and attach a new process.
  A cannot-load replacement keeps the same scope on the new session ID.
- Missing or unreadable recorded scope refuses Recover and Open terminal with
  the saved-configuration explanation and starts neither calls nor attaches;
  shared Cursor configuration stays unchanged. Default recovery continues to
  carry no scope exactly as before.
- Three comparable passing ordinary one-worker runs of this family's maintained
  selection each finish with the stated saving, including startup, every
  credited replacement check and teardown.

#### Success measure

Save at least 10 seconds of whole-command wall time on the same ordinary
one-worker Cursor session selection with every replacement, preparation and
teardown paid. The retained corrected baseline's five cases cost 30.691–33.595
summed local case seconds (median 30.691 s). Require a matched family baseline
on the current execution base and repeated passing observations. Keep the live
PTY/UI revival and refusal observations that cheaper boundary checks do not
exercise.

#### Provenance and evidence

Extracted by Terry's instruction from
SEED-303#speed-up-slowest-dashboard-checks,
with the [slice mapping](../evidence/SEED-303-early-handoff/README.md).
Use [cursor-repair-evidence.md](../evidence/SEED-303-early-handoff/cursor-repair-evidence.md),
[comparable-baseline.md](../evidence/SEED-303-early-handoff/comparable-baseline.md)
and [coverage-map.md](../evidence/SEED-303-early-handoff/coverage-map.md) as
retained evidence, not a new baseline. Former slice 8 remains provisional
planning input only; old slice readiness does not transfer.
