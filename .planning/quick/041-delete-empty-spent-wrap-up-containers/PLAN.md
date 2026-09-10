# Delete empty spent wrap-up containers

## Source and outcome

Bounded correction from the Quick 039 retrospective of
[SEED-011 Story Wrap-Up](../../seeds/SEED-011-story-wrap-up.md#story-wrap-up).
Provenance: `65349b5`, `ab447d4`, `8ab5e80`, merge `c16d13b`. Current wrap-up
source is unchanged after those commits.

After wrap-up deletes spent files, empty directories named by that spent work
are also gone from the current snapshot. Git recovery of the files is unchanged.

**Excluded:** repeating Quick 039's three-host matrix; changing Git recovery
or follow-up queueing; a deletion framework; wrapping up SEED-011; release.

The seed already requires deleting empty containers. This does not add a new
product promise. [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
edit `src/skills/dough-story-wrap-up/SKILL.md`; do not edit managed installed
copies. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
native Codex owns the previously failing observation; Cursor/Claude may reuse
039 directory-absence while this is the only wrap-up source change and there is
still no wrap-up host adapter. [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
state the deletion rule once in the runtime skill.

## Ordered slices

### 1. Leave no empty spent wrap-up directories
Type: Behavior
Status: planned
Behavior: A completed story's spent plan and evidence files are deleted; native
wrap-up also removes leftover empty directories named by that spent work,
including nested untracked evidence directories, so those paths are absent
rather than empty.
Proof: Independent filesystem check that the spent plan path and its evidence
directory are absent, not merely empty of files. Spent files remain recoverable
with `git show <before-cleanup-commit>:<spent-path>`. Exercise native Codex
(Quick 039 slice 1 left `planning/plans/trim-names/evidence` empty). Reuse Cursor
and Claude 039 directory-absence with an applicability note if wrap-up source
differs only by this instruction. Do not treat “empty or absent of files” as
passing. Record candidate hash, host version, skill use, and before/after
state with the plan.

## Proof ownership

| Promise | Owning slice |
| --- | --- |
| Empty spent directories are absent after wrap-up | 1 |
| Spent files remain Git-recoverable | 1 |
| Other wrap-up promises from Quick 039 | unchanged; do not re-prove |

## Plan assessment

One Behavior slice. The common rule is already wrap-up's deletion completeness;
this names empty containers, which Codex omitted and Cursor/Claude already
removed. No Structure slice. No numeric slice budget was supplied. Native
session duration is the execution concern; resolve it in the slice.

## Current decisions

Keep this plan as the canonical active home. Do not create a seed.
