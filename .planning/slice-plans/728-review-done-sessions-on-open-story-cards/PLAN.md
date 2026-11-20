# Review done sessions on open story cards

**Identity:** SEED-414#review-done-sessions-on-open-story-cards
**Source:** [Review done sessions on open story cards](../../seeds/SEED-414-review-done-sessions-on-open-story-cards.md#review-done-sessions-on-open-story-cards)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

In Development, a developer can scan an unfinished story for its progress and
current work, then review its retained sessions from the same card. Preserve
the existing access, recovery, story selection and review actions. The Sessions
sidebar keeps its history and selection rules. Session retention, ad hoc
follow-up grouping and review semantics are outside the story.

Use the approved [collapsed and expanded card mockup](../../evidence/SEED-414-story-card.html)
for visual comparison. Remove the mockup and its planning links at wrap-up.

## Current decisions

- Published Backlog and Taken membership determines which unfinished card can
  hold a session. Match retained launches by project and story identity, using
  the saved Done state. For the story's own Done sessions the Board uses the
  unfinished card first, then the listed published done card, then a standalone
  entry. A historical done card can still appear with its existing story
  actions. Derive placement and counts from the same rule, without new durable
  state. This follows [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  and [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).
- Reuse `storySessionsOf` and `isOpen` for membership and disposition. Apply the
  Board's placement decision before paging and counting Recently done. Reuse
  the existing Session entry, retained-history read and conditional Session
  Follow up when moving a session. Leave `storyCardSessionsOf` and Start's
  current-session gating open-only. Carry the project label from the published
  source for actions that already need it.
- Keep the disclosure local to its card. Existing session navigation should
  reveal a specifically requested nested entry. Keep keyboard focus with the
  triggering control or an existing visible fallback when a row moves or is
  removed. Expanding history by itself keeps story selection and Side panel
  content as they were. Preserve focus ownership when a session action opens
  the Side panel.

## Decisive premises and baseline

The observations below ran in the preparation worktree at `b07ea7b517db`, in
Chromium with one worker on macOS AC power. Both groups used `--reporter=line`.
The local commands are under [Local gates](#local-gates).

| Consuming operation | Observed baseline and consequence |
| --- | --- |
| Real Board Mark as done, refresh and reopen | E2E `agent-launch-story-card-done` and `recently-done-returned-sessions` (3 passed). The real local Done operation moves the row to Recently done while the published story stays in Backlog or Taken. A returned launch keeps its label, can reopen to Working, and joins its completed story's history when that card becomes its home. Move the row while retaining those transitions. |
| Board listing, paging count and sidebar destination | Frontend `recently-done-active-story-sessions`, `recently-done-story-sessions`, `recently-done-follow-up-membership` and `recently-done-sessions-select-development` (8 passed). Overlap produced one open entry on the Backlog card and one closed entry on the historical done card; the column count included that card and an ad hoc entry. Absent cards left standalone entries, closed follow-ups grouped only under their listed source, and the sidebar could reach a standalone row beyond the visible range. Update the overlap's session owner from the existing fixture and preserve the other outcomes. |
| Current card scan facts and controls | Frontend `taken-slice-progress`, `story-card-selection` and `accessible-board-touch` (5 passed); E2E `backlog-preparing`, `agent-roster-avatar` and `start-eligibility` (4 passed). These journeys exercise published progress and its gap, roster and credit, narrow paging and Start's guarded behavior. Use them to preserve the interactions while changing visual emphasis. |

## Ordered slices

### 1. Review retained Done sessions from their unfinished story

Type: Behavior
Status: done

With published Backlog or Taken membership and retained launches for the same
story, opening the card's Done disclosure reveals the sessions in existing
newest-first launch order and makes their actions available. Closing it hides
them. Updating a session or the published membership moves the same retained
entry to its current home and updates the affected count. Use the existing
Board placement seam, add the disclosure beside the existing launch area, and
reuse session destination handling to open it on an explicit reveal. Compose
the disclosure alongside `StoryCardLaunches.tsx` and render it with the shared
`SessionEntry.tsx`. Both files are already 250 lines.

**Accepted proof (pre-delivery).** Unfinished cards hold Done sessions in
`StoryCardDoneSessions` (sibling of launches); `newestFirst` skips unfinished
identities before Recently done paging/counts; navigation opens
`details.story-card-done` on reveal. Focused proof: disclosure vitest,
recently-done frontend siblings, E2E mark-done/returned/sidebar, Review
changes card action, typecheck, lint. Accessible list label is `Done history`
(avoid substring clash with `Sessions`). Refactor: `storyCardAssignmentsOf`,
`storyCardDone` class module, `story-card-done.css`, disclosure page-object
helpers.

| Promise | Owning browser proof |
| --- | --- |
| No disclosure with zero Done sessions. Two Done sessions and a current session give a collapsed count of two, then accessible rows and actions when expanded. Closing leaves focus on the disclosure and hides the rows from keyboard navigation. | Mount the owning card/history UI with typed same-project retained launches, current session and existing Session entry providers. Exercise keyboard expansion and collapse and the rendered row count and actions. Use a separate case with no Done sessions. |
| Real Done and reopen move the row between history and current work while published membership, existing outcome words, action availability and Start gating follow their existing inputs. A session action still reaches its terminal/report or offers Follow up when it cannot reopen. A sidebar destination can reveal a collapsed row without changing the sidebar's selection semantics. | Extend the existing `agent-launch-story-card-done` and `recently-done-returned-sessions` E2E journeys at the changed Board destination. Observe the protected Start condition, a sidebar reveal on an unfinished card, existing recovery, and return to Working after a real synthetic-host attach. Exercise the moved entry's report and conditional Follow up using the owning rendered view with retained record/state and typed host capabilities. |
| One Board home in Backlog, Taken, historical overlap and published completion; unrelated/expired sessions remain standalone. Counts use rendered top-level entries. | Update the overlap fixture's observation in `recently-done-active-story-sessions`. Keep its historical card and count checks. Recheck `recently-done-story-sessions`, `recently-done-follow-up-membership` and `recently-done-sessions-select-development`; use the returned-session E2E progression for the Backlog–Taken–done transition. Include a different-project launch with the same story identity in placement proof. |

### 2. Make current work easiest to scan

Type: Behavior
Status: planned

A developer reading a Backlog or Taken card with current work sees the title
and applicable compact slice progress first. Give the current session and its
available primary action the most emphasis. Keep the Done disclosure and
secondary story actions quiet and accessible. Use the existing assignment
components (agent portrait/name, credited human with smaller avatar/name when
available) and keep the roster and existing availability cues reachable.

**Proof.** Compare a Taken card at a viewport where all columns fit and at a
narrow viewport with the approved mockup, both collapsed and expanded. Check
title/progress placement, primary action emphasis, wrapping and keyboard
reachability. Run `taken-slice-progress`, `story-card-selection`,
`accessible-board-touch`, `backlog-preparing`, `agent-roster-avatar` and
`start-eligibility` for progress gaps, unchanged selection, assignment/roster,
narrow Board layout and Start eligibility.

## Local gates

- Apply [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  selection before test edits. Follow the [Architectural North Star](../../NORTH-STAR.md)
  for new frontend cases. Use Vitest Browser Mode at the smallest owning view
  with typed launch/assignment data and the existing contexts; keep the
  real mark/reopen journey in E2E. Keep default timeouts.
- Run focused frontend cases with `npm run test:dashboard:frontend -- <specs>`
  and E2E cases with `npm run test:e2e -- <specs> --project=chromium --workers=1`.
  The retained frontend baseline ran with `./node_modules/.bin/playwright test
  --config dashboard/frontend.playwright.config.ts --project=chromium
  --workers=1 --reporter=line <spec basenames>`. The E2E baseline used the E2E
  command with `--reporter=line`. Trace actual changed output, selectors and
  callers and run each affected reader before delivery.
- Run `npm run typecheck:dashboard` and `npm run lint` for the touched UI and
  test contracts. Use Homebrew Bash 5 for shell gates, with `NO_COLOR`,
  `FORCE_COLOR` and `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset. Run long local
  checks while awake with `caffeinate -s -i` on AC power per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Plan review

Slice-plan refinement was not needed. The first slice owns the complete move
and uses one placement rule across the Board; the second independently changes
the reading order and emphasis using existing card facts. Each fits the
15-active-minute budget with focused proof. This review found no remaining
slice-specific concern.
