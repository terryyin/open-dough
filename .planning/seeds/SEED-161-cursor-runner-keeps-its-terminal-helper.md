---
id: SEED-161
status: active
planted: 2026-10-28
planted_during: A Cursor execution start after a dashboard update printed a session id and never opened the terminal
trigger_when: Starting a Cursor session after the dashboard install that started the runner has been removed
scope: small
---

# SEED-161: The Cursor runner keeps a terminal helper

## Why This Matters

Starting a Cursor session opens its terminal through a helper file the runner
loaded from the dashboard install that started it. A later dashboard update
deletes that install and leaves the runner process running. The next start can
still print a session id, then fails to open the terminal because that helper
is gone. The screen says the first prompt was not confirmed. Sessions the
runner already holds keep running. Restarting the runner makes the next start
work until the next update deletes the helper again.

## Selected Story

<a id="cursor-runner-keeps-its-terminal-helper"></a>

### The Cursor runner keeps a terminal helper

**Identity:** SEED-161#cursor-runner-keeps-its-terminal-helper
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"665bbdee384c93e773271288b32fed52cefd0476acf585d860c83cbafbf672cd"}}
```

**Goal:** After the dashboard install that started the Cursor runner is gone,
the next Cursor launch opens its terminal on a runner whose terminal helper
still exists.

**Scope:** New Cursor work replaces an accepting runner that does not report
the helper file it uses to open a terminal, or reports one that is no longer
on disk. The replacement is the runner this dashboard would start, and its
helper file exists. Sessions already held stay with the old runner until that
next launch. Starting the runner only when none is accepting does not replace
it. Listing sessions does not replace it.

**Expectations:**

- A runner whose recorded helper path is missing is left in place by
  start-if-absent, and the next create-chat replaces it with a runner whose
  helper file exists.
- A runner that reports the same existing helper and the current build is
  reused for the next launch.
- A runner that omits the helper is not current for new work.

**Out of scope:** Rewording an unconfirmed prompt after a helper that still
exists fails to spawn. Repairing the execution that already failed.
