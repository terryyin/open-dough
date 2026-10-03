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

<a id="remove-files-a-release-dropped"></a>

### Remove installed files that a newer release no longer declares

**Identity:** SEED-001#remove-files-a-release-dropped
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** After `dough-update`, the project's installed skill roots hold only
the files the installed release declares. A file an earlier release installed
and a later release dropped no longer stays behind, where it can fail on load
or mislead an agent that finds it.

**Scope:**

- On update, remove managed files that the previously installed release
  declared and the new release does not, in every installed root
  (`.agents/skills/` and `.claude/skills/`).
- Keep files the project added itself; only files Open Dough previously
  installed are candidates.
- Handle an orphan that was edited locally the same way edited managed files
  are handled today: report it and require the explicit force replacement.
- Report the removed files in the update result.

**Key examples:**

1. Release 0.3.47 dropped `dough-story-wrap-up/scripts/closure-publication.mjs`
   and `dough-execute-plan/scripts/current-branch-publication.mjs`. This
   repository's installed copies, at 0.3.55, still hold them. Loading
   `closure-publication.mjs` fails because the updated `publication-git.mjs`
   no longer exports `recordedCheckoutIdentity`. After the update, neither
   file exists.
2. A project's own skill file under `.claude/skills/` that no release declared
   stays untouched.

## Breadcrumbs

- 2026-10-03: found during SEED-085 wrap-up when the installed
  `closure-publication.mjs` failed to load; `install.sh` copies only
  `managed_files` and never removes a previously declared file.
