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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer starting or continuing an agent from the dashboard
in an existing worktree whose Open Dough installation differs from the main
checkout's installation.

**Goal:** Start and Continue check the bundle in the actual launch workspace,
keep supported older installations usable, and provide a reliable update and
retry journey when required support is unavailable.

**Scope:** Check the selected host's installed capabilities and complete
required helper dependencies in the workspace that will launch the agent.
Perform checks before avoidable publication or native launch effects when the
workspace is already known. Preserve any assignment and start already kept.
A known incompatibility before native launch produces a definite, actionable
pre-launch failure rather than an uncertain-session recovery state.

Provide an **Update worktree and retry** action that invokes the existing
verified whole-payload release updater for that exact worktree, then resumes
the retained start. Preserve its story identity, assignment, workspace, and
duplicate-session safeguards. Use the updater's existing baseline checks,
recorded release source, all-tool installation, and refusal behavior.

**Key examples / evaluation:**

- The main checkout has 0.3.74 while a retained refinement worktree has 0.3.73
  and lacks the newly required reporting helper. Start or Continue identifies
  that worktree's missing support without an uncaught copy error or a false
  claim that a session might have launched.
- With an assignment already published and no native session launched, the
  update action installs the complete verified release in both native skill
  roots. Retry reuses the retained assignment and worktree and launches one
  session; it creates no replacement claim or workspace.
- A compatible older bundle launches using its supported capabilities, without
  fetching release support or requiring a version match with the main checkout.
- Edited or incomplete managed files, an unverifiable recorded baseline, an
  unavailable release source, or an updater failure leave an actionable
  explanation. Retry does not launch through an unsuccessful update, and no
  automatic force reinstall overwrites local changes. Preserve the updater's
  truthful incomplete-install recovery if replacement had already begun.
- Execution, refinement, and retained session starts use the same compatibility
  rules wherever they consume installed helpers. Codex, Cursor, and Claude Code
  retain their native paths and existing start/recovery contracts.

**Constraints:** Automatic detection stays local. Updating is an explicit
maintenance action, and uses complete tagged releases under
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md).
Keep workspace/update behavior in the existing workflow and updater boundaries
under [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).

**Excluded:** Background upgrades on every launch, partial helper-file copying,
automatic forced updates, resetting worktrees to the main checkout, and changes
to story implementation or assignment ownership.

**Preparation:** Queued for refinement and implementation planning. This seed
does not authorize execution.

## Breadcrumbs

- Terry's Pygardon failure report, successful worktree recovery, and instruction
  to put this response first in the product backlog, 2026-10-29.
- [Dashboard start and retained-workspace recovery](../../dashboard/LAUNCH-START.md).
- [Startup reconciliation](../../dashboard/AGENT-LAUNCH-STARTUP.md).
- [Existing verified release updater](../../src/skills/dough-update/SKILL.md).
