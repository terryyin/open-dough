# Slice 2 proof

[Active plan](PLAN.md). Implementation `/root/slice_2`, about 13 active minutes.

## Observed promises

Real built frontend with controlled external notes/terminal services:
`story-notes.spec.ts` desktop/phone cases open every card kind, name the
selected story, save two general notes, list newest first with story context,
show count2 and return focus. Blank text keeps composer and sends no POST.
Captured POST objects contain only action, identity and text. Another story
stays empty. `storyNotesPage.expectSaved` asserts one status/announcement.
The next-read case changes the external answer under a controlled clock,
observes count/list1, then releases an older read after save and observes the
newer two-note list/count. Shared owner performs one initial project GET.

Terminal case starts the real Terminal UI with a substitute program/socket,
then opens card Notes via explicit keyboard. Output printed through the
original attachment while dialog is open appears afterwards; original screen
remains connected, attachment count stays1, focus returns to Notes.
First attempt timed out at a pointer click on a card paged offscreen by opening
Terminal. Trace `dashboard/frontend-tests/test-results/2026-11-17T00-06-40.143Z-70881/frontend-tests-stories-sto-04250-minal-mounted-and-connected-chromium/trace.zip`
shows it already attached. Corrected caller selects the supported keyboard
focus-reveal path. No timeout override or product failure exemption.

Real E2E `story-notes-persistence.spec.ts`: phone-sized page saves through real
endpoint/HOME store, server closes/restarts on same HOME, desktop reload reads
same note/context/count. Setup supplies only done-story facts, not notes.
Cross-page next-read rule is observed at frontend boundary with external
change; E2E proves page/server persistence, without claiming a second concurrent
real-page journey. This is sufficient composed proof, not a product limitation.

## Terminal commands

- `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list stories/story-notes.spec.ts` — 4 passed (final 11.5s).
- `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts --reporter=list stories/story-notes-persistence.spec.ts` — 1 passed (6.2s).
- `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list stories/` — 17 passed (19s); final notes-only assertions strengthened afterwards and rerun above.
- `npm run typecheck:dashboard` — passed after final edits.
- `git diff --check` — passed.

Host awake on AC; natural load4.8. Named focused default-worker checks under
`caffeinate -s -i`; no full suite or competing owned proof.
Freshness unchanged at fa98417444d9523089c3e91d69dd209c7e614e90;
named siblings still preparation-only, with no incoming product change.

[Complete consumer trace](slice-2-consumers.md), generated against
`ab91ef3234f6c1a496bf309932ba327ad09ebb44` with supplied terms `StoryNotes`
and `storyNotesEndpoint`, includes explicit dispositions for all279 located
rows. Actual changed purposes use the observations above; unchanged forwarded
exports, generic-symbol matches, comments and historical/guidance links are
excluded with row-specific reasons. No affected purpose is left unproved.

## Independent refactor acceptance

`/root/refactor_2`, six active minutes, `## REFACTOR COMPLETE`: extracted
identical note/review subscription, interval, sequence and generation handling
to `localSettingState.ts`, preserving domain request/context owners; removed
unused notes enabled branch and substitute getter. Root inspected mechanism
and changed note/review owners; inspected sidebar stale-read and sharing
observations. [Refactor trace and renewed proof](slice-2-refactor.md) supplies
42 complete dispositions, exact commands and setup/assertion purposes.
Renewed frontend stories plus sidebar review cues:29 passed24.2s; E2E notes
persistence plus review refresh/persistence/failed-save/ad-hoc cue:5 passed14.6s.
Typecheck and whitespace passed. Source1 server proof unchanged; source2 owner
proof replaced at same observing locations. All files<=250 (format projection
scripts/styles<=225). Final source freshness unchanged at pinned trunk above;
previous named-sibling attribution remains applicable. No unresolved gap.

Delivery formatter stopped before commit on an unbound test attachment method,
an unnecessary optional chain, and TypeScript project-service lookup of the
component named `StoryNotes.tsx` alongside `storyNotes.ts`. Mechanical repair
renamed the component module `StoryNotesControl.tsx` with unchanged export/body,
updated its two card imports, bound the callback through an arrow and removed
the unnecessary optional chain. `npm run typecheck:dashboard` passed; the
literal four-case notes frontend command above passed again (9.5s). Shared
review mechanism, server code and observing E2E locations remain unchanged.

Fresh independent repair check: [accepted return](slice-2-repair-refactor.md),
`/root/refactor_2_repair`, no edits, `## REFACTOR COMPLETE`; exact old/new
runtime imports audited and proof reused. Final freshness again unchanged at
the same pinned trunk, so named-sibling no-hold decision remains applicable.
