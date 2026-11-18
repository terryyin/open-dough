# Submit and close the dashboard terminal

**Source:** [Submit and close the dashboard terminal](../../seeds/SEED-385-submit-and-close-the-dashboard-terminal.md#submit-and-close-the-dashboard-terminal)
**Identity:** SEED-385#submit-and-close-the-dashboard-terminal

## Goal and scope

A macOS developer submits a ready follow-up from a focused Side panel terminal
with Command+Enter, sees acceptance as that session leaving ready-for-prompt
activity, then gets the same Close outcome while native work continues. The
seed owns Goal, Scope, Key examples, deferred promises, and UI/architecture.

Excluded: Windows/Linux Control+Enter; a visible Submit-and-close control;
closing immediately after Enter without leave-ready confirmation; changing
Mark as done, Delete, or host attach keep/SIGHUP rules.

## Existing solution and direction

PFE at `3603f59713737b2f00f9b2aa689766ae53617347`:

- Page Command chords:
  [`pageShortcuts.ts`](../../../dashboard/src/pageShortcuts.ts)
  `useCommandShortcut` (Meta, optional Shift, capture, ignore dialogs/settings);
  Close uses it in
  [`SidePanelControls.tsx`](../../../dashboard/src/SidePanelControls.tsx);
  proof pattern in
  [`e2e/terminals/agent-terminal-keyboard.spec.ts`](../../../e2e/terminals/agent-terminal-keyboard.spec.ts)
  with [`pageShortcutsPage.ts`](../../../dashboard/tests/pageShortcutsPage.ts).
- Terminal input and Close:
  [`attachedTerminal.ts`](../../../dashboard/src/attachedTerminal.ts)
  `onData` → WebSocket `{ input }` (local offer, not a PTY receipt);
  [`Terminal.tsx`](../../../dashboard/src/Terminal.tsx) already holds
  `current: LaunchWithState` and `onClose`.
- Ready / leave-ready readings (normalized activity): Cursor
  [`sessions.ts`](../../../dashboard/server/hosts/cursor/sessions.ts)
  follow-up → `awaiting-instruction` or `review`, working/waiting otherwise;
  Claude listing `done` → `review`, `working`/`blocked` → working/waiting;
  Codex idle/completed → awaiting-instruction/review, inProgress/waiting flags
  → working/waiting.
- Machine-sessions pace:
  [`revisionCheckSchedule.ts`](../../../dashboard/src/revisionCheckSchedule.ts)
  `checkIntervalMs` = 15_000; `agentLaunches` has an internal `reread` but
  exports only `rereadOffers` (Host switch). Terminal cannot ask a prompt read
  today.

Direction: reuse `useCommandShortcut` for Meta+Enter while terminal input is
focused; gate on attachment input + activity `awaiting-instruction`|`review`;
send one ordinary Enter on the existing input path; expose a prompt
machine-sessions reread the gesture can ask (same path as internal `reread`,
not a second poller); close via existing `onClose` when activity becomes
`working`|`waiting`; on disconnect/end/bounded wait without that change, keep
the panel open with confirmation-unavailable feedback. No new host attach API.
ADR 0008 observe-without-owning and WebSocket terminal I/O hold; no North Star
topic.

## Decisive premises and preparation observations

Observations in this workspace at `3603f59713737b2f00f9b2aa689766ae53617347`
on 2026-11-18.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| `useCommandShortcut` matches Meta+Enter without Shift and rejects plain Enter | Node evaluation of the same predicate as `pageShortcuts.ts` `matches`: Meta+Enter true; plain Enter false; Meta+Shift+Enter false. | None. |
| Ready-for-prompt and leave-ready map to existing activities on each host | Read Cursor/Codex/Claude session classifiers: ready = `awaiting-instruction`\|`review`; leave-ready = `working`\|`waiting`. | None. |
| Steady sessions poll is 15s; Terminal has no prompt reread today | `checkIntervalMs === 15000`; `readSessions` exports `rereadOffers` only; `Terminal` uses `usePageSessions` without a prompt reread. | Slice exposes one prompt reread for this gesture (and compatible callers), not a new schedule. |
| Fake Claude can drive listing through ready → working for integrated proof | `claudeSessionBecomes` + `done-live` / `working` appearances in `fakeClaudeListing.ts` / `claudeListingTestData.mjs`; existing Done/session specs already flip listing while a terminal is open. | Spec drives listing after Enter; fake attach need not rewrite agents.json on Enter. |
| Outside-in keyboard Close journey is the proof neighbor | `agent-terminal-keyboard.spec.ts` opens synthetic Claude, focuses terminal, presses Meta+Shift+Escape, asserts Close semantics via `watchCommandShortcut`. | Extend or sibling under `e2e/terminals/` with page objects / MakeMe as `test-entry-rules` selects. |

## Outside-in proof ownership

| Promise | Slice | Observable proof |
| --- | --- | --- |
| Command+Enter on a ready, focused, connected terminal sends one Enter, then closes like Close once activity is working or waiting; native attach keep/SIGHUP unchanged | 1 | Integrated journey: session at `review` (Claude `done-live`), focused terminal, prompt typed, Meta+Enter → attach lines show one submitted line; after listing becomes `working`, panel is gone and focus returns as Close; process keep/SIGHUP matches today's Close for that host. |
| Disconnect or bounded wait without leave-ready keeps the panel and says confirmation is unavailable | 1 | Same setup → Meta+Enter → force disconnect or hold listing at ready past the bound → panel remains; status names confirmation unavailable. |
| Not-ready activity or unfocused terminal does not submit-and-close; plain Enter unchanged | 1 | Working session + Meta+Enter: chord prevented (`watchCommandShortcut`), no new attach line, panel open. Plain Enter still submits without closing. |
| Meta+Enter never reaches the PTY as Meta+Enter | 1 | Prevented-default watch on Meta+Enter while focused in the terminal. |

## Ordered slices

### 1. Command+Enter submits a ready prompt and closes after leave-ready
Type: Behavior
Status: planned
Proof: the four rows above; focused
`npm run --silent test:e2e -- e2e/terminals/<submit-close-spec> --workers=1 --reporter=list`
(or the extended keyboard spec), plus `npm run typecheck:dashboard` and staged
lint.

Behavior: focused connected terminal whose session activity is
`awaiting-instruction` or `review`, with a typed prompt → developer presses
Command+Enter → one ordinary Enter is offered on the attachment, a prompt
machine-sessions read is asked, and when that session's activity becomes
`working` or `waiting` the Side panel closes as Close does; if the attachment
is lost or the bound expires first, the panel stays open and says confirmation
is unavailable; when activity is already working/waiting or input is unfocused,
Command+Enter does not run this submit-and-close; plain Enter stays as today.

## Verification and delivery

- Follow [the failing/flaky-test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written; a base failure is attribution, never an exemption.
- Before test edits, run installed `test-entry-rules.mjs` for actual paths and
  apply [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) and
  [dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md) as
  resolved. No sleeps, `test.slow()`, or timeout overrides.
- Local gate: focused e2e command and proofs above, `npm run typecheck:dashboard`,
  post-change refactoring, staged lint, ordinary delivery. No full local suite:
  change is terminal shortcut + sessions reread exposure + one focused journey.
  Hosted CI runs the shard.
- Run under maintained `caffeinate -s -i` on AC, per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos);
  on battery, `caffeinate -i` awake with the lid open and read the sleep log.
- Bounded wait for confirmation: longer than one prompt read round-trip, not
  tied to inventing a second poll interval; exact ms chosen in implementation
  against the existing read path, recorded in Current decisions when set.

## Current decisions and plan review

One Behavior owns one outcome and one proof loop; exposing prompt reread is
necessary implementation for that Behavior, not a separate Structure outcome.
No trunk-only step or human checkpoint. Slice-plan refinement was not needed:
no boundary, cumulative design, sizing, or proof-ownership concern was
identified. This review identified no remaining slice-specific concern.
