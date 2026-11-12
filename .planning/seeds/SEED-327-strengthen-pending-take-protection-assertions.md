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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/601-strengthen-pending-take-protection-assertions/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"11bc5dfb2045f62cecf9e90856bc24a42c874afd8be3d6cb35dbcfc37432b414","plan":"af09ff15683a5a5bd677d59830d6f8d9034fff8d149ccca8f5d8e9bafc52a197"}}
```

#### Goal

Maintainers of the Dashboard's launch protection see a regression that drops
source links or Select story from a protected card after the stale read, on
the Backlog card and on the Taken card alike. Today the pending Take
reconciliation check observes them once, on the stale Backlog card, so a
Taken-only omission passes.

#### Scope

Included:

- In the pending Take reconciliation check of
  [responsive-session-reconciliation.spec.ts](../../dashboard/tests/launches/responsive-session-reconciliation.spec.ts),
  each protected state after the stale read (failed comparison, unrelated
  revision, and the Taken card whose snapshot is partly read) observes the
  full shared `expectProtected`: actions unavailable, Select story enabled,
  and a readable Canonical-record source link.
- The file-local `expectActionsUnavailable` goes with its last use, leaving
  one protection observation shared with the other launch checks.
- Focused proof of that check, including a reverted scratch fault that omits
  source links on the protected Taken card only and fails the check.

Scope limits:

- The overlapped settle waits, single board preparation, and other savings
  SEED-303 kept in this check stay. The restored assertions read an already
  rendered card and add no wait, reload, or request; SEED-303's 45-second and
  busy-ratio measure is not reopened.
- Product behavior is unchanged; the protected Taken card already shows its
  source links.
- Pinned deployment, Taken profile mark reductions, and the SEED-311–315
  families are untouched.

#### Key examples

- The Take's accepted revision is read while its seed is still unread → the
  Taken card shows "Waiting for published story state", Inspect story
  disabled, Select story enabled, and its Canonical-record link.
- A scratch fault hides source links on a protected Taken card while Inspect
  story stays disabled → the pending Take reconciliation check fails at the
  partly read Taken state.
- The comparison fails, then the unrelated revision is read after reload →
  the Backlog card still shows Select story enabled and its Canonical-record
  link in both states.
- The stale-read `expectProtected` and the exact comparison list stay as they
  are.
