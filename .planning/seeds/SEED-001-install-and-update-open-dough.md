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
repository has product documentation and a backlog direction, but no installer,
updater, or installed Open Dough guidance.

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

- **Status:** Unfinished; queued; refined 2026-09-06.
- **Depends on:** None.
- **Effort hypothesis:** M (1–2 hours), low confidence; one placeholder skill
  and a simple installer.

#### Goal

Install Open Dough into itself and invoke its first skill in Codex, so we can
start using the installation flow and learn from it.

#### Scope

- Install one update placeholder from the supplied URL into the target project.
  Recommended name: `dough-update`. Invoking it says updating is not implemented.
- If Open Dough is already installed, warn and stop. Let the user explicitly
  insist on reinstalling, overwriting Open Dough's installed files. Recommended
  option: `--force`.
- Keep this project-local and simple: no real updating, version checks,
  migrations, or merging. Further rules and edge cases can follow actual use.

#### Key examples

1. Install from Open Dough's GitHub URL into this repository, then invoke the
   skill in Codex. It responds that updating is not implemented yet.
2. Install again: it warns and stops. Explicitly force the reinstall: it writes
   the supplied content over the previous Open Dough installation.

<a id="update-after-source-change"></a>

### 2. Apply the latest shared guidance to Open Dough's Codex installation

- **Status:** Unfinished; queued.
- **For / why:** As the maintainer, change a shared skill's source and update
  this project's installation so development benefits from the improvement.
- **Outcome and scope:** Fetch and apply the source repository's latest
  default-branch content to the existing Codex installation whenever update is
  invoked. Reuse the installation behavior without detecting installed or newer
  versions. Source content and installed output remain distinct.
- **Evaluation:** Starting with guidance installed in Codex and no edits to the
  installed copies, edit a skill's distributable source and push it to `main`.
  Run update in this repository. A fresh Codex session uses the changed skill.
  No release is published and no version comparison gates the update. Invoking
  update again still fetches and applies latest. Changed rules follow the same
  contract as changed skills; source and unrelated project files are preserved.
- **Value / learning:** Completes the smallest requested self-improvement loop
  without requiring version infrastructure.
- **Effort hypothesis:** M (1–2 hours), low confidence; assumes reuse of Story
  1's installation path with an explicit default-branch source and unchanged
  installed copies. Complex replacement or migration behavior is excluded.
- **Depends on:** Story 1's usable Codex installation.
- **Safe stopping point:** The maintainer can keep using and refreshing Open
  Dough guidance even if all remaining stories are deferred.
- **Excluded:** Version records/checks, update-availability notifications,
  automatic merges, and policy for collisions, edits, or retired installed
  files. These cases are deferred, not implicitly authorized for overwriting.

<a id="cursor-project-installation"></a>
<a id="claude-code-project-installation"></a>

### 3. Use and update Open Dough guidance in Cursor and Claude Code projects

- **Status:** Unfinished; queued.
- **For / why:** As a team using Cursor and Claude Code, adopt the same shared
  guidance and update flow already usable in Codex within our projects.
- **Outcome and scope:** Extend project installation and simple updates to
  Cursor and Claude Code together. Use the same shared skill and rules; platform
  adaptation should not require maintaining separate lifecycle definitions.
- **Evaluation:** In each tool, install from the supplied URL into a project,
  invoke the skill, push a shared source improvement, and apply latest through
  update. Both tools demonstrate the improved behavior. Selected integrations
  can coexist in a project; no home-level guidance is changed. The initial
  update remains unconditional, without version detection.
- **Value / learning:** Gives the team the same usable install/update workflow
  across the remaining two tools named in the product scope.
- **Effort hypothesis:** L (2–4 hours), low confidence; assumes reuse of Stories
  1–2 with focused adaptation for two tools. The owner requested these platforms
  together; verify each tool separately within this story during refinement.
- **Depends on:** Stories 1–2's working Codex installation and update journey.
- **Safe stopping point:** All three platforms are usable without version
  detection or a broader lifecycle catalogue.

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
tracking and update detection last. This preserves four queued outcomes while
keeping the initial update small.

First to drop: Story 4, then Story 3. Defer Story 2 only if a usable first
installation is the deliberately chosen stopping point. Stories are sized by
observable scope, not by auditing GSD's implementation. All estimates remain
hypotheses; no executable plan or implementation is authorized by this queue.

## Open Decisions

- `dough-update` and `--force` are recommended names. Keep installation details
  minimal and adjust them through use.
- Conflict handling for the later update story remains for future discussion.
  Version detection stays in Story 4.

## When to Surface

The four stories are in the [product backlog](../PRODUCT-BACKLOG.md). Refine the
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
