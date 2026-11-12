# Source review

Launch: a fresh general-purpose reviewer without conversation inheritance,
2026-11-12, before the first delegation. Input: the story's Goal, Scope, Scope
limits and Key examples as written in
[the seed](../../seeds/SEED-320-conditional-terminal-opening.md#open-terminal-only-without-a-custom-instruction),
with the instruction to use only that text, read no project files, change
nothing, and return individually numbered commitments.

Reviewer reading notes: 5.4 and 2.3 coexist (a host without a Dashboard
terminal presents none even when the field is blank); the examples are not
rejection rules, and 10.6 is one instance of “every host”; 10.1's keyboard is
the undisturbed-handoff case of 5.1.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1.1 | A developer who starts an ad hoc session with a typed instruction keeps the view they are working in while the session processes it | slice 2 | |
| 1.2 | A developer who starts a follow-up with a typed instruction keeps the view they are working in while the session processes it | slice 2 | |
| 1.3 | A developer who types nothing gets the session's terminal as soon as the session starts | slice 2 | |
| 1.4 | Reason for 1.3: a session started with nothing typed waits for the developer | slice 2 | |
| 2.1 | The required behavior applies to the project row's Start session | slice 2 | |
| 2.2 | The required behavior applies to Recently done's Follow up | slice 2 | |
| 2.3 | The required behavior applies on every host | slice 2 | |
| 3.1 | The typed instruction field alone decides whether the started session's terminal is presented | slice 2 | |
| 3.2 | Text that is blank after trim presents the started session's terminal | slice 2 | |
| 3.3 | That presentation is the same as today's | slice 2 | |
| 3.4 | Any other text presents nothing | slice 2 | |
| 4.1 | The Side panel is left as it is: open stays open | slice 2 | |
| 4.2 | The Side panel is left as it is: closed stays closed | slice 2 | |
| 4.3 | The Side panel keeps whatever it shows | slice 2 | |
| 4.4 | The new session appears as an entry in the Board's Taken | slice 2 | |
| 4.5 | The new session appears as an entry in the Sessions sidebar | slice 2 | |
| 4.6 | The entry's Open terminal opens the session | slice 2 | |
| 4.7 | The keyboard returns to the button that started the session | slice 2 | |
| 4.8 | 4.7 holds only when the keyboard still rests on the startup's progress | slice 2 | |
| 5.1 | The keyboard moves into a presented terminal only from where handoff left it | slice 2 | |
| 5.2 | A terminal the developer opened during the startup stays as they left it | slice 2 | |
| 5.3 | A terminal the developer closed during the startup stays as they left it | slice 2 | |
| 5.4 | A host with no Dashboard terminal presents none | slice 2 | |
| 5.5 | 5.1 to 5.4 are existing behavior that is retained, not new behavior | slice 2 | |
| 6.1 | The session receives the instruction, unchanged | slice 2 | |
| 6.2 | The session receives the attached images, unchanged | slice 2 | |
| 6.3 | The session receives a follow-up's recorded context, unchanged | slice 2 | |
| 6.4 | The session receives the reporting context, unchanged | slice 2 | |
| 7.1 | Story launch Execute keeps its current presentation | slice 2 | |
| 7.2 | Story launch Refine keeps its current presentation | slice 2 | |
| 7.3 | Startup recovery's Continue keeps its current presentation | slice 2 | |
| 8.1 | The dialog gains no choice about opening the terminal | slice 2 | |
| 8.2 | The dialog gains no wording about opening the terminal | slice 2 | |
| 9.1 | Attached images do not count as an instruction for this decision | slice 2 | |
| 9.2 | A follow-up's context does not count as an instruction for this decision | slice 2 | |
| 9.3 | Both remain input to the session | slice 2 | |
| 9.4 | A start with images and no typed text opens the terminal | slice 2 | |
| 9.5 | A start with context and no typed text opens the terminal | slice 2 | |
| 10.1 | Blank field, Start in Start session: once the session starts, the terminal opens with the keyboard in it | slice 2 | |
| 10.2 | Whitespace-only field in Follow up, Start: the terminal opens, and the session's first input carries the entry's recorded context | slice 2 | |
| 10.3 | Final report open in the Side panel, “summarize the open issues” typed, Start: the final report stays; a Working entry appears in Taken; its Open terminal shows the session processing that instruction | slice 2 | |
| 10.4 | Side panel closed, instruction typed in Follow up, Start: the Side panel stays closed and the keyboard returns to Follow up | slice 2 | |
| 10.5 | Images attached, field blank, Start: the terminal opens | slice 2 | |
| 10.6 | Cursor selected, instruction typed, Start: Cursor takes the instruction with no terminal joined, and the entry's Open terminal later joins that same client | slice 2 | |
