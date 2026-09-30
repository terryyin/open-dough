# Scan sessions quickly in a compact sidebar that surfaces those needing attention

## Source and authority

- **Identity:** SEED-062#compact-session-sidebar
- **Source:** [refined story](../../seeds/SEED-062-compact-session-sidebar.md#compact-session-sidebar)
  (Goal, Scope, Deferred promises, Key examples).
- **Authority:** Terry requested a slice plan on 2026-09-30. Planning only;
  this plan grants no implementation, Take, or publication.
- **Preparation:** Owned workspace `open-dough-prep-062`, Preparing assignment
  announced for this story.

## Goal and scope

A developer glancing at the dashboard Sessions sidebar sees compact one-line
rows, recognises state by border color and style, and finds attention sessions
first. Included: SVG toggle with numeric attention badge (open or closed), the
sidebar's attention sentence removed, attention ordering, state-styled left
border with hidden label, one-line row (title + elapsed time; state words,
project, workflow, launch time leave the row and move to the tooltip).
Excluded (deferred): sorting/grouping controls, attention filter, card-level
attention wording, alerts-unavailable note, session-detail content, launch
flows, state definitions. Attention keeps today's `sessionShown` reading
(needs input, ready for review, failed, stopped).

## Direction and existing solutions

Change the existing dashboard components; no new subsystem. PFE: `sessionShown`
already owns the state reading and `needsAttention`; `attentionSummary` owns the
card's wording and stays for cards (`CardLaunches.tsx`), so the badge uses the
count, not that sentence. `openSessionsOf` (`agentLaunch.ts`) owns sidebar
ordering. `SidebarEntry.tsx` / `session-sidebar.css` own the row;
`SessionSidebar.tsx` owns the toggle. `shownSession` (`SessionEntry.tsx`) is
shared with card and Recent entries, which keep their words. Elapsed time is a
small new formatter beside the sidebar entry, recomputed on a 30 s tick. No ADR
applies to the change; behavior is proven at the page boundary, as the existing
sidebar tests do.

## Decisive premises (observed)

| Premise | Observation | Result |
| --- | --- | --- |
| Playwright proof can seed sessions with chosen start times and states | Read `dashboard/tests/agent-launch-records.spec.ts:84` (`launchedAt: daysAgo(days)`), `sessionStatePace.ts` | Records take a controllable `launchedAt`; states come from the seeded session listing |
| Sidebar tests assert words/project/launch text and the attention sentence | Read `sessionSidebarPage.ts` (`attention`, `expectEntries`) and grep of `sidebarParts` users | Helpers and their callers change in slices 1, 3, and 4 |
| Page clock is controllable for elapsed time | `page.clock` used in existing specs (`agent-launch-attention-clearing.spec.ts`) | Available for the 30 s tick |
| Card/Recent entries share `shownSession` | Read `SessionEntry.tsx` | They keep their words; only the sidebar row changes |

Proof command for each slice: `npx playwright test --config dashboard/playwright.config.ts <specs>`
for the touched sidebar specs, plus `npm run typecheck:dashboard`; the full
suite runs at delivery per project guidance.

## Proof ownership

| Promise | Slice | Observable proof |
| --- | --- | --- |
| Toggle is an SVG icon named "Sessions"; badge is the number only, only when ≥1 attention session, open or closed; no sidebar sentence | 1 | Playwright: button by role/name, badge text and absence, no `N sessions need attention` text in the sidebar; card wording unchanged (existing `agent-launch-attention.spec.ts`) |
| Attention group first (earliest start first), rest newest first; failed/stopped included | 2 | Playwright with the 09:00/10:00/08:00/11:00 example; state change moves the row and raises the badge |
| State by left border style/thickness/color; hidden state label | 3 | Playwright: computed border style/width/color per state; hidden label text per row |
| One-line row: truncated title + elapsed time; no state words, project, workflow, launch time; tooltip holds them | 4 | Playwright: row text, single-line height, ellipsis on a long title, `1m`/`1d`/`<1m` under the page clock, tick update |

## Ordered slices

### 1. Icon toggle with a numeric attention badge
Type: Behavior
Status: done
Proof: Playwright on `sessionSidebarPage.ts` parts; typecheck.

Behavior: sessions exist, some needing attention → the banner shows an SVG
Sessions icon button with a red badge holding only the count, open or closed;
with none needing attention no badge; the sidebar's attention sentence is gone.

### 2. Attention sessions lead the list
Type: Behavior
Status: planned
Proof: Playwright order example and state-change example.

Behavior: attention sessions at 09:00/10:00, working at 08:00/11:00 → order
09:00, 10:00, 11:00, 08:00; a working session becoming needs input moves into
the attention group; failed and stopped lead too.

### 3. State shown by a styled left border
Type: Behavior
Status: planned
Proof: Playwright computed border styles per state; hidden label text.

Behavior: each row's left border is solid thick red (needs input), solid thick
green (ready for review), dashed red (failed/stopped), thin blue (working), thin
grey (done), dotted grey (unknown/unlisted/unrecognized), with a visually hidden
state label. State words are still in the row until slice 4.

### 4. One-line row with elapsed time
Type: Behavior
Status: planned
Proof: Playwright row text and layout under the page clock; long-title example.

Behavior: a row shows only the truncated story title and, at its end, the
elapsed time since launch (`<1m`, `5m`, `2h`, `3d`, recomputed each 30 s); state
words, project, workflow, and launch time leave the row and appear in its
tooltip; the row stays one line for a long title.

## Current decisions

- Attention reading is today's `sessionShown` (includes failed, stopped);
  confirmed by Terry.
- Elapsed time from launch time, largest whole unit, 30 s tick; state colors and
  border styles as in the story; row shows title and elapsed time only.

## Learnings

- Slice 1: `attentionCount` now lives in `sessionShown.ts` beside `attentionSummary`; the badge's accessible name reuses `attentionSummary`. Badge red `#c62828` and a three-line icon were chosen (story fixes neither); no visual check of badge placement or the narrow-window layout yet. One unreproduced flake seen in `agent-launch-card-delete.spec.ts` ("Delete record… State unknown"); passed on rerun and 6x repeat.
