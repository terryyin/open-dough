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

## Removal table

| Removed / merged inspection | Promise | Surviving observation | Scratch fault (reverted) |
| --- | --- | --- | --- |
| 4×2 mark loop: re-`expectMark` + `inspected` for every card at 1280 and 360 | 23; 5.6/5.7/22.3 marks and widths | This check: unique desktop marks on trunk/branch/modelless (covers trunk.svg, story-branch.svg, claude.png, codex.png, cursor.png); narrow rechecks only `branchStory` host+mode clearance without a new `inspected` | Scratch A: narrow host `expectMark` expected `claude.png` instead of `codex.png` → `toHaveAttribute` failed on branch scan mark (`slice2-scratch-A.log`) |
| `lastInRotation` full mark proof at both widths (Story Branch + Claude already proved) | 23; 5.6 | This check: desktop uniqueMarks prove those assets; malformed step `owner-mark` count 3 on `lastInRotation` after its earlier detail open | Scratch B: skip `inspected(lastInRotation)` → count stays below 3 → `toHaveCount(3)` failed (`slice2-scratch-B.log`) |
| Trailing mark-step re-`inspected(trunkStory)` + detail text repeat | 5.1/5.2/10.1 | This check: trunk detail text in the first Trunk Mode step (detail left open) | Covered by Scratch C path for unique desktop marks; trunk mode/detail text remains in step 1 |
| Mark-loop inclusion of repeated Trunk Mode / Claude Code on every width for every card | 10.1/10.2/23 | This check: one desktop proof per distinct mode/host asset via `uniqueMarks` | Scratch C: modelless host expected `codex.png` instead of `cursor.png` → `toHaveAttribute` failed (`slice2-scratch-C.log`) |
| Malformed step re-`inspected` for each of four recorded cards before mark counts | 5.5/10.1 | This check: counts alone after details already open; `inspected(older)` retained for zero marks | Scratch B above (detail-closed lastInRotation fails the count survivor) |
| Branch / modelless detail steps re-calling `inspected` | 5.3/5.4/10.1 | This check: `detail(title)` text after mark step already opened those cards | Same open-detail dependency as Scratch B; text asserts remain |
| Preparing scan/marks (already deferred in comment) | Preparing ≠ Taken owner | `backlog-preparing.spec.ts` host mark + preparing scan; this check still asserts Preparing + Kirara portrait and no owner/mode | Neighbor run passed; preparing ownership unchanged |

Consumer-trace: local helpers only (`detail`/`inspected`); shared helpers unchanged.

Logs: `slice2-focused*`, `slice2-selection*`, `slice2-neighbors*`, `slice2-attr*`, `slice2-scratch-*`.
