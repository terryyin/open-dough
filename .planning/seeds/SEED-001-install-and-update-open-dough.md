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

Priority reconsidered 2026-09-06: finish safe installation, publish the already
extracted ADR-awareness skill, and install/use it in Open Dough itself through
the same flow as any other target project. Then add replacement of Donut's
redundant local guidance under SEED-004 Story 4. More extraction and inline changelog display do not block that first
replacement. Rare unversioned installations are handled manually; no migration
feature is planned. The
[product backlog](../PRODUCT-BACKLOG.md) records this delivery order.

Current refinement direction, 2026-09-06: safe installation is complete. Reach
the third backlog item, Donut adoption with redundant ADR-awareness removal, as
soon as possible. Keep publication and self-use to their smallest useful
outcomes; postpone work that does not enable that adoption.

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

- **Status:** Complete 2026-09-06. The [plan](../quick/010-publish-version-aware-updater/PLAN.md)
  records preparation, local finalization, exact-tag publication, and an
  independent public fetch of annotated `v0.2.0` at `676188a`.
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
and matched its complete tree. Story 5e owns adoption.

<a id="adopt-version-aware-updater"></a>

### 5e. Adopt and reuse released guidance in Open Dough

- **Status:** Candidate split; refine before updating or refining its provisional plan.
- **For / why:** The maintainer needs real self-use evidence of the same released
  installation flow used by other projects; this is adoption, not a separate
  installer implementation.
- **Evaluation:** Open Dough's three native installations adopt the published
  release separately; each natively discovers and uses `dough-adr-awareness` on
  real ADR-relevant work, and a fresh updater invocation reports current without
  writes. Further skill extractions are not required to complete this story.
  Handle any actual unversioned starting state manually using explicit reinstall;
  do not add an automated migration feature.
- **Value / learning:** Closes the bootstrap loop and tests coexistence in daily use.
- **Effort hypothesis:** M, medium confidence once the release exists.
  **Depends on:** Story 5d. Provisional
  [plan](../quick/011-adopt-version-aware-updater/PLAN.md), not executable.

<a id="show-update-changelog"></a>

### 6. See the relevant changelog while updating Open Dough

- **Priority:** Deferred until manually reading release notes obstructs real
  updating. Maintaining the release changelog remains required; inline display
  does not block publication or adoption.
- **Status:** Unfinished; candidate boundary only. The
  [third plan](../quick/006-show-update-changelog/PLAN.md) is retained planning
  material, **not for direct execution**. Refine this story, update that plan,
  then refine its slices before execution.
- **For / why:** A developer wants to understand an update's changes without
  finding and interpreting the source changelog manually.
- **Evaluation:** Native update shows actual applicable release-note content,
  including skipped releases from a recorded baseline, in all three tools.
- **Value / learning:** Puts the already-authored changes into the update
  interaction; learn whether that output is sufficient for real use.
- **Effort hypothesis:** S (30–60 minutes), low confidence; assumes Story 5b
  exposes truthful transitions from a recorded baseline.
- **Depends on:** Stories 5b and 5d and released changelog entries.

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

## Ordering and Scope Reduction

Safe installation (5a) is complete. Remaining delivery order: publish the accepted
ADR-awareness payload and updater (5d), then install and use that release in
Open Dough (5e). Self-adoption uses the same project-local flow as other targets;
it is a real-use check, not another installation mechanism. After that, implement
and deliver first-install replacement in Donut under SEED-004 Story 4. Publish
any accepted replacement changes with the existing release workflow before
claiming they are available through released installation.

The two new extraction stories and update-time replacement do not block
first-install ADR-awareness replacement. This sequence replaces the earlier
proposal to start replacement development ahead of installation and self-use.

Story 4, safe installation (5a), and recorded updating (5b) are complete; retain their evidence for
unchanged behavior. All affected behavior still requires separate native
evidence in Codex, Cursor, and Claude Code.

Keep inline notes (6) lower in priority until manual reading becomes a pain.
Handle the limited unversioned installations manually; no migration story or
feature is planned. Neither blocks fresh-install and recorded-update behavior. Preserve pinning, truthful outcomes,
project containment, and existing repeat protection on the main path. Broader
recovery and conflict handling wait for a concrete need; the reproduced
containment defect linked from Story 5a already constitutes such evidence.

## Split-plan provenance

Quick 005 received original leaves 8–9, 11–15, 20–25, and 29–31 plus
retrospective corrections. Quick 008 received 1–7 and 17–19;
Quick 010 received 35–36; Quick 011 received 37–42.
Completed and partial status/evidence moved with their leaves. Quick 008 was
subsequently refined to five remaining slices, all now accepted. The spent
Quick 005 and Quick 008 plans were dropped after completion; their evidence is
summarized in Stories 5b and 5a above and in the
[recently completed stories](../PRODUCT-BACKLOG.md#recently-done).
Quick 010 now has three refined release slices mapped to original leaves 35–36.
The other unfinished split plans remain explicitly not executable until their
stories and slices are refined again.

## Open Decisions

- Story 5a is complete with all five slices accepted and earlier evidence retained.
  Story 5d is complete with independently verified public `v0.2.0`. Story 5e
  needs refinement for the smallest real self-use check.
  Story 6 needs refinement when manual release-note reading becomes a pain;
  local-edit conflict handling stays outside.

## When to Surface

The [product backlog](../PRODUCT-BACKLOG.md) now starts with Story 5e before
SEED-004's first ADR-awareness replacement and places Story 6 later.
[Recently completed stories](../PRODUCT-BACKLOG.md#recently-done) retains Stories 1–4, 5a, 5b, and 5d. Execute only a selected story with a
refined plan; do not chain the provisional plans as one delivery.

## Breadcrumbs

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
- Owner's current direction, 2026-09-06: create a branch/worktree for the first
  backlog item and borrow Donut's story-refinement skill. Reach the third item,
  safe Donut adoption with redundant ADR-awareness removal, as soon as possible;
  other work can wait. This pass refines 5d only and leaves backlog order intact.
  Borrowed `.agents/skills/story-refinement/SKILL.md` and its planning rule from
  Donut checkout `81081ebae26f58d45def73fbc3a31864ebf2fc22`; no borrowed skill was
  installed, extracted, or distributed.
- [Donut story-decomposition](../../../doughnut/.agents/skills/story-decomposition/SKILL.md)
- [Donut story-refinement](../../../doughnut/.agents/skills/story-refinement/SKILL.md)
- [Donut slice-plan-refinement](../../../doughnut/.agents/skills/slice-plan-refinement/SKILL.md)
- [ADR playbook](../../docs/adrs/README.md)
