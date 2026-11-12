---
id: SEED-320
status: active
planted: 2026-11-12
planted_during: Terry requested background launches when an ad hoc session or follow-up has a custom instruction
trigger_when: Developers select conditional terminal opening for refinement
scope: story
---

# SEED-320 — Conditional terminal opening for Dashboard sessions

<a id="open-terminal-only-without-a-custom-instruction"></a>

### Open the terminal only when no custom instruction is supplied

**Identity:** SEED-320#open-terminal-only-without-a-custom-instruction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/597-open-terminal-only-without-a-custom-instruction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5ee70619392395f52c9d4338cf80e5b9b73260dabcb060cbe1800071fd13787a","plan":"c9d1bbc045e6a76bfa951047e4fd5cc30ef09e39c58cf6d37c393b0d7393578d"}}
```

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

#### Architecture

No Accepted decision is affected; [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)'s
Side panel holds one item at a time, which this story leaves alone on an
instructed start.

One rule serves two places. The page decides whether to present the terminal
(`presentTerminal` in `dashboard/src/StartSession.tsx`), and a Cursor start
separately tells the server that the page's terminal is part of the launch
(`attachTerminal` in `dashboard/src/launchStarts.ts`). While that handoff is
held, the kept Cursor client's idle watch does not begin until a terminal
joins or the dashboard releases it (`dashboard/server/launchInstruction.ts`,
`dashboard/server/liveTerminalClient.ts`). A Cursor start
therefore requests the handoff exactly when the page will present the
terminal: an instructed start stops requesting it, while a start with no
typed text that still sends a prompt (a follow-up's context, attached images)
keeps it.
