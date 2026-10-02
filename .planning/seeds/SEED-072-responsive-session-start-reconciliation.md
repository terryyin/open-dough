---
id: SEED-072
status: active
planted: 2026-10-01
planted_during: Terry's request for responsive dashboard session startup and reconciled story state
scope: story
---

# SEED-072: Keep the dashboard responsive while session startup settles

## Why This Matters

A developer starting refinement, execution, or an unattached startup session
needs immediate feedback that Start has taken effect, without being able to
cancel work that has already begun. Launch processing should let the developer
continue using the dashboard while protecting the affected story from further
actions until its temporary local state and published state agree.

## Story

<a id="recheck-verification-fidelity"></a>

### Recheck verifies only what its host can list, and trusts a launch's own record

**Identity:** SEED-072#recheck-verification-fidelity
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/211-recheck-verification-fidelity/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fdc936cf96af22c6fa50d584e3f59a5a327da5895a3a2961f3ce4d40212d6a71","plan":"0e1e54f11628eaaa54a404aee050aecf89e107b41dd88cc9548f45bb87a7a96f"}}
```

**Goal:** A developer who presses Recheck on an uncertain story start sees an
answer true to that start: a Codex start is rechecked as it was before, without
an answer that its host offers no session listing, and a start whose own launch
record already holds its session settles as launched, never as "not launched"
while its card lists that session and its story could be started twice.

**Scope:** A bounded retrospective correction of
`SEED-072#durable-startup-reconciliation` (plan 206, commits `3d82d365`,
`a6fa2461`, `f7dbab51`, `1414d5c8`). Recheck asks for native verification only
for a host whose local service offers a session listing (a host capability,
not a host name); an attempt whose own launch record already holds a session
settles as launched before any listing or folder matching; launch and
verification share one rule for where a story launch started and what record
it keeps. Preserve every promise of the reviewed story; no new feature promise,
host, endpoint or retention change.

**Plan:** [bounded correction input and slices](../slice-plans/211-recheck-verification-fidelity/PLAN.md).

## Breadcrumbs

- Terry's direction in this chat, 2026-10-01: capture this UX/UI improvement
  first in the product backlog, directly on main, then commit and sync with
  origin. Disable Cancel immediately on launch, move startup to the background,
  show the story as read-only and processing, and recover its actions only after
  temporary dashboard state reconciles with authoritative `origin/main` state.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard session journey](SEED-052-start-agent-work-from-dashboard.md).
- [Composable session options](SEED-066-composable-lightweight-session-options.md).
- Session panel header controls (`60b6aa6b:.planning/seeds/SEED-071-session-panel-header-controls.md`).
