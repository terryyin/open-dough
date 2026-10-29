---
id: SEED-166
status: active
planted: 2026-10-29
planted_during: Recovery of Pygardon's dashboard refinement start after its Open Dough update
trigger_when: A dashboard launch or continuation uses an older bundle in an existing worktree
scope: one selected story
---

# SEED-166: Reliable dashboard launches from existing worktree bundles

## Why This Matters

A developer should be able to resume dashboard work after updating Open Dough
without diagnosing which checkout still holds an older installation. During
Pygardon's 2026-10-29 refinement start, the main checkout had release 0.3.74 but
the retained worktree still had 0.3.73. Reporting preparation tried to copy
`first-landing-expectation.mjs`, which that older release did not include.
The assignment was already published, Claude had not launched, and the generic
exception handler nevertheless described session existence as uncertain.

Updating the retained worktree through the released updater and continuing the
saved attempt successfully launched Claude while preserving its assignment.
The dashboard should recognize and guide that recovery itself.

## Selected Story

<a id="handle-stale-worktree-bundles"></a>

### Handle stale worktree bundles before dashboard agent launches

**Identity:** SEED-166#handle-stale-worktree-bundles
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/369-handle-stale-worktree-bundles/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4f89e14ddbb6da107e507a16c0a389f26079e1d6cb07e525e8e2e3b2cddba15d","plan":"c6b237fe69d0b6a448f4bb19277ca0d5afbf3cb35350fe094a8576d66f18360c"}}
```

**Goal:** A developer starting or continuing a dashboard agent in an existing
worktree whose Open Dough installation differs from the main checkout's gets a
compatible launch when that worktree's bundle already supports the needed
capabilities, or a definite pre-launch recovery path that updates that exact
worktree and retries the retained start when it does not — without diagnosing
which checkout is stale or losing a published assignment.

**Scope:**

- Before avoidable publication or native launch effects when the launch
  workspace is already known, check the selected host's installed capabilities
  and required helper dependencies in that workspace — not the main checkout's
  bundle alone.
- Keep a compatible older installation usable when it already provides the
  needed support; do not require a version match with the main checkout or
  fetch release support for ordinary use.
- When required support is missing before native launch, fail with a definite,
  actionable pre-launch explanation rather than an uncaught helper-copy error
  or an uncertain-session recovery state. Preserve any assignment and start
  already kept.
- Offer **Update worktree and retry**: run the existing verified whole-payload
  release updater for that exact worktree, then resume the retained start with
  the same story identity, assignment, workspace, and duplicate-session
  safeguards. Reuse the updater's baseline checks, recorded release source,
  all-tool installation into both native skill roots, and refusal behavior.
- Apply the same compatibility rules wherever Start, Continue, or retained
  session recovery consume installed helpers for execution, refinement, or
  unattached sessions. Codex, Cursor, and Claude Code keep their native paths
  and existing start/recovery contracts.

**Key examples:**

- Main checkout is on 0.3.74; a retained refinement worktree is on 0.3.73 and
  lacks a newly required reporting helper. Start or Continue names that
  worktree's missing support, does not throw an uncaught copy error, and does
  not claim a session might have launched.
- An assignment is already published and no native session has launched. Update
  worktree and retry installs the complete verified release in both native
  skill roots, then reuses the retained assignment and worktree to launch one
  session — no replacement claim or workspace.
- A compatible older bundle still supports the needed capabilities: Start or
  Continue launches from that worktree without fetching release support and
  without requiring a version match with the main checkout.
- Edited or incomplete managed files, an unverifiable recorded baseline, an
  unavailable release source, or an updater failure leave an actionable
  explanation. Retry does not launch after an unsuccessful update. No automatic
  force reinstall overwrites local changes. If replacement had already begun,
  the updater's truthful incomplete-install recovery remains.

**Constraints:** Automatic detection stays local to the machine and known
workspace. Updating is an explicit maintenance action using complete tagged
releases under
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md).
Keep workspace and update behavior inside existing workflow and updater
boundaries under
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).

**Deferred / excluded:** Background upgrades on every launch; partial
helper-file copying as a substitute for a release update; automatic forced
updates; resetting worktrees to the main checkout; changes to story
implementation or assignment ownership.

**Preparation:** Refined and planned in
[slice-plans/369-handle-stale-worktree-bundles/PLAN.md](../slice-plans/369-handle-stale-worktree-bundles/PLAN.md).
This seed does not authorize execution.

## Breadcrumbs

- Terry's Pygardon failure report, successful worktree recovery, and instruction
  to put this response first in the product backlog, 2026-10-29.
- [Dashboard start and retained-workspace recovery](../../dashboard/LAUNCH-START.md).
- [Startup reconciliation](../../dashboard/AGENT-LAUNCH-STARTUP.md).
- [Existing verified release updater](../../src/skills/dough-update/SKILL.md).
