# Prove Mark as done's remaining edges and trim card-session residue

## Source and authority

- **Identity:** SEED-052#card-session-residue.
- **Source:** [correction story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#card-session-residue),
  from the execution retrospective of SEED-052#keep-story-session-links (plan
  157) on 2026-09-29.
- **Provenance:** reviewed commits `30bdc002`, `08f217af`, `76e6dce3`,
  `32e554d5`, and `cbd9b7d6` on `claude/keep-story-session-links`, after the
  Take `4df86e5b`.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

Maintainers can rely on a test for every Mark as done promise the dashboard
documents, read one request shape for the page's session operations, and
change card-session behavior in specs that each own one concern and stay
within 250 lines.

Preserved: every promise of SEED-052#keep-story-session-links (examples 1 to
6, the membership rule, Terry's focus decisions, stop only while listed or
unreadable, retention from the done time) and the page-wide rules in
`accessible-overview-keyboard.spec.ts` and `published-work.spec.ts`. Also
preserved: SEED-052#reopened-session-returns (plan 161, queued ahead of this
correction), under which an admitted attach clears a session's done mark and
returns it to its card; whichever plan lands second rebases onto the other.
Excluded: new behavior; ADR 0008's "Launch workflow" definition, which still
names the removed settlement and is Terry's to revise; a page observation of a
40-day-old unclosed record (the page applies no age filter, so the boundary
case in `agent-launch-records.spec.ts` decides it); a restart after marking an
unlisted session (the persistence path is shared with the listed case, which
restarts).

## Current findings

1. The focus fallback to the Recent sessions region, for a session whose entry
   is not on the page, is implemented (`src/terminalOpening.ts`
   `sessionKeyboardHome`) but no spec observes it.
2. `server/doneMarks.ts` still stops a session whose listing cannot be read;
   no done spec marks a session while `claudeListingFails` is set. The North
   Star row says only "stops it if Claude Code lists it".
3. A card entry's refusal message ("The session could not be marked done.")
   is asserted only for the panel (`agent-terminal-done.spec.ts:161`).
4. `MarkSessionDone` takes a `TerminalOpening` whose `opener` holds the Mark
   as done button, and `terminalOpening.ts` also owns marking
   (`useMarking`, `notMarkedDone`). `SessionEntry`'s `onCard` gates the
   `data-shows-session` marker, which `sessionKeyboardHome` already scopes to
   `.recent-sessions`.
5. Test variables still say Started for card session entries:
   `agent-terminal.spec.ts:65`, `agent-terminal-done.spec.ts:190`,
   `agent-launch-card.spec.ts:139` and `:198`.
6. `agent-launch-card-session-states.spec.ts` (252 lines) rechecks every state
   label that `agent-launch-recent-session-states.spec.ts` owns through the one
   `sessionStateWords`; `agent-launch-card.spec.ts` (251 lines) reproves two
   entries, newest first, which `agent-launch-card-sessions.spec.ts` owns; card
   listing across reload and project switch is asserted in three places.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| No spec observes the region fallback. | `grep -rn "recentSessions).toBeFocused" dashboard/tests` at `cbd9b7d6`. | None. `agent-terminal-lifetime.spec.ts:100` already switches to Doughnut with a panel open. |
| No done spec marks while the listing fails. | `grep -n claudeListingFails dashboard/tests/agent-launch-done*.ts`. | None. |
| The card refusal text is asserted only for the panel. | `grep -n "could not be marked" dashboard/tests/*.ts`. | Only `agent-terminal-done.spec.ts:161`. |
| `terminalOpening.ts` has four importers, all in the page. | `grep -rln terminalOpening dashboard/src dashboard/tests`. | `SessionEntry.tsx`, `TerminalSplit.tsx`, `LaunchSession.tsx`, `TerminalPanel.tsx`. |
| Two specs exceed 250 lines. | `wc -l` on both. | 252 and 251. |
| The whole dashboard suite runs locally in under a minute. | `npx playwright test --config dashboard/playwright.config.ts --reporter=line` at `cbd9b7d6`'s content. | 286 passed (45.8 s). |

## Slices

### 1. Every documented Mark as done edge has a test
Type: Structure
Status: done
Proof: `agent-terminal-lifetime.spec.ts` gains a step: with the panel open on
an Open Dough session and Doughnut selected, Mark as done in the panel moves
focus to `parts(page).recentSessions`. `agent-launch-done.spec.ts` gains a
boundary case: with `claudeListingFails(true)`, the done POST answers the
marked record and `calls.jsonl` has `["stop", shortId]`. The card-done spec
asserts a card entry's refusal message when the boundary refuses. Update the
North Star row to "stops it if Claude Code lists it or cannot read its list".

Accepted proof: `agent-terminal-lifetime.spec.ts` step "marked done from the
panel while another project is shown, the keyboard goes to Recent sessions";
`agent-launch-done.spec.ts` "still stops a session whose listing cannot be
read"; `agent-launch-card-done.spec.ts` "a refused mark keeps the session on
its card and says so on its entry"; North Star row updated
(`dashboard/AGENT-LAUNCH.md` already said so). Whole dashboard suite 288
passed; typecheck passed.

### 2. The page's session operations share one request shape
Type: Structure
Status: planned
Proof: the launch and terminal specs pass unchanged in what they observe;
`npm run typecheck:dashboard`.

Replace `TerminalOpening` as the argument of both `OpenTerminal` and
`MarkSessionDone` with one `{ record, control }` request; keep the open-panel
state in `TerminalSplit`. Rename `terminalOpening.ts` for the page's sessions
(for example `pageSessions.ts`). Put `data-shows-session` on every entry and
drop its `onCard` gate. Rename the Started test variables to entries. When plan
161 has landed, the page's refresh after a terminal attaches to a done
session uses the same request shape; do not add a second one.

### 3. Card specs keep only card-specific observations
Type: Structure
Status: done
Proof: every changed spec is at most 250 lines, and each removed assertion
names its surviving owner.

In `agent-launch-card-session-states.spec.ts`, keep that each state stays
listed on its card, Session unavailable without Open terminal, State unknown
with it, and the restart/reload/switch step (example 3); leave the label
matrix to `agent-launch-recent-session-states.spec.ts`. In
`agent-launch-card.spec.ts`, keep the refinement argv and focus on the newest
entry; leave two entries and their order to `agent-launch-card-sessions.spec.ts`.
Drop card-sessions' standalone reload and project-switch steps; the
card-session-states restart step and card-sessions' in-stage reloads keep that
coverage. Update `dashboard/tests/README.md`. Keep plan 161's reopening
observations in `agent-terminal-done.spec.ts` and the terminal boundary spec
when they have landed; they are not overlap.

Accepted proof, delivered ahead of slice 2 while plan 161 was not yet on
trunk: after SEED-052#launch-claude-refinement landed,
`agent-launch-recent-session-states.spec.ts` owns the state matrix on Recent
sessions entries plus one card entry (`placed`);
`agent-launch-card-session-states.spec.ts` keeps each state on its card,
Session unavailable without and State unknown with Open terminal, and
restart, reload and switch persistence; `agent-launch-attention.spec.ts`'s
project-switch step keeps only the attention count; card-sessions loses its
standalone reload and switch; card keeps the refinement argv and focus.
Each removal names a verified surviving owner in the execution conversation.
Specs are 232, 186, 238, 227 and 239 lines; whole dashboard suite 291 passed;
typecheck passed.

## Learnings

- Plan 161 (reopened-session-returns) reports, before it lands on trunk:
  its reopening observations live in the new
  `dashboard/tests/agent-terminal-reopen.spec.ts`, not the terminal boundary
  spec; `agent-terminal-done.spec.ts` and `agent-terminal-boundary.spec.ts`
  are each at 250 lines; `TerminalSplit` now takes one
  `sessions: Pick<ProjectLaunches, "markDone" | "readSession">` prop and
  `TerminalPanel`'s `onAttached(record)` drives `readSession`, which slice 2
  folds into its one request shape; the server's `markRecordDone` became
  `setRecordDoneAt`. Rebase slice 2 onto plan 161 once it is on trunk.
- SEED-052#launch-claude-refinement (plan 159) landed after the Take: it
  made card entries share `sessionShown` (`dashboard/src/sessionShown.ts`)
  and had `agent-launch-recent-session-states.spec.ts` check every state on
  both entries, which slice 3 trimmed to one card entry. Slice 2's Started
  variables are now `started` and `refinementStarted` only.
- CI run 36564344723 on the trunk merge exposed a race in the CI mailbox:
  a worker exiting after its publication can show a bare `[node]` command,
  and shutdown was confirmed without waiting for it. Repaired in `4e0b2420`.

## Proof ownership

| Promise | Owner |
| --- | --- |
| Region focus fallback | 1: `agent-terminal-lifetime.spec.ts` |
| Unreadable listing still stops | 1: `agent-launch-done.spec.ts` |
| Card entry refusal message | 1: `agent-launch-card-done.spec.ts` |
| Every existing launch and terminal observation | 2 and 3: the launch and terminal specs, with surviving owners named for each removal |

## Delivery checks

Run the whole dashboard Playwright suite before each delivery, since two page
changes in plan 157 failed page-wide specs only in CI (DD-177), and it takes
under a minute. `npm run typecheck:dashboard`. Gate commit and delivery on
`npm run format` succeeding (`&&`). Run the `dough-post-change-refactor` pass
before each commit.

## Concern review

Three slices, each one concern: missing proof, one representation, and spec
overlap. Slice 3 depends on no other slice; slice 2 touches the specs slice 3
trims only by variable names, so running 2 before 3 avoids conflicts. No
concern remains.
