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

### 9. Run process retrospectives only when a project enables them

**Identity:** SEED-001#default-skip-process-retrospective
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/137-default-skip-process-retrospective/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"72cf8aaaaeda94167779922ac9b024f4ee3755884615b93997d4f86dc22168cb","plan":"fbe5999a9b2280a079e21b9e1d68ae460ee2338edd5a888a87aa2eafe084f554"}}
```

**Status:** Refined on 2026-09-28; mid priority.

**Goal:** A project using Open Dough stops paying for process retrospectives it
did not ask for. Process review mainly produces `DearDough.md` feedback for
Open Dough's maintainers, so it runs only when the project enables it; product
and code/design review stay on by default. Terry accepted on 2026-09-28 that
this reduces default process feedback from other projects.

**Scope:**

- In `dough-execution-retrospective` review selection, a missing
  `.planning/open-dough.json` or missing `skipProcessRetrospective` key skips
  process review; `false` enables it; `true` skips it. Explicit invocation
  selection (`--skip-process`, an include-process request) still overrides
  storage. Malformed or invalid configuration keeps its current
  unresolved-selection path.
- Update the statements of the old default: the skill's own description and
  body, `docs/installation-and-updates.md` (showing `false` as the enabling
  example), and SEED-010's recorded default.
- This repository keeps its process practice by recording
  `{ "skipProcessRetrospective": false }` in its own
  `.planning/open-dough.json`.

**Rejected design:** Having the installer or updater write `true` into the
project's configuration. [ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)
item 4 forbids creating the file to materialize defaults and requires updates
to preserve configuration; changing the standard behavior reaches new and
existing installations without touching project files.

**Deferred:** New flags, install-time prompts, and CHANGELOG wording (owned by
the release). Paid native acceptance stays manual and outside this story.

**Key examples:**

- No `.planning/open-dough.json` → planned execution completes → the automatic
  retrospective runs code/design and product review, performs no process
  analysis or agent-history access, and writes no `DearDough.md`.
- File with `"skipProcessRetrospective": false` → retrospective → process review
  runs and records findings as today.
- No file, invoked with an explicit request to include process review → process
  review runs.
- File with `"skipProcessRetrospective": "yes"` or malformed JSON → the error is
  reported, process review is omitted, other reviews continue (unchanged).
- A project updated from an earlier release without the key → next
  retrospective skips process review; the updater leaves the file byte-for-byte
  as it was, or absent.

**Effort:** S, high confidence; prose and configuration only, no installer
change.
