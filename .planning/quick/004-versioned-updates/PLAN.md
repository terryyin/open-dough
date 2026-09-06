# Create an identifiable Open Dough release with the internal skill

Status: in progress — slices 1–5 done; next is slice 6 (Cursor native release).

Source: [SEED-001, Story 4](../../seeds/SEED-001-install-and-update-open-dough.md#release-tagged-version).
Method: [Donut story-refinement](../../../../doughnut/.agents/skills/story-refinement/SKILL.md),
then [slice-plan-refinement](../../../../doughnut/.agents/skills/slice-plan-refinement/SKILL.md).
Decisions: Accepted ADRs [0000](../../../docs/adrs/0000-use-adrs-accepted.md) and
[0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).

## Goal and scope

The Open Dough maintainer uses one small internal skill to prepare and tag a
chosen release with matching source version, dated changelog, and committed
payload. The skill works natively in Codex, Cursor, and Claude Code. Ordinary
Git publication lets another reader fetch and identify that release.

The outcome remains useful if the later updater and presentation stories are
cancelled. This plan has no installer changes, installed-version records,
version comparisons during update, legacy migration, or automatic changelog
presentation. Current installed copies and public `dough-update` remain intact.
The first release notes describe only delivered behavior, including the existing
unconditional updater; they must not claim the later stories are implemented.

Exclude automatic bump selection, per-skill versions, prereleases, signing,
rollback, release services/pipelines, new global configuration, unrelated
skill distribution, and broad release-management tooling. The internal skill
and the repository acceptance guard are not distributed to adopting projects.

## Current decisions

- Use one canonical `release-version` skill in
  `.agents/skills/release-version/SKILL.md`. Add only a thin native discovery
  entry referring to that source if Cursor or Claude Code needs it. Native
  proof decides whether an entry is necessary. Do not independently maintain
  multiple release procedures or build a general internal-skill installer.
- The maintainer supplies a numeric `MAJOR.MINOR.PATCH` and change description.
  First release is `0.1.0`; a later request must advance existing release
  history. Preserve previous changelog entries. Use a simple consistent dated
  heading such as `## 0.1.0 - 2026-09-06` and tag `v0.1.0`.
- Preparation may stop at reviewable `VERSION` and `CHANGELOG.md` when requested.
  Finalization commits those intended metadata changes and tags the committed
  payload. The intended product changes must already be committed. Do not
  stage/commit unrelated changes, reset them, or move an existing release tag.
- Conflicting or non-increasing versions are rejected before new release
  metadata is written. The same version can be finalized from its prepared
  state if it has not already been released. Preparation is not a release and
  must not be mistaken for an existing tag when determining the prior release.
- Published tags are immutable. Use ordinary non-force Git publication, which
  must not overwrite a conflicting remote tag. Report actual local/published
  state; do not claim publication merely because a local tag was created.
- Stay with skill instructions over Git and Markdown. No helper, dependency,
  registry, or CI publication job is planned. If a concrete leaf cannot work
  without a helper, revisit that leaf's sizing before adding one.
- Release creation is the authorized future behavior when this plan is selected
  for execution. This planning turn creates no skill, source release metadata,
  commit, tag, or publication. Execution follows the session's authorization
  and ordinary repository delivery workflow; no new confirmation ritual is
  designed into the skill.

## Outside-in proof and execution context

The stable boundary is a native invocation of `release-version` with a chosen
version and description, then inspection of the resulting Git release. Use a
disposable Open Dough checkout for leaves 1–7, with the candidate skill in its
native discovery path and all three existing updater installations present.
Commit the fixture's intended payload before asking for release metadata.
Fixture tags are not public product releases.

For native observations record tool/version, session or conversation ID,
invocation, loaded entry and canonical source, relevant before/after file and
Git identity, and the result. Capture unrelated staged/unstaged sentinels,
installed updater copies, and home guidance. Distinguish runtime-owned changes
from release-skill writes. Never infer discovery from a file copy alone.

The current installer copies only the selected public `SKILL.md`; its shared
source and platform mapping need no change for this story. Existing installer
checks cover all three paths and unrelated-skill preservation. In leaf 1,
exercise that real installer with the candidate internal skill present in the
source: all three adopter outputs still contain only the existing managed
payload and omit the internal skill/guard. Native updater behavior remains
unchanged; reuse earlier proof only for that unchanged boundary and identify
its source in the execution record. If new native discovery changes invalidate
it, keep the affected check pending and resolve it within the owning leaf.

Use native fixture evidence for this instruction-driven workflow. Do not create
an imitation release-script test suite or a helper merely to unit-test prose.
Keep the existing focused installer regression green. For the complete release
candidate, run the repository's normal `npm test`, `npm run lint`, and
`git diff --check` once before real tagging; repeat only for relevant changes
or failures. Align the small maintainer usage documentation and initial notes
with actual release behavior; leave existing updater instructions accurate.

## Refinement of the reused plan

The original aggregate 27-leaf plan has been split by stakeholder outcome.
Original 12–15 and the initial-release portion of 24 map here. Updater work is
in [Story 5's plan](../005-update-only-when-needed/PLAN.md); note presentation
is in [Story 6's plan](../006-show-update-changelog/PLAN.md). Both later plans
require story refinement, plan update, and slice-plan refinement before direct
execution. The seed maps every original leaf, including split responsibilities.

This refinement edits the same plan file. No original leaf was completed, so
there is no completed history or runtime-overrun evidence to preserve.

| Initially mapped leaf | Classification | Replacement and reason |
| --- | --- | --- |
| 1: first-release preparation (old 12) | Ready | Leaf 1: one native preparation result. Supporting canonical instructions and the unchanged-installer regression belong to it. |
| 2: tag success plus version refusals (old 13) | Refine | Leaves 2, 4, 5: successful finalization, existing-tag refusal, and unused-but-older version refusal have distinct triggers and observations. |
| 3: later release in Cursor (old 14) | Refine | Move first implementation of history-preserving preparation to leaf 3; leaf 6 then checks already-working shared behavior in Cursor with only minimal discovery adaptation. |
| 4: later release in Claude Code (old 15) | Ready after leaf 3 | Leaf 7 reuses implemented preparation/finalization; one native release result. |
| 5: first real release and publication (old 24) | Refine | Leaves 8–9 separate real maintainer self-use from external availability. Neither waits for the updater or notes-presentation stories. |

There is no selected-story scope change during this slice-refinement pass.
The parent split and first-story refinement were completed before this pass.

## Ordered slices

Each leaf is one Behavior with a primary outside-in proof loop. No standalone
Structure is needed. Tests, supporting files, documentation, and cleanup stay
with the behavior they serve; do not create preparation-only technical layers.

### 1. Prepare the first release in Codex

Type: Behavior
Status: done

Behavior: Given a committed usable payload and no release history, ask the
internal skill in Codex to prepare `0.1.0` with a change description. It leaves
matching source version and dated notes ready for review, without claiming a tag.

Proof: A fresh native `$release-version` preparation request in the disposable
checkout loads the canonical skill and produces only the intended metadata.
Inspect `VERSION`, the date/entry content, Git diff, absent tag, and unrelated
sentinels. Include the existing real-installer regression and candidate-source
output enumeration described above to establish internal-only distribution.

### 2. Finalize a prepared release in Codex

Type: Behavior
Status: done

Behavior: Given the prepared metadata and committed payload, ask the skill to
finalize that same release. Its matching tag identifies the committed payload
and metadata without including unrelated work.

Proof: One native finalization invocation creates the intended metadata commit
and `v0.1.0`; inspect the tag's commit, version/notes at that commit, and diff
against the prior payload. An unrelated staged sentinel is not in the new
commit, and unrelated staged/unstaged work remains available. Report local tag
success without claiming remote publication.

### 3. Prepare the next release while retaining its history

Type: Behavior
Status: done

Behavior: Given a released `0.1.0`, request preparation of a chosen higher
version with a new change description. New version/dated notes agree while the
previous release entry remains unchanged.

Proof: One native Codex preparation invocation for `0.1.1` changes the intended
metadata, preserves the exact earlier entry, and leaves `v0.1.0` unchanged.
This leaf implements the later-release variation before testing full reuse in
the other tools. Finalization uses leaf 2's already-proven behavior.

### 4. Refuse to reuse an existing release tag

Type: Behavior
Status: done

Behavior: Given an existing release tag, ask the skill to release that version
again with different notes. It explains the conflict without changing the tag
or preparing misleading replacement metadata.

Proof: One native fixture invocation for the existing version. The before/after
tag commit and metadata bytes are identical; output reports refusal rather
than a new release. No force-tag, reset, or unrelated write appears in the trace.

### 5. Refuse an unused version below the latest release

Type: Behavior
Status: done

Behavior: Given latest released `0.2.0` but no `v0.1.9` tag, request `0.1.9`.
The skill rejects the non-increasing release even though that tag is unused.

Proof: One native fixture request reports the numeric ordering problem, leaves
metadata/history unchanged, and creates no tag. This covers the distinct policy
that cannot be inferred from the existing-tag refusal in leaf 4.

### 6. Produce a release through Cursor's native internal skill

Type: Behavior
Status: planned

Behavior: Given the already-working shared skill and an earlier release, invoke
`/release-version` in Cursor to produce a chosen higher tagged release.

Proof: One fresh native release invocation loads the canonical behavior through
its actual selected entry, retains earlier notes, and creates matching committed
version/notes/tag. Check installed updater and unrelated/home sentinels. Add
only a thin discovery entry if needed; do not reimplement the release logic.

### 7. Produce a release through Claude Code's native internal skill

Type: Behavior
Status: planned

Behavior: Given the same shared skill and earlier release, invoke
`/release-version` in Claude Code to produce a chosen higher tagged release.

Proof: One fresh native invocation records its selected entry/canonical source
and the matching committed release with retained history and preserved other
guidance. Reuse shared behavior, adding only a minimal native entry if necessary.

### 8. Create the first real Open Dough release

Type: Behavior
Status: planned

Behavior: Given the complete, verified internal workflow and committed actual
payload, the maintainer uses the skill in Open Dough itself to create its first
real tagged release with truthful notes about delivered behavior.

Proof: After the candidate checks and fixture evidence, one native release
invocation prepares/finalizes the real `0.1.0`. Inspect the actual tag, source
version, dated notes, and scoped metadata commit. Existing installed copies and
installer/updater source remain unchanged. The notes and maintainer usage do
not claim version-aware updates or automatic update-note display. If release
history changed before execution, reconcile the intended next version first;
do not recreate an already published first version.

### 9. Make the real release available through ordinary Git

Type: Behavior
Status: planned

Behavior: Given the verified local release, ordinary Git publication makes its
commit and tag available for another reader to fetch and identify.

Proof: Publish the intended commit/tag without force, then fetch from that
source into a fresh checkout and compare the tag's commit, source version, and
changelog content. A remote conflict is a failed publication, never permission
to move the tag. This leaf does not add GitHub Release objects or a pipeline.

## Promise-to-proof ownership

| First-story promise | Owning leaf and observable evidence |
| --- | --- |
| Chosen first version and dated human-readable notes; reviewable preparation | 1: native prepared metadata and absence of a claimed tag |
| Tag matches committed source identity and payload; preparation can finalize as the same version | 2: tag/commit content inspection |
| Preserve previous release notes when a higher version is chosen | 3; native reuse in 6–7 |
| No reused/moved published version tags | 4: refusal and unchanged tag; 9: non-force publication and truthful outcome |
| Next version is numerically greater, not merely unused | 5: unused older version is rejected |
| Native discovery, invocation, and intended behavior in Codex/Cursor/Claude Code | Codex 1–3, Cursor 6, Claude Code 7; record selected path and result separately |
| One shared source with minimal adaptation | 1 creates canonical instructions; 6–7 observe actual loading and review any thin entry |
| Unrelated work and other installed/home guidance survive; commits include only intended metadata | 1–7 snapshots; 2 inspects committed paths with staged and unstaged sentinels |
| Internal skill/guard absent from adopting projects; existing updater/install behavior retained | 1: real-installer output and unchanged source; 6–8: coexistence and unchanged updater copies; identify any reused native baseline explicitly |
| First real source version/tag/notes are useful without later stories | 8: real native self-use and truthful description of current behavior |
| Publication actually exposes the intended release | 9: independent fresh fetch matches local tag and metadata |
| No extra release framework, automatic bump selection, or distribution changes | 1–8: review candidate skill/diff, maintainer-supplied versions, and actual installed output |

## Native evidence

| Platform | Discovery and invocation | Release behavior and coexistence |
| --- | --- | --- |
| Codex | Done — 1–5 (`$release-version` loaded `.agents/skills/release-version/SKILL.md`; prepare 0.1.0 `01a074f8-f035-7752-b631-355e0401ee92`, finalize `01a07502-cbb1-7f21-a713-7e9d86de3613`, prepare 0.1.1 `01a07506-e535-7de3-9bfd-60838e5533f1`, refuse existing 0.1.0 `01a0750b-5dba-7e22-9c7c-9b8a4b686c88`, refuse unused 0.1.9 `01a0750f-d6a4-7911-a7e2-0ede4c930bc6`, CLI 0.153.4) | Done — 2–5 (later prepare, existing-tag refusal, unused-older refusal) |
| Cursor | Pending — 6 | Pending — 6 |
| Claude Code | Pending — 7 | Pending — 7 |

Real maintainer self-use: pending — 8. Published release identity: pending — 9.
Adopter output exclusion/regression: done — 1 (`bash tests/install-omits-internal.sh` and `bash tests/install.sh`). Record evidence with these
rows during execution. Native success in one tool or copied files cannot fill
another tool's row. Missing verification remains pending under the repository's
[acceptance guard](../../../AGENTS.md).

## Sizing, stopping points, and learnings

The five mapped draft leaves were classified above and refined into nine
Behavior leaves. Each now has one primary result and proof loop. Later-release
preparation is implemented before platform reuse; the real release and its
publication are independently observable stopping points. No ordinary
implementation step has a known reason to exceed the five-minute target.

Sizing remains a hypothesis, including focused verification and local cleanup.
One native session or a remote fetch may itself take longer; that runtime is
an explicit exception only when it explains the elapsed time, not permission
to bundle more implementation. At five minutes, inspect hidden work and split
if necessary. At ten, safely park only attempt-owned WIP and refine this same
plan again unless a single focused test's runtime accounts for the delay.

Execution can start with leaf 1 when this story is selected for implementation.
It must not automatically continue into the two non-executable later plans.
Keep required checks green at each leaf, preserve user changes, and apply the
execution workflow's review/delivery gates when execution is requested. No
commits, tags, or product changes were made during this planning work.

The inherited aggregate plan had no completed slices and no measured overrun.
Its two sizing errors were bundling tag success/refusal and combining real
release creation with publication; both are now split. The selected story no
longer waits for any installer/updater or update-presentation work. Keep this
compact evidence and any new learning as execution proceeds; reduce completed
story detail to goal/scope only after its enduring behavior is documented.

## Learnings

- Native Codex proof used `/Applications/ChatGPT.app/Contents/Resources/codex`
  0.153.4. PATH `codex` 0.144.1 remains too old (same as Story 1).
- `$release-version` loaded the canonical `.agents/skills/release-version/SKILL.md`
  with no Cursor/Claude discovery copy. Leaves 6–7 still need their own native
  observations.
- Fixture prepare wrote `VERSION` `0.1.0` and `## 0.1.0 - 2026-09-06` without a
  tag or commit. Codex also added a `# Changelog` title. Unrelated staged and
  unstaged sentinels and home `~/.codex/skills` / `~/.agents` checksums were
  unchanged. Main repo still has no `VERSION`, `CHANGELOG.md`, or `v*` tag.
- macOS `/tmp` vs `/private/tmp` can reject one `apply_patch`; writes to the
  `-C` fixture path succeeded. Canonical skill already describes finalize, so
  leaf 2 is native finalization proof rather than a second skill rewrite.
- Leaf 2: `$release-version finalize 0.1.0` created annotated local `v0.1.0` on
  `80ac178` (`Release 0.1.0`; files `VERSION`, `CHANGELOG.md` only). Staged and
  unstaged sentinels survived and were not in the tag commit. Output reported
  local finalize and no push. `-s workspace-write` was enough for prepare
  file writes; commit+tag needed a sandbox that can write `.git` (`danger-full-access`
  in the fixture after workspace-write hit `.git/index.lock`).
- Leaf 3: `$release-version prepare 0.1.1` after fixture `v0.1.0` on `4557674`
  wrote `VERSION` `0.1.1` and `## 0.1.1 - 2026-09-06`, left the 0.1.0 changelog
  entry bytes unchanged (sha256 `9fda157d…`), and did not move `v0.1.0` or
  create `v0.1.1` or a commit.
- Leaf 4: `$release-version prepare 0.1.0` with different notes refused because
  `v0.1.0` already existed. Tag peel `7df8e0a` / object `9e443c9` and
  VERSION/CHANGELOG bytes were unchanged; trace had no force-tag, reset, or
  metadata write.
- Leaf 5: `$release-version prepare 0.1.9` with latest fixture `v0.2.0` and no
  `v0.1.9` refused for numeric ordering (not an existing-tag conflict). HEAD
  `b4855ab`, tag object `0460428`, and VERSION/CHANGELOG bytes unchanged.
