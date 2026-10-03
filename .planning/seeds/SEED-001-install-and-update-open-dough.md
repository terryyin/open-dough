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
**Slice plan:** [Remove files a release dropped](../slice-plans/225-remove-files-a-release-dropped/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/225-remove-files-a-release-dropped/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b432a88069e56ff3934969a4a97013be375487a85eb16891c81b7b961c3e67cc","plan":"4616432389d149db22efdcc2b92ac441309a241944193ec1afd8df480f3cdd69"}}
```

**Goal:** After `dough-update`, the project's installed skill roots hold only
the files the installed release declares, plus the project's own files. A file
an earlier release installed and a later release dropped no longer stays
behind, where it can fail on load or mislead an agent that finds it.

**Scope:**

- A leftover is a file in an installed root (`.agents/skills/` and
  `.claude/skills/`) whose path some release up to the new one declared and
  the new release does not. The basis is the release history at the recorded
  source, not only the release recorded as installed, so leftovers stranded by
  earlier updates are found too.
- An ordinary update removes an unedited leftover: its bytes match a release
  that declared that path.
- A leftover that matches no declaring release counts as edited. An ordinary
  update refuses it the same way it refuses edited managed files today: it
  names the file, writes nothing, and points to the explicit force replacement.
- The explicit force replacement removes every leftover, edited or not.
- Paths no release declared stay untouched, including installation records
  such as `dough-update/SOURCE` and `VERSION`.
- The update result lists the removed files.
- Directories that removal leaves empty are removed too; a directory still
  holding a project file stays.

Deferred: removing leftovers when the recorded release already equals the
latest release (the "already current" path). The next update that installs a
newer release cleans them up.

**Key examples:**

1. This repository is recorded at 0.3.55 and still holds six files that later
   releases dropped in both roots, for example
   `dough-story-wrap-up/scripts/closure-publication.mjs` (last declared in
   0.3.46) and `dough-execute-plan/scripts/workspace-publication.mjs` (last
   declared in 0.3.32). Each matches a release that declared it byte for byte.
   Loading `closure-publication.mjs` fails because the updated
   `publication-git.mjs` no longer exports `recordedCheckoutIdentity`. An
   ordinary update to a newer release removes all six from both roots and
   lists them in its result.
2. `.claude/skills/release-version/SKILL.md`, a maintainer skill that no
   release declared, stays untouched by the same update.
3. A project edited a leftover `closure-resources.mjs`. An ordinary update
   names that file and refuses without writes. Rerunning with the explicit
   force replacement removes it and installs the new release.

## Breadcrumbs

- 2026-10-03: found during SEED-085 wrap-up when the installed
  `closure-publication.mjs` failed to load; `install.sh` copies only
  `managed_files` and never removes a previously declared file.
