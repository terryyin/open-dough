---
id: SEED-001
status: dormant
planted: 2026-09-06
planted_during: Initial installation and update exploration
trigger_when: Bootstrap Open Dough to install and update its own skills and rules
scope: medium
---

# SEED-001: Install and update Open Dough in its own project

## Why This Matters

For the Open Dough maintainer and contributors, borrowing Donut's guidance
should change to installing Open Dough's own skills and rules from its GitHub
URL into this repository, then updating that installation after changing the
shared skill source. Real self-use should demonstrate that the distributed
guidance is usable and that improvements reach the project using it.

The owner chose this bootstrap loop as the near-future goal and identified
OpenGSD (`../gsd-core`) as a source of inspiration and reusable code. The current
repository has product documentation and a backlog direction, but no installer,
updater, or installed Open Dough guidance.

Constraints supplied by the owner and existing product definition:

- Install directly into each target project, including Open Dough itself.
  Global installation and shared home-level agent configuration are unsupported.
- Distribute from Open Dough's GitHub URL; a package registry is not required.
- Support installing and later updating shared skills and rules, with recorded
  version identity. The README specifies latest-only installation and updates,
  with no version selection or pinning.
- Codex, Cursor, and Claude Code are the intended platform scope.
- Capture and shape the work now; this seed does not implement an installer or
  introduce agent instruction files into this repository.

## Alternatives and Decision

- **Defer:** continue reading Donut's guidance. This keeps development moving
  but does not test the requested distribution and update loop.
- **Smaller behavior:** install one useful skill and the rules it requires for
  one platform, then prove an update to that same skill before expanding.
- **Manual or existing-tool workflow:** copy files by hand or use GSD's local
  installer. Manual copying does not provide the requested repeatable versioned
  update; GSD installs its own lifecycle and its local mode can still write
  shared machine defaults. Neither meets the complete stated outcome unchanged.
- **Requested direction, recommended:** build the smallest project-only
  installation and update journey using portable ideas from Donut and GSD.

The first learning question is whether guidance installed from GitHub can be
discovered and used in the producing project without relying on the sibling
repositories. The next is whether a source improvement reaches that installed
copy through an update with clear version identity and preserved project work.

Working hypotheses, not accepted architecture: start with Codex, since it is
the current development tool; use the product backlog skill as the first useful
skill; treat “latest” as the latest published release pending the owner's
choice. The [exploration note](../research/installation-and-updates.md) records
GSD evidence and implementation possibilities separately from these stories.

## Story Decomposition

<a id="install-from-github"></a>

### 1. Use Open Dough guidance installed from GitHub in its own project

- **Status:** Unfinished candidate.
- **For / why:** As the maintainer, install Open Dough from its GitHub URL into
  this repository so I can use its own guidance during development.
- **Outcome and scope:** Install one useful skill and its required rules for
  Codex, show the installed version, and use that skill in a fresh session.
  Include the publishable payload and documented invocation needed for this
  end-to-end journey. Broader skill migration is outside this story.
- **Evaluation:** Given a published version and a checkout without Open Dough
  installed, the maintainer follows the GitHub installation instructions and
  uses the installed skill on an actual task, such as backlog maintenance.
  The installed identity matches the fetched version. No Donut/GSD checkout is
  required. No home-level agent guidance is installed or changed.
- **Value / learning:** Delivers an independently usable installation and tests
  the source-to-consumer boundary with Open Dough as its first consumer.
- **Effort hypothesis:** L (2–4 hours), low confidence; assumes one small skill,
  minimal supporting rules, one platform, and an existing GitHub repository.
  Refine before planning if packaging or content adaptation exceeds this band.
- **Depends on:** None; preparing the first usable published payload is part
  of this story, not a separate technical preparation story.
- **Safe stopping point:** The installed skill remains useful if updates are
  deferred. Source documents, planning, and existing project guidance survive;
  a conflicting pre-existing destination is reported without overwriting it.

<a id="update-after-source-change"></a>

### 2. Use an improved shared skill after updating Open Dough itself

- **Status:** Unfinished candidate.
- **For / why:** As the maintainer, change a shared skill's source and update
  this project's installation so development benefits from the improvement.
- **Outcome and scope:** Publish the skill change as the next available version,
  update from the same GitHub source, and demonstrate the changed installed
  behavior. Preserve the selected platform and show the old and new installed
  identities. Source content and installed output remain distinct.
- **Evaluation:** Starting with version A installed, edit a skill's distributable
  source, publish version B, and update this repository. A fresh agent session
  uses B's changed behavior. The maintainer can review the installed-file diff;
  source edits and unrelated project content are preserved. Updating again to
  identical content produces no new diff. Changed rules follow the same update
  contract as changed skills.
- **Boundaries:** No global writes or version selection. A failed fetch leaves
  the existing installation usable. Unowned destination collisions and edited
  installed files are reported without silently overwriting them or claiming
  a successful update. Retired files are removed only when previously managed
  and unchanged. Automatic merging of installed customizations is deferred.
- **Value / learning:** Completes the requested self-improvement loop and proves
  that version identity corresponds to usable installed behavior.
- **Effort hypothesis:** L (2–4 hours), low confidence; assumes Story 1 provides
  ownership/version records and the update can reuse installation behavior.
  Conflict handling initially stops for manual resolution rather than merging.
- **Depends on:** Story 1's usable GitHub installation.
- **Safe stopping point:** The install/update loop is useful for continuing
  Open Dough development even if other platform support is deferred.

<a id="cursor-project-installation"></a>

### 3. Use and update Open Dough guidance in a Cursor project

- **Status:** Unfinished candidate.
- **For / why:** As a contributor using Cursor, use the shared Open Dough
  guidance and receive its improvements within my project.
- **Evaluation:** Install the same minimal shared guidance into a target
  project's Cursor integration, invoke the skill in Cursor, then update to the
  next published version and observe the changed behavior. Existing project
  guidance and any other installed platform integration remain usable; no
  global Cursor guidance changes.
- **Value / learning:** Tests whether the working distribution loop serves a
  second platform without maintaining a separate lifecycle definition.
- **Effort hypothesis:** M (1–2 hours), low confidence; assumes Stories 1–2
  provide the shared install/update behavior and only platform adaptation is
  needed. Runtime discovery must be verified during refinement.
- **Depends on:** Stories 1–2's working installation and update journey.
- **Safe stopping point:** Cursor contributors retain a complete usable workflow
  even if the Claude Code integration is deferred.

<a id="claude-code-project-installation"></a>

### 4. Use and update Open Dough guidance in a Claude Code project

- **Status:** Unfinished candidate.
- **For / why:** As a contributor using Claude Code, use the shared Open Dough
  guidance and receive its improvements within my project.
- **Evaluation:** Install the same minimal shared guidance into a target
  project's Claude Code integration, invoke the skill, then update to the next
  published version and observe the changed behavior. Existing project guidance
  and any other installed platform integration remain usable; no global Claude
  Code guidance changes.
- **Value / learning:** Makes the shared install/update journey usable on the
  remaining platform named in the initial product scope.
- **Effort hypothesis:** M (1–2 hours), low confidence; assumes reuse of the
  established distribution loop with focused platform adaptation.
- **Depends on:** Stories 1–2; Cursor support is not a product prerequisite.
- **Safe stopping point:** The supported platform set is independently usable;
  no additional lifecycle catalogue is needed to justify this increment.

## Ordering and Scope Reduction

First prove a usable self-installation, then the source-change/update loop.
These two stories address the immediate goal. The remaining stories are
candidates for completing the README's platform scope, not prerequisites for
self-use. Cursor-before-Claude Code is tentative and can follow contributor
demand. First to drop: Story 4, then Story 3; defer Story 2 only if a usable
first installation is the deliberately chosen stopping point.

Stories are sized by observable scope, not by auditing GSD's implementation.
All estimates are hypotheses; do not turn this seed into one large execution
task. No stories are queued or selected for execution by this document.

## Open Decisions

- Does latest mean the latest published release or default-branch commit?
  Releases are recommended; the owner has been asked. A branch-based choice
  replaces the publishing examples with pushes and requires exact commit
  identity even when a human-readable version is unchanged.
- Codex-first and a minimal backlog skill are proposed starting assumptions.
  Another first platform or skill changes Story 1's scope, not the project-only
  installation and update goal.
- Initial conflict policy is a proposed stop-and-report behavior. If automatic
  preservation of edits to installed files is needed immediately, refine the
  update story before execution; it is different from editing shared source.

## When to Surface

When selecting the first bootstrap story. Refine the chosen story's goal,
scope, and examples before slice planning. Keep backlog prioritization separate
from this non-executable seed and architectural acceptance.

## Breadcrumbs

- Owner's request: explore OpenGSD installation and updates; capture GitHub
  self-installation, skill changes, versioning, and project-only self-updates.
- [Near-future direction](../PRODUCT-BACKLOG.md)
- [Product definition](../../README.md)
- [Installation and update exploration](../research/installation-and-updates.md)
- [Donut story-decomposition skill](../../../doughnut/.agents/skills/story-decomposition/SKILL.md)
- [Donut decomposition rules](../../../doughnut/.cursor/rules/problem-decomposition.mdc)
- [ADR playbook](../../docs/adrs/README.md): architecture remains subject to the
  advice process; ADR 0001's skill naming is still a proposal.
