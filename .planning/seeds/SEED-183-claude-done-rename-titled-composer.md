---
id: SEED-183
status: active
planted: 2026-10-30
planted_during: Terry's bug report on a red done-mark message on a dashboard session card
trigger_when: Marking a dashboard-launched Claude Code session done
scope: Claude Code prompt readiness for the done-mark rename
---

# SEED-183: Claude Code Done Rename Recognizes a Titled Composer

## Why This Matters

Marking a dashboard-launched Claude Code session done reports "Local done mark
retained. Claude Code rename failed: The terminal attachment could not be
opened." The session keeps its native name instead of its `done-` name.

## Selected Stories

<a id="claude-done-rename-titled-composer"></a>

### Claude Code done rename recognizes a titled composer

**Identity:** SEED-183#claude-done-rename-titled-composer
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"826883961998b5c800daa8875dbecbc1ca193b87ebb82ffa42123b33c0a70909"}}
```

**Goal:** Resolve the reported discrepancy: marking an idle, named Claude Code
session done renames it through a private attachment instead of failing to
open that attachment.

**Expected:** With no open terminal, the done mark attaches privately, sees
Claude Code's ready composer, types `/rename done-…`, and Claude Code lists the
new name.

**Actual:** Current Claude Code draws the session name in the composer's top
rule, so that row starts with the name rather than `───`:

```text
 Open Dough · Refinement · Collapse redundant dashboard touch viewport matric… ─
❯ 
────────────────────────────────────────────────────────────────────────────────
```

The Claude Code prompt readiness rule requires the top rule to start with
`───`, so the attachment never becomes ready and the rename fails.

**Evidence:** A read-only 80×24 `claude attach` to idle session `a9e760a3`
showed the screen above with a visible cursor and was still not ready after
12 seconds.

**Scope:** Accept a composer top rule that carries a title and ends in `─`,
while transcript `❯` lines and the attach banner still cannot establish
readiness.
