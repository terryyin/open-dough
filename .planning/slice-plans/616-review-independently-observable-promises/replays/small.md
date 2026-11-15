# Small-story source review replay

## Launch and isolation

2026-11-15; fresh general-purpose collaboration reviewer
`/root/slice1/small_reviewer`, launched with `fork_turns: none`.
The actual tool launch and unmodified return are inspectable in that task's
conversation; the exact message and return are transcribed below. No plan,
historical review, expected grouping, product, proof or suspected gap was
supplied. No human amendments were supplied. The return used no tool calls.
Candidate: uncommitted `Distribution/src/skills/dough-execute-plan/references/obtain-source-review.md`
on base `7bb9992277410f6b5c3ba8da0b461c3c61939a84`.
Source recovered with:
`git show f595336fb608dcfebfaa01685141db1b61fbcaf6:.planning/seeds/SEED-320-conditional-terminal-opening.md`.
Input is the complete Goal, Scope, Scope limits and Key examples, matching
what the historical reviewer received; source identity/state and Architecture
were not part of either review input.

## Actual reviewer input

```text
Use only these inputs, read no other project files, change nothing; number independently observable promises, one id per expected result under its source conditions. Group repeated statements and clauses describing the same result under one id, retaining their source text or locations, qualifications, triggers and journey examples so one sufficient observation can cover that promise. Separate results that can fail independently, including alternatives and genuine rejection restrictions; sharing a proof command or location does not make them one promise. Keep reasons, settled baselines, effort hypotheses, proof-method explanations and delivery deferrals available as unnumbered source context unless they also promise an independently checkable result. Keep scope limits and exclusions as context unless they promise such a result; do not turn them or examples into new rejection rules. Derive promises, not slice ownership or acceptance.

Original source:
#### Goal

A developer who starts an ad hoc session or a follow-up in the Dashboard with
a typed instruction keeps the view they are working in while the session
processes it. A developer who types nothing gets the session's terminal as
soon as it starts, because that session waits for them.

#### Scope

Required behavior, for the project row's **Start session** and Recently
done's **Follow up**, on every host:

- The typed instruction field alone decides: text that is blank after trim
  presents the started session's terminal as today; any other text presents
  nothing.
- A start that presents nothing leaves the Side panel as it is, open or
  closed, with whatever it shows. The new session appears as an entry in the
  Board's Taken and in the Sessions sidebar, where its **Open terminal**
  opens it. The keyboard returns to the button that started it when it still
  rests on the startup's progress.
- What already holds for a presented terminal stays: the keyboard moves into
  it only from where handoff left it, a terminal the developer opened or
  closed during the startup stays as they left it, and a host with no
  Dashboard terminal presents none.
- What the session receives is unchanged: the instruction, attached images,
  a follow-up's recorded context and the reporting context.

Scope limits:

- Story launches (Execute, Refine) and Startup recovery's Continue keep their
  current presentation.
- The dialog gains no choice or wording about opening the terminal.
- Attached images and a follow-up's context do not count as an instruction
  here, though they are input to the session: a start with images or context
  and no typed text opens the terminal.

#### Key examples

- Blank field → Start in **Start session** → once the session starts, the
  terminal opens with the keyboard in it.
- Whitespace-only field in **Follow up** → Start → the terminal opens, and
  the session's first input carries the entry's recorded context.
- Final report open in the Side panel, “summarize the open issues” typed →
  Start → the final report stays; a Working entry appears in Taken; its
  **Open terminal** shows the session processing that instruction.
- Side panel closed, instruction typed in **Follow up** → Start → the Side
  panel stays closed and the keyboard returns to **Follow up**.
- Images attached, field blank → Start → the terminal opens.
- Cursor selected, instruction typed → Start → Cursor takes the instruction
  with no terminal joined, and the entry's **Open terminal** later joins that
  same client.
```

## Actual reviewer return

The promises below apply to project-row **Start session** and Recently done **Follow up**, on every host, subject to the explicit host capability condition.

1. **Blank text presents the terminal when the session starts.** The field is blank after trimming. This includes an empty field, whitespace-only **Follow up**, attached images without typed text, and recorded follow-up context without typed text. Sources: Goal; Scope’s instruction decision; Scope limits; examples 1, 2 and 5. A host without a Dashboard terminal is covered by promise 15.

2. **Nonblank text presents nothing automatically.** Any text remaining after trimming triggers this result. Sources: Goal; “any other text presents nothing”; examples 3, 4 and 6.

3. **An open Side panel stays open when the start presents nothing.** Source: “leaves the Side panel as it is, open or closed.”

4. **A closed Side panel stays closed when the start presents nothing.** Sources: the same Side-panel requirement; typed **Follow up** example.

5. **Existing Side-panel content stays displayed when the start presents nothing.** Sources: “with whatever it shows”; the final report remains displayed while “summarize the open issues” processes.

6. **The new session appears in the Board’s Taken.** Sources: the entry requirement; the typed-instruction example specifies a **Working** entry while the instruction processes.

7. **The new session appears in the Sessions sidebar.** Source: the entry requirement.

8. **The Taken entry’s Open terminal opens the new session.** Source: the final-report example, where that action shows the session processing the typed instruction.

9. **The Sessions-sidebar entry’s Open terminal opens the new session.** Source: “in the Sessions sidebar, where its Open terminal opens it.”

10. **A start that presents nothing returns keyboard focus to its originating button if focus still rests on the startup’s progress.** Sources: the conditional keyboard-return requirement; typed **Follow up** with the Side panel closed returns focus to **Follow up**.

11. **A presented terminal receives keyboard focus when focus remains where handoff left it.** Sources: the retained terminal-focus behavior; the blank **Start session** example opens the terminal “with the keyboard in it.”

12. **A presented terminal does not take keyboard focus after the developer has moved it away from the handoff position.** Source: keyboard moves into the terminal “only from where handoff left it.”

13. **A terminal the developer opens during startup stays as they left it.** Source: the retained behavior for a terminal “opened … during the startup.”

14. **A terminal the developer closes during startup stays closed.** Source: the retained behavior for a terminal “closed during the startup.”

15. **A host without a Dashboard terminal presents none.** Source: the explicit host condition.

16. **The session receives the instruction unchanged.** Sources: “What the session receives is unchanged: the instruction”; the Cursor example says Cursor takes the typed instruction.

17. **The session receives attached images unchanged.** Source: the unchanged-input requirement. The blank-field image example also retains images as session input.

18. **A follow-up receives its recorded context unchanged.** Sources: the unchanged-input requirement; whitespace-only **Follow up** carries the entry’s recorded context in the session’s first input.

19. **The session receives reporting context unchanged.** Source: the unchanged-input requirement.

20. **With Cursor selected and nonblank typed text, no terminal is joined during startup.** Source: the Cursor example’s “no terminal joined.” This is separate from whether a terminal is visibly presented.

21. **Open terminal later joins the same Cursor client that received the instruction.** Source: the Cursor example’s “joins that same client.” This retains the client-identity qualification beyond merely opening a terminal.

22. **Execute launches retain their current presentation.** Source: the explicit story-launch scope limit.

23. **Refine launches retain their current presentation.** Source: the same scope limit.

24. **Startup recovery’s Continue retains its current presentation.** Source: the recovery scope limit.

25. **The dialog gains no choice about opening the terminal.** Source: the explicit dialog scope limit.

26. **The dialog gains no wording about opening the terminal.** Source: the same scope limit.

Unnumbered source context:

- The reason for automatic presentation without typed text is that the session waits for the developer.
- The typed instruction field alone determines the new presentation decision. Images and recorded context remain session inputs; neither substitutes for typed text in that decision.
- Existing presentation and handoff behavior supplies the retained baseline referenced above; the source does not specify additional changes to those workflows.
- The examples supply triggers and observable qualifications for the promises above. They do not introduce additional input-rejection rules.
- No effort hypotheses, proof commands or delivery deferrals were supplied.

## Private acceptance comparison

The historical review allocated 44 rows. This return has 26 numbered promises,
all retained above. The reviewer puts the explanation and baseline context
outside numbering; blank input and typed input stay distinct (1 and 2).
Multiple references to blank text, whitespace, images and follow-up context
share promise 1. Focus qualification remains attached to 10; presented-terminal
focus has independently checkable undisturbed/moved alternatives in 11 and 12.
Cursor's no-join and same-client continuation stay explicit (20 and 21).
No source-specific hint or expected output was fed back to this reviewer.
No candidate revision/retry was needed.

| Historical id(s) | Fresh id(s) or context | Inspected source-result correspondence |
| --- | --- | --- |
| 1.1, 1.2 | 2–5 | Typed starts retain the working view in both entry points. |
| 1.3 | 1 | Blank launch opens at session start. |
| 1.4 | unnumbered context | Reason retained without a separate observable result. |
| 2.1–2.3 | return preface; 15 | Both entry points, every host, explicit no-terminal exception. |
| 3.1, 3.2 | 1, 2; unnumbered decision context | Trim alone selects; images and context attached as blank conditions. |
| 3.3 | 1, 11–15 | Existing terminal presentation and handoff qualifications retained. |
| 3.4 | 2 | Typed-input alternative has its own id. |
| 4.1 | 3 | Open stays open. |
| 4.2 | 4 | Closed stays closed. |
| 4.3 | 5 | Existing content stays displayed. |
| 4.4 | 6 | Taken entry including Working state. |
| 4.5 | 7 | Sessions sidebar entry. |
| 4.6 | 8, 9 | Both visible Open terminal entry points. |
| 4.7, 4.8 | 10 | Originating-button focus with unchanged-focus condition attached. |
| 5.1 | 11, 12 | Undisturbed handoff and developer-moved focus alternatives. |
| 5.2 | 13 | Developer-opened terminal preserved. |
| 5.3 | 14 | Developer-closed terminal preserved. |
| 5.4 | 15 | Host capability restriction remains explicit. |
| 5.5 | unnumbered baseline context; 1, 11–15 | Existing-behavior qualification attached to each result. |
| 6.1 | 16 | Instruction unchanged. |
| 6.2 | 17 | Images unchanged. |
| 6.3 | 18 | Recorded context unchanged and first-input condition retained. |
| 6.4 | 19 | Reporting context unchanged. |
| 7.1 | 22 | Execute presentation unchanged; no new rejection rule. |
| 7.2 | 23 | Refine presentation unchanged. |
| 7.3 | 24 | Recovery Continue presentation unchanged. |
| 8.1 | 25 | No dialog choice. |
| 8.2 | 26 | No dialog wording. |
| 9.1, 9.2, 9.4, 9.5 | 1 | Images/context without typed text share blank-opening result. |
| 9.3 | 17, 18 | Images/context remain session input. |
| 10.1 | 1, 11 | Blank terminal and handoff keyboard outcomes. |
| 10.2 | 1, 18 | Whitespace follow-up and first context input. |
| 10.3 | 2, 3, 5, 6, 8, 16 | Final-report journey outcomes and typed instruction. |
| 10.4 | 2, 4, 10 | Closed follow-up with conditional focus return. |
| 10.5 | 1, 17 | Blank image launch and preserved image input. |
| 10.6 | 2, 16, 20, 21 | Cursor processing without terminal join, later same-client join. |

This comparison covers all 44 historical ids, rather than deleting any fresh
ids to obtain a smaller count. Every fresh promise is traceable to the quoted
source; the output adds no rejection behavior. Scope limits that explicitly
promise preservation retain ids 22–26. The explanation has no independent
result and therefore no new id. Shared command/location alone never groups
independently failing results.

## Maintainer behavior review

- Invocation: the execute-plan discovery/body routes planned-delegation and
  acceptance boundaries to this focused reference; no trigger change.
- Required context: original selected source and explicit amendments remain
  required. Missing review/isolation still stops dependent delegation or
  acceptance. Candidate diff leaves both boundary sections unchanged.
- Useful outcome: this isolated source-only replay yields one qualified blank
  result, distinct typed/focus/preservation alternatives and no reason row.
  Original source clauses, not product evidence or slicing, drove extraction.

## Deterministic checks and consumer reach

`PATH="/opt/homebrew/bin:$PATH" npm test -- Distribution/tests/skills/dough-execute-plan/story-obligations-source-review*.test.mjs Distribution/tests/installation/payload-declaration-links.sh`
passed (exit 0; four Node files, 24 cases, and one shell payload-link check).
The unprefixed attempt refused before launching checks because macOS selected
Bash 3.2; the documented Bash 5 prerequisite resolved it without code changes.

Inspected observations: `story-obligations-source-review.test.mjs` allocates
real Markdown rows through `reviewed` and asserts the allocated slice refuses
an unobserved result, carries only its own rows in `list`, and accepts a
sufficiently recorded row without accepting others. `source-review-record`
asserts duplicate/malformed/unlinked returns refuse. `source-review-write`
observes real record cell escaping, stale-digest refusal and obligation links.
`source-review-lifecycle` checks pending owner alternatives and refuses early
observations. These checks prove unchanged record integration, not semantic
extraction. The fresh reviewer return is the extraction observation.
`payload-declaration-links.sh` resolves relative links in every declared
Markdown file against the payload declaration; the original links survive.

[Consumer trace with a disposition for every listed file](small-consumers.md).
No tests were edited; no new test convention or generator was triggered.
No full dashboard or repository run was needed for this prose change.
No claim is made about time/token savings, matched-model causation, native
Cursor/Claude behavior, or ordinary-use effectiveness.
