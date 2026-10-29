---
id: SEED-169
---

# Compact session entry

<a id="compact-session-entry"></a>

### Compact session entry

**Identity:** SEED-169#compact-session-entry
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/371-compact-session-entry/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2469d495ed087cef0d8473319d29c43d3bf36ef0ac63b52f26d7b7f327210941","plan":"7d3424a91595ffafb608bbe050d9b832f72bc8b714017933cd19abf824f94aba"}}
```

**Goal:** Let a developer scan session status and reach its main action without
reading launch diagnostics, following the Compact proposal accepted in this chat.

**Scope:** Use one compact session summary with host and requested model, a
prominent terminal/final-report action, collapsed Session details for launch time,
workspace, session ID, requested options and continuation command, and a separate
More session actions disclosure for existing stop/done/delete controls. Keep
attention, unread reports, uncertainty, recovery and failed-operation feedback
visible. Preserve published progress and branch qualification. Hide the positive
Ready for execution scan badge while that story has an open execution session;
retain preparation facts in Inspect story and preserve warnings.

**Key examples:**

- A working session shows Working, Cursor and requested model, with Open terminal;
  paths, IDs and accepted-input diagnostics are collapsed until Session details
  opens. Details can close again without losing terminal access or focus.
- A developer opens More session actions and uses existing Stop/Mark as done
  behavior, including confirmation, refusal feedback and focus restoration.
- Waiting, uncertain input, recovery limitations and unread reports stay visible
  with details closed. A stopped or unavailable session retains its existing
  supported recovery actions.
- A narrow card wraps the controls and long disclosed values without page
  overflow. Local Taken and Recently done entries reuse the same presentation.

**Boundaries:** Presentation and its documentation/tests only. Keep native host
capabilities, session lifecycle, terminal/review routing and workflow facts.
Do not implement the Timeline variant or the mockup's simulated host behavior.
