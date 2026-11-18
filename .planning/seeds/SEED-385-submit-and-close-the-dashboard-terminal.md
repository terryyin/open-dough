---
id: SEED-385
status: active
planted: 2026-11-16
planted_during: Request to submit a dashboard terminal prompt with Command+Enter and close after confirmation
trigger_when: selected from the product backlog
scope: story
---

# SEED-385 — Submit and close the dashboard terminal

<a id="submit-and-close-the-dashboard-terminal"></a>

### Submit and close the dashboard terminal

**Identity:** SEED-385#submit-and-close-the-dashboard-terminal

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/692-submit-and-close-the-dashboard-terminal/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d2516246f0d4bb784d3e2c75ecf4faa2cfda2631eca9a521ada66e176e226dbd","plan":"f46f3fbb346c1854733ff3452a0124385d2a81d46aa10b73f7a26abf76c82c12"}}
```

#### Goal

A developer on macOS can submit a ready prompt from a focused dashboard
terminal with **Command+Enter**, confirm the agent took that submission, and
return to the dashboard with the Side panel closed as for Close, while the
native session keeps working.

#### Scope

- **Command+Enter** is a dashboard gesture while the terminal's input has
  focus: the page takes the chord (as Command+Shift+Escape does) so the
  session never receives Meta+Enter. Plain Enter keeps today's behavior.
- The gesture runs only when the open attachment can accept input and that
  same session's normalized activity is ready for a follow-up prompt
  (`awaiting-instruction` or `review`). Otherwise the chord is taken and
  nothing is submitted or closed.
- When it runs, the dashboard sends one ordinary Enter through the existing
  terminal input path, asks for a prompt machine-sessions reread, and keeps
  the panel open until that same session's activity becomes `working` or
  `waiting`. That leave-ready change is the acceptance signal on each host's
  existing observation. There is no separate PTY delivery receipt today.
- On acceptance, Close runs unchanged: focus returns as for Close; Claude and
  Codex hang up only the attachment client while native work continues;
  Cursor keep leaves its client running.
- If the attachment disconnects, ends, or a bounded wait expires without
  that leave-idle change, the panel stays open and shows that confirmation
  is unavailable. The developer can reconnect, retry, or Close manually.
- No new host attach API, no change to Mark as done / Delete, and no
  Windows/Linux Control+Enter binding in this story.

**Deferred:** a visible Submit-and-close control; binding the same gesture
outside terminal focus; treating "send Enter and Close immediately" as the
primary path.

**Direction:** prefer wait-for-leave-idle then Close over immediate Close
after Enter, because Claude/Codex socket close sends SIGHUP to the attach
client and typed input today has only a local offer, not a PTY receipt.
Borrowing "send and dismiss after delivery confirmation" (as in send-and-
archive) maps well, except agents expose leave-idle side effects rather than
a true delivery ACK — false negatives keep the panel open.

#### Key examples

1. Focused, connected terminal; session ready for a follow-up; prompt typed →
   Command+Enter → one Enter is sent → session reading becomes working or
   waiting for input → panel closes and focus returns as for Close; native
   work continues under that host's close rule.
2. Same setup → Command+Enter → attachment disconnects or the bounded wait
   ends with the session still ready for a prompt → panel stays open and
   says confirmation is unavailable.
3. Terminal input focused while the session is already working or waiting →
   Command+Enter → chord is taken; no Enter is sent for this gesture; panel
   stays open.
4. Prompt ready; plain Enter → today's submit behavior only; panel stays
   open. Command+Enter does nothing for this story when the terminal input
   does not have focus.

#### UI and architecture

The user is a macOS developer with a hardware keyboard, finishing a prompt in
the Side panel terminal and wanting the board back once the agent has the
turn. Feedback is either the ordinary Close (panel gone, focus restored) or
an in-panel notice that confirmation is unavailable; no new layout is
chosen. Capture Command+Enter on the existing page Command-shortcut path so
xterm cannot forward Meta+Enter.

Follow Accepted
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them):
WebSocket terminal I/O, Side panel Close, and host observation without the
dashboard owning native work. Acceptance reuses each host's existing
ready/working/waiting readings; close keeps today's keep-versus-SIGHUP
attach behavior. No Accepted ADR conflict.
