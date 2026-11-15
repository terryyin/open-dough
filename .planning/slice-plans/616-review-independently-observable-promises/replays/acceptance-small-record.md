# Source review

Launch: fresh reviewer, source text only.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | **Blank text presents the terminal when the session starts.** The field is blank after trimming. This includes an empty field, whitespace-only **Follow up**, attached images without typed text, and recorded follow-up context without typed text. Sources: Goal; Scope’s instruction decision; Scope limits; examples 1, 2 and 5. A host without a Dashboard terminal is covered by promise 15. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 2 | **Nonblank text presents nothing automatically.** Any text remaining after trimming triggers this result. Sources: Goal; “any other text presents nothing”; examples 3, 4 and 6. | slice 1 | observed: fixture-only typed-input observation marker under retained nonblank condition |
| 3 | **An open Side panel stays open when the start presents nothing.** Source: “leaves the Side panel as it is, open or closed.” | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 4 | **A closed Side panel stays closed when the start presents nothing.** Sources: the same Side-panel requirement; typed **Follow up** example. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 5 | **Existing Side-panel content stays displayed when the start presents nothing.** Sources: “with whatever it shows”; the final report remains displayed while “summarize the open issues” processes. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 6 | **The new session appears in the Board’s Taken.** Sources: the entry requirement; the typed-instruction example specifies a **Working** entry while the instruction processes. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 7 | **The new session appears in the Sessions sidebar.** Source: the entry requirement. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 8 | **The Taken entry’s Open terminal opens the new session.** Source: the final-report example, where that action shows the session processing the typed instruction. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 9 | **The Sessions-sidebar entry’s Open terminal opens the new session.** Source: “in the Sessions sidebar, where its Open terminal opens it.” | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 10 | **A start that presents nothing returns keyboard focus to its originating button if focus still rests on the startup’s progress.** Sources: the conditional keyboard-return requirement; typed **Follow up** with the Side panel closed returns focus to **Follow up**. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 11 | **A presented terminal receives keyboard focus when focus remains where handoff left it.** Sources: the retained terminal-focus behavior; the blank **Start session** example opens the terminal “with the keyboard in it.” | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 12 | **A presented terminal does not take keyboard focus after the developer has moved it away from the handoff position.** Source: keyboard moves into the terminal “only from where handoff left it.” | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 13 | **A terminal the developer opens during startup stays as they left it.** Source: the retained behavior for a terminal “opened … during the startup.” | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 14 | **A terminal the developer closes during startup stays closed.** Source: the retained behavior for a terminal “closed during the startup.” | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 15 | **A host without a Dashboard terminal presents none.** Source: the explicit host condition. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 16 | **The session receives the instruction unchanged.** Sources: “What the session receives is unchanged: the instruction”; the Cursor example says Cursor takes the typed instruction. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 17 | **The session receives attached images unchanged.** Source: the unchanged-input requirement. The blank-field image example also retains images as session input. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 18 | **A follow-up receives its recorded context unchanged.** Sources: the unchanged-input requirement; whitespace-only **Follow up** carries the entry’s recorded context in the session’s first input. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 19 | **The session receives reporting context unchanged.** Source: the unchanged-input requirement. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 20 | **With Cursor selected and nonblank typed text, no terminal is joined during startup.** Source: the Cursor example’s “no terminal joined.” This is separate from whether a terminal is visibly presented. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 21 | **Open terminal later joins the same Cursor client that received the instruction.** Source: the Cursor example’s “joins that same client.” This retains the client-identity qualification beyond merely opening a terminal. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 22 | **Execute launches retain their current presentation.** Source: the explicit story-launch scope limit. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 23 | **Refine launches retain their current presentation.** Source: the same scope limit. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 24 | **Startup recovery’s Continue retains its current presentation.** Source: the recovery scope limit. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 25 | **The dialog gains no choice about opening the terminal.** Source: the explicit dialog scope limit. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| 26 | **The dialog gains no wording about opening the terminal.** Source: the same scope limit. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |

## Retained return context

The promises below apply to project-row **Start session** and Recently done **Follow up**, on every host, subject to the explicit host capability condition.



- The reason for automatic presentation without typed text is that the session waits for the developer.
- The typed instruction field alone determines the new presentation decision. Images and recorded context remain session inputs; neither substitutes for typed text in that decision.
- Existing presentation and handoff behavior supplies the retained baseline referenced above; the source does not specify additional changes to those workflows.
- The examples supply triggers and observable qualifications for the promises above. They do not introduce additional input-rejection rules.
- No effort hypotheses, proof commands or delivery deferrals were supplied.