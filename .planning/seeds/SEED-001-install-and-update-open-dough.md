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

Clients should install complete Open Dough guidance, run `dough-update` to
receive a newer release, and review and commit the resulting project changes.
The first installation/versioning/self-use loop is complete. The next delivery
must implement the simpler contract and make it available for a retained Donut
adoption and a meaningful ordinary update.

The [product backlog](../PRODUCT-BACKLOG.md) places this client path ahead of
further extraction. Historical completed scopes remain below; new Story 7 owns
changes to the delivered contract.

## Decisions and Constraints

<a id="client-installation-and-update"></a>

### Architectural direction under review — client installation and update

[ADR 0004 — Client installation and update](../../docs/adrs/0004-client-installation-and-update.md)
is **Proposed**. Once Accepted, it governs future work under this seed alongside
[Accepted ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md).
[ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md) governs decision ownership.
This seed owns installation, updating, installation records, publication, and
self-use. Completed story scopes and evidence below remain historical facts;
their exact payload and earlier exclusions are not permanent architecture.

The owner's clarified direction is to install and update the whole client
payload, with no skill selection or draft public-guidance state. Every item in
a release's client payload must be ready for public use. Ordinary use stands
alone with all required scripts and supporting files installed. Maintenance
information is fetched from the Open Dough source repository during
`dough-update` and discarded. Record the version and source repository URL;
the immutable release supplies comparison content without permanent commit or
checksum records. Clients can force replacement of edited managed files, with
no reconciliation or recovery guarantee for their edits. Offline replacement
and a package distribution mechanism are not current requirements.

Configuration is still speculative: reserve `open-dough.json` at the client
project root, shared by all tools, but introduce no file, options, or configuration
machinery until a real need exists. Keep that proposal distinct from delivered
behavior. Future options must be minimal; the absence of a file uses the standard
behavior.

#### Differences from the delivered installation

This comparison describes the earlier released contract (also present in local
tag v0.2.1). Subsequent source cleanup is accounted for in
[Story 7's current-scope check](#standalone-client-update); do not treat every
row as still-unimplemented work or infer that source cleanup was published.

| Existing behavior or scope | Required direction if ADR 0004 is accepted |
| --- | --- |
| Stories [5a](#install-latest-release), [5d](#publish-version-aware-updater), and [5e](#adopt-version-aware-updater) distribute three files, including `RECOGNITION.md`. | Declare the whole client payload without maintenance material; change installer, updater references, documentation, and affected checks together. The current full-install behavior continues; no feature selector is needed. |
| The updater reads recognition locally and promises no fetch for standalone assessment/replacement. | Move that support to a matching inspected source fetched during maintenance. Offline maintenance is not promised; unavailable support must not lead to an unsupported completion claim. |
| `open-dough-release.sh` invokes forced copying for older or unknown recorded installations, without checking installed content against its previous release. | Ordinary updates compare against the recorded release and stop without writes for changed, missing, or unverifiable content. An explicitly forced update replaces the managed payload, including local edits, without merging or promising to recover those edits. |
| The installed record contains only numeric `VERSION`, and the updater asks for a source URL on each invocation. | Remember the version and the Open Dough repository URL used during installation. Subsequent updates reuse that location without asking; the client project's Git remote is not the release source. Record no maintenance material. Additional permanent commit/checksum metadata is not required. |
| There is no separate installed customization contract or demonstrated customization need. | Reserve the shared root `open-dough.json` location; defer creating the file, defining settings, and implementing configuration until needed. When introduced, preserve it through both ordinary and forced updates. |
| Earlier scope excludes general migration automation and the current installer does not retire removed payload files. | Handle the concrete transition between Open Dough releases, including obsolete recognition and its references. Preserve completed releases; retirement of unchanged managed files does not require a general reconciliation framework. |

For ordinary updates at equal versions, preserve the existing no-write property. The earlier
observation that edited skill text still produces a successful "current" result
does not establish the new integrity check: a modified installation should be
reported as unsupported, even when its recorded version equals latest. Ordinary
updates preserve newer installations without downgrade; an explicitly forced
update replaces managed content with the selected latest release, even when
ordinary comparison would have skipped it. No restore-before-update requirement
or automatic edit recovery is introduced.

SEED-004's existing local-practice adoption work is separate from the permanent
update contract. Supporting arbitrary edited copies is not a future requirement
of this seed, and deferred generic matching/reconciliation is not a prerequisite.
SEED-006 consumes releases for Donut adoption; it does not own an installer
redesign. These documentation changes do not change backlog order or authorize
execution. Deferred changelog presentation can read source notes temporarily;
it does not require installing release history.

#### Delivery acceptance and evidence

For each tool independently, require native discovery, explicit invocation and
intended automatic application where applicable, correct guidance behavior,
installation, updating, and coexistence. Observe at least:

- a fresh complete installation containing only release-ready guidance, ordinary
  use with Open Dough unavailable, and local supporting files; self-use must not
  borrow missing files from the surrounding Open Dough source repository;
- an update from a verifiable earlier release that updates all managed content,
  retires obsolete files, and records the version/source only after verification;
  ordinary equal and newer version outcomes make no writes;
- invoking `dough-update` in the client project automatically uses the saved
  Open Dough location and the appropriate Codex, Cursor, or Claude Code layout;
  it leaves reviewable file changes without automatically committing or pushing;
- changed or missing managed files and an unverifiable baseline stopping without
  writes during ordinary updating, including when the recorded version is current;
- explicit forced updating replaces managed content despite local edits or an
  equal recorded version, with no merge or edit-recovery guarantee. It preserves
  unrelated files and other tools' installations;
- temporary maintenance retrieval, inspection, cleanup, and truthful handling
  when its source is unavailable; and
- preservation of unrelated project guidance and other tools' separate
  installations throughout those operations. When configuration is introduced,
  verify its shared use, preservation during ordinary/forced updates, and
  rejection of incompatibility before writes separately in each tool.

| Platform | Evidence for the revised contract |
| --- | --- |
| Codex | Pending. The existing ADR-awareness skill was discovered and applied in this drafting task; no revised installation or update was exercised. |
| Cursor | Pending; no native session run for this revision. |
| Claude Code | Pending; no native session run for this revision. |

Source inspection confirms the gaps above but is not native delivery evidence.
Reuse earlier observations only when their covered inputs and behavior remain
unchanged. This revision changes architecture and planning documents only.

#### Normal client workflow and remaining refinement

1. The client runs `dough-update` in its project through Codex, Cursor, or
   Claude Code. The application determines its installation layout automatically.
2. The updater retrieves the latest release from the Open Dough location saved
   during installation and updates the client project's installed files.
3. The client reviews and commits the resulting changes in its own repository.

The Open Dough repository supplies releases; the client repository receives and
versions the installed files. Choosing an AI application layout or switching
release repositories is not an additional user decision in this workflow.
Do not introduce repository-switching functionality without a concrete need.

No further architectural question from this discussion needs to block the
proposal. Configuration settings and their schema await a concrete use case;
Story 7 now contains the current refinement and planned native evidence.

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

- **Status:** Complete, 2026-09-06. All five slices passed: focused
  success/stale-selection proof and separate native installations in Cursor,
  Codex, and Claude Code. Authorized retries resolved the initial launch blockers;
  unchanged discovery/use/update and failure evidence is retained below. The
  spent plan was dropped after acceptance.
- **Depends on:** A valid tagged source under
  [Accepted ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md).
  Controlled releases can prove this story before backlog item two publishes it.

#### Goal

As a developer adopting Open Dough in a project such as Donut, install and use
its released `dough-update` and `dough-adr-awareness` guidance safely, knowing
which source and release supplied it and retaining my existing project guidance.

The owner's current goal is to reach backlog item four:
[start using Open Dough without overlapping local guidance](SEED-004-extract-and-adopt-project-guidance.md#reconcile-guidance-on-install).
This story supplies the safe installation needed for that outcome. Item four
then proves that Donut's original `adr-awareness` is redundant, removes it, and
repairs its callers while preserving effective ADR use. Removal is not part of
this story's installation success. The first-install journey can reach that
outcome without waiting for the separate update-time replacement story.

#### Scope

- Install into the captured target project for the running tool, starting with
  neither managed Open Dough skill installed for that tool. Other local skills,
  including Donut's `adr-awareness`, and other tools' installations may exist.
- Deliver exactly the current three public files: `dough-update/SKILL.md`,
  `dough-adr-awareness/SKILL.md`, and `dough-adr-awareness/RECOGNITION.md`, plus
  the selected updater's numeric `VERSION` record. Use one shared source with
  only the native destination and invocation adaptations for Codex, Cursor,
  and Claude Code. Do not introduce a general payload catalogue.
- Use the supplied URL's highest numeric `vMAJOR.MINOR.PATCH` release. Pin its
  commit before executing fetched repository code; inspect its installer,
  executable dependencies, and declared payload, then execute that same
  snapshot. A changed selection stops the operation without silently repinning.
  Correct the existing README-linked installation flow only as needed to make
  this behavior usable; broader documentation restructuring is unnecessary.
- Verify all installed payload bytes against the pinned sources before recording
  success. Report the source URL, tag, commit, selected tool and paths, and actual
  outcome. A displayed commit alone does not prove which code executed.
- Preserve the existing repeat/force policy across both managed skills. If either
  already exists, ordinary installation stops before changing either or its
  record. Explicit `--force` authorization replaces the declared managed files
  and record, including local edits, while preserving other guidance.
- Preserve project containment, source files, local ADRs and their callers,
  unrelated guidance, other tools' installations, and home guidance. The internal
  skills and repository acceptance guard remain undistributed. Reuse the
  [completed containment and copy-failure fixes](../quick/012-harden-public-guidance-installation/PLAN.md);
  they are existing safeguards to retain, not unfinished implementation.
- Release/fetch/validation or unsafe-destination failures stop before target
  writes, without a lower-tag or branch fallback. A failure after copying begins
  reports possible incomplete files and leaves the last successful version
  record unchanged or absent. Retain explicit reinstall recovery and cleanup of
  operation-owned temporary work; no automatic rollback or general repair.
- Both installed skills must be discoverable and invocable in fresh native
  sessions of each tool; ADR-awareness follows local accepted decisions and the
  same-release updater reports current without writes. Reuse the already-recorded
  native discovery, use, update, and coexistence observations while their inputs
  and behavior remain unchanged. Verify the corrected installation instructions
  once per tool; reopen only evidence affected by implementation or a concrete
  tool-behavior change. No full lifecycle rerun is required by this story.
- Defer new extraction (including the story-refinement skill borrowed here),
  overlap detection/removal and caller changes, local-difference reconciliation,
  migration automation, global installation, cross-tool synchronization, requested
  versions, inline changelog display, and speculative hardening. Publication and
  real-project self-use remain separate backlog items. Do only the remaining
  work needed for safe adoption; do not add prerequisites to item four.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| Donut-like project has local `adr-awareness` and callers but no selected Open Dough installation; source has `v0.1.9`, `v0.1.10`, and later untagged branch changes | Install from the supplied URL | Only inspected `v0.1.10` repository code executes; all three payload files match that commit and record `0.1.10`. Original guidance, callers, and ADR documents remain intact for item four. |
| Another tool already has its own installation | Install for the running tool and start a fresh native session | Only the selected native root changes. Both installed skills are discovered and invoked; ADR-awareness uses local accepted decisions, and the same-release updater reports current without writes. Retain the earlier native discovery/use/no-op evidence separately for each tool; observe the changed installation path in each. |
| Either managed skill already exists, with local edits | Repeat ordinary installation; then explicitly authorize a forced reinstall | Ordinary installation preserves both skills and the record. Authorized force replaces the declared payload and record only; other local guidance stays intact. |
| Highest release is unusable, selection changes after inspection, or destination would escape the project | Attempt installation | Stops before target writes with a specific explanation, without executing a replacement snapshot or falling back to branch/lower-release content. |
| A real copy or verification failure occurs after writes begin | Attempt installation | Reports possible incomplete files, preserves the previous successful record or creates none, explains explicit reinstall recovery, and cleans its temporary work. |

#### Acceptance and evidence

The owner clarified that established tool experience should reduce repeated
verification. The public installation examples now select and pin with Git,
inspect the full call chain and payload, revalidate, and invoke the direct
installer. Focused success and stale-selection checks pass. Each native tool then
independently followed that corrected journey in a fresh synthetic adopter,
installed the exact pinned payload/record only under its own root, preserved
existing guidance, and cleaned its checkout. Authorized retries resolved the
initial launch blockers. Conclusions about unchanged skills, discovery/use,
updating, repeat/force, and containment remain retained.

| Platform | Earlier native evidence retained | New installation observation |
| --- | --- | --- |
| Codex | Quick 007 slices 11–12: installed updater and fresh ADR use/coexistence; Story 5b: version-aware decisions and no-op; original Quick 008 updater discovery. | Passed: Codex CLI 0.144.1, session `01a0768a-809c-7143-825d-4f7702370197`; inspected pinned direct installation, byte/record verification, preservation, and cleanup. |
| Cursor | Quick 007 slice 14: installed updater, fresh ADR use, and coexistence; Story 5b: version-aware decisions and no-op. These later runs establish stable discovery beyond Quick 008's earlier file read. | Passed: Cursor Agent 2026.09.02-c22c1a3, session `cdbdd351-db77-41d1-9e5f-a13ce5fc774f`; corrected-guide installation, full call-chain inspection, byte/record verification, preservation, and cleanup. |
| Claude Code | Quick 007 slice 16: installed updater, fresh ADR use, and coexistence; Story 5b: version-aware decisions and no-op; original Quick 008 updater discovery. | Passed: Claude Code 2.1.263, session `02b2fb98-25d5-48a5-b10d-e6078773cb13`; full persisted inspection read before direct installation, byte/record verification, preservation, and cleanup. |

[Quick 007](../quick/007-generalize-project-guidance/PLAN.md)'s original native
delivery used default-branch fixtures. Its unchanged discovery/ADR observations
remain reusable; they do not establish the changed release-install route.
The three new native runs used a disposable source with competing tags and a
divergent branch. Each selected annotated `v0.1.10`, peeled commit
`9d5050ea5efe1f65a941777dd2e9c39f74ee6f99`, and inspected the installer, its four
helper/dependency files, and all three payload sources before executing code.
Chronological traces recorded resolve/compare/validate followed by direct
`install.sh`, without `apply`, force, or repinning. Independent checks found
exactly four new files under each selected native root, matching all payload
bytes and VERSION; original guidance/callers and other-platform sentinels were
unchanged, branch-execution markers stayed empty, and each agent's checkout was
absent before fixture teardown. Codex repaired a verification-wrapper shell error
without reinstalling; Claude read the complete persisted inspection output before
execution. All three launchers and final verification completed successfully.

`bash tests/pin-and-inspect.sh`, ShellCheck, shfmt, and Markdown link/diff checks
passed. The existing repeat/force, release validation, internal omission,
containment, and truthful copy-failure evidence was retained because installer,
helper, payload, skill content, and native mappings did not change. Reopen only
claims affected by changed inputs or behavior; no automatic evidence expiry or
full tool-version matrix is introduced. Each platform has its own native evidence.

Detailed tool-event excerpts, transcript digests, and the retired plan remain in
Git history at commit `38f6f36`, retrievable with
`git show 38f6f36:.planning/quick/008-install-latest-release/PLAN.md`.
The story is listed among the [recently completed stories](../PRODUCT-BACKLOG.md#recently-done).

No unresolved product decision blocks execution. Donut's story-refinement and
slice-planning guidance was borrowed in this session from checkout
`43f0dbe0d47840e31f4773723cfed2d663e56bc8`; no borrowed skill was installed or
distributed. Those refinement passes changed only planning files. Subsequent
execution completed the guide correction, focused tests, and three native fixture
installations recorded above; no release or Donut installation/removal occurred.

<a id="detect-installed-version"></a>
<a id="update-only-when-needed"></a>

### 5b. Keep a recorded installation current only when needed

- **Status:** Complete, 2026-09-06. Older, equal, and newer recorded versions
  each produce the correct native outcome independently in Codex, Cursor, and
  Claude Code, executing only the inspected pinned release; the retrospective
  pinned-code execution, temporary-cleanup, and numeric-comparison corrections
  are folded in. The detailed slice plan was dropped after acceptance; see the
  [recently completed stories](../PRODUCT-BACKLOG.md#recently-done) for the evidence
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

<a id="publish-version-aware-updater"></a>

### 5d. Publish extracted guidance and the version-aware updater

- **Status:** Complete 2026-09-06. Preparation, local finalization, exact-tag
  publication, and an independent public fetch verified annotated `v0.2.0` at
  `676188a`. The spent plan was dropped after acceptance.
- **Depends on:** Completed safe installation (5a), recorded updating (5b), and
  [ADR-awareness extraction](SEED-004-extract-and-adopt-project-guidance.md#generalize-project-guidance).
  Their accepted behavior is already available on `main`.

#### Goal

As the Open Dough maintainer, make the accepted installer, version-aware updater,
and ADR-awareness guidance available together in one immutable, fetchable release,
so Open Dough and then Donut can adopt them through the existing installation
and update flows without borrowing public guidance from a sibling checkout.

This first backlog item ends at verified release availability. It enables
[self-use](#adopt-version-aware-updater) and then the third backlog item's
[Donut adoption and redundant-guidance removal](SEED-004-extract-and-adopt-project-guidance.md#reconcile-guidance-on-install).
The release does not yet perform that removal.

#### Scope

- Publish the already-accepted public payload: `dough-update/SKILL.md`,
  `dough-adr-awareness/SKILL.md`, and `dough-adr-awareness/RECOGNITION.md`, with
  the existing installer, its dependencies, and the README-linked safe procedure.
  Keep one shared behavioral source and the existing native destinations for
  Codex, Cursor, and Claude Code. No additional skill or installer capability is
  needed for this publication.
- Use the existing release workflow and
  [Accepted ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  a maintainer-chosen version above the highest published numeric release,
  matching committed `VERSION`, dated changelog entry, and immutable annotated
  `vMAJOR.MINOR.PATCH` tag. Preserve `v0.1.0` and earlier notes. Notes describe
  delivered safe installation, recorded updating, and ADR-awareness; they do not
  claim local-guidance removal or automatic changelog presentation.
- Make that exact release available from the intended source repository through
  ordinary Git publication. A fresh fetch independent of the release worktree
  must resolve the new highest numeric tag to the intended commit and verify
  metadata, the three public sources, and installation dependencies. A local tag,
  pushed branch, or successful push alone does not complete this story.
- Carry forward the completed native acceptance below when its covered behavior
  is unchanged. Check the actual release metadata and fetched snapshot; reopen
  only evidence invalidated by a changed payload, procedure, native mapping, or
  observed defect. Do not add a complete three-tool lifecycle rerun to publication.
- Preserve existing installed copies and unrelated work. The installer continues
  to omit internal skills and the repository acceptance guard; public availability
  of repository sources is distinct from their installation into an adopter.
- Keep real Open Dough adoption in 5e and Donut equivalence assessment, original
  skill removal, caller repair, and native automatic-application proof in SEED-004
  Story 4. Ordinary recorded updating is already included; update-time removal
  of equivalent local guidance remains a separate later story. Do not make that
  later cleanup a prerequisite for the first-install journey.
- Defer further extraction (including the borrowed story-refinement skill),
  local-difference reconciliation, migration automation, inline release notes,
  CI-monitor extraction, release pipelines, registries, and speculative hardening.
  A later accepted replacement capability can use this same release workflow.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| Accepted installer, updater, and ADR-awareness changes are on `main`; `v0.1.0` lacks them | Publish a maintainer-chosen higher release | A fresh fetch of the highest numeric release contains the intended commit, matching version/notes, and accepted three-file payload with its installer. `v0.1.0` and its notes are unchanged. |
| Matching metadata and a tag exist only locally | Inspect availability from the intended repository | Publication remains incomplete until an independent fetch resolves the intended release. A branch push is insufficient. |
| The release is available; Open Dough's installed copies and Donut's original ADR skill still exist | Finish publication | The release is ready for the next adoption story. Existing installations, local skill, callers, and ADR documents are unchanged; no replacement success is claimed. |
| Release preparation would change a public skill or installation procedure covered by earlier acceptance | Assess readiness | Reopen the affected native observations before claiming acceptance; unchanged observations remain reusable. This does not authorize unrelated behavior changes. |

#### Acceptance and evidence

These are retained observations, not new runs in this refinement. Each platform
must retain native discovery, invocation, intended ADR behavior, installation,
recorded updating, and coexistence evidence; file equality alone cannot replace
a missing native observation.

| Platform | Native evidence retained while unchanged | Publication evidence completed |
| --- | --- | --- |
| Codex | [5a](#install-latest-release): native pinned installation; [5b](#update-only-when-needed): older/equal/newer decisions; [Quick 007, slices 11–12](../quick/007-generalize-project-guidance/PLAN.md): updater invocation, fresh ADR discovery/use, and coexistence. | Done: covered source and Codex mapping were unchanged; the public `v0.2.0` complete tree matches the finalized tree. |
| Cursor | [5a](#install-latest-release): native pinned installation; [5b](#update-only-when-needed): older/equal/newer decisions; [Quick 007, slice 14](../quick/007-generalize-project-guidance/PLAN.md): updater invocation, fresh ADR discovery/use, and coexistence. | Done: covered source and Cursor mapping were unchanged; the same independently fetched complete tree preserves it. |
| Claude Code | [5a](#install-latest-release): native pinned installation; [5b](#update-only-when-needed): older/equal/newer decisions; [Quick 007, slice 16](../quick/007-generalize-project-guidance/PLAN.md): updater invocation, fresh ADR discovery/use, and coexistence. | Done: covered source and Claude Code mapping were unchanged; the same independently fetched complete tree preserves it. |

The unchanged internal release workflow has separate native discovery/invocation,
prepare/finalize, and coexistence evidence for all three tools in
[Quick 004](../quick/004-versioned-updates/PLAN.md#native-evidence). One new
publication and fresh-fetch observation can establish release availability for
the common source; it does not claim new native self-use or Donut replacement.

#### Release outcome

The maintainer chose `0.2.0` and the scoped notes. Annotated tag
`426acffe15d6227098d1282a3115690d7569cdf4` peels to
`676188a66504f7dc751e03311f9be5245757b24a`; a fresh repository fetched that
exact highest numeric release from `https://github.com/terryyin/open-dough.git`
and matched complete tree `b1dc25ed4740e1be96ff3871645f3564493dba0d`.
`bash src/install/open-dough-release.sh validate-checkout .`, `git diff --check`,
`npm test`, and `npm run lint` passed; `v0.1.0` and its earlier notes remained
unchanged, and the temporary checkout was removed. Covered public sources and
native mappings were unchanged from accepted baseline `1a673ef`, so their
separate Codex, Cursor, and Claude Code evidence remains valid. The retired plan
is available in Git history at `7a233e8` with
`git show 7a233e8:.planning/quick/010-publish-version-aware-updater/PLAN.md`.
Story 5e owns adoption.

<a id="adopt-version-aware-updater"></a>

### 5e. Adopt and reuse released guidance in Open Dough

- **Status:** Complete 2026-09-06. All nine independent native adoption,
  ADR-use, and no-write observations passed. The released installation is
  committed at `706af65`; detailed sessions and preservation evidence remain in
  [Quick 011](../quick/011-adopt-version-aware-updater/PLAN.md).
- **Depends on:** [Publication (5d)](#publish-version-aware-updater), complete.
- **Effort hypothesis:** S–M, medium confidence; assumes the released flow works
  unchanged and fresh native sessions are available for all three tools.

#### Goal

As the Open Dough maintainer, use the released updater and ADR-awareness in
Open Dough itself through the same project-local flow available to adopters,
so the project benefits from its shared guidance and the queue can move to
[proving Codex use after the completed replacement](SEED-006-extend-adr-guidance-adoption.md#prove-codex-use-after-replacement).

The stopping point is one successful adoption and fresh native reuse in each
supported tool. No waiting period, further extraction, or manufactured source
improvement is needed.

#### Scope

- Adopt the supplied repository URL's latest numeric release into this Open
  Dough worktree, separately for Codex, Cursor, and Claude Code. The published
  baseline is v0.2.0 at 676188a66504f7dc751e03311f9be5245757b24a from
  https://github.com/terryyin/open-dough.git. Resolve and inspect the actual
  latest release at execution; this observation is not a requested-version pin.
- Use the existing installed updater for the observed starting state. All three
  copies already support the complete public payload and missing VERSION
  records. Their existing unknown-record path can install the released
  ADR-awareness files and record the release; no migration code is needed.
  Only a genuinely older updater that refuses the expanded payload needs the
  existing manual bootstrap with explicit overwrite authorization.
- Keep the current three-file payload and selected updater VERSION record.
  Fetch, pin, inspect, apply, and verify through the existing released flow;
  preserve truthful failure reporting and temporary-checkout cleanup. Compare
  installed bytes to the inspected release, not to untagged working-tree source.
  Follow [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md);
  no installer redesign, new version, or release publication is expected.
- In fresh native sessions, discover and invoke the installed dough-update and
  dough-adr-awareness for each tool. The updater reports current without calling
  the installer or writing installed files or records. Use ADR-awareness on the
  real next-story question: which Accepted Open Dough decisions constrain
  adopting released guidance and replacing Donut's original? It must read the
  local index, cite relevant current decisions, and retain human decision
  authority without changing ADRs or implementing the next story.
- Preserve distributable source, ADR documents and their index, internal
  skills, the repository acceptance guard, unrelated guidance, other tools'
  installations and records, and home guidance. Keep shared behavior in the
  existing source with only the established native destination/invocation
  adaptations. A selected tool's adoption does not synchronize other tools.
- Reuse unchanged installation, update-decision, ADR-behavior, and coexistence
  evidence. Add only the real-project adoption and reuse observations missing
  here, separately per tool. Reopen wider checks only if a concrete defect or
  changed input invalidates them; native launch trouble remains pending evidence,
  not a reason to claim success or build new infrastructure.
- Donut installation, equivalence assessment, redundant-file removal, caller
  repair, and proof that architecture-triggered use survives are outside this
  story. Main independently completed the authorized replacement through its
  4A cutoff and split the remaining proof/preservation work into Plans 014–017;
  this execution did not advance those plans.
  Further extraction (including the borrowed refinement skill), inline changelog
  display, automatic migration, rollback, global installation, and speculative
  hardening are deferred. A concrete blocker to safe adoption must be surfaced.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| A selected Open Dough updater matches the released skill, but its VERSION and both ADR-awareness files are absent | Invoke the installed updater with the supplied source URL | The existing unknown-record path installs all three public files from the inspected latest release and records its version. Only the selected installation changes; source and other guidance stay intact. |
| That tool has adopted the release | Start a fresh native session and invoke dough-adr-awareness for the next-story ADR question | The installed skill is discovered and applied, reads Open Dough's ADR index, cites relevant Accepted decisions, and preserves human authority and ADR documents. No sibling checkout supplies the skill. |
| That installation records the same release still selected from the URL | Invoke dough-update in a fresh native session | Reports current, with no installer invocation or installed-file/record writes. An empty Git diff alone does not prove no writes. |
| Another tool already has its own installation and local guidance | Adopt and reuse the release in the selected tool | Its native root is used and the other installation and unrelated guidance remain intact; no compatibility-path fallback or cross-tool overwrite. |

#### Acceptance and evidence

Read-only inspection at worktree base d7d04e9fb4343d7e64dcf30dfc3c46eca66a7126
found the same starting state for all three platforms: dough-update/SKILL.md
byte-matches v0.2.0, its VERSION is absent, and dough-adr-awareness/SKILL.md and
RECOGNITION.md are absent. The installer, helper sources, public payload, README,
and installation guide are unchanged from that release. Reading the existing
updater and helper confirms support for this unknown-record state; this is
static evidence, not a new native installation or update result.

| Platform / native root | Earlier evidence retained while unchanged | New self-use evidence |
| --- | --- | --- |
| Codex / .agents/skills/ | [5a](#install-latest-release): native pinned installation; [5b](#update-only-when-needed): recorded update decisions; [Quick 007, slices 11–12](../quick/007-generalize-project-guidance/PLAN.md): native discovery, invocation, ADR use, and coexistence. | Complete: Codex CLI 0.144.1 independently adopted v0.2.0, used installed ADR-awareness, and twice proved selected-root `apply-skip-equal` with no install or metadata write; the second proof preserved the newer post-main local updater. |
| Cursor / .cursor/skills/ | [5a](#install-latest-release): native pinned installation; [5b](#update-only-when-needed): recorded update decisions; [Quick 007, slice 14](../quick/007-generalize-project-guidance/PLAN.md): native discovery, invocation, ADR use, and coexistence. | Complete: Cursor 3.19.13 independently adopted v0.2.0, used installed ADR-awareness, and twice proved the same selected-root no-write outcome, including after main integration. |
| Claude Code / .claude/skills/ | [5a](#install-latest-release): native pinned installation; [5b](#update-only-when-needed): recorded update decisions; [Quick 007, slice 16](../quick/007-generalize-project-guidance/PLAN.md): native discovery, invocation, ADR use, and coexistence. | Complete: Claude Code 2.1.263 independently adopted v0.2.0, used installed ADR-awareness, and twice proved the same selected-root no-write outcome, including after main integration. |

Every native update resolved `https://github.com/terryyin/open-dough.git` to
`v0.2.0` / `676188a66504f7dc751e03311f9be5245757b24a`, inspected the pinned
helper and complete payload, and used no `--force`. Adoption recorded each
missing VERSION as 0.2.0 and installed both ADR files while preserving all other
surfaces. Fresh ADR sessions cited Accepted ADRs 0000 and 0003, treated Proposed
0001/0002 as non-binding, retained human authority, found no status/filename
conflict, and changed no files. Fresh no-op sessions returned 0 with exactly one
selected-root skip trace, no installer entry, and identical SHA-256,
`mtime_ns`, and `ctime_ns` before/after. After main changed all three local
updater copies, the no-op checks were repeated and proved the release record
preserves that newer project-local behavior. Quick 011 records the exact session
IDs, hashes, and timestamps.

No unresolved product decision was identified in story refinement. The follow-up
slice-planning pass updated the existing plan and preserved its earlier mappings.
Recheck the release and installed state when execution starts. No adoption,
Donut changes, or skill extraction was performed by either planning pass.

<a id="show-update-changelog"></a>

### 6. See the relevant changelog while updating Open Dough

- **Priority:** Deferred until manually reading release notes obstructs real
  updating. Maintaining the release changelog remains required; inline display
  does not block publication or adoption.
- **Status:** Deferred; no execution plan. Refine only when manual release-note
  reading becomes an observed problem in the working client update path.
- **For / why:** A developer wants to understand an update's changes without
  finding and interpreting the source changelog manually.
- **Evaluation:** Native update shows actual applicable release-note content,
  including skipped releases from a recorded baseline, in all three tools.
- **Value / learning:** Puts the already-authored changes into the update
  interaction; learn whether that output is sufficient for real use.
- **Effort hypothesis:** S (30–60 minutes), low confidence; assumes Story 5b
  exposes truthful transitions from a recorded baseline.
- **Depends on:** Story 7's working client updater and released changelog entries.

#### Goal

As an adopting developer, see the changes that apply to my update as part of
running `dough-update`.

#### Scope

- Before applying latest, show the changelog content for every release after
  the installed version through latest. A link alone is insufficient. Exclude
  older and unreleased entries; do not install intermediate versions.
- Unversioned installations remain manual maintenance, outside this presentation
  feature. Do not infer a baseline or reconstruct installation history.
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

<a id="standalone-client-update"></a>

### 7. Release the standalone client installation and update workflow

- **Status:** Re-refined and slice plan refined, 2026-09-07; remaining delivery
  planned, not executed. Current-source inspection:
  `d32a9c5a3c788a1ae23d871173a6eff5fed9a32f`.
- **Plan:** [Quick 019 — standalone client update](../quick/019-standalone-client-update/PLAN.md).

#### Goal

A client developer can install the complete released guidance, use it without
access to Open Dough, and later run `dough-update` with no repeated source URL
to obtain a verified newer release as reviewable project changes. Publish and
self-use this outcome so Donut can retain an adoption next. Donut adoption and
its subsequent meaningful newer-release update remain separate backlog stories.

#### Scope

- Finish the existing installer/updater contract, using one shared behavioral
  source and the existing Codex, Cursor, and Claude Code native destinations.
  The current everyday payload is the two skill files; neither requires a local
  helper script. Keep recognition descriptive and source-only. Do not add
  hypothetical support files or move maintenance helpers into client projects.
- Save the installed version and supplied Open Dough repository location in the
  selected installation. Subsequent ordinary invocations use that location,
  never the client's Git remote. Select and inspect the highest numeric tagged
  release, preserving existing pinning and latest-only behavior.
- Before an ordinary replacement or successful current-version report, compare
  managed files with their recorded release from the saved source. Changed or
  missing managed files, missing/malformed records, or an unavailable/unverifiable
  baseline mean an actionable refusal without target writes. A clean equal
  version remains unwritten; a newer recorded version is never downgraded or
  silently certified if its baseline cannot be verified.
- Explicit force replaces the complete selected payload with the selected latest
  release, including edits or equal/newer recorded versions, without a merge or
  edit-recovery promise. Keep the already-implemented fixed recognition-file
  retirement. Verify installed content before advancing installation metadata;
  report partial replacement truthfully. Preserve unrelated guidance, retained
  project context, client-owned files, and other native installations.
- Existing released updaters have no saved source and a different payload
  contract. Use the documented, inspected, explicitly forced bootstrap with a
  supplied URL once, then a fresh native session. No automatic reconstruction of
  old installation history or arbitrary old payload layouts is required.
- Fetch maintenance/comparison content temporarily and clean it on success and
  failure. Ordinary ADR use must work with that source unavailable. Updater runs
  leave changes for client review and commit; they do not commit or push.
- Publish the verified result with a maintainer-chosen version under Accepted
  ADR 0003, independently fetch and verify it, and self-adopt through the same
  client flow in Open Dough's three native installations.

#### Current scope versus earlier work

[Quick 018](../quick/018-remove-obsolete-adoption-content/PLAN.md) already records
the reusable adoption-procedure removal, two-file payload, fixed recognition
retirement, and native candidate-use/legacy-transition leaves as done. Source
inspection confirms those implementations. Retain that evidence with its tested
revision; do not schedule their implementation again. Its remaining tooling and
historical-document cleanup are not prerequisites for this story.

The updater still asks for a URL, the installer writes only `VERSION`, and
`apply` overwrites older/unknown installations without checking their content.
The equal-version test deliberately accepts an edited file as current. Those
are the remaining changes, together with the new contract's delivery proof,
publication, and self-use. Existing documentation about interim retirement must
be aligned when these paths change. Local tag `v0.2.1` still carries recognition
and reusable adoption procedures; source cleanup is not a published release.

#### Key examples

| ID | Pre-condition → trigger → observable result |
| --- | --- |
| E1 | Clean client with unrelated guidance and other native roots → install from a supplied Open Dough URL → complete two-skill payload plus version/source record in the running tool's root, no recognition or maintenance checkout; fresh native discovery and ADR use work while Open Dough is unavailable. |
| E2 | Unedited recorded release A, meaningful newer release B at its saved source, and a different client Git remote → invoke `dough-update` without a URL → B's complete payload and verified record replace A in only the selected root; the client has a reviewable, uncommitted diff. |
| E3 | Unedited installation equals latest → ordinary update → successful current report with no target writes. A newer installation is preserved without downgrade; unavailable comparison content produces an unsupported-baseline report, not a success claim. |
| E4 | Managed content is edited/missing, or the record/baseline cannot be verified → ordinary update, including at equal version → refusal and unchanged target. No automatic force, restoration, merge, or guessing a source. |
| E5 | Edited, incomplete, equal, or newer installation → explicitly force latest from the known source → complete verified replacement, fixed obsolete recognition removed, unrelated files retained. Fetch/validation failure writes nothing; replacement failure reports incomplete state without claiming success. |
| E6 | A known old updater cannot accept the revised contract or has no saved URL → follow the inspected forced bootstrap with a supplied source, then start a fresh session → the revised updater uses its saved source. This does not replace a local non-Open-Dough practice. |
| E7 | Candidate behavior verified separately in three tools → publish, independently fetch, and self-adopt the release → Donut has an actual release to adopt next; no Donut changes or synthetic second public release are included. |

#### Exclusions and readiness

No configuration file/options, per-skill selection, registry/package mechanism,
generic payload discovery or migration engine, local-practice reconciliation,
merge/rollback/recovery product, automatic changelog presentation, new extraction,
Donut caller edits, or extra public release just to simulate Donut updating.
Preserving client-owned files introduces no configuration feature.

No unresolved story-scope decision blocks planning. Record placement and the
fixed baseline comparison are implementation choices in Quick 019. The actual
release number is a maintainer-supplied input at release preparation, not an
automatically selected bump. This request authorizes refinement and planning;
implementation/publication are future execution work. ADR 0004 remains Proposed;
the owner's recorded direction defines this story, with no Accepted-ADR conflict.

Native proof for the revised version/source/integrity contract remains **pending
separately in Codex, Cursor, and Claude Code**. Prior native cleanup proof does
not establish it. Fixture release transitions are candidate evidence only and
do not count as the later live Donut update. Per-platform acceptance and evidence
ownership are in Quick 019.

## Ordering and Scope Reduction

Stories 1–5e retain completed results. Story 7 is the next useful delivery:
make the smaller installation/update contract available, then complete Donut's
one-time adoption in SEED-006 Story 3. A useful newer release should then be
used in Donut through Story 4 at the first opportunity. Planning extraction can
supply that improvement but must not postpone an already-available update.

Story 6 stays deferred until manual note reading is a real obstacle. One-time
client replacements are not an ongoing updater feature. Preserve the existing
pinning, containment, truthful outcomes, and native coexistence behavior; no
speculative configuration or reconciliation framework is needed.

## Split-plan provenance

Quick 005 received original leaves 8–9, 11–15, 20–25, and 29–31 plus
retrospective corrections. Quick 008 received 1–7 and 17–19;
Quick 010 received 35–36; Quick 011 received 37–42.
Completed and partial status/evidence moved with their leaves. Quick 008 was
subsequently refined to five remaining slices, all now accepted. The spent
Quick 005, Quick 008, and Quick 010 plans were dropped after completion; their
evidence is summarized in Stories 5b, 5a, and 5d above and in the
[recently completed stories](../PRODUCT-BACKLOG.md#recently-done).
Quick 011 is aligned to Story 5e and retains its completed execution evidence.
New delivery plans must be written from the currently selected story rather
than resurrecting unfinished fragments from the earlier combined scope.

## Next refinement

Story 7 has been re-refined against current source and the owner's direction;
[Quick 019](../quick/019-standalone-client-update/PLAN.md) contains its refined
remaining slices. Revisit the story only if execution evidence changes its goal,
examples, or boundary. ADR 0004 remains Proposed. Configuration stays deferred.

## When to Surface

Story 7 is next in the [product backlog](../PRODUCT-BACKLOG.md). Story 6 surfaces
only when its manual-notes trigger occurs. Completed Stories 1–5e remain evidence
for unchanged behavior and are not unfinished delivery work.

## Breadcrumbs

- Owner direction, 2026-09-07: make this seed subject to ADR 0004 once accepted.
  Subsequent feedback broadened it to client installation and update: whole
  payload, standalone supporting files, temporary maintenance support, proposed
  shared configuration, version/source recording, and forced replacement without
  edit-recovery guarantees. The ADR stays concise;
  delivery differences, evidence requirements, and open questions live here.
  Completed scopes and evidence remain unchanged.
- Initial owner direction: project-local supplied-URL installation, an
  unconditional update loop, then versioning; Codex first, followed by Cursor
  and Claude Code. Completed Stories 1–3 preserve that history.
- Owner's versioning requirements: tags, changelog, comparison before update,
  unchanged-version no-op, latest-only updating, release-note
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
- Owner's earlier publication direction, 2026-09-06: create a branch/worktree for the first
  backlog item and borrow Donut's story-refinement skill. Reach the third item,
  safe Donut adoption with redundant ADR-awareness removal, as soon as possible;
  other work can wait. This pass refines 5d only and leaves backlog order intact.
  Borrowed `.agents/skills/story-refinement/SKILL.md` and its planning rule from
  Donut checkout `81081ebae26f58d45def73fbc3a31864ebf2fc22`; no borrowed skill was
  installed, extracted, or distributed.
- Owner's self-use direction, 2026-09-06: create a fresh branch/worktree for
  backlog item one and refine it using Donut's story-refinement skill. Reach item
  two, safe Donut adoption and redundant ADR-awareness removal, as soon as
  possible. This pass refines 5e only and preserves the ordered backlog.
  Borrowed story-refinement and its planning/decomposition rules from Donut
  checkout 96eede10d4755757c53d43741e483c310c98356c; used their workflow here
  without copying, extracting, or distributing the skill.
- [Donut story-decomposition](../../../doughnut/.agents/skills/story-decomposition/SKILL.md)
- [Donut story-refinement](../../../doughnut/.agents/skills/story-refinement/SKILL.md)
- [Donut slice-plan-refinement](../../../doughnut/.agents/skills/slice-plan-refinement/SKILL.md)
- [ADR playbook](../../docs/adrs/README.md)
