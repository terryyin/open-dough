# Use the full mobile screen for sessions and simplify their header

**Identity:** SEED-199#mobile-session-screen
**Source:** [Refined story](../../seeds/SEED-199-mobile-session-screen.md#mobile-session-screen)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Give an opened Side panel session the whole screen wherever no usable split
exists, without Maximize/Restore there, and make the panel header compact on
every width. The source owns the complete scope, deferred promises and key
examples. This plan adds no browser-Back handling and no visual-viewport
keyboard tracking (both deferred by the source).

Useful stopping point: after slice 1 the header is compact on every width;
after slice 2 the narrow arrangement occupies the screen.

## Design and reuse

Follow Accepted
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
vocabulary (Side panel, Panel divider). No ADR conflict or new decision.

PFE found existing owners; nothing new is introduced:

- `sidePanelWidth.ts` already derives the arrangement from the room each
  render (`stacked` vs `split`). Rename the non-split arrangement to an
  occupied-screen one (for example `covering`) and keep it derived, never
  stored.
- The maximized layout in `side-panel.css` (`.page-maximized`, including the
  narrow `.page-stacked.page-maximized` rules) already hides the page column
  with `visibility: hidden` and pins the panel at `100dvh`. `PageFrame.tsx`
  shows the occupied arrangement through that same layout
  (shown maximized = chosen maximized or occupied). Delete the half-height
  stacked rules (`--stacked-panel-height`, row-2 page column) rather than keep
  a second covering layout.
- `SidePanelControls.tsx` gains one input saying whether Maximize/Restore is
  offered; `Terminal.tsx` and `StoryReview.tsx` pass it from the frame, so one
  rule drops the control for both. `FinalReport.tsx` has no Maximize and needs
  no change beyond the shared layout.
- `pageSidePanel.ts` keeps the developer's `maximized` choice unchanged; the
  frame only combines it with the arrangement for display, so widening
  restores the split or the chosen Maximize (example 5).
- Header: `Terminal.tsx` drops `<code>{sessionId}</code>` from the second
  line; `side-panel.css` keeps the title on one line with an ellipsis. The
  complete title stays the heading's text for assistive technology. Disclosure:
  the heading's title is a toggle button (`aria-expanded`) that wraps the title
  in full while expanded, because a native `title` tooltip, as Sessions sidebar
  entries use, is not reachable by touch. The terminal, story review and final
  report headers all render their title in `.side-panel-names h2`, so put the
  truncating title and its disclosure in one shared panel-title component
  beside `SidePanelControls.tsx` that all three use; no content then gets
  truncation without disclosure, and no copy diverges. The story review and
  final report need no further proof than their existing journeys passing.

The common rule is one arrangement derived from the room, with Maximize as a
desktop-only choice. The two slices are independent outcomes with separate
proof loops; neither needs preparatory Structure.

Concurrent preparation SEED-192 (plan 424-development-intent-frame) also edits
`PageFrame.tsx`; reconcile with whichever lands first without changing its
promises. Its plan already expects a mobile full-screen session to cover the
dashboard under this story.

## Outside-in proof

| Source example | Owner | Observable proof |
| --- | --- | --- |
| 1 phone open: fills viewport, compact header, no UUID, no Maximize, Board unreachable | Slices 1, 2 | `agent-terminal-touch.spec.ts` at the phone portrait viewport: panel box equals the viewport, heading on one line, second line "… session" without the UUID, no Maximize/Restore button, Tab from Close never reaches the Board, tapping the Board region hits the panel |
| 2 type, reduce height, rotate | Slice 2 | the same spec's existing editing, 400/240px height and landscape steps, now with the panel covering, header and Close in view |
| 3 Close returns context; session keeps running; reopen | Slice 2 | the same spec's close/reopen step plus a Board scroll position assertion and focus on the opener |
| 4 desktop header, divider, Maximize/Restore | Slices 1, 2 | `agent-terminal-maximize.spec.ts` desktop cases with an added header assertion (no UUID, workflow label) |
| 5 narrow and widen keep chosen width and Maximize choice | Slice 2 | rewritten `side-panel-width-covering.spec.ts` for terminal and story review: narrow covers without Maximize; widening restores width; a maximized panel stays maximized with Restore |
| 6 sidebar open, no usable room | Slice 2 | the covering spec's sidebar case at 880px (880 − 288px sidebar = 592px < two 320px minimums): the panel takes the page column beside the sidebar without Maximize |
| Title disclosure | Slice 1 | touch spec: tapping the title expands it to its full text, and the heading's accessible name is the full title throughout |

## Decisive premises

Observed 2026-10-31 in this preparation's worktree
(`claude/use-the-full-mobile-screen-for-sessions-and-simp` at `ad6e6e34`),
Node 24.21.0, after `node scripts/setup-native.mjs npm|browser|check`.

1. **Proof route.** `npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/agent-terminal-touch.spec.ts dashboard/tests/side-panel-width-covering.spec.ts dashboard/tests/agent-terminal-maximize.spec.ts`
   → 3 passed (45 s) unchanged. The owning specs run locally, and today's
   narrow Maximize already fills the window (maximize spec's narrow case).
2. **Consumers of the change.** Scratch edit, reverted before recording:
   `PageFrame.tsx` showed the panel maximized when
   `sidePanel.shown !== undefined && stacked`, `SidePanelControls.tsx` hid
   Maximize while stacked, and `Terminal.tsx` dropped the header UUID. Running
   every spec mentioning stacking, Maximize/Restore, the header, or touch
   (87 files), then the failing subset at `--workers=4`: 28 failed. The same
   28 with the scratch reverted: 22 passed, so these are the change's consumers.
   - Header UUID (slice 1): `agent-terminal-avatar`, `agent-terminal`,
     `agent-terminal-maximize`, `agent-terminal-touch`,
     `session-management-touch`, `sessions-sidebar-touch` each assert the
     `Execution session <uuid>` text or `.side-panel-names code`.
   - Occupied screen (slice 2): `agent-launch-ad-hoc-sessions`,
     `agent-launch-start-session-touch`, `agent-launch-start-session-answer-touch`,
     `board-scroll` (700×800 case), `board-session-reading` (700px cases),
     `final-report-touch`, `frame-sessions-look`,
     `sessions-sidebar-navigation-cases` (narrow case), `side-panel-width`,
     `story-review-one-shot-choice-races`, `story-review-touch`, plus the
     owners `side-panel-width-covering`, `side-panel-width-kept`,
     `agent-terminal-touch` and `agent-terminal-maximize`. They read or
     operate the Board, banner or sidebar while a panel is open at a narrow
     width, or measure the half-height stack. The new promise hides the Board
     behind an open panel, so each journey either closes the panel first and
     then reads what the Board shows (the revealed story, the start
     acceptance, the scroll position), or asserts the covering instead. Do not
     weaken what each journey proves about the Board; move it after Close.
3. **Pre-existing local failures, not consumers.** With the scratch reverted,
   `cursor-session-recovery.spec.ts:171`, both
   `session-workspace-retirement-attach.spec.ts:36` cases and three
   `session-workspace-retirement-claude-done.spec.ts` cases still fail
   (Recently done entries not found); hosted CI on `494237ab` passed. This
   story does not own them. Execution must not count them as its regressions,
   and should report them if they still fail then.
4. **Not observable here.** An overlaying iOS keyboard is out of scope
   (source deferred promise); Chromium's `setViewportSize` stands in for a
   resizing keyboard, as the touch spec already does.

**Sizing note.** Slice 2 is one proof loop but revises about fifteen spec
files. Start with the shared helpers they use (`sidePanelWidthPage.ts`,
`touchTerminalPage.ts`, `pageLayout.ts`) so the journeys share one "close,
then read the Board" step instead of each copying it.

## Slices

### 1. Compact panel header on every width
Type: Behavior
Status: done
Proof: `agent-terminal-touch.spec.ts` (phone) and `agent-terminal-maximize.spec.ts` (desktop) header assertions; title disclosure by tap and keyboard; affected header consumers listed under Decisive premises updated and passing.

Behavior: a session open in the Side panel at any width → read the header →
one truncated title line and "<Workflow> session" without the UUID; activating
the title shows it in full; the heading's accessible name is the full title.

Accepted proof (slice 1):
`npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/agent-terminal-touch.spec.ts dashboard/tests/agent-terminal-maximize.spec.ts dashboard/tests/agent-terminal.spec.ts dashboard/tests/agent-terminal-avatar.spec.ts dashboard/tests/session-management-touch.spec.ts dashboard/tests/sessions-sidebar-touch.spec.ts dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts dashboard/tests/agent-launch-ad-hoc-codex.spec.ts dashboard/tests/frame-sessions-look.spec.ts dashboard/tests/final-report-touch.spec.ts dashboard/tests/final-report-touch-divider.spec.ts dashboard/tests/story-review.spec.ts` → 20 passed. Shared `SidePanelTitle` disclosure; Terminal second line `{name} session` without UUID. Refactor removed dead `touchTerminalPage` title/session helpers; maximize spec under 250 lines. Learnings: coarse-pointer title toggle needs `--control-size` min-height; ellipsis titles need look-spec `cutByDesign`. CI repair: Final report UUID consumers and look exclusions; title-toggle margin keeps tap size without squeezing review body.

### 2. The Side panel occupies the screen where no split fits
Type: Behavior
Status: done
Proof: rewritten `side-panel-width-covering.spec.ts`, updated `agent-terminal-touch.spec.ts` and `agent-terminal-maximize.spec.ts` narrow case, other consumers under Decisive premises updated and passing; `docs/dashboard-navigation.md` describes covering instead of stacking.

Behavior: a window 800px or narrower, or too little room beside the open
sidebar → open a session or story review → the panel takes the page column's
room (the whole viewport on a narrow window), the Board and banner are hidden
and unreachable, no Maximize/Restore is offered, and Close returns to the
unchanged Board context; widening restores the developer's split width and
Maximize choice.

Accepted proof (slice 2): owners `agent-terminal-touch`, `side-panel-width-covering`, `agent-terminal-maximize` pass serially; consumers updated (close-then-read Board / covering). Arrangement renamed to `covering`; PageFrame uses maximized layout while panel open; title-toggle keeps control-size min-height without negative margin (CI clip fix). Pre-existing retirement attach/claude/done failures still reported, not owned. Covering CI repair: board-reading, sessions-sidebar, sessions-sidebar-touch, recently-done-sessions-sidebar-reopen close-then-observe under covering. Completion CI repair: Recently done fixtures use a recent doneAt (fixed 2026-10-01 fell outside retention); covering Mark-as-done home keeps Recently done entry in view. Also fixed remaining 2026-10-01 doneAt fixtures in cursor-session-recovery and boundary agent-terminal-codex. keepInView on keyboard return is limited to Mark-as-done Recently done homes so Close preserves Board scroll.

## Execution complete

Product advice: Reasoned no-change to backlog or direction. Deferred iOS overlay-keyboard cursor visibility remains a post-delivery phone observation, not a planned correction. Pending CI on the latest covering repair revision does not change that advice.

## Story obligations

### G1. Unrelated dashboard-header and story-review changes
Reported: slice 1 — "Unrelated dashboard-header and story-review changes remain outside this story."
Story clause: "Unrelated dashboard-header and story-review changes remain outside this story."
Disposition: excluded "Unrelated dashboard-header and story-review changes remain outside this story."
Commitment: Q3

### G2. Browser Back while a session occupies the screen
Reported: slice 1 — "Browser Back while a session occupies the screen keeps today's history behavior; making Back close the panel is not promised."
Story clause: "Browser Back while a session occupies the screen keeps today's history behavior; making Back close the panel is not promised."
Disposition: excluded "Browser Back while a session occupies the screen keeps today's history behavior; making Back close the panel is not promised."
Commitment: X1

### G3. Overlaying on-screen keyboard without page resize
Reported: slice 1 — "An on-screen keyboard that overlays the page without resizing it (iOS Safari's default) is not separately tracked through the visual viewport."
Story clause: "An on-screen keyboard that overlays the page without resizing it (iOS Safari's default) is not separately tracked through the visual viewport."
Disposition: excluded "An on-screen keyboard that overlays the page without resizing it (iOS Safari's default) is not separately tracked through the visual viewport."
Commitment: X2

## Plan review

Refinement not needed: the two slices are independent outcomes with one
proof loop each, the arrangement rule is single, and the observed consumer
list bounds slice 2's size.

No remaining slice-specific concern identified in this review.
