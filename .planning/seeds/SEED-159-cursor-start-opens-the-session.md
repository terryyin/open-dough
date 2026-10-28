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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

For a person starting a Cursor refinement or execution, the start leaves
Cursor running in that session and the first prompt delivered into it. The
same start still works when the workspace was already trusted through a
parent directory. When Cursor quits before the prompt is delivered, the
dashboard shows Cursor's own reason and keeps that failed start. Continue
does not create another empty session that quits the same way.

**Evaluation:** Start one Cursor refinement and one Cursor execution. Each
session is running and its first prompt was accepted. Resume one of those
sessions with standard input closed and confirm the current CLI would
otherwise exit with `No prompt provided for print mode`; the dashboard start
does not take that exit. A startup quit shows that reason, says the session
ended, and a further Continue adds no new session id. An already trusted
parent workspace is not asked for trust again, and the runner does not grant
trust by itself.

**Completion:** The two recorded starts above are the evidence that ordinary
starts were quitting. Queueing this story does not repair those two launches.
