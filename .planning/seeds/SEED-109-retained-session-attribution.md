---
id: SEED-109
status: active
planted: 2026-10-06
scope: story
---

# Retained session attribution

<a id="retained-session-attribution"></a>

### Retained sessions show who was assigned when they launched

**Identity:** SEED-109#retained-session-attribution
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** A dashboard session retains its original recorded agent, credited
human developer, host tool, and model after its story's assignment is released,
without presenting that historical attribution as the current story owner.

**Scope:** Investigate and reproduce the missing attribution for a retained
refinement session after preparation release, then attempt one bounded repair
through dough-bug-fixing with no replanning and a ten-minute implementation
limit. Use the existing saved launch and published allocation evidence.
Keep unavailable historical credit explicit rather than borrowing a later
allocation of the same agent. Preserve existing session and assignment actions.
Retired-worktree hook failures are outside this repair.

**Expected versus observed:** In the production dashboard, the still-visible
session for Doughnut's SEED-066#create-with-spoken-title lost its agent,
human developer, and tool attribution after its preparation landed. Its saved
launch retains Yuma-chan, Claude Code, requested model Fable, and allocation
commit d5f7249c4bd4c2bd195842022ddc4e6845cc647d. That commit credits Terry Yin.
Commit 2e3a630c1a removed the assignment at 09:18 JST on 2026-10-06. The
dashboard hides the card's attribution when no current profile matches.

**Key examples:**

- A refinement session launched under Yuma-chan, allocated by Terry Yin on
  Claude Code with model Fable, remains visible after release: its original
  session attribution remains readable while the story has no current preparer.
- Another agent takes preparation of that story, or Yuma-chan is reused for
  different work: the original session still credits its own allocation.
- A retained launch has no usable allocation evidence, or the historical read
  fails: available recorded agent and tool details remain visible and the
  missing human credit is stated without a guessed developer.

**Remaining uncertainty:** Confirm the behavior through an existing dashboard
E2E boundary and determine whether historical attribution fits one bounded
repair. If not, retain the evidence in this same Taken story for later work.
