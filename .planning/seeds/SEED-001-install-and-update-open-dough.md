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
repository now installs and updates its own skill from a supplied URL in
Codex, Cursor, and Claude Code. Stories 4–6 add identifiable releases,
version-aware updating, and changelog presentation as separate outcomes.

## Decisions and Constraints

The owner clarified the following for the initial loop on 2026-09-06. These
choices describe completed Stories 1–3. The accepted versioning contract and
Stories 4–6 supersede the initial version deferrals as each outcome is delivered.

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

- **Status:** Complete, 2026-09-06. Cursor and Claude Code each install,
  protect against ordinary reinstall, force-reinstall, and natively fetch and
  reapply a pushed shared source improvement, including unchanged-content
  reapplication; Codex's existing use is unaffected and each tool's separate
  installation coexists with the others in this repository.

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

## Smaller outcomes for versioned releases

For Open Dough's maintainer and adopting developers, unconditional updates
without an installed identity should become identifiable releases, updates
only when needed, and visible release notes. The owner requested a small
internal version skill and later rejected the combined 27-leaf story as too
large, asking for at least three stories and refinement of the first only.

[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) remains
Accepted: one numeric `MAJOR.MINOR.PATCH` version starting at `0.1.0`, matching
immutable published Git tags, source `VERSION`, dated `CHANGELOG.md`, and latest
meaning the highest numeric tagged release. No requested-version updates,
prereleases, per-skill versions, or GitHub Release service are needed.

### Alternatives and working order

| Option | Judgment |
| --- | --- |
| Defer everything | Leaves the requested release identity and update decision unresolved. |
| Make one smaller behavior change | Selected: first deliver a usable maintainer release workflow, then version-aware updating, then automatic changelog presentation. |
| Use only manual Git and Markdown | A sufficient fallback for producing a valid release; it does not provide the requested reusable internal skill or version-aware updater. Ordinary Git publication and manual reading of the changelog remain sufficient between stories. |
| Deliver the combined story | Retains all outcomes but ties the first useful result to too much work; the owner explicitly requested this split. |

The working order tests the small release contract first. The release skill is
useful to the maintainer independently; it is not being disguised as a technical
prerequisite. Story 5 needs a valid release, which could also be made manually.
Story 6 genuinely requires the version comparison and transition delivered by
Story 5. This order is a planning recommendation, not a claim that the owner
separately selected it. Each story covers its affected behavior in all three
tools; platforms are not separate product stories.

<a id="release-tagged-version"></a>

### 4. Create an identifiable Open Dough release with the internal skill

- **Status:** Unfinished; first in the backlog, re-refined 2026-09-06. The
  [reused first plan](../quick/004-versioned-updates/PLAN.md) covers only this
  story and has been refined in place into nine Behavior leaves.
- **For / why:** The maintainer needs a repeatable way to describe and identify
  a delivered version without a release framework.
- **Evaluation:** Invoke the internal skill with a chosen version and change
  description; inspect the resulting committed version, dated notes, and tag.
  Publish normally through Git and read the same release from a fresh fetch.
- **Value / learning:** A human can identify, share, and inspect a release even
  if no updater work follows. Learn whether one small shared skill keeps the
  release identity and description coherent in each supported tool.
- **Effort hypothesis:** S (30–60 minutes), medium confidence; assumes a
  lightweight skill over Git and Markdown and available native sessions.
- **Depends on:** A usable committed Open Dough payload, already available from
  completed Stories 1–3. No dependency on Stories 5–6.

#### Goal

As the Open Dough maintainer, use one internal skill to prepare and tag a
chosen release whose content and changes I can inspect and share through Git.
The release must be useful without an installed-version detector or updater
changes.

#### Scope

- Add the internal `release-version` skill for use in Open Dough. It accepts
  the maintainer's chosen next numeric version and a human-readable description
  of changes. Start at `0.1.0`; subsequent versions must be greater than the
  existing release history. Automatic bump classification is excluded.
- Prepare a source `VERSION` and matching dated entry in `CHANGELOG.md`.
  Preserve previous release entries. Preparing these files is also a useful
  stopping point when the maintainer asks to review before tagging.
- Finalize the release by committing its intended metadata and tagging the
  committed payload with the matching `vMAJOR.MINOR.PATCH`. Assume the intended
  product changes are already committed. Do not sweep unrelated work into the
  release commit or silently move/reuse a published tag. Refuse a conflicting
  or non-increasing version and explain the issue.
- Ordinary Git publication makes the commit and tag available. Demonstrate the
  first real release after native fixture proof, describing only behavior
  actually delivered. Do not add a publishing service, automatic push pipeline,
  generated compatibility promises, or artificial public test releases.
- Keep one shared skill source with minimal native discovery adaptation.
  Discover and invoke it separately in Codex, Cursor, and Claude Code with
  other installed guidance present. The internal skill and acceptance guard
  remain absent from adopter installations.
- Leave current `dough-update`, installer behavior, and installed copies intact.
  Release notes and usage documentation must explain that version-aware
  updating arrives in Story 5. Having a source release version does not imply
  that existing installations record or compare it.
- Exclude installed-version records, latest-release installation, no-op updates,
  legacy bootstrap, automatic changelog display during update, release signing,
  rollback, global installation, and unrelated distributed guidance. These
  boundaries keep this a complete maintainer outcome rather than a partial
  implementation of the updater.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| Committed usable payload, no release history | Ask the internal skill to prepare `0.1.0` with a change description | `VERSION` and a dated `0.1.0` changelog entry agree; no tag is claimed when preparation alone was requested. |
| Matching prepared metadata and committed payload | Ask the skill to finalize the release | `v0.1.0` points to the commit containing the matching metadata and payload; unrelated changes are excluded from the commit and preserved. |
| An earlier release exists | Ask for a chosen higher release with its changes | New version/notes/tag agree and earlier changelog entries remain intact. |
| A tag already exists, or a requested version does not advance the release history | Ask for that release | Explains the conflict without moving the tag or writing misleading new release metadata. |
| The candidate skill is present alongside existing guidance in each tool | Invoke it natively in a disposable Open Dough checkout | Each tool loads the shared behavior and produces the chosen release; passing in one tool does not count for another. |
| The first real release is published through ordinary Git | Fetch it afresh | The published tag resolves to the intended committed payload, source version, and readable notes. The notes do not promise Stories 5–6. |

#### Acceptance and stopping point

Native discovery, invocation, and release behavior are pending separately for
Codex, Cursor, and Claude Code in the first plan. Verify coexistence and that
ordinary installer/update use still preserves internal guidance and distributes
only its existing payload. Reuse earlier evidence only for unchanged behavior;
new internal-skill discovery requires new observations.

This story is complete when the maintainer can use and share the release
workflow in all three tools. Cancelling Stories 5–6 still leaves a useful,
identified release and a repeatable internal skill. No unresolved scope
question blocks this story; the proposed order remains open to owner steering.

<a id="detect-installed-version"></a>
<a id="update-only-when-needed"></a>

### 5. Update Open Dough to the latest release only when needed

- **Status:** Unfinished; candidate boundary only. The
  [second plan](../quick/005-update-only-when-needed/PLAN.md) is retained planning
  material, **not for direct execution**. Refine this story, update that plan,
  then refine its slices before execution.
- **For / why:** A developer wants a current installation without needless
  overwrites and needs a truthful record of what is installed.
- **Evaluation:** Across all three native tools, install latest; update an
  older/unknown installation once; repeat at the same version with no writes.
- **Value / learning:** Useful automatic version decisions, even while the
  developer reads the already-published changelog manually.
- **Effort hypothesis:** M (1–2 hours), low confidence; assumes the established
  installer/native entry points remain adequate. Reassess during refinement.
- **Depends on:** At least one valid tagged release. Story 4 supplies it, but
  the internal release skill itself is not technically required.

#### Goal

As an adopting developer, install or update the selected tool to the latest
released Open Dough version and avoid rewriting an already-current installation.

#### Scope

- Use the supplied repository URL, highest numeric tagged release, and one
  record per selected tool. Update directly to latest, without requested-version
  selection or automatic downgrade. Initial installation records its version.
- Compare before writing: equal versions cause no installed-file/metadata writes;
  unknown versions transition once; newer installed versions are preserved.
- Handle genuine old installed skills through a documented explicit bootstrap
  where necessary. Record the version only after successful payload verification;
  source resolution/metadata failures leave installations untouched and failed
  installs never claim success or advance the record.
- Preserve ordinary-repeat warning, explicit forced reinstall, other tools'
  installations, distributable source, unrelated work, and home guidance. Keep
  shared behavior and prove native install/update/coexistence in all three tools.
- Report source, tool, old/unknown and resulting versions, and fresh-session use.
  A valid tagged release already contains its changelog; reading that file
  manually is the explicit interim workflow. Automatic release-note presentation
  belongs to Story 6 and is not a prerequisite for this story's completion.

#### Key example and stopping point

Installed `0.1.0`, latest `0.1.2` → native update → only the selected installation
advances directly to `0.1.2`. Repeat → reports current without reinstalling or
writing its metadata. An unversioned copy instead establishes its first known
version through the supported transition. This remains useful if Story 6 is
cancelled; detecting versions is not split away from the update decision.

<a id="show-update-changelog"></a>

### 6. See the relevant changelog while updating Open Dough

- **Status:** Unfinished; candidate boundary only. The
  [third plan](../quick/006-show-update-changelog/PLAN.md) is retained planning
  material, **not for direct execution**. Refine this story, update that plan,
  then refine its slices before execution.
- **For / why:** A developer wants to understand an update's changes without
  finding and interpreting the source changelog manually.
- **Evaluation:** Native update shows actual applicable release-note content,
  including skipped releases or an unknown baseline, in all three tools.
- **Value / learning:** Puts the already-authored changes into the update
  interaction; learn whether that output is sufficient for real use.
- **Effort hypothesis:** S (30–60 minutes), low confidence; assumes Story 5
  already exposes truthful installed/latest identity and a stable update path.
- **Depends on:** Story 5's version-aware updater and released changelog entries.

#### Goal

As an adopting developer, see the changes that apply to my update as part of
running `dough-update`.

#### Scope

- Before applying latest, show the changelog content for every release after
  the installed version through latest. A link alone is insufficient. Exclude
  older and unreleased entries; do not install intermediate versions.
- For an unknown baseline, show available released history and state that the
  previous version is unknown. Do not invent a baseline or reconstruct history.
- Keep Story 5's equal-version no-op, source/target identity, failure reporting,
  and coexistence. Missing/inconsistent required changelog content stops before
  installation changes; exact presentation and range-validation examples are
  for the next story-refinement pass.
- Cover native invocation and refreshed skill behavior in Codex, Cursor, and
  Claude Code. Do not add a separate changelog command, notification system,
  automatic release authoring, or installer synchronization.

#### Key example and stopping point

Installed `0.1.0`, released `0.1.1` and `0.1.2` → native update → displays both
entries before one installation of latest. The version remains truthful after
success/failure and the other tools are untouched. This completes the original
combined outcome without reopening release production or version detection.

## Ordering and Scope Reduction

The working backlog order is Story 4 (release), Story 5 (update when needed),
then Story 6 (show changes). Their complete outcomes, rather than implementation
layers or platform batches, define the boundaries. Refine only the first now;
later plan fragments are deliberately not ready to execute.

First to defer is automatic changelog presentation: manual reading still works.
If capacity is smaller still, defer version-aware updating and keep the useful
maintainer release workflow. Manual release preparation is a fallback if the
internal skill proves unnecessary, not a reason to grow release infrastructure.
The accepted versioning contract is unchanged; consumer adoption is staged.

## Reuse of the original 27-leaf plan

The old aggregate plan is replaced, not retained as a competing execution plan.
No leaves were completed and no execution evidence is lost. The following maps
all old leaf numbers to their new homes; shared rows separate the updater
mechanics from changelog presentation rather than duplicating implementation.

| Original leaves | First plan: Story 4 | Second plan: Story 5 | Third plan: Story 6 |
| --- | --- | --- | --- |
| 1–5, 10–11, 16, 18, 20, 22 | — | Installation, records, repeat/force behavior, no-op, no downgrade, failures, native selection | — |
| 6–8 | — | Newer and unknown version transitions | Release-note content, skipped releases, unknown-baseline explanation |
| 9 | — | Source/version/release validation and latest-only interface | Required changelog/range validation |
| 12–15 | Internal release skill, native preparation/tagging and coexistence | — | — |
| 17, 19, 21, 23 | — | Cursor/Claude update and legacy mechanics | Notes in those native journeys |
| 24 | Publish the first real release with delivered behavior only | Publish actual updater improvements as a later release | Publish actual presentation improvements as a later release |
| 25–27 | — | Version-aware self-use in the three tools | Verify note presentation during later self-updates |

The first plan retains its existing path for in-place refinement. The two
later files preserve useful intent and proof obligations, not final slice sizes
or an instruction to run the old sequence.

## Open Decisions

- No unresolved decision blocks the refined first story. Release → update →
  notes is the working recommendation and can be reordered by the owner.
- Stories 5–6 need their own refinement before execution; their plans identify
  the boundaries and evidence to revisit. Local-edit conflict handling remains
  outside this set of stories.

## When to Surface

The [product backlog](../PRODUCT-BACKLOG.md) queues Stories 4–6, with completed
Stories 1–3 retained. Execute only a selected story with a refined plan; do not
chain the three plans as one delivery. Planning here does not implement or
publish a release.

## Breadcrumbs

- Initial owner direction: project-local supplied-URL installation, an
  unconditional update loop, then versioning; Codex first, followed by Cursor
  and Claude Code. Completed Stories 1–3 preserve that history.
- Owner's versioning requirements: tags, changelog, comparison before update,
  unchanged-version no-op, latest-only updating, legacy support, release-note
  content, and a basic internal version skill.
- Owner accepted the versioning proposal on 2026-09-06; ADR 0003 records it.
- Owner then requested splitting the large story into at least three, reusing
  its plan, refining the first story and its slices, and explicitly withholding
  execution readiness from the other plans.
- [Donut story-decomposition](../../../doughnut/.agents/skills/story-decomposition/SKILL.md)
- [Donut story-refinement](../../../doughnut/.agents/skills/story-refinement/SKILL.md)
- [Donut slice-plan-refinement](../../../doughnut/.agents/skills/slice-plan-refinement/SKILL.md)
- [ADR playbook](../../docs/adrs/README.md)
