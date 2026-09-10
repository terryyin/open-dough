---
id: SEED-902
status: active
planted: 2026-09-10
planted_during: Quick 039 slice-3 walkthrough (fictional)
trigger_when: When a maintainer selects execution-integrity wrap-up follow-up
scope: small
---

# SEED-902: Protect reviewed execution commits during wrap-up

## Goal

Give selected wrap-up overwrite follow-up a canonical story home the maintainer
can queue without mixing it into unrelated workshop documentation.

## Why This Matters

The Open Dough maintainer needs an evaluable story so wrap-up cannot replace
an already-reviewed execution commit, without forcing that work into an
unsuitable seed.

## Stories

<a id="prevent-wrap-up-from-overwriting-reviewed-commits"></a>

### 1. Prevent wrap-up from overwriting a reviewed execution commit

**Status:** Queued follow-up; not refined, not planned, not executed.

**For / why:** The Open Dough maintainer can finish wrap-up without losing the
already-reviewed Taken-work patch set, so later review still has the execution
commit to inspect.

**Evaluation:** After wrap-up, the reviewed execution commit remains reachable
from the branch (or an equivalent preserved locator), and Taken-work patches
are not replaced by an unrelated cleanup snapshot.

**Finding:** `ODF-901` in [findings.md](../findings.md) (heading
`## ODF-901 — Wrap-up overwrote the reviewed execution commit`). This story is
queued follow-up, not a claim that the finding is resolved.

**Safe stopping point:** The queued story remains discoverable from the backlog
and the finding; wrap-up behavior is unchanged until a later authorized
execution.
