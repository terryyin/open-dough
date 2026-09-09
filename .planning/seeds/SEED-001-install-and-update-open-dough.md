---
id: SEED-001
status: active
planted: 2026-09-06
planted_during: Initial installation and update exploration
trigger_when: Release the working standalone updater for client use
scope: medium
---

# SEED-001: Install and update released guidance

## Goal

A client installs Open Dough, uses its skills, and receives a wanted release
through `dough-update`. The maintainer reviews the resulting project changes.

<a id="client-installation-and-update"></a>

## Current contract

Install the complete released payload in the established tool layouts. Ordinary
use reads local support. Record the Open Dough source URL and installed version;
use that source for subsequent updates. Verify managed content against its
recorded release. Handle local edits through an explicit, manually chosen force
replacement. Keep unrelated project content intact. Report the actual result.

[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) governs
release identity and the maintainer's version choice.

## Stories

<a id="register-ci-host-hooks-consistently"></a>

### 8. Register CI observation host hooks without environment-local drift

**Status:** Planned.
**Goal:** The Open Dough maintainer can use execute-plan CI observation in
Cursor and Claude Code without leaving untracked, environment-only host
settings, and without creating an unexplained behavior difference from Codex.
**Scope:** Decide and deliver one consistent way to register the Cursor
`.cursor/hooks.json` entries and Claude Code `.claude/settings.json` entries
that execute-plan CI observation needs. Keep Codex on its yielded-cell
adapter, which does not use those hook fragments. Preserve unrelated host
hooks, permissions, settings, and local preferences. Do not treat this
discussion as a chosen design: whether hooks are written at install/update,
merged only when execute-plan starts observation, left registered after
shutdown, or cleaned up, remains open.
**Key examples:**

- Given execute-plan needs CI observation in Cursor, when observation starts,
  then the host can deliver readiness and failure notifications. Quick 028
  created an untracked `.cursor/hooks.json` from the installed fragment and
  left it after the observer stopped.
- Given the installer already ships
  `dough-execute-plan/assets/cursor-hooks.json` and
  `claude-hooks.json`, when a client is installed or updated, then today it
  does not write host settings. Docs say fragments are included without
  overwriting host settings, and execute-plan may merge them later.
- Given host settings are sensitive, when arguing against writing them at
  install, then that argument does not by itself justify writing the same
  files during execute-plan: same file, same merge, same clobber risk.
  Execute-plan writing them is more surprising because the skill is about
  executing a plan, not configuring the host.
- Given hooks are lightweight when no observer is running, when observation
  stops, then current execute-plan stops the watcher process and does not
  remove hook entries. Automatic removal would risk deleting unrelated merged
  hooks.
- Given Codex uses the yielded-cell adapter, when Cursor or Claude host hooks
  are registered in a project, then Codex observation must still work without
  those files, and Cursor/Claude must not depend on a Codex-only path. Whether
  install should write unused host files into a Codex-driven checkout is an
  open cross-tool question, not a settled difference.
- Given the maintainer wants environments to stay consistent, when comparing
  checkouts, then untracked host files created only in the session that ran
  execute-plan are an unwanted local change.

**Evaluation:** After a chosen design is implemented, a fresh install or
update plus execute-plan CI observation in Cursor and Claude Code does not
require a one-off untracked host file; Codex observation still uses its
adapter; unrelated host settings remain; and the three tools' required
registration is explicit rather than implied by whichever environment last
ran execute-plan.
**Effort:** M, low confidence; the delivery moment, merge vs create, Codex
unused-file question, and shutdown cleanup are unresolved.
**Depends on:** The released execute-plan skill and its host adapters. Does
not depend on finishing another queued story first.

<a id="standalone-client-update"></a>

### 7. Release the standalone client installation and update workflow

**Status:** Pending release. Candidate: `6682816a2385d96066883b5e4dc073b28e4b3d4f`.
**Goal:** Make the working standalone updater available as a tagged release and
use it in Open Dough.
**Scope:** Review the candidate's functional checks, resolve the concrete
[Claude Code use question](SEED-007-cross-tool-validation.md#accept-standalone-client-workflow),
publish the maintainer-chosen version, and adopt it through the ordinary updater.
Review current source changes when choosing the release revision.
**Evaluation:** A fresh fetch supplies the chosen tag and complete payload;
Open Dough updates from its remembered source and uses the installed guidance
on a real task. The owner can review the installed version and file changes.
**Effort:** S–M, medium confidence; assumes existing implementation and release tools.
**Depends on:** A working candidate and the maintainer's release version.

<a id="show-update-changelog"></a>

### 6. See the relevant changelog while updating Open Dough

**Status:** Deferred until manual release-note reading becomes a repeated obstacle.
**Goal:** Understand a wanted update during the update interaction.
**Scope:** Show the applicable existing changelog entries before applying the
latest release. Use the recorded version as the starting point.
**Evaluation:** Updating from release A to C shows the entries for B and C and
installs C. The resulting version and outcome are clear.
**Effort:** S, low confidence; refine when the trigger occurs.
**Depends on:** A working updater and useful release notes.

## Delivered capabilities

<a id="install-from-github"></a>

### 1. Install Open Dough's update placeholder from a supplied URL for Codex

**Status:** Complete.
**Goal and scope:** Bootstrap project-local guidance from a supplied repository.

<a id="update-after-source-change"></a>

### 2. Apply the latest shared guidance to Open Dough's Codex installation

**Status:** Complete.
**Goal and scope:** Bring a shared guidance improvement into a project installation.

<a id="cursor-project-installation"></a>
<a id="claude-code-project-installation"></a>

### 3. Use and update Open Dough guidance in Cursor and Claude Code projects

**Status:** Complete.
**Goal and scope:** Use shared guidance through the supported native layouts.

<a id="release-tagged-version"></a>

### 4. Create an identifiable Open Dough release with the internal skill

**Status:** Complete.
**Goal and scope:** Prepare matching version metadata and publish an immutable tag.

<a id="install-latest-release"></a>

### 5a. Install the latest released Open Dough guidance safely

**Status:** Complete.
**Goal and scope:** Install inspected released guidance while preserving project content.

<a id="detect-installed-version"></a>
<a id="update-only-when-needed"></a>

### 5b. Keep a recorded installation current only when needed

**Status:** Complete.
**Goal and scope:** Advance older installations and report current or newer versions accurately.

<a id="publish-version-aware-updater"></a>

### 5d. Publish extracted guidance and the version-aware updater

**Status:** Complete.
**Goal and scope:** Deliver the shared updater and ADR guidance together in a tagged release.

<a id="adopt-version-aware-updater"></a>

### 5e. Adopt and reuse released guidance in Open Dough

**Status:** Complete.
**Goal and scope:** Use released guidance through Open Dough's own project installation.
