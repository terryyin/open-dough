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
