# See running sessions with the sidebar closed

**Identity:** SEED-235#see-running-sessions-with-sidebar-closed
**Source:** [selected story](../../seeds/SEED-235-see-running-sessions-with-sidebar-closed.md#see-running-sessions-with-sidebar-closed)
in SEED-235, refined 2026-11-05 with the UX/UI and architecture focuses.
**Prepared:** 2026-11-05. Planning only, in the story's established workspace
(branch `claude/see-running-sessions-with-the-sidebar-closed`, agent
steven-chan), continuing the refinement in the same session.

## Goal and boundaries

With the Sessions sidebar closed, the Sessions toggle's badge shows a green
working count first and the existing attention count after it; open, it shows
the attention count alone, as now. The story's key examples are the
acceptance.

Included: the working rule (native Working, or Cursor's held "working" screen,
of open sessions), the closed-only working count with its accessible name,
zero counts hidden, and the existing attention count unchanged. Excluded, as
the story records: changes to session reads or their pace, the sidebar's
title-row figures, entries, ordering and alerts.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout. Local gate: the slice's focused specs through the Playwright
runner with the list reporter; before landing the dashboard change,
`npm run test:dashboard` with Bash 5 first on PATH under `caffeinate -s -i` on
AC power ([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)),
because the change renders inside the banner every dashboard journey shows.

## Direction and PFE

- **Reuse the shared session reading.** `dashboard/src/sessionShown.ts`
  already owns `attentionCount` and the `*Words` wording beside it; the
  working count and its words ("N sessions working", "1 session working")
  join them there, decided by `sessionShown`'s `tone === "working"` plus
  Cursor's held screen (`sessionState.kind === "unknown"` with
  `cursorHeldLabel.working`), the same pair `unfinishedIntention` already
  treats as working. One shared predicate for "reads working" serves both;
  do not add a second recognizer.
- **Extend the existing toggle.** `SessionsButton` in
  `dashboard/src/SessionsSidebar.tsx` already holds `open` and the open
  sessions; it renders the working count only while closed. The two counts
  form one badge at the existing corner, the working count in `--ready`
  green with white text (the attention count keeps `--problem`), and the
  badge stays fully readable at the narrow and touch widths the existing
  specs check.
- No ADR or North Star topic is affected; this stays machine-local session
  evidence under ADR 0008.

## Decisive premises

| Premise | Consuming operation | Observation (form, profile, time) | Result |
| --- | --- | --- | --- |
| The predicate counts native Working and Cursor's held "working" screen, and not held waiting or awaiting first instruction | working count in `sessionShown.ts` | scratch `workingCount` in `sessionShown.ts` (tone working or held "working") plus a scratch boundary spec in `dashboard/tests/boundary/`, run with `npx playwright test --config dashboard/playwright.config.ts … --reporter=list`, revision `2956ae0f8`, 2026-11-05 | count 2 of {held working, held waiting, awaiting instruction, Working}; scratch reverted |
| The toggle receives every project's open sessions with live state, so a closed-sidebar count shows on the real journey and opening hides it | `SessionsButton` render | scratch render plus scratch assertions in `sessions-sidebar.spec.ts:109` (same runner, revision, time) | closed: an image named "4 sessions working" with four working sessions across projects; open: none; scratch reverted |
| Existing banner and badge consumers stay green with the added count; the button's own text stays empty because the badges sit beside it in its group | `sessions-sidebar.spec.ts`, `sessions-sidebar-touch.spec.ts`, `frame-sessions-look.spec.ts` | same scratch change, same runner, revision and time | 5 passed; `button.innerText()` read "" with the working count shown |

Unverified remainder: none for the approach. The scratch rendered no styling,
so the badge's fit at narrow and touch widths is proved in the slice, not by
these rows.

Running Playwright from this session needed
`env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`: the
inherited alternate-objects variable made global setup's fixture clone fail
with "bad tree object". It is this session's environment, not a test defect.

## Slices

### 1. The closed toggle shows how many sessions are working
Type: Behavior
Status: planned
Proof: extended `dashboard/tests/sessions-sidebar.spec.ts` journey (examples
1, 2, 5, 6 across two projects: closed shows working then attention with both
accessible names and order; a session needing input moves 3/2 → 2/3; opening
shows attention only and closing restores both); boundary rule cases in
`dashboard/tests/boundary/session-unread-rule.spec.ts` or a sibling boundary
spec (examples 3 and 4: awaiting first instruction excluded, Cursor held
"working" counted, held waiting excluded, unread report on a working session
still counted, singular wording); `sessions-sidebar-touch.spec.ts` and
`frame-sessions-look.spec.ts` keep the badge whole and in view with both
counts present; then the local gate above.

Behavior: open sessions across projects, some working and some needing
attention, with the sidebar closed → the developer looks at the Sessions
toggle → one badge shows a green working count named "N sessions working"
before the attention count named "N sessions need attention", each only when
above zero, following state changes on the existing reads; opening the
sidebar leaves the attention count alone.

## Current decisions

- The working count uses the entry's own working reading, not the open title
  row's "active" figure (open sessions not needing attention), which also
  counts awaiting-instruction and unsettled sessions.
- Wording is "working", the entry label's word; "running" stays with
  Cursor's runner process.
- Zero counts are hidden, as the attention count already is.

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| Closed: working count, green, first, with accessible name | 1 | `sessions-sidebar.spec.ts` journey |
| Attention count unchanged; follows state changes | 1 | same journey |
| Open: attention only; close restores | 1 | same journey |
| Working rule boundaries and singular wording | 1 | boundary rule spec |
| Zero counts hidden; no badge before first read | 1 | journey's first step (no badge before sessions) and boundary spec |
| Badge readable at narrow and touch widths | 1 | `sessions-sidebar-touch.spec.ts`, `frame-sessions-look.spec.ts` |

## Concern evidence

Slice-plan refinement not needed: one Behavior slice with one proof loop and
one shared rule; no fragmentation or second outcome. This review identified
no remaining slice-specific concern.
