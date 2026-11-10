---
id: SEED-298
status: active
planted: 2026-11-10
scope: story
---

# Insert common prompts in the dashboard terminal

<a id="insert-common-prompts-in-the-dashboard-terminal"></a>

### Insert common prompts in the dashboard terminal

**Identity:** SEED-298#insert-common-prompts-in-the-dashboard-terminal
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/574-insert-common-prompts-in-the-dashboard-terminal/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c3ad6939e85b19410fe2f0d8b4b3dd4e6137fd5b8ea2a96b1063d96a56d95f5a","plan":"58635290023c19e74cb0081f402fb7686228195a915e5d31a8ffff04a0cc9604"}}
```

**Goal:** A developer replying in the Side panel terminal can insert the short
common replies `OK` and `as recommended` without typing them, and can still
start terminal dictation from the same header control, then edit and send
deliberately.

**Scope:**

- Replace the terminal header's standalone **Dictate into terminal** control
  with a **Prompts** control in the same session-actions slot, on desktop and
  mobile.
- Opening **Prompts** offers exactly three choices: `OK`, `as recommended`, and
  **Dictate into terminal**.
- Choosing `OK` or `as recommended` closes the menu and inserts that literal
  text into the active terminal input through the same attachment `insert`
  path typing, dictation, and composer Insert already use. The offer sends no
  Enter. Focus returns so the developer can edit and press Enter to send.
- Choosing **Dictate into terminal** closes the menu and starts the existing
  [dictation flow](../../dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md#dictation).
  While recording, **Stop recording** replaces **Prompts** in that slot; when
  recording ends, **Prompts** returns. Pending-transcript recovery, Insert
  transcript, Discard transcript, and cancellation on close or session switch
  stay as they are.
- Preset inserts are accepted under the same open-and-not-refused attachment
  rule as typing. When an offer cannot be accepted, the panel names the same
  recovery it already uses for unavailable input (Reconnect, Open again, or
  still connecting); the developer opens **Prompts** again after recovery.
  Fixed presets do not need a separate unsent-transcript surface.

Required restriction: selecting a preset must not submit for the developer.
Independent need: every other terminal insert path already requires a
deliberate Enter so the developer can review what the agent will receive.

Deferred promises: a custom or editable prompt library; more presets than the
two fixed phrases; auto-send on select; contextual or agent-suggested replies;
dedicated keyboard shortcuts for presets; changing dictation transcription,
OpenAI setup, or phone key-toolbar / Compose behavior.

**Key examples:**

| Pre-condition | Trigger | Result |
| --- | --- | --- |
| Side panel terminal open; attachment accepts input; **Prompts** idle | Open **Prompts**, choose `OK` | Menu closes; `OK` is inserted with no Enter; input is focused for edit or Enter. |
| Same; existing typed text already in the input | Open **Prompts**, choose `as recommended` | Menu closes; `as recommended` is inserted through the normal insert path (existing input remains as that path already handles); no Enter. |
| Same | Open **Prompts**, choose **Dictate into terminal** | Menu closes; recording starts; header shows **Stop recording** instead of **Prompts**. |
| Recording in progress | Choose **Stop recording** | Recording stops; transcript follows the existing dictation offer path; **Prompts** returns in the slot. |
| Attachment not yet open or refused | Open **Prompts**, choose `OK` | Menu closes; text is not inserted; status names Reconnect, Open again, or still connecting; nothing is auto-retried. |
| Fine-pointer desktop or coarse-pointer mobile terminal header | Use session actions | **Prompts** occupies the former Dictate slot beside the other session actions; both pointer classes can open it and use the three choices. |

**UI:** The user is a developer answering an agent from the Side panel
terminal—often with a short affirmation, sometimes with voice. They see one
**Prompts** header control where Dictate used to be; opening it shows the two
presets and Dictate. After a preset, they review the input and press Enter.
During recording they only need **Stop recording** in that slot. The extra
click before Dictate is accepted so one header slot holds reply shortcuts and
voice. Do not invent layout, components, or chrome beyond that interaction.

**Investigation, alternatives, borrow, and challenge:** Observed today: the
header offers a standalone Dictate `IconButton` before Mark as done
(`dashboard/src/Terminal.tsx`, `useTerminalDictation.tsx`); insert goes through
`useAttachedTerminal` → `attachedTerminal.insert` with no trailing Enter; Stop
recording already replaces the mic during capture; no Prompts menu or preset
catalog exists. Docs state the shared acceptance rule in
[Terminal input](../../dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md).

Alternatives compared to the same goal: keep Dictate and add separate chips
(more header chrome); auto-send presets on select (faster, breaks deliberate
Enter); slash-commands inside xterm (host-dependent); contextual reply chips
when the agent asks a question (needs waiting-state detection). Recommended
direction remains the seed's **Prompts** menu in Dictate's slot: one control,
fixed inserts, reused insert path, Dictate preserved behind the menu.

Borrowed mechanism: canned-reply pickers (mail/chat quick replies)—catalog →
picker → insert into compose → user sends. Mapping: Prompts menu = picker;
`OK` / `as recommended` = canned text; terminal input = compose; Enter = send.
Limit: those products often auto-send or generate contextual suggestions; this
story keeps fixed phrases and deliberate Enter.

Strongest doubt: Dictate loses one-click access while desktop typing of `OK`
is already cheap, so the wording could ship yet miss a mobile-first purpose if
focus or insert feedback fails after a preset. The purpose still holds when
insert reuses the existing path, focus returns, and deliberate Enter stays
required; the one-click Dictate cost is an explicit scope choice, not an open
goal rewrite.

**Architecture:** Panel-local UI only. The two phrases are fixed strings in the
terminal header, not durable project or configuration state. Reuse the
existing attachment insert and dictation flows; add no new terminal wire
message and no repository-backed prompt catalog.
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps the Side panel as the place that shows one terminal and keeps the
dashboard from owning workflow authority—this story does not change Board,
assignment, or published progress concepts. No Accepted ADR conflict. ADR
index and in-file statuses agree for the cited record.
