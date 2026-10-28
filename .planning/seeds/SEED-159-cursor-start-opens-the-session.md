---
id: SEED-159
status: active
planted: 2026-10-28
planted_during: A normal Cursor refinement and a normal Cursor execution both quit at startup
trigger_when: Starting a Cursor refinement or execution again
scope: small
---

# SEED-159: Starting Cursor opens the session

## Why This Matters

Starting a Cursor refinement or execution is an ordinary dashboard start. On
2026-10-28 two of those starts printed a session id and then Cursor quit
before it saved a conversation. Pygardon
`SEED-20261035#bound-test-process-hangs` kept id
`0e93f076-3827-46d6-8970-672a7fd036ea`. Lizard
`SEED-018#repeatable-shell-entry` kept id
`037ce608-8457-4daa-b8f2-c1ff732b7da1` after Continue replaced
`e62a4e76-ceba-4adb-8059-f93288049b9e`. Neither id has a chat database, and
neither process kept running. The dashboard said Cursor kept the session and
the first prompt was not confirmed.

`cursor-agent` 2026.10.22 enters print mode when its input or output is not a
terminal. Print mode needs the prompt on the command line. The dashboard
starts `cursor-agent --workspace … --resume <id>` and types the prompt into
the composer afterward, so print mode exits with `No prompt provided for
print mode` and never creates the chat. These worktrees inherit trust from
`/Users/terryyin/git`, so the exit is that missing prompt, not a trust
refusal. A closed-input resume of the Lizard worktree reproduced it. A
terminal resume of the same worktree reaches the composer.

## Selected Stories

<a id="cursor-start-opens-the-session"></a>

### 1. Starting a Cursor refinement or execution opens the session

**Identity:** SEED-159#cursor-start-opens-the-session
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/001-cursor-start-opens-the-session/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"97c639d5915ea9d3c31db73aecd6f6168eb065602858d6fca3b163ff81091ffd","plan":"0804e2d6a9adb785862d1325b6a3787731b790b6a1b58d7b46b64eebaa979bdc"}}
```

## Goal

A person starting a Cursor refinement or execution gets that Cursor session
running, with the start's first prompt delivered into it.

## Scope

Required. The start keeps `cursor-agent` attached to a terminal from the
moment it decides whether to open a conversation. It opens that conversation
and the dashboard types the first prompt into it. The saved session shows the
prompt accepted, and the process is still running. A workspace already
trusted on its own or through a parent directory, as `/Users/terryyin/git` is,
starts this way with no new trust question.

When Cursor still exits before the prompt is accepted, the dashboard shows
the text Cursor printed, including `No prompt provided for print mode`, and
records that the session ended. Continue on that start does not create
another session id.

Deferred. Repairing the two starts that already quit: Pygardon
`0e93f076-3827-46d6-8970-672a7fd036ea` and Lizard
`037ce608-8457-4daa-b8f2-c1ff732b7da1`. Changing the words of the refinement
or execution prompt. Granting workspace trust for a directory that is not
already trusted.

Boundary. Cursor decides trust. This story leaves that decision with the
person and does not pass `--trust`.

## Key examples

1. **Refinement start.** The workspace is already trusted through its parent.
   The person starts a Cursor refinement. Cursor is attached to a terminal,
   the conversation is saved, the refinement prompt is accepted, and the
   process is still running.

2. **Execution start.** The same for a Cursor execution: the process stays
   up and the execution prompt is accepted.

3. **Closed input would quit.** Resuming the same workspace with standard
   input closed makes the current CLI exit with `No prompt provided for
   print mode` and save no chat. The dashboard start of that workspace does
   not take that exit: Cursor is on a terminal and receives the prompt.

4. **A later quit is shown and not replaced.** If Cursor exits before the
   prompt is accepted, the dashboard shows Cursor's text and says the session
   ended. Continue does not add a session id.
