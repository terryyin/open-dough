# Insert common prompts in the dashboard terminal

**Identity:** SEED-298#insert-common-prompts-in-the-dashboard-terminal
**Source:** [Refined story](../../seeds/SEED-298-insert-common-prompts-in-the-dashboard-terminal.md#insert-common-prompts-in-the-dashboard-terminal)
**Preparation:** owned workspace
`/Users/terryyin/git/open-dough/.worktrees/insert-common-prompts-in-the-dashboard-terminal`,
branch `cursor/insert-common-prompts-in-the-dashboard-terminal`, starting
revision `334460b73e52dc2dd235b22f75b8154c380b703b`. This plan authorizes no
execution.

## Goal and scope

A developer replying in the Side panel terminal can open **Prompts** in the
former Dictate session-actions slot, insert the literal replies `OK` or
`as recommended` without Enter, or start the existing terminal dictation flow
from that menu, then edit and send deliberately. While recording, **Stop
recording** replaces **Prompts**; when recording ends, **Prompts** returns.
Desktop and mobile headers share the control. Preset offers use the same
attachment acceptance and recovery naming as other terminal inserts.

Out of scope: custom prompt libraries, more presets, auto-send, contextual
replies, new keyboard shortcuts for presets, dictation transcription or OpenAI
setup changes, and phone key-toolbar / Compose redesign.

## Architecture and reuse

PFE: the responsibility is “offer short canned terminal replies and Dictate
from one header session action.” Existing owners: `useTerminalDictation`
(Dictate / Stop recording control and transcript recovery),
`useAttachedTerminal.insertText` / `attachedTerminal.insert` (local offer, no
Enter, focus), session-actions header in `Terminal.tsx`, and
[Terminal input](../../../dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md). Reuse and
change that header control owner so **Prompts** wraps the two presets plus the
existing dictation start; do not add a second insert path, wire message, or
repository-backed prompt catalog. Fixed phrases stay panel-local UI strings.

Follow [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
for Side panel / session-actions naming. No Accepted conflict; index and
in-file status agree. No new North Star topic: ordinary panel chrome within
existing terminal contracts.

Common rule: one header slot; menu chooses insert-or-dictate; inserts never
submit; recording owns the same slot as today.

## Outside-in proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| **Prompts** replaces Dictate in session actions; menu offers `OK`, `as recommended`, Dictate | 1: dashboard Playwright journey opens **Prompts**, sees the three choices |
| Choosing a preset inserts that text with no Enter; focus allows edit then Enter | 1: traffic/assert input shows the phrase without a submit line until Enter; existing typed text preserved as insert already does |
| Dictate from the menu starts recording; Stop recording replaces Prompts; Prompts returns | 1: updated voice journey through menu → record → stop; existing recovery/lifecycle still pass |
| Unavailable attachment refuses preset insert and names recovery | 1: ended or connecting panel; choose `OK`; no insert; status names Reconnect, Open again, or still connecting |
| Product docs describe Prompts and the shared insert rule | 1: `AGENT-LAUNCH-TERMINAL-INPUT.md` matches the shipped control |

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| `insert(text)` offers via `terminal.input` with focus and no Enter | Slice 1 preset offer | Read `dashboard/src/attachedTerminal.ts` insert at `334460b73e52dc2dd235b22f75b8154c380b703b` (lines offering `terminal.input(text)` then `terminal.focus()`) | Settled: no trailing Enter in the offer |
| Dictate / Stop recording is the replaceable session-actions control from `useTerminalDictation` | Slice 1 Prompts slot | Read `useTerminalDictation.tsx` and `Terminal.tsx` session-actions at that revision | Settled: one `control` node in the header |
| Current voice proof opens Dictate by accessible name on that header button | Slice 1 voice path update | Scratch renamed the product label to `Dictate SCRATCH` at that revision, then listed remaining `Dictate into terminal` selectors in `terminalVoicePage.ts`, `session-terminal-voice*.spec.ts`, and `agent-terminal-cursor-page.spec.ts`; reverted the scratch | Settled: those helpers/specs must open Dictate through **Prompts** (or equivalent) in the same slice; unpaid focused voice run remains the discrimination proof after the change |

## Ordered slices

### 1. Reply with common prompts or dictate from the terminal header
Type: Behavior  
Status: planned  
Proof: Focused dashboard Playwright covering preset insert without Enter, Dictate via Prompts with Stop recording slot swap, unavailable-attachment recovery for a preset, and updated existing voice/cursor terminal specs that currently click Dictate directly; update `AGENT-LAUNCH-TERMINAL-INPUT.md`. Run the touched terminal voice and related terminal specs through the dashboard Playwright project (named path selection, not a mandatory full suite).

Behavior: Side panel terminal open → developer opens **Prompts** in the former Dictate slot → choosing `OK` or `as recommended` inserts that literal text without Enter and leaves focus for edit/Enter; choosing **Dictate into terminal** starts the existing dictation flow with **Stop recording** in that slot until recording ends; when the attachment cannot accept input, a preset is not inserted and status names the panel's recovery.

## Current decisions

- Keep deliberate Enter for presets (same rule as dictation and composer Insert).
- Fixed catalog of two phrases only; no durable prompt store.
- Prefer extending the dictation header control owner over a parallel insert feature.

## Plan concern assessment

Slice-plan refinement was not needed: one cohesive Behavior owns the header
replacement, presets, Dictate entry, and proof-consumer updates under one
insert rule. This review found no remaining slice-specific concern. No
human-owned scope or ADR decision is pending.

## Execution notes

- No numeric slice target or hard limit is supplied; judge boundedness by one
  proof loop and the Behavior gate above.
- Local gates: focused dashboard terminal/voice specs named in slice 1 proof,
  ordinary commit hooks; no mandatory full-suite run for this panel change.
  For long runs start fully awake: on AC use `caffeinate -s -i`; on battery
  plug in or keep the lid open under `caffeinate -i` and inspect sleep logs
  per [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written to every delegation and repair handoff. Shared `makeMe`
  arranges automated domain data where applicable; no sleeps, `test.slow()`, or
  suite/hook timeout overrides. Execution owns applicable local and published
  CI repairs.
