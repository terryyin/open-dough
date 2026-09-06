# Publish extracted guidance and the version-aware updater

Status: complete 2026-09-06. Published and independently verified annotated
`v0.2.0` at `676188a66504f7dc751e03311f9be5245757b24a`.

## Source and retained mapping

- [SEED-001, Story 5d](../../seeds/SEED-001-install-and-update-open-dough.md#publish-version-aware-updater)
  is the selected, refined contract.
- This existing plan inherited leaves 35–36 from the larger updater plan, visible
  at `c26c503:.planning/quick/005-update-only-when-needed/PLAN.md`; the split into
  Quick 010 is recorded in commit `46b3185`. Both leaves were planned, with no
  completed release execution to preserve.
- Use the existing [release workflow](../004-versioned-updates/PLAN.md) and
  [Accepted ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).

| Original leaf | Assessment | Updated ownership |
| --- | --- | --- |
| 35. Identify the delivered updater as a new release | Refine: preparation for review and finalization have separate observable stopping points. | 1 prepares truthful metadata; 2 commits/finalizes the immutable local release and retains the pre-tag checks. |
| 36. Make that exact release available from the supplied repository | Ready after specifying the source and fetch comparison. | 3 publishes and independently verifies that same release. |

## Goal and scope

The maintainer can share one immutable release containing the accepted safe
installer, version-aware updater, and ADR-awareness guidance. Completion means
another checkout can fetch the intended latest release and verify its identity
and contents. This enables minimal Open Dough self-use, followed by Donut
adoption and redundant local ADR-awareness removal.

Keep the existing three public files under `src/skills/`, installer and its
`src/install/` dependencies, README-linked safe procedure, and native mappings.
Only release metadata needs product changes. Preserve existing installations,
unrelated work, published tags, and previous notes. The installer continues to
omit internal skills and the repository acceptance guard.

Self-use remains Story 5e; Donut equivalence assessment, original-skill removal,
caller repair, and automatic-application proof remain SEED-004 Story 4. Defer
update-time local-guidance removal, further extraction, difference reconciliation,
migration automation, inline changelog presentation, CI-monitor extraction, and
release infrastructure. There is no installation or migration slice here.

## Current decisions

- Execution workspace: `codex/publish-guidance-refinement` in
  `/Users/terryyin/git/open-dough-publish-guidance`. Accepted behavior baseline:
  `1a673ef`; the subsequent story-refinement commit `76bb719` changed only a seed.
  Reassess affected evidence if product content differs at execution time.
- Intended public source: `https://github.com/terryyin/open-dough.git`; the current
  `origin` push URL is `git@github.com:terryyin/open-dough.git`. Both exposed the
  same original tag before publication; a fresh HTTPS fetch verified the published
  `v0.2.0` object, peel, metadata, and complete tree afterward.
- Reuse the existing internal `release-version` preparation/finalization steps.
  Its original-release warning does not describe the now-completed updater:
  release notes must follow the accepted Story 5b evidence and this story's scope.
  Updating or redistributing that internal skill is not required here.
- Final release notes: safe installation selects and
  inspects the pinned latest numeric release; recorded updates advance older
  installations, leave equal versions unwritten, and preserve newer versions;
  the public payload now includes ADR-awareness and its recognition record for
  Codex, Cursor, and Claude Code. Local-guidance replacement and inline changelog
  display remain future work.
- Preparation is reviewable without tagging. Finalization produces a local tag;
  ordinary Git publication is a separate action. Reuse authorization already
  given during execution; ask only for missing inputs or actions. Do not push a
  branch, move an existing tag, or change another worktree to satisfy this plan.

## Outside-in proof and promise ownership

| Promise / example | Owning slice | Observable proof |
| --- | --- | --- |
| Accepted changes have no new release identity → prepare a chosen higher version → reviewable, truthful metadata | 1 | `VERSION` and dated notes agree; earlier notes are byte-identical; local/remote tag snapshots are unchanged. |
| Public payload and mappings remain the accepted behavior | 1–2 | Compare the candidate with `1a673ef` for `install.sh`, `src/`, `README.md`, `docs/installation-and-updates.md`, and native/internal skill entries; apply the evidence policy below to any difference. |
| Reviewed metadata → finalize → immutable local release | 2 | Annotated tag peels to the intended committed snapshot; metadata validates; old tag objects/peels are unchanged; checks pass. |
| A local tag or branch push alone does not establish availability | 3 | Before publication the new tag is absent remotely; completion requires a fresh fetch from the public URL yielding the intended highest numeric tag, commit, and contents. |
| Publication preserves the accepted three-file payload and executable dependencies | 3 | Compare the fetched release tree with the finalized tree, including metadata, public sources, installer/dependencies, and installation instructions. |
| Internal instructions stay undistributed; existing installations and other work are preserved | 1–3 | Before/after working-tree and installed-path comparison; retained omission/coexistence evidence plus the existing default test suite in 2. Slice 3 invokes no installer and cleans its own temporary checkout on every outcome. |
| Native discovery, invocation, installation, updating, and intended ADR behavior remain supported in each tool | 2–3 | Retain the separate platform evidence below when covered inputs are unchanged; verify the fetched tree in 3. Missing or invalidated native observations stay pending. |

## Ordered slices

### 1. Review accurate metadata for the accepted guidance release
Type: Behavior
Status: complete 2026-09-06
Proof: Inspect the prepared metadata diff against the maintainer's chosen version
and notes, validate the dated entry, and compare previous notes and tag snapshots.

Behavior: The maintainer supplies a higher numeric version and final change
description for the accepted payload → prepare using the existing release
workflow → matching `VERSION` and dated notes are ready for review, with no tag
created or existing release changed.

Capture the candidate commit, current worktree status, existing tag objects/peels,
previous notes, and selected native skill trees. Check published numeric versions
using `git ls-remote --tags` and the existing numeric comparison behavior; reject
an already-used or non-increasing choice before editing metadata. Compare the
covered source paths with `1a673ef` to establish whether earlier acceptance still
applies. Change only `VERSION` and the new changelog entry. Run
`bash src/install/open-dough-release.sh validate-checkout .` and `git diff --check`;
these validate metadata, not tag availability or native behavior.

Sizing: about five minutes of active work, medium confidence after release inputs
are supplied. Network wait is recorded separately. A stopped preparation remains
a useful reviewable result; it does not claim a release.

### 2. Identify the verified candidate with an immutable local tag
Type: Behavior
Status: complete 2026-09-06
Proof: Inspect the annotated tag object, its peeled commit, committed metadata and
tree; compare all pre-existing tags and installation snapshots with slice 1.

Behavior: The prepared metadata is reviewed and finalization is requested → run
the existing checks and finalize → one new immutable local tag identifies the
accepted guidance and matching metadata, with older releases unchanged.

Retain original leaf 35's `npm test` and `npm run lint` before tagging, once for
this candidate. The default test runner passes no `--native` argument: its
fixture checks are not new native proof. Do not launch the optional native runs
unless a covered change invalidates existing evidence. If checks fail, fix only
within the selected scope or record the precise impediment; do not tag a failing
candidate. Reuse passing checks only while their inputs remain unchanged.

Use `release-version` finalization to commit only intended metadata and create
the annotated tag on that committed payload. Verify tag type and peel with Git,
validate the tagged metadata, and compare its public sources/dependencies with
the accepted candidate. Record tag object, commit, version, and check outcomes
here. No additional release scripts, skill adapters, or branch integration are
needed. A local tag leaves remote publication pending.

Sizing: about five minutes of active work, medium confidence with existing tooling.
The inherited test/lint runtime may exceed that estimate; record command/runtime
as the exception. Tool installation or unrelated check failures are not hidden
inside that exception.

### 3. Fetch the published release independently
Type: Behavior
Status: complete 2026-09-06
Proof: A fresh repository, with no local object sharing, fetches from the public
source and matches the intended highest numeric tag, annotated object, peeled
commit, metadata, and finalized tree. Recheck previous published tags unchanged.

Behavior: The verified local release is authorized for publication → push only
its exact tag through ordinary Git and fetch independently → the intended source
exposes that exact release for the next adoption story.

Recheck remote tags and numeric ordering. Publish only
`refs/tags/<chosen-tag>` through the configured origin, with no force or wildcard
push. Create an owned temporary repository and fetch the advertised tag from
`https://github.com/terryyin/open-dough.git`; use Git before running any fetched
code. Verify its object/peel and complete committed tree against slice 2, then
validate the metadata with the already-inspected helper. This comparison includes
all three public files and the installer call chain; no adopter installation or
new native session is needed to establish availability.

Record actual source URL, tag object, peeled commit, version, comparison result,
unchanged old tags, and temporary-checkout cleanup here. A failed push/fetch or
mismatch leaves this slice incomplete; inspect remote state before retrying an
uncertain push, and never move a published tag. Clean only this operation's
temporary directory on success or failure. Successful completion hands the
release identity to Story 5e, not directly to Donut replacement execution.

Sizing: about five minutes of active work, medium confidence; Git network wait
is an external-duration exception, not a reason to add another product slice.

## Per-platform evidence and invalidation

The [story evidence](../../seeds/SEED-001-install-and-update-open-dough.md#publish-version-aware-updater)
remains the acceptance source. These observations predate this planning pass.

| Platform | Retained native evidence | Completed release observation |
| --- | --- | --- |
| Codex | Story 5a pinned installation; Story 5b older/equal/newer updates; Quick 007 slices 11–12 updater invocation, fresh ADR discovery/use, and coexistence; Quick 004 release workflow. | Covered shared source and Codex mapping were unchanged from `1a673ef`; the independently fetched complete release tree matches the finalized tree. |
| Cursor | Story 5a pinned installation; Story 5b older/equal/newer updates; Quick 007 slice 14 updater invocation, fresh ADR discovery/use, and coexistence; Quick 004 release workflow. | Covered shared source and Cursor mapping were unchanged from `1a673ef`; the independently fetched complete release tree matches the finalized tree. |
| Claude Code | Story 5a pinned installation; Story 5b older/equal/newer updates; Quick 007 slice 16 updater invocation, fresh ADR discovery/use, and coexistence; Quick 004 release workflow. | Covered shared source and Claude Code mapping were unchanged from `1a673ef`; the independently fetched complete release tree matches the finalized tree. |

Reuse the completed [extraction/delivery](../007-generalize-project-guidance/PLAN.md)
and [release-tool](../004-versioned-updates/PLAN.md#native-evidence) observations,
and the completed installation hardening. Metadata and planning edits alone do
not invalidate them. Changed guidance, native mappings, installation instructions,
executable dependencies, or an observed defect reopen the affected proof in
slice 2. Record affected platforms and observations here; neither file copying
nor another platform's success fills missing native evidence. Scope expansion
returns to the home story instead of being hidden inside a release slice.

## Execution record

- The maintainer selected `0.2.0` and finalized the scoped notes on 2026-09-06.
  Preparation changed only `VERSION` and the new first `CHANGELOG.md` entry;
  the complete `0.1.0` entry remained byte-identical. Both remote URLs initially
  exposed only annotated `v0.1.0`, tag object
  `9bfbe475786936b26c1edab2d3de496af762a1d7`, peeling to
  `53b6da2eb4583feb5680518fd4d03e2277a28612`.
- `bash src/install/open-dough-release.sh validate-checkout .`,
  `git diff --check`, `npm test`, and `npm run lint` passed on the final candidate.
  The first lint readiness attempt found the worktree had no local ESLint or
  Prettier; `npm ci` restored the locked development dependencies, after which
  lint passed without tracked changes. The final test-plus-lint run took about
  15 seconds. No optional native run was needed.
- The covered product paths were unchanged from accepted baseline `1a673ef`.
  The subsequent `76bb719` changed only the seed, so the separate Codex, Cursor,
  and Claude Code observations remain valid. No adopter installer was invoked;
  repository native mappings and installed copies were not changed, and the
  default tests used and cleaned their own fixtures.
- Release finalization committed only `VERSION` and `CHANGELOG.md` as
  `676188a66504f7dc751e03311f9be5245757b24a`. Annotated `v0.2.0` has tag object
  `426acffe15d6227098d1282a3115690d7569cdf4`, peels to that commit, and has tree
  `b1dc25ed4740e1be96ff3871645f3564493dba0d`. Tagged metadata validation and the
  accepted-path comparison passed; the original tag object and peel were unchanged.
- Publication pushed only `refs/tags/v0.2.0` to `origin`, without force or a
  branch push. A new empty repository fetched all tags from
  `https://github.com/terryyin/open-dough.git` without local object sharing.
  It resolved `v0.2.0` as the highest numeric tag with the exact tag object,
  peeled commit, and complete tree above; fetched metadata validation passed,
  `v0.1.0` remained unchanged, and the operation-owned checkout was removed.
- This completion hands the verified release identity to Story 5e. It does not
  perform Open Dough self-use, Donut skill removal, caller repair, or changelog
  presentation.

## Learnings and readiness

- The split was real: original leaves 35–36 survive in this same plan. There is
  no need for another plan or for repeating completed installation/updater work.
- All preparation assumptions now have concrete checks and an owning slice.
  Reassess at five minutes of active work; at ten, park only attempt-owned work
  and refine the affected leaf unless a recorded test or network wait explains
  the duration. Estimates are hypotheses, not execution-time guarantees.
- Refined with Donut's `slice-plan-refinement` and its planning/decomposition
  rules from checkout `81081ebae26f58d45def73fbc3a31864ebf2fc22`. No skill was
  copied or extracted. Planning checks do not mark any release slice done.
