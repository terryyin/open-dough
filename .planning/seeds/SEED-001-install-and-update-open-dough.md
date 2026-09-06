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
should change to installing Open Dough's own skills and rules from a supplied
URL into this repository, then updating that installation after changing the
shared skill source. Real self-use should demonstrate that the distributed
guidance is usable and that improvements reach the project using it.

The owner chose this bootstrap loop as the near-future goal and identified
OpenGSD (`../gsd-core`) as a source of inspiration and reusable code. The current
repository now installs and updates its own Codex skill from a supplied URL;
Cursor and Claude Code support remains the next queued story.

## Decisions and Constraints

The owner clarified the following on 2026-09-06:

- Install directly into each target project, including Open Dough itself.
  Global installation and shared home-level agent configuration are unsupported.
- Installation uses whatever source URL is supplied. The usual source is the
  latest default-branch content (`main` in Open Dough), not a published release.
  Do not silently substitute a different source for an explicitly supplied URL.
- Routine updates fetch and apply the latest content from the source
  repository's default branch. No installed-version detection, newer-version
  comparison, release publication, or version metadata is required initially.
- Version tracking and detecting whether an update is available are a separate
  later story. They are not prerequisites for installation or a simple update.
- Start with Codex. Group Cursor and Claude Code support into one follow-up.
- For installation, warn or stop when Open Dough is already present and allow
  an explicit override to overwrite its installed files, including local edits.
  No migration or version comparison is needed. Update conflict policy remains
  separate and deferred.
- Shape and queue the work now; this seed does not implement an installer or
  introduce agent instruction files into this repository.

## Alternatives and Decision

- **Defer:** continue reading Donut's guidance. This keeps development moving
  but does not test the requested distribution and update loop.
- **Smaller behavior, selected:** first install a discoverable update placeholder
  in Codex, with explicit reinstall support. Implement the real update behavior
  next. Defer version detection and the remaining platforms.
- **Manual or existing-tool workflow:** copy files by hand or use GSD's local
  installer. Manual copying does not provide the requested repeatable update;
  GSD installs its own lifecycle and its local mode can still write shared
  machine defaults. Neither meets the complete stated outcome unchanged.
- **Release-based, version-aware updates:** useful as an inspiration, but impose
  release and detection work that the owner has excluded from the first loop.

The first learning question is whether guidance installed from a URL can be
discovered and used in the producing project without relying on sibling
repositories. The next is whether pushing a source improvement and running
update brings that improvement into use in the same project.

The first installed skill is an update placeholder, as requested by the owner.
The [exploration note](../research/installation-and-updates.md) records GSD
evidence and implementation possibilities separately from stories.

## Story Decomposition

<a id="install-from-github"></a>

### 1. Install Open Dough's update placeholder from a supplied URL for Codex

- **Status:** Complete, 2026-09-06. GitHub installation into Open Dough and
  fresh Codex invocation verified; repeat protection and forced replacement
  passed the focused installer check. [Execution outcome](../quick/001-install-update-placeholder/PLAN.md).

#### Goal

Install Open Dough into itself and invoke its first skill in Codex, so we can
start using the installation flow and learn from it.

#### Scope

- Install `dough-update` from the supplied cloneable URL into the target project.
  Invoking it reports that updating is not implemented yet.
- Stop with a warning when the skill directory already exists. Explicit
  `--force` reinstallation overwrites its installed file, including local edits.
- Keep this project-local: no real updating, version checks, migrations,
  merging, additional rules, or comprehensive edge-case suite.

<a id="update-after-source-change"></a>

### 2. Apply the latest shared guidance to Open Dough's Codex installation

- **Status:** Complete, 2026-09-06. Supplied-URL fixture, GitHub self-update,
  fresh-session wording, and unchanged-content reapplication verified.
  [Execution evidence](../quick/002-update-installed-guidance/PLAN.md).

#### Goal

Use the installed `dough-update` skill to bring a pushed source improvement into
Open Dough's Codex installation and use it in a fresh session.

#### Scope

- Refresh only the project-local `dough-update` skill from the supplied URL's
  latest default branch. Every invocation fetches and reapplies latest.
- Bootstrap an existing placeholder once through explicit forced reinstall.
  Preserve source, unrelated project files, and home-level guidance.
- Assume an unedited installed copy. Additional skills, platforms, versions,
  conflict handling, migrations, and notifications remain outside this story.

<a id="cursor-project-installation"></a>
<a id="claude-code-project-installation"></a>

### 3. Use and update Open Dough guidance in Cursor and Claude Code projects

- **Status:** Unfinished; refined 2026-09-06.
- **Execution plan:** [Cursor then Claude Code](../quick/003-cursor-claude-guidance/PLAN.md).
  The owner will hand the plan to each tool separately; Cursor completes its
  part and records the handoff before Claude Code begins.

#### Goal

As a developer using Cursor or Claude Code, install and invoke `dough-update`
in my project and use a pushed source improvement after updating. Learn whether
the small loop already demonstrated in Codex works in both additional tools.

#### Scope

- Support Cursor and Claude Code together in this story, demonstrating each
  separately. Install only the existing `dough-update` skill into the target
  project from the supplied repository URL.
- Reuse the shared updater behavior, adapting only what each tool needs to
  discover, invoke, and refresh its installed skill. Do not maintain separate
  update workflows for the tools.
- Working assumption: installation explicitly selects the intended tool, and
  update refreshes that tool's installation. Installing or updating one tool
  does not require installing or synchronizing the others. Existing Codex use
  remains available; selected integrations can coexist in the same project.
- Supply the source URL for each update. Fetch and apply its latest default
  branch every time, including when content is unchanged. Report success only
  after installation succeeds, and explain how to use the refreshed skill.
- Preserve the existing installation contract: an ordinary repeat for the
  selected tool warns and stops; explicit `--force` reinstall replaces its
  installed skill, including local edits. Routine update examples assume
  unedited installed copies; customization and conflict policy remain deferred.
- Preserve distributable source, unrelated project content, other tools'
  separate installations, and home-level guidance.
- Exclude additional skills, rules distribution, global installation, version
  tracking, release publication, source-URL persistence, automatic platform
  discovery, cross-tool synchronization, migrations, and comprehensive edge
  cases. No broader lifecycle catalogue is needed to prove this story.

#### Key examples

1. **Install and use in each tool:** Starting with an existing project without
   that tool's Open Dough installation, install from the supplied URL for
   Cursor, then repeat the example for Claude Code. In a fresh session of each
   tool, discover and invoke `dough-update` with the source URL. It successfully
   refreshes that tool's project-local installation.
2. **Use a shared improvement:** With unedited copies installed in both tools,
   push one observable wording improvement to the shared source's default
   branch. Invoke update in Cursor and in Claude Code separately. Each receives
   the improvement, and a fresh session in each tool demonstrates it. A second
   invocation without another source change still fetches and reapplies latest.
3. **Coexist and reinstall:** In a project with Codex already installed, add
   Cursor and Claude Code. An ordinary repeat installation for either new tool
   stops without changing its copy; an explicit forced reinstall replaces that
   copy. Updating either tool preserves the other tools' separate installations,
   distributable source, unrelated project files, and home-level guidance.

No blocking product questions remain under the working assumption above.
Native discovery, invocation, and refresh need verification in both tools;
copying files alone is not completion. Exact command syntax and destination
paths are implementation details to resolve during slice planning. The safe
stopping point is one usable install/update loop in each of the three tools.

<a id="detect-installed-version"></a>

### 4. See whether installed Open Dough guidance is behind the latest source

- **Status:** Unfinished; queued after the initial install/update workflow.
- **For / why:** As a maintainer, identify what guidance is installed and whether
  upstream has changed so I can decide when an update is useful.
- **Outcome and scope:** Add installed-source identity and comparison with the
  latest default-branch source as a separate capability. A Git revision may be
  sufficient; release versions or per-skill version numbers are not required
  by this story. Choose the identity and comparison contract during refinement.
- **Evaluation:** After installing known source content, check whether it is
  current. Push a change to the shared guidance and check again; the maintainer
  can distinguish the installed content from latest. After applying latest,
  the check reports it current. Checking alone does not change installed skills.
- **Value / learning:** Makes update decisions informed without delaying the
  simple install/update loop.
- **Effort hypothesis:** M (1–2 hours), low confidence; assumes one source identity
  for the installed guidance, not independent skill versioning.
- **Depends on:** Stories 1–2; support for Cursor and Claude Code is an ordering
  preference, not a prerequisite. Earlier installations have no required
  version record; refinement must account for that starting condition.
- **Safe stopping point:** The check is useful independently; automated updating
  or notifications are not required.

## Ordering and Scope Reduction

First establish self-installation in Codex, then the unconditional update loop.
Next extend those behaviors to Cursor and Claude Code together. Add version
tracking and update detection last. This preserves four ordered outcomes while
keeping the initial update small.

First to drop: Story 4, then Story 3. Defer Story 2 only if a usable first
installation is the deliberately chosen stopping point. Stories are sized by
observable scope, not by auditing GSD's implementation. All estimates remain
hypotheses; the queue alone does not authorize implementation. Story 1 was
subsequently selected, planned, executed, and completed.

## Open Decisions

- Story 1 uses `dough-update` and `--force`. Keep further installation details
  minimal and adjust them through use.
- Conflict handling for the later update story remains for future discussion.
  Version detection stays in Story 4.

## When to Surface

The remaining stories are in the [product backlog](../PRODUCT-BACKLOG.md), with
Stories 1–2 recorded as recently done. Refine the
chosen story's goal, scope, and examples before slice planning. Keep backlog
prioritization separate from execution and architectural acceptance.

## Breadcrumbs

- Owner's request: explore OpenGSD and capture project-only installation and
  self-updates; subsequent clarification chooses default-branch latest,
  unconditional initial updates, Codex first, and deferred version detection.
- [Near-future direction and story queue](../PRODUCT-BACKLOG.md)
- [Product definition](../../README.md)
- [Installation and update exploration](../research/installation-and-updates.md)
- [Donut story-decomposition skill](../../../doughnut/.agents/skills/story-decomposition/SKILL.md)
- [Donut decomposition rules](../../../doughnut/.cursor/rules/problem-decomposition.mdc)
- [ADR playbook](../../docs/adrs/README.md): architecture remains subject to the
  advice process; ADR 0001's skill naming is still a proposal.
