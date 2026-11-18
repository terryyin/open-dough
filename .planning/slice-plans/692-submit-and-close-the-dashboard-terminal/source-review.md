# Source review

Launch: one fresh general-purpose reviewer (agent
`2e987f47-36d9-4825-921c-06a13114c73b`) on 2026-11-18, without conversation
inheritance, given only the selected story's Goal, Scope, Deferred, Direction,
and Key examples, told to read no project file and change nothing. Its return
numbered 1–7; the returned source text is retained per row.

Unnumbered source context as returned: scope exclusions (no new host attach
API; no change to Mark as done / Delete; no Windows/Linux Control+Enter); Deferred
(visible Submit-and-close control; gesture outside terminal focus; immediate
Close after Enter as primary path); Direction / reasons (prefer wait-for-leave-idle
then Close because Claude/Codex socket close sends SIGHUP and typed input has
only a local offer, not a PTY receipt; leave-idle side effects rather than a true
delivery ACK; false negatives keep the panel open).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Command+Enter chord capture (focused terminal input, macOS dashboard): While the terminal's input has focus, Command+Enter is a dashboard gesture: the page takes the chord (as Command+Shift+Escape does) so the session never receives Meta+Enter. Goal; Scope bullet 1; Key example 3. | slice 1 | observed: e2e/terminals/agent-terminal-submit-and-close.spec.ts watchCommandShortcut true; WS sent only "\r" |
| 2 | Gesture runs only when attachment can accept input and session is ready for a follow-up (`awaiting-instruction` or `review`). Scope bullet 2; Goal ("ready prompt"); Key example 1. | slice 1 | observed: useSubmitAndCloseTerminal acceptsInput+readyForPrompt gate; e2e ready Meta+Enter submits follow up |
| 3 | Not ready: chord taken, no submit, panel stays open. Otherwise the chord is taken and nothing is submitted or closed. Scope bullet 2; Key example 3 (focused while working/waiting → no Enter for this gesture; panel stays open). | slice 1 | observed: e2e working step: submitKeyTaken [true], no new attach line, panel visible |
| 4 | When it runs: one ordinary Enter through the existing terminal input path; panel stays open until activity becomes `working` or `waiting`; on acceptance Close runs unchanged (focus as Close; Claude/Codex hang up attachment client; Cursor keep; native work continues). Goal; Scope bullets 3–4; Key example 1. Retained: asks for a prompt machine-sessions reread. | slice 1 | observed: e2e ready step: lines [stay,follow up], sent "\r", panel gone, opener focused, attach ended, record available not done; rereadSessions wired |
| 5 | Acceptance unavailable: if attachment disconnects, ends, or bounded wait expires without leave-idle, panel stays open and shows confirmation is unavailable. Scope bullet 5; Key example 2. | slice 1 | observed: e2e kill-attach: confirmationUnavailable + panel visible; product submitAndCloseConfirmMs timer same feedback |
| 6 | Plain Enter keeps today's submit behavior only; panel stays open. Scope bullet 1; Key example 4. | slice 1 | observed: e2e plain Enter: lines [stay], panel visible |
| 7 | Command+Enter does nothing for this story when the terminal input does not have focus. Key example 4; Scope bullet 1. | slice 1 | observed: e2e unfocused: watchCommandShortcut last false, no new line, panel visible |
