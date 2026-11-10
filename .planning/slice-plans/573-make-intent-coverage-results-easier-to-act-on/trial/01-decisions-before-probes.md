# Decisions before paired probes

Recorded before A1 launch. Keep criteria unchanged from `00-freeze-and-basis.md`.

## Search-heavy (Recently done) — both arms

**Before:** If the probe shows the maintained selection checks omit project-change
supersession during an unanswered catalog read, and an independent witness shows
wrong navigation under the selected fault, the next proof action is journey proof
for that transition. Recognize planned correction
`SEED-272#prove-recently-done-check-supersession` rather than inventing a new
repair from the retained report alone. If evidence is incomplete, gather the
named missing observation instead.

## Focused (Landed CI) — both arms

**Before:** If the maintained pending-proof walk catches a stop-at-proof-wait
fault on the path that should continue past the skip, no product repair follows
from the probe; note which assertion actually caught (including an earlier
helper). If the fault is not caught despite exercising the path, that would be
an assertion gap. Incomplete setup/reach/restoration stays inconclusive.

## Experimental variable

Current arms: no promise/fault/command/fixture/assertion hints.
Candidate arms: those hints supplied; skill validates/revises and bounds search.

## Expensive-proof reconsideration before B arms (2026-11-10T10:25:21Z)

- Auth probe: `claude -p` → AUTH_OK (is_error=false).
- Seven-day rate_limit still `allowed_warning` at utilization ~0.99; overage rejected/org_level_disabled; resetsAt 1794394800 (~2026-11-11 19:00 +08).
- Fresh stream-json AUTH_OK probe completed; not blocked.
- Machine: AC Power, battery charged; load averages ~12/15/19 on 16 cores — high but same regime as A arms.
- Decision: proceed with sequenced B1 then B2 (not parallel). Stop if an arm hits auth/rate-limit/infrastructure block.
