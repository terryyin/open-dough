---
id: SEED-214
status: active
planted: 2026-11-01
scope: story
---

# Completed CI context at session launch

<a id="completed-base-ci-ancestor"></a>

### Show the nearest completed base CI ancestor

**Identity:** SEED-214#completed-base-ci-ancestor
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Help the developer judge a session's starting revision by showing the
nearest ancestor with a completed CI result alongside a running base CI notice.

When the nearest check is still running, retain that status and also show the
nearest ancestor with a completed result, including its commit, passed or failed
outcome, and run link. Search ancestry rather than unrelated branch history;
report unavailable historical evidence truthfully. Preserve existing launch
choices and CI ownership. No release or installation changes are requested.

Examples: a running base check with a nearer unchecked commit and an older
successful run shows both the running check and that success; the nearest
completed failure is shown even when an older success exists.
