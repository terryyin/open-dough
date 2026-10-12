---
id: SEED-063
status: active
planted: 2026-09-30
planted_during: Terry's request to move dashboard-launched CI monitoring into the dashboard
trigger_when: A GitHub request or failed-job log could not be read and needs a useful cause
scope: story
---

# SEED-063: GitHub request diagnostics

<a id="request-owner-says-why"></a>

### A GitHub request or failed log that could not be read says why

**Identity:** SEED-063#request-owner-says-why
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/300-request-owner-says-why/PLAN.md"}
```
**Slice plan:** [Request owner says why](../slice-plans/300-request-owner-says-why/PLAN.md).

**Goal:** A developer or agent whose GitHub request never reached `gh`, or
whose failed-job log could not be read, is told the actual cause instead of
"gh failed" or an unbounded retry instruction. This bounded correction comes
from the retrospective of shared GitHub request admission, whose closed
story is recoverable at
`2d889140cd7bd390f5bbb6e775de1e690e65645b:.planning/seeds/SEED-063-dashboard-owned-ci-monitoring.md`.

**Scope:** The request owner's unreachable-owner causes and the diagnostic
entry's unavailable-log causes, with the guidance that names them; one shared
reading of the process table for the request owner and the CI mailbox; and
removal of request-rule proofs repeated across test layers. No new feature
promise.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard launch](../../dashboard/AGENT-LAUNCH.md) and
  [completion reporting](../../dashboard/AGENT-LAUNCH-COMPLETION.md).
- [GitHub request ownership and costs](../../dashboard/GITHUB-REQUESTS.md).
- [CI observation](../../src/skills/dough-execute-plan/references/ci-monitor.md),
  [completion mechanics](../../src/skills/dough-execute-plan/references/ci-completion-wait.md),
  and [wrap-up closure](../../src/skills/dough-execute-plan/references/wrap-up-closure-publication.md).
