# Handle stale worktree bundles before dashboard agent launches

**Source:** [Selected story](../../seeds/SEED-166-dashboard-worktree-bundles.md#handle-stale-worktree-bundles)
**Source review:** [source-review.md](./source-review.md)
**Identity:** SEED-166#handle-stale-worktree-bundles

## Goal and scope

When Start or Continue uses an existing launch worktree whose Open Dough
installation differs from the main checkout, check that worktree's installed
capabilities and required helpers before native launch. Keep compatible older
installations usable without a version match. When required support is missing,
fail with a definite actionable explanation that preserves the kept assignment
and start, and offer **Update worktree and retry** that runs the existing
verified whole-payload release updater for that exact worktree, then resumes
the retained start. No background upgrades, partial helper copying, automatic
force reinstall, resetting worktrees to the main checkout, or changes to story
or assignment ownership.

## Outside-in proof

Key examples map to slices below. Stable boundaries: launch attempt outcome and
explanation before native session creation; reporting preparation from the
launch workspace installation; the Update worktree and retry maintenance path;
existing start/Continue/duplicate-session contracts for Codex, Cursor, and
Claude Code.

Focused proof owns incomplete-install failure vs compatible-install success,
updater refusal vs successful update-and-resume, and host-path preservation.
Reuse existing reporting, preparation resume, and landing-admission tests for
unchanged complete-install journeys.

## Current decisions

- **Learning (slice 1):** Launch-run reporting refusal belongs beside the
  capability check (`launchWorkspaceReporting` / `launchReportingPreparation`),
  not inside the native-launch orchestrator; `launchRun` stays under the line
  budget after that extraction.
- **Reuse, do not replace, the release updater.** Dashboard invokes the existing
  verified whole-payload apply path (`dough-update` / `open-dough-release.sh
  apply`) with `--target` set to the launch worktree. Reuse its baseline checks,
  recorded SOURCE, all-tool installation into `.agents/skills` and
  `.claude/skills`, and refusal/incomplete-install recovery. No parallel
  installer and no partial helper-file copy as a substitute update.
- **Launch workspace installation is the helper source for reporting.**
  `launchRun` already passes `establishedLaunch(start)?.workspace` into
  `reportingContext`, and host `installedSkillPath` resolves under that folder
  (Cursor/Codex: `.agents/skills`; Claude: `.claude/skills`). Checks and updates
  address that same workspace, not the main checkout alone.
- **Compatibility is capability completeness, not VERSION equality.** An older
  install that already supplies what this launch will consume proceeds. Missing
  a required helper for the selected path fails actionably. ADR 0003 / 0004 /
  0008 constrain updates to explicit whole tagged releases inside existing
  workflow and updater boundaries.
- **Settled premises (this checkout):**
  1. Established starts prepare reporting from the launch worktree folder —
     observed in `dashboard/server/launchRun.ts` (`reportingContext(...,
     establishedLaunch(start)?.workspace ?? folder, ...)`).
  2. Landing present and `first-landing-expectation.mjs` absent → `copyFile`
     throws `ENOENT` — scratch observation of that copy sequence in this
     workspace (temporary incomplete install; reverted).
  3. Any throw from the attempt run becomes
     `uncertain` / “a session may or may not have started” —
     observed in `dashboard/server/launchAttemptSettlement.ts` `settleAttempt`.

## Ordered slices

### 1. Incomplete launch-workspace support fails before native launch
Type: Behavior
Status: done
Proof: Accepted — `npm run test:dashboard -- dashboard/tests/boundary/agent-launch-workspace-reporting-support.spec.ts dashboard/tests/boundary/agent-launch-incomplete-reporting-settlement.spec.ts --reporter=list` (5 passed). Incomplete install (landing present, sibling absent) refuses prep and settles Start/Continue as `failed`/`refused` naming the helper, with kept start/Taken and no uncertain-session wording; compatible older install without landing prepares reporting and launches. Existing complete-install landing-admission / story-branch-landing-context specs left green (pre-refactor).

Behavior: Given a known launch workspace whose selected-host installation lacks
a helper this launch's reporting (or other consumed installed helpers) requires,
Start or Continue stops before native launch with a definite, actionable
pre-launch failure naming the missing support. It does not throw an uncaught
copy error through settlement and does not claim a session might have launched.
A workspace whose older install already provides the needed capabilities
launches without fetching release support and without requiring a VERSION match
to the main checkout. When the workspace is already known, perform the check
before avoidable further publication or native launch effects.

### 2. Update worktree and retry restores support and resumes the retained start
Type: Behavior
Status: planned
Proof: Dashboard/API journey for the Update worktree and retry action: successful
apply against the exact worktree then Continue-equivalent resume reuses the
retained assignment, workspace, and duplicate-session safeguards and launches
one session (no replacement claim or workspace). Updater refusal (edited or
incomplete managed files, unverifiable baseline, unavailable source) leaves an
actionable explanation and does not launch; no automatic `--force`. Incomplete
install after a started replacement preserves the updater's truthful recovery
guidance. Host native paths and existing start/recovery contracts remain for
Codex, Cursor, and Claude Code.

Behavior: From the definite incompatible-bundle failure (or equivalent kept
start), the developer can run **Update worktree and retry**. That action invokes
the existing verified whole-payload release updater for that exact worktree,
installing into both native skill roots, then resumes the retained start. A
successful update launches one native session from the same assignment and
workspace. A refused or failed update does not launch.

## Story obligations

### G-X1. Background upgrades on every launch
Reported: slice 1 — "Background upgrades on every launch"
Story clause: "Background upgrades on every launch"
Disposition: excluded "Background upgrades on every launch"
Commitment: X1

### G-X2. Partial helper-file copying as a substitute for a release update
Reported: slice 1 — "partial helper-file copying as a substitute for a release update"
Story clause: "partial helper-file copying as a substitute for a release update"
Disposition: excluded "partial helper-file copying as a substitute for a release update"
Commitment: X2

### G-X3. Automatic forced updates
Reported: slice 1 — "automatic forced updates"
Story clause: "automatic forced updates"
Disposition: excluded "automatic forced updates"
Commitment: X3

### G-X4. Resetting worktrees to the main checkout
Reported: slice 1 — "resetting worktrees to the main checkout"
Story clause: "resetting worktrees to the main checkout"
Disposition: excluded "resetting worktrees to the main checkout"
Commitment: X4

### G-X5. Changes to story implementation or assignment ownership
Reported: slice 1 — "changes to story implementation or assignment ownership"
Story clause: "changes to story implementation or assignment ownership"
Disposition: excluded "changes to story implementation or assignment ownership"
Commitment: X5

## Plan concern review

Refinement was not needed: the two Behavior slices share one launch-workspace
installation model (check completeness, then explicit whole-payload update and
resume), map 1:1 to the story's key examples, and need no preparatory Structure
beyond work inside each Behavior. No remaining slice-specific concern was
identified.
