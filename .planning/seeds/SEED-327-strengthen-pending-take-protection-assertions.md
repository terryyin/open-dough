---
id: SEED-327
status: active
planted: 2026-11-12
planted_during: SEED-303#speed-up-slowest-dashboard-checks wrap-up Intent Coverage
trigger_when: next Dashboard pending-Take or reconciliation proof change, or when a Taken protected card's source links are at risk
scope: story
---

# SEED-327 — Strengthen pending Take protection assertions

## Why this matters

SEED-303#speed-up-slowest-dashboard-checks thinned post-stale protection checks
in
[responsive-session-reconciliation.spec.ts](../../dashboard/tests/launches/responsive-session-reconciliation.spec.ts)
to `expectActionsUnavailable` (one enabled control + Inspect disabled) after a
single full `expectProtected` at stale. Intent Coverage at
`3e8a3e7c1e47219d904a68fcadae67fee584911d` showed a Taken-only source-link
omission still leaves that thin helper green while Canonical-record links are
missing on the protected Taken card. Maintainers need the post-stale path to
recheck source-link readability (and Select story when that half is the
concern) so protection regressions stay visible.

<a id="strengthen-pending-take-protection-assertions"></a>

### Strengthen pending Take protection assertions

**Identity:** SEED-327#strengthen-pending-take-protection-assertions
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Queued from SEED-303 Intent Coverage Assertion gap on thin expectActionsUnavailable; renumbered from wrap-up draft SEED-324 after trunk already used SEED-324–326. Refine before execution. No execution authority is granted."],"basis":{"document":"94bc22ec857059b4ae8b8e7f50e20a9e97e47fb3fea1c65e755b68b3a5608366"}}
```

#### Goal

Pending Take reconciliation proof catches a protected Taken card that drops
Canonical-record source links (and Select story when applicable) after stale,
not only disabled Inspect plus a single enabled control.

#### Scope

Included: `expectActionsUnavailable` in the pending-Take reconciliation check
and/or shared `expectProtected` reuse on compare/partial/unrelated recovery
paths; focused proof for that journey.

Excluded: reopening SEED-303's 45-second / busy-ratio measure; pinned
deployment; Taken profile mark reductions; SEED-311–315 families.

#### Key examples

- A fault that hides Canonical-record links on a protected Taken card while
  Inspect stays disabled fails the maintained reconciliation check.
- Stale Backlog `expectProtected` coverage remains; thinning elsewhere does not
  erase Taken source-link observation after partial accepted reads.
