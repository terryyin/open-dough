---
id: SEED-097
status: active
planted: 2026-10-04
planted_during: Confirmed report that a dashboard Cursor launch does not type the story into the real composer, and the requested goal that the same agent stay joinable
trigger_when: A developer starts a story in Cursor from the dashboard and the agent does not receive that story, or closing the terminal ends the process that should stay available
scope: unknown
---

# SEED-097: A launched Cursor agent stays joinable

## Why This Matters

A developer starts a story in Cursor from the dashboard and then leaves the
terminal. That agent should already be running the story, and opening the
terminal later should join the same process.

## Stories

<a id="cursor-agent-stays-joinable"></a>

### A launched Cursor agent receives its story and stays joinable

**Identity:** SEED-097#cursor-agent-stays-joinable
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/242-cursor-agent-stays-joinable/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"adc8e499b51412f4ec6e9efc3a2fe9474942a677b0dbc4e115f71dcc2a47aff6","plan":"45ca05ccb872f2f8d627c3b011e46de4335e54a3af470738f5404e3314947e21"}}
```

**Goal:** A developer who starts a story in Cursor from the dashboard gets
that story into the agent, then can close the terminal and open it again on
the same process. The agent keeps running the story in the background, and
the story card shows whether that process is at the follow-up prompt,
working, or waiting for an answer.

**Scope:**

- The runner types the launch instruction once into the empty composer
  current `cursor-agent` paints: the screen shows `→ Plan, search, build
  anything` or `→ Add a follow-up`, the terminal cursor stays hidden, and
  the stream has no synchronized-update frame. The launch record then says
  the first input was accepted. The chat's first user message is that
  instruction.
- Closing the dashboard or the terminal leaves that process running. This
  includes a working screen and the empty follow-up prompt. Opening the
  terminal again joins that process and shows its current screen. It does
  not start a second `cursor-agent`.
- The story card shows the label the runner already reads from that
  screen: "at the follow-up prompt", "working", or "waiting for an answer".
  It no longer says activity is unknown while the runner holds the process.
  When the runner is not running or cannot be reached, the card says that,
  and it does not start an agent.
- An untrusted workspace stays on its trust prompt. The launch does not
  pass `--trust`, does not type the story there, and does not record the
  first input as accepted.
- Stopping the runner still hangs up the processes it holds. This story
  does not keep an agent alive across a runner restart, and it does not
  require `cursor-agent persist`.

**Key examples:**

- A trusted workspace's empty chat shows `→ Plan, search, build anything`,
  with the terminal cursor hidden and no synchronized-update frame → the
  dashboard keeps that client for a story launch → the client receives the
  launch instruction once, the launch record says the first input was
  accepted, and that instruction is the chat's first user message.
- That process is on the empty follow-up prompt → the developer closes the
  terminal → the same process is still alive. Opening the terminal joins
  it and does not start another `cursor-agent`.
- That process is working → the developer closes the terminal → it keeps
  working. Opening the terminal joins the same process, and the story card
  says "working" while the runner holds it.
- The runner is not running → the story card says the runner is not
  running and shows no screen label. Nothing on the card starts an agent.
- A new directory shows "Workspace Trust Required" → the kept client does
  not receive the story instruction, and the launch record does not say
  the first input was accepted.
