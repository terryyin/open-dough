# Slice 2 count and run evidence

Uncommitted change in `dashboard/tests/stories/taken-agent-profile.spec.ts`
only (`agentPortrait.ts` / `takenAgentProfileRecords.ts` unchanged). Loaded
host, AC, `caffeinate -s -i`. Quiet-host three-run check still owed (slice 4).

| Metric | Slice 1 baseline | After slice 2 |
| --- | ---: | ---: |
| Profile `test.trace` before-events | 991 | 552 |
| `inspected()` calls (`toBeVisible` with `inspected` in stack) | 18 | 6 |
| Mark-step `inspected()` calls | 8 in 4×2 (+1 trailing trunk) | 3 unique desktop cards; 0 at narrow |
| `setViewportSize` passes | 2 | 2 (360 then restore 1280) |
| Mark step duration (list/`test.trace`) | 4.394 s | 1.202 s |
| Profile list duration | ~14.0 s (attr) / 15.05–15.23 s (runs 2–3) | 8.5 s focused attr; 9.1 s in selection |

Focused: `npm run --silent test:dashboard -- --workers=1 --grep "each Taken card shows its published agent profile"` → exit 0, quiet real 29.93 s (load ~17/24/28); traced list 1 passed (8.5 s) real 17.83 s (load ~16/23/27).

Selection (prefer): same three-check grep, list reporter → 3/3 passed, profile 9.1 s, pending 17.7 s, pinned 14.9 s, real 50.00 s (load before ~21/20/24 → after ~14/18/23). Earlier quiet-reporter selection also exit 0, real 87.94 s under higher contention.

Neighbors cited in the plan removal table (helpers unchanged; still run for survivor confidence): `agent-roster.spec.ts`, `backlog-preparing.spec.ts`, `taken-agent-profile-refresh.spec.ts` — 3/3 passed, real 57.91 s.

Logs: `slice2-focused*`, `slice2-selection*`, `slice2-neighbors*`, `slice2-attr*`, `slice2-scratch-*`.
