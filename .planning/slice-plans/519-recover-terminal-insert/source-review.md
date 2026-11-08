# Source review: SEED-269#recover-terminal-insert

Launch: fresh general-purpose reviewer without conversation inheritance,
2026-11-08, before Slice 1 delegation. Input: only the seed story text from
**Goal** through **Key examples** (excluding Architecture) of
[SEED-269#recover-terminal-insert](../../seeds/SEED-269-recover-terminal-insert.md#recover-terminal-insert),
copied unchanged to one file; instructed to read no other project files and
change nothing, and to return numbered commitments, qualifications,
examples and exclusions without slice ownership.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer using the dashboard's embedded terminal on a phone can insert dictated or pasted text into the current session whenever the terminal already accepts their typing | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts dictation, Paste and composer steps on a pending-readiness Codex frame |
| 2 | or recover from an attachment that cannot accept it without losing a completed transcript | slice 2 | |
| 3 | Text input on the phone becomes as dependable as typing, which keeps phone-driven sessions moving. | slice 2 | |
| 4 | Deliberate and dictated text input … is accepted whenever the panel's current attachment is open and not refused, the same condition under which typing reaches the session. | slice 1 | observed: attachedTerminal.ts acceptsInput (current, !refused, open socket); agent-terminal-pending-readiness-input.spec.ts all steps |
| 4.1 | completed dictation is accepted under that condition | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts step "a completed transcript is offered once" sent == [transcript], no Unsent transcript |
| 4.2 | Insert transcript is accepted under that condition | slice 1 | observed: useTerminalDictation.tsx Insert transcript calls the same attachment insert proven in agent-terminal-pending-readiness-input.spec.ts; unavailable path in session-terminal-voice-recovery.spec.ts |
| 4.3 | toolbar Paste (text) is accepted under that condition | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts step "toolbar Paste offers clipboard text once" |
| 4.4 | toolbar Paste (stored image path) is accepted under that condition | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts step "toolbar Paste offers a clipboard image's stored path once" |
| 4.5 | composer Insert is accepted under that condition | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts step "composer Insert offers its draft once" |
| 4.6 | toolbar keys are accepted under that condition (Esc, Tab, arrows, Enter, Ctrl+C) | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts toolbar Enter and Esc sent; Tab, arrows, Ctrl+C share ToolbarKey → insert (TerminalKeyToolbar.tsx), existing families pass |
| 5 | Each offer is sent once | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts exact sent slices per step and one submitted line |
| 6 | submission remains an explicit Enter. | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts submitted() == [] before toolbar Enter, [offered] after |
| 7 | Readiness confirmation keeps deciding reopening and startup-failure handling | slice 1 | observed: server readiness unchanged; agent-terminal-codex-page.spec.ts held-frame and fail tests pass |
| 7.1 | Readiness confirmation keeps deciding reopening | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts done mark clears only after Esc completes the ready frame; agent-terminal-codex-page.spec.ts held-frame test |
| 7.2 | Readiness confirmation keeps deciding startup-failure handling | slice 1 | observed: no server change; Codex startup-failure tests in dashboard/tests/terminals and backend-tests pass |
| 8 | accepting input does not confirm readiness or clear a done mark by itself. | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts done mark set after all offers and Enter |
| 8.1 | Accepting input does not confirm readiness by itself | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts done mark set after all offers and Enter |
| 8.2 | Accepting input does not clear a done mark by itself | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts done mark set after all offers and Enter |
| 9 | When input cannot be accepted, feedback matches the panel's state and names the recovery the panel actually offers | slice 2 | |
| 9.1 | the shown Reconnect or Open again action after an ending or refusal | slice 2 | |
| 9.2 | or waiting while the terminal is still connecting | slice 2 | |
| 10 | A completed transcript stays available for an explicit Insert transcript or Discard transcript | slice 2 | |
| 11 | reconnecting sends no text by itself. | slice 2 | |
| 12 | Keep the distinction between a terminal that cannot accept input and a browser that cannot read the clipboard. | slice 2 | |
| 13 | The real Codex trigger that leaves readiness pending is not diagnosed or changed here | slice 1 | observed: no server, protocol or host change in slice 1 diff |
| 14 | when readiness is confirmed for reopening is unchanged. | slice 1 | observed: no server readiness change; agent-terminal-codex-page.spec.ts held-frame test passes |
| 15 | No new feedback for toolbar keys pressed while the attachment is closed; the panel's ending status already explains that state. | slice 2 | |
| 16 | Retaining a transcript after it was offered (for example because the native host ignored input during its own startup) is not promised. | slice 2 | |
| 17 | A local offer remains no native delivery receipt, exactly as for typing. | slice 2 | |
| E1 | Dictation on a visible prompt: readiness still pending → dictates → text appears once in the composer, no Unsent transcript panel, nothing submitted until Enter. | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts dictation step and Enter step |
| E2 | Paste on the same screen: taps Paste → text pasted once with no trailing Enter and no reconnect message. | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts toolbar Paste text step (status empty) |
| E3 | Toolbar key while pending: taps toolbar Esc → native terminal receives Escape (held redraw completes in the fixture). | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts toolbar Esc step |
| E4 | Done mark unchanged by input: done Codex session reopened into the held frame → pastes text → sent, done mark stays until the server confirms a ready completed frame. | slice 1 | observed: agent-terminal-pending-readiness-input.spec.ts done-mark assertions through Esc step |
| E5 | Attachment ended, panel shows Open again → transcript completes → stays under Unsent transcript with feedback naming Open again; after reopening, Insert transcript sends it once, reopening alone sends nothing. | slice 2 | |
| E6 | Clipboard unreadable: Paste → feedback to use Compose and the keyboard's own Paste, not a reconnect message. | slice 2 | |
