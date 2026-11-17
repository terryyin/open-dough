# Separate dashboard terminal dictation from quick replies

**Identity:** SEED-392#separate-dashboard-terminal-dictation-from-quick-replies
**Source:** [Separate dashboard terminal dictation from quick replies](../../seeds/SEED-392-separate-dashboard-terminal-dictation-from-quick-replies.md#separate-dashboard-terminal-dictation-from-quick-replies)

## Goal and scope

A developer using the dashboard terminal starts and stops dictation from a
dedicated microphone control and picks fixed quick replies from **Prompts**,
without opening a menu to dictate or losing replies while recording. The story
section owns the scope, scope limits and key examples; this plan adds none.

Preparation authorizes no implementation.

## Existing solution and direction

Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
terminal header actions stay on the session panel; dictation and fixed replies
remain browser presentation over the existing attachment `insert` path. No
North Star topic or new ADR is needed.

PFE findings and choices:

- **Ownership today.** `src/useTerminalDictation.tsx` mounts either
  `TerminalPrompts` (replies plus **Dictate into terminal**) or a **Stop
  recording** `IconButton`. While recording, **Prompts** is absent. Reply
  insertion and dictate entry share that one header slot.
- **Reuse and change.** Keep `TerminalPrompts` as the replies menu and
  `useInstructionRecording` for capture. Change `useTerminalDictation` so the
  microphone / **Stop recording** control is always its own `IconButton`
  (`Mic` / `Square` from lucide-react, same `IconButton` pattern as Stop
  today), and `TerminalPrompts` stays mounted beside it. Drop the dictate prop
  and menu item from `TerminalPrompts`; the menu lists only fixed phrases.
- **Words.** Accessible start name for the microphone control:
  **Dictate into terminal** (retires the menu item wording onto the button).
  Stop stays **Stop recording**. Reply phrases remain the literals in the
  story.
- **Helpers.** `tests/support/terminalVoicePage.ts` owns dictate start/stop
  and availability checks used by frontend and e2e voice specs. Point
  `chooseTerminalDictation`, `expectTerminalDictationAvailable`,
  `beginTerminalClip` and `expectClipStopped` at the standalone control and at
  **Prompts** remaining visible while recording. `dictateMenuItem` retires with
  the menu item.
- **Docs.** Update
  [AGENT-LAUNCH-TERMINAL-INPUT.md](../../../dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md)
  Common prompts / Dictation sections and the `Terminal.tsx` Alt+F10 help text
  so they match the two controls.

Expected edits stay under the 250-line check:

| File | Lines | Decision |
| --- | --- | --- |
| `dashboard/src/TerminalPrompts.tsx` | 136 | Remove dictate; reply list only. |
| `dashboard/src/useTerminalDictation.tsx` | 118 | Always render mic/stop plus Prompts. |
| `dashboard/tests/support/terminalVoicePage.ts` | 179 | Retarget helpers; no new ownership. |

## Current decisions

- Control order in session actions: microphone (or **Stop recording**), then
  **Prompts**, then Mark as done / panel controls as today.
- While recording, **Prompts** stays available; choosing a reply inserts text
  and does not stop capture. The later transcript still uses today's offer
  path.
- Microphone start is disabled while an unsent transcript is pending or
  recording is busy, matching today's dictate availability.
- Exact five reply strings: `OK`, `as recommended`, `Try again`, `Resume`,
  `Please explain`.

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| Standalone microphone control starts dictation; becomes **Stop recording**; **Prompts** stays available; menu has no **Dictate into terminal**; Alt+F10 then Tab reaches both controls | 1: update `dashboard/frontend-tests/terminals/session-terminal-voice.spec.ts` (keyboard path and recording UI); helpers in `terminalVoicePage.ts`; consumers `e2e/terminals/session-terminal-voice-lifecycle.spec.ts`, `session-terminal-voice-recovery.spec.ts`, `agent-terminal-pending-readiness-input.spec.ts` via those helpers |
| **Prompts** offers only the five replies; choosing one inserts, preserves prefix, returns focus, requires Enter; ended attachment recovery wording unchanged | 2: update `dashboard/frontend-tests/terminals/session-terminal-prompts.spec.ts` (desktop and phone); recovery still covered by `dashboard/frontend-tests/terminals/terminal-prompts-recovery.spec.ts` for connecting/refused paths |
| Maintained contract text | 1 updates dictation + keyboard help in `AGENT-LAUNCH-TERMINAL-INPUT.md` and `Terminal.tsx`; 2 updates the Common prompts reply list in that doc |

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Recording replaces **Prompts** with Stop in one header slot | Slice 1 control split | 2026-11-17, read at `a79ed0ef1`: `useTerminalDictation` returns `recordingNow ? Stop IconButton : TerminalPrompts`; `beginTerminalClip` asserts `terminalPromptsControl` count 0 while recording |
| Dictate starts only through the Prompts menu item | Slice 1 helper retarget | 2026-11-17, read at `a79ed0ef1`: `TerminalPrompts` renders **Dictate into terminal**; `chooseTerminalDictation` opens Prompts and clicks that menuitem; frontend keyboard voice spec Ends to that item |
| Frontend prompts and voice specs are the outside-in proof route for header replies and dictation | Slices 1–2 focused gates | 2026-11-17, listed under `dashboard/frontend-tests/terminals/`; voice specs import `terminalVoicePage` helpers; prompts spec asserts menu text `OK` / `as recommended` / `Dictate into terminal` |
| e2e voice journeys start capture only through `chooseTerminalDictation` / `beginTerminalClip` | Slice 1 helper change covers consumers | 2026-11-17, ripgrep of `e2e/terminals`: those helpers are the only dictate entry points in lifecycle, recovery and pending-readiness specs |

## Concerns

Slice-plan refinement was not needed. Both Behavior slices extend one rule:
dictation is a dedicated header control and **Prompts** is only fixed replies.
Slice 2 only widens the reply list on that menu. This review found no remaining
slice-specific concern.

Accepted interim behavior: after slice 1, **Prompts** offers only `OK` and
`as recommended` until slice 2 adds the three new phrases.

## Ordered slices

Each slice targets 15 active minutes.

### 1. Standalone terminal dictation beside Prompts
Type: Behavior
Status: planned
Proof: updated `session-terminal-voice.spec.ts` and `terminalVoicePage.ts`
helpers; consumers named in the slice 1 proof row; `npm run typecheck:dashboard`;
`npm run lint`. Local gate:
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list terminals/session-terminal-voice` plus the named e2e consumers when helpers change their contracts.

Behavior: terminal attached and ready → session actions show **Dictate into
terminal** (microphone) and **Prompts** separately. Activating the microphone
starts capture without a menu; the control becomes **Stop recording**;
**Prompts** remains visible and openable. **Prompts** has no **Dictate into
terminal**. Alt+F10 focuses session actions; Tab reaches the microphone
control, then **Prompts**. Pending transcript or busy recording keeps the
microphone from starting a new capture. Dictation insertion and recovery stay
as today.

- Split `useTerminalDictation` controls; strip dictate from `TerminalPrompts`;
  retarget voice helpers and docs.

### 2. Prompts offers the five fixed replies
Type: Behavior
Status: planned
Proof: updated `session-terminal-prompts.spec.ts` (desktop and phone menu
membership and insert journeys for the new phrases alongside the existing
ones); `npm run typecheck:dashboard`; `npm run lint`. Local gate:
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list terminals/session-terminal-prompts`.

Behavior: open **Prompts** → menu lists exactly `OK`, `as recommended`,
`Try again`, `Resume`, and `Please explain`. Choosing any inserts that
literal, preserves existing input, returns focus, and submits only on Enter.
Ended-attachment recovery for a preset still names **Open again** and never
retries automatically.

- Reply list in `TerminalPrompts`; Common prompts doc list.

## Local gates and execution discipline

Apply the linked
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Run Playwright with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES` and
`--reporter=list`, naming the config: `dashboard/frontend.playwright.config.ts`
or `e2e/playwright.config.ts`. Following [AGENTS.md](../../../AGENTS.md), keep
the default timeouts, never use `test.slow()`, and apply MakeMe and page-object
selection before editing tests. Each slice's named specs and consumers are its
local gate. Hosted CI runs the full suites. The local-gate sleep guard is
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake, and on AC power wrap long or full runs in `caffeinate -s -i`.

## Learnings

None yet.
