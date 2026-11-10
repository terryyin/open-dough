---
id: SEED-297
status: active
planted: 2026-11-10
planted_during: Terry invoked dough-bug-fixing after a revived Cursor session left its continuation unsent
trigger_when: A revived Cursor session shows the continuation draft still waiting in the composer
scope: story
---

# SEED-297 — Submit a revived Cursor continuation

<a id="submit-revived-cursor-continuation"></a>

### Submit a revived Cursor continuation

**Identity:** SEED-297#submit-revived-cursor-continuation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** After the Cursor runner revives an unfinished session whose first
prompt was already confirmed, submit the continuation so the agent continues
from that worktree without a person pressing Enter.

**Scope.** The keep shared by Recover and runner revival types one multiline
continuation into the idle composer and is supposed to submit it. This story
makes that submit happen when Cursor leaves the continuation as composer text
instead of a paste chip. The continuation's wording stays as it is. Cannot-load
replacement, a session whose first prompt is still unconfirmed, and a working
or questioning screen stay out of scope.

**Expectations.**

- Intended: revival or Recover writes the continuation and submits it. The
  agent continues from the worktree's committed and uncommitted state and does
  not open another assignment.
- Actual: the continuation stays in the composer until a person presses Enter.
- Evidence: on 2026-11-10 the clipboard session "See Clipboard test case counts
  in Intent" showed that draft in the composer, ending with "Continue from this
  worktree's committed and uncommitted state without opening another
  assignment." and its reporting command, reference
  `860ca7b5-64ef-476b-a358-505faab1aad9`, worktree
  `~/git/clipboard/.worktrees/see-clipboard-test-case-counts-in-intent`, branch
  `cursor/see-clipboard-test-case-counts-in-intent`. The keeper writes a
  multiline continuation without Enter and sends Enter only after the screen
  contains `Pasted text`. A finished frame that shows the filled composer and
  no chip settles without Enter.
- Gap: the live PTY of that session was not captured, so whether Cursor painted
  a chip that the keeper missed, or never painted one, is still to be proved
  by a screen the keeper can judge.

**Key examples.**

- Given an idle composer, when the keeper writes the multiline continuation and
  the next finished screen shows that text in the composer with no `Pasted
  text` chip, the keeper sends Enter once and does not send the continuation
  again.
- Given the same write and a screen that shows a `Pasted text` chip, the keeper
  still sends Enter once.
