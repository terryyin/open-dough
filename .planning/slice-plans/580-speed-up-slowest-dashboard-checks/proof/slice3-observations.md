# Slice 3 count and run evidence

Uncommitted change in
`dashboard/tests/launches/responsive-session-reconciliation.spec.ts` only
(`responsiveStart.ts`, `startOrigin.ts`, and the `dashboard` fixture
unchanged). Loaded host, AC, `caffeinate -s -i`. Quiet-host three-run check
still owed (slice 4).

| Metric | Slice 1 baseline | After slice 3 |
| --- | ---: | ---: |
| Pending `test.trace` before-events | 663 | 635 |
| Full `expectProtected` calls | 5 | 1 (stale) |
| Thin `expectActionsUnavailable` | 0 | 3 (compare-failure, unrelated, partial) |
| `untilPageRequestsAnswered` after stale | 1 | 0 |
| Story B visibility wait | 1 | 0 |
| `Reload` API calls | 2 | 2 |
| Asserted `compares` list length | 3 | 3 (exact list unchanged) |
| Pending list duration | ~21.7 s (attr) / 24.8–27.0 s (runs 2–3) | 9.2 s focused attr; 8.5 s in file |

## Removal table

| Removed / merged preparation or wait | Promise | Surviving observation | Scratch fault (reverted) |
| --- | --- | --- | --- |
| Pre-stale full `expectProtected` plus waiting-before-release sequencing | 6.1; 24.1 stale protection | This check: full `expectProtected` after stale `before` tip is shown; session + status overlap after releasing the held tip with Claude | Scratch A: expect Inspect enabled after stale → `toBeEnabled` failed (`slice3-scratch-A.log`) |
| `untilPageRequestsAnswered` after stale status | 6.1 read settled | This check: status `Published work read at revision ${before}` already bounds the stale read | Covered by Scratch A path (stale status + protection remain) |
| Story B visibility wait in open | 10.3 own prep | This check: opens Story A only via `publishCommittedOrigin` + `openUntilRead`; sibling still uses `openStories` | Sibling file case passed; Story B unused by this journey |
| Serial Claude release after publication poll | 10.3 own prep / repeated waits | This check: `releaseHeldClaude` with push release so launch settles during publication observation | Publication + session + stale assertions remain; file 2/2 passed |
| Repeated full `expectProtected` (source links / Select story) on compare-failure, unrelated, and partial | 6.1–6.4; 24.1–24.3 | This check: one full `expectProtected` at stale; later states use `expectActionsUnavailable` (disabled Inspect + single enabled control) | Scratch B: compare-failure Inspect enabled → failed (`slice3-scratch-B.log`); Scratch C: partial not-waiting while seed held → failed (`slice3-scratch-C.log`); unrelated uses the same thin survivor as B after recovery |
| Complete-phase re-`toHaveCount(0)` disabled buttons + owner visible + session before descendant | 6.4; 24.3 actions after full snapshot | This check: `not` waiting + Inspect enabled after `releaseSeed`; session rechecked on persistence reload | Complete + descendant + reload assertions remain in file proof |
| Mid-sequence compare recovery via clock-only tip recheck (attempted, not kept) | 6.3 recovery | Unchanged: tip-unchanged failed compare still needs `reloadUntilRead` so the compare is asked again and the error clears; exact `compares` list keeps two unrelated entries | Attempt failed with leftover "could not reach GitHub"; reload retained |

File proof: `npm run --silent test:dashboard -- --workers=1 --reporter=list --grep "responsive-session-reconciliation\\.spec\\.ts"` → 2/2 passed, pending 8.5 s, sibling 3.3 s, real 16.48 s (load ~5.9/5.9/10.3).

Focused attr: `--grep "a Take.s older snapshot arriving late" --trace=on --reporter=list` → 1 passed (9.2 s) real 13.63 s (load ~5.1/5.9/11.0).

Scratch faults (reverted): A stale Inspect-enabled, B compare-failure Inspect-enabled, C partial not-waiting — logs `slice3-scratch-A/B/C.log`.

Logs: `slice3-focused*`, `slice3-file*`, `slice3-attr*`, `slice3-scratch-*`, `slice3-attribution-summary.json`.
