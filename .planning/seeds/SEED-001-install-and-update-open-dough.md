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

<a id="register-ci-host-hooks-consistently"></a>

### 8. Register CI observation host hooks without environment-local drift

**Status:** Complete in `v0.3.4`; released and adopted through the ordinary updater.
**Plan:** [Register and release reproducible CI host hooks](../quick/031-register-ci-host-hooks/PLAN.md).
**Goal:** A client installs or updates Open Dough and can use execute-plan CI
observation across Codex, Cursor, and Claude Code with reproducible project
configuration. Deliver this capability in a new tagged release.
**Scope:**

- Register the existing Cursor and Claude Code hook fragments during
  install/update in `.cursor/hooks.json` and `.claude/settings.json`, regardless
  of the invoking tool. Keep the current all-tool installation and Codex's
  yielded-cell adapter.
- Merge only Open Dough's entries, without duplicates. Preserve unrelated
  hooks, permissions, settings, and local preferences. Report malformed
  configuration or conflicting edits to managed entries before writing;
  whole-file replacement of shared settings is outside this story.
- Treat hook registration as part of installation completeness, including
  when the installed skill version is already current. Keep configuration
  portable and intended for version control; the installer reports the diff
  and does not commit it automatically.
- Leave hooks registered after observation stops. Execute-plan verifies the
  existing bridge and starts/stops the observer; it no longer writes host
  settings. Missing readiness reports unavailable monitoring without changing
  trust or policy settings or substituting AI polling.
- Update the directly affected installation/execution guidance and checks.
  Publish a new maintainer-chosen version with matching `VERSION`, changelog,
  and immutable tag, then adopt it in Open Dough through the ordinary updater
  and commit the resulting project configuration.

**Out of scope:** Plugins, skill-frontmatter hook delivery, user-global setup,
new platform selection options, general settings-management machinery,
automatic hook removal, CI observer/repair redesign, idle-session wakeups,
and a new performance or cross-tool conformance suite. Retain the current
notification timing and supported runtime boundaries. Other queued skill and
Donut adoption work remains separate.

**Key examples:**

- Given a fresh client, when Open Dough is installed from Codex, Cursor, or
  Claude Code, both native hook configurations are produced alongside the
  existing skill roots. After those project files are committed, a fresh
  checkout needs no session-created hook file.
- Given existing unrelated hooks and preferences, when installation is
  repeated or a release is updated, those values survive and Open Dough's
  entries occur once. An already-current skill payload with missing entries
  is repaired; malformed settings or conflicting managed edits are reported
  without partial configuration changes.
- Given a supported Cursor or Claude Code session, when execute-plan probes
  and starts observation, readiness and a ready CI failure reach the owning
  coordinator. Cursor also works with Claude compatibility enabled without
  duplicate delivery. When hooks are disabled or unavailable, execution
  reports missing monitoring and does not rewrite settings.
- Given observation has stopped, the hook entries remain and an invocation
  with no ready event adds no context or follow-up. Codex continues through its
  existing adapter without depending on the hook files.
- Given the scoped checks and applicable release evidence pass, when the
  maintainer's new version is published and adopted, a fresh fetch resolves
  the matching tag and Open Dough's ordinary update installs the registrations.
  The installed version and committed configuration are reviewable.

**Evaluation:** Focus deterministic checks on installation, repeated/update
merges, preservation, and refusal. Use representative native readiness/failure
checks in Cursor and Claude Code, including coexistence; reuse still-valid
Codex and observer behavior evidence under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
Keep missing native proof pending until resolved before release. Completion
includes the published tag and ordinary self-update, not just source changes
or prepared release metadata.
**Effort:** M, medium confidence; reuse existing fragments, adapters, and
release workflow. Native session availability remains an execution risk.
**Depends on:** Existing execute-plan adapters and runnable native sessions.
Apply [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
and [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Coordinate the publication with [Story 7](#standalone-client-update) so the
same release need not be performed twice. Its outstanding
[Claude Code updater acceptance](SEED-007-cross-tool-validation.md#accept-standalone-client-workflow)
remains separately owned and must be resolved if the selected release includes
that affected work.
**Release decision:** The maintainer selected `0.3.4`. Cursor's Claude-
compatibility invocation and SEED-007's native Claude updated-use check remain
explicitly pending under the recorded one-release exception.

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
