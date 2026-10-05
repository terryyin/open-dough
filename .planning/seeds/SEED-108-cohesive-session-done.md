# SEED-108: Cohesive session completion

<a id="cohesive-session-done"></a>

### Automatic and manual completion use one Mark as done action

**Identity:** SEED-108#cohesive-session-done
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** A dashboard session that reports successful completion without attention
is marked done through the same cohesive operation as manual Mark as done,
including the native session's done disposition and title where supported.

**Scope:** Diagnose the reported mismatch, reproduce it at the existing dashboard
boundary, and repair the shared session completion path within one bounded bug
repair. Preserve completion reports, identity binding, attention messages, native
session safety, and recoverable failure reporting.

**Expectations:**

- A quiet completion marks the native session done as manual Mark as done does,
  including its existing Done prefix where that host supports renaming.
- Automatic completion and manual completion share one operation; adding only a
  cosmetic prefix does not meet the goal.
- Completed-with-attention and unfinished reports remain open for attention.
- Reports arriving before native session identity is known apply the same action
  after the accepted launch binds to that session.
- If a native action fails, the dashboard retains evidence and permits recovery.

**Reported actual:** Quiet completion removes the entry from active Sessions,
but the native session lacks the Done prefix manual completion supplies. The
validity, cause, and exact host behavior remain to be confirmed.
