---
id: SEED-119
status: active
planted: 2026-10-12
scope: small
---

# Clear missing-backlog message

<a id="missing-published-backlog"></a>

### Missing published backlog

**Identity:** SEED-119#missing-published-backlog
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Explain a missing or inaccessible published backlog briefly and clearly.

**Scope:** Repair the dashboard read failure wording for a backlog HTTP 404; keep projects without a backlog addable, preserve error/recovery semantics, and avoid asserting that a 404 proves absence.

**Examples:** Lizard can be added with no published `.planning/PRODUCT-BACKLOG.md`. Its dashboard explains that the backlog cannot be found or accessed without CLI commands or a full commit hash. Other read failures retain their meaning and project switching remains available.

**Evidence:** Lizard's published commit `4b57b3ba7d754b9956625ad6f3d15b4afcfe966c` lacks the configured backlog; repository access succeeds. The current banner gives lengthy authentication advice for this 404.
