---
id: SEED-001
status: active
planted: 2026-09-06
planted_during: Initial installation and update exploration
trigger_when: A concrete installation or update improvement is needed
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

<a id="default-skip-process-retrospective"></a>

### 9. Skip process retrospectives by default for new installations

**Status:** Backlog; mid priority.
**Goal:** A client installing Open Dough starts with process retrospectives
skipped unless the project has deliberately chosen otherwise.
**Scope:** Set `skipProcessRetrospective` to boolean `true` in
`.planning/open-dough.json` for a new installation. When updating an
installation that predates the setting, add the same default only when the key
is absent. Preserve an existing boolean `true` or `false` and all unrelated
configuration; do not treat the new default as authority to replace the
project's choice. Keep malformed or invalid configuration on the existing
refusal path rather than overwriting it. Update the directly affected
installation and update checks and documentation.
**Evaluation:** A fresh installation records `true`; an older installation
without the key gains `true` on update; updates preserve explicit `true` and
`false` values and unrelated keys; malformed or invalid configuration is
reported without replacement.
**Effort:** S–M, medium confidence; the write is small, but safe migration,
preservation, refusal, and install/update coverage make this more than a
one-line quick fix.
**Depends on:** The existing merge-and-preserve behavior for
`.planning/open-dough.json`.

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
