---
id: SEED-001
status: dormant
planted: 2026-09-06
planted_during: Initial installation and update exploration
trigger_when: Bootstrap Open Dough to install and update its own skills and rules
scope: large
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

- **Status:** Completed 2026-09-06. Published annotated `v0.1.0` on `53b6da2`.
  Native proof is in the [story plan](../quick/004-versioned-updates/PLAN.md).

#### Goal

As the Open Dough maintainer, use one internal skill to prepare and tag a
chosen release whose content and changes I can inspect and share through Git.
The release must be useful without an installed-version detector or updater
changes.

#### Scope

- The internal `release-version` skill accepts a maintainer-chosen increasing
  numeric version and change description, prepares matching `VERSION` and dated
  `CHANGELOG.md`, and finalizes the committed payload with an immutable tag.
- Native discovery and behavior were verified separately in Codex, Cursor, and
  Claude Code. Ordinary Git published `v0.1.0`; a fresh fetch matched its
  metadata and payload.
- Conflicting/non-increasing versions, unrelated release automation, updater
  behavior, installed records, and changelog presentation remained excluded.
- The internal skill and repository acceptance guard remain undistributed.

<a id="install-latest-release"></a>

### 5a. Install the latest released Open Dough guidance safely

- **Status:** Candidate split; refine before updating or refining its provisional plan.
- **For / why:** An adopting developer needs a trustworthy first installation.
- **Evaluation:** Each native tool installs and discovers the highest numeric
  release from the supplied URL; only the inspected pinned release executes.
- **Value / learning:** Makes release identity usable without update behavior.
- **Effort hypothesis:** M, medium confidence; implementation exists, but the
  trust boundary, oversized README, and fresh Cursor proof remain.
- **Depends on:** Story 4's valid release. Provisional
  [plan](../quick/008-install-latest-release/PLAN.md), not for direct execution.

<a id="detect-installed-version"></a>
<a id="update-only-when-needed"></a>

### 5b. Keep a recorded installation current only when needed

- **Status:** Complete, 2026-09-06. Older, equal, and newer recorded versions
  each produce the correct native outcome independently in Codex, Cursor, and
  Claude Code, executing only the inspected pinned release; the retrospective
  pinned-code execution, temporary-cleanup, and numeric-comparison corrections
  are folded in. The detailed slice plan was dropped after acceptance; see the
  [product backlog](../PRODUCT-BACKLOG.md#recently-done) for the evidence
  summary.
- **For / why:** A developer with a recorded installation needs a truthful
  update decision without needless overwrites or downgrade.
- **Evaluation:** Older, equal, and newer recorded versions produce the right
  native outcome independently in Codex, Cursor, and Claude Code.
- **Value / learning:** Delivers useful version-aware updating while notes stay
  manually readable.
- **Effort hypothesis:** L, medium confidence after separating sibling outcomes.
- **Depends on:** A valid tagged release and selected installation record.

#### Goal

As an adopting developer whose selected tool has a valid installed record, run
one update that advances older, leaves equal unwritten, and preserves newer.

#### Scope

- Use the supplied URL's highest numeric release and execute only the exact
  pinned code inspected by the agent. Report source, tag/commit, selected path,
  prior version, and outcome; clean temporary work on success and failure.
- Equal performs no installer call or installed-file/record writes. Older
  advances once to latest. Newer is preserved. Malformed records, requested
  versions, invalid releases, and failed replacement remain truthful and safe.
- Keep independent Codex, Cursor, and Claude Code entries with one shared
  behavior. Preserve other installations, source, unrelated work, home guidance,
  internal skills, and the repository guard.
- Exclude fresh install, missing records, genuine legacy bootstrap, publication,
  self-adoption, inline changelog, rollback, downgrade, and local-edit merging.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| Selected installation records `0.1.0`; latest is `0.1.2` with an intermediate `0.1.1` | Invoke native update | Advances once directly to `0.1.2`; verifies before recording success; does not install intermediate releases or require inline release notes. |
| Selected installation records latest `0.1.2`; branch content or local skill text has changed | Invoke native update | Reports already current; no installer call and no installed-file or record writes. An empty Git diff alone is insufficient proof. |
| Selected installation records `0.2.0`; supplied repository's latest is `0.1.2` | Invoke native update | Reports the newer installed version and preserves it without a downgrade. |

Each decision was proven separately, natively, in all three tools, including
the retrospective pinned-code execution, temporary cleanup, numeric comparison,
and helper-size corrections.

<a id="establish-unversioned-installation"></a>

### 5c. Establish a known release for an unversioned installation

- **Status:** Candidate split; refine before updating or refining its provisional plan.
- **For / why:** A developer with no trustworthy selected record needs a
  deliberate path to a known, version-aware installation.
- **Evaluation:** Missing-record and genuine legacy starting states reach latest
  once, then a fresh native update is unwritten; no other record is inferred.
- **Value / learning:** Makes existing adopters eligible for normal updates.
- **Effort hypothesis:** L, low confidence until the two starting conditions are
  refined. **Depends on:** Stories 5a–5b. Provisional
  [plan](../quick/009-establish-unversioned-installation/PLAN.md), not executable.

<a id="publish-version-aware-updater"></a>

### 5d. Publish the version-aware updater

- **Status:** Candidate split; refine before updating or refining its provisional plan.
- **For / why:** The maintainer needs accepted updater behavior available as an
  immutable release rather than only fixture code.
- **Evaluation:** A chosen higher version, metadata, tag, payload, and fresh
  fetch agree; `v0.1.0` remains unchanged.
- **Value / learning:** Makes the updater adoptable outside its source checkout.
- **Effort hypothesis:** S, medium confidence. **Depends on:** accepted Stories
  5a–5c. Provisional [plan](../quick/010-publish-version-aware-updater/PLAN.md),
  not executable.

<a id="adopt-version-aware-updater"></a>

### 5e. Adopt and reuse the released updater in Open Dough

- **Status:** Candidate split; refine before updating or refining its provisional plan.
- **For / why:** The maintainer needs real self-use evidence, not fixtures alone.
- **Evaluation:** Open Dough's three native installations adopt the published
  release separately and each fresh invocation reports current without writes.
- **Value / learning:** Closes the bootstrap loop and tests coexistence in daily use.
- **Effort hypothesis:** M, medium confidence once the release exists.
  **Depends on:** Story 5d. Provisional
  [plan](../quick/011-adopt-version-aware-updater/PLAN.md), not executable.

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
- **Effort hypothesis:** S (30–60 minutes), low confidence; assumes Stories
  5b–5c expose truthful recorded and unknown-baseline transitions.
- **Depends on:** Stories 5b–5d and released changelog entries.

#### Goal

As an adopting developer, see the changes that apply to my update as part of
running `dough-update`.

#### Scope

- Before applying latest, show the changelog content for every release after
  the installed version through latest. A link alone is insufficient. Exclude
  older and unreleased entries; do not install intermediate versions.
- For an unknown baseline, show available released history and state that the
  previous version is unknown. Do not invent a baseline or reconstruct history.
- Keep Story 5b's equal-version no-op, source/target identity, failure reporting,
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

Order the remaining outcomes as safe fresh installation (5a), recorded update
(5b), unversioned migration (5c), publication (5d), real self-use (5e), then
automatic notes (6). Story 4 is complete. Each stopping point leaves a visible
outcome or consequential learning; platform rows remain acceptance evidence,
not separate stories.

First to drop is automatic note presentation because manual reading works,
followed by real-project self-use when fixtures are sufficient temporarily.
Publication is required before external adoption; unversioned migration can be
deferred while new installations and recorded updates remain useful.

## Split-plan provenance

Quick 005 retains original leaves 8–9, 11–15, 20–25, and 29–31 plus
retrospective corrections. Quick 008 receives 1–7 and 17–19; Quick 009 receives
10, 16, 26–28, and 32–34; Quick 010 receives 35–36; Quick 011 receives 37–42.
Completed and partial status/evidence moved with their leaves. The new plans are
explicitly not executable until their stories and slices are refined again.
Quick 005's plan file was dropped after all of its leaves and retrospective
corrections completed; its evidence is summarized in Story 5b above and in the
product backlog.

## Open Decisions

- Stories 5a and 5c–5e, plus Story 6, need story refinement before their mapped
  plans can be updated or refined. Local-edit conflict handling stays outside.

## When to Surface

The [product backlog](../PRODUCT-BACKLOG.md) queues Stories 5a and 5c–6, with
Stories 1–4 and 5b retained as completed. Execute only a selected story with a
refined plan; do not chain the provisional plans as one delivery.

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
- Quick 005 implementation later expanded to 42 leaves. A code-only execution
  retrospective on `178f1b0` and `c26c503` found a missing pinned-code execution
  boundary, temporary-work leakage, unsafe numeric comparison, and oversized
  changed files. The owner requested another story split while preserving the
  delivered implementation evidence.
- [Donut story-decomposition](../../../doughnut/.agents/skills/story-decomposition/SKILL.md)
- [Donut story-refinement](../../../doughnut/.agents/skills/story-refinement/SKILL.md)
- [Donut slice-plan-refinement](../../../doughnut/.agents/skills/slice-plan-refinement/SKILL.md)
- [ADR playbook](../../docs/adrs/README.md)
