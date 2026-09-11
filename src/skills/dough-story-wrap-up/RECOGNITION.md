# Recognition: dough-story-wrap-up

Review: source authoring walkthrough for available-context closure; native
acceptance of the revised flow remains pending in SEED-010 Story 2

## Original clues

- Working name: Story Wrap-Up
- Public Open Dough skill under `src/skills/dough-story-wrap-up/`
- Human direction: delete spent plan/story history from the current snapshot;
  Git owns recovery; maintained product content carries lasting knowledge

## Purpose

Close one completed feature story or bounded retrospective correction from
available execution context so the current project keeps useful product
knowledge and no spent source or plan history, while Git can recover what was
removed. Retrospective advice is optional input to those same closure
actions.

## Triggers

- wrap up a story
- wrap up a bounded correction
- close a completed story
- delete spent plan and execution history

## Distinguishing behavior

- Establishes execution completion from the selected work and available
  evidence: planned work when every slice is done; planless feature work from
  its story, changes, and execution results. Incomplete implementation stays intact.
- Treats retrospective advice as optional. Present advice is applied under
  existing authority. Absent or empty advice uses the same ordinary closure
  flow. Wrap-up does not require a retrospective-completion record.
- Commits uncommitted spent history with the project's Git conventions before
  deleting the only copy; refuses closure when recovery cannot be resolved.
- Assimilates lasting knowledge into maintained product content without
  execution narration or judgments. A spent-context-only product fact is
  written into maintained documentation even when tests already exercise
  related behavior.
- Deletes spent plan (when one exists), story, proof, **Taken**, queue, and
  finished-history entries, related log occurrences, and incoming historical
  links without archives or tombstones. Execution may retain a plan after
  slices finish; wrap-up still deletes that spent plan.
- Preserves sibling stories, unrelated log text, human notes, and ambiguous
  records that cannot be attributed to the selected execution.
- Puts an existing follow-up plan first through one canonical active home:
  its supplied feature story or, for a seedless correction, the plan itself.
  Presence of that plan is enough, including when retrospective advice is
  absent.
- Closes a completed seedless correction by plan identity after Git recovery,
  while leaving unfinished corrections intact. Planless feature work does not
  invent a planless correction format.
- Applies authorized product-review advice with optional human input; human
  input wins; unresolved choices are reported.

## Client project context

The executing project must supply repository root, selected feature-story or
bounded-correction identity, and Git conventions for a recoverable commit.
Planned work also needs plan location and status vocabulary. Planless feature
work needs the story, changes, and execution results instead of a plan.
Seed conventions apply only to feature stories. Backlog path is required only
when a **Taken** or queue entry points at the selected work. Retrospective
advice is used when present and is not a required completion record.

## Differences that rule out replacement

This is public source, not a rewrite of an installed skill. It does not
replace `dough-execute-plan`, `dough-execution-retrospective`, or standalone
`dough-product-backlog` maintenance. Those participants keep their review and
delivery behavior; wrap-up owns later closure. Retrospective output is advice
to wrap-up, not a wrap-up gate.

Under ADR 0003 the skill is in the 0.3.6 payload; later source clarifications
remain Proposed until a later release. Under ADR 0005 spent proof is deleted
at wrap-up, not retained for later judgment. Under ADR 0006 the runtime skill
addresses the agent in this project and keeps maintainer analysis in this
record.

## Validation needed

Native wrap-up acceptance on Codex, Cursor, and Claude Code is recorded for
the earlier marker-required flow. Recover that plan and evidence from Git when
a later source change needs a new native judgment. Do not treat the v0.3.6
release exception as passing proof of this revised flow. SEED-010 Story 2
owns native acceptance for planned and planless execution context, optional
retrospective advice with absent/empty fallback, and preserved active-work and
recovery behavior.

The 2026-09-10 source review confirmed that the existing active-entry removal
also names **Taken** entries. The human explicitly skipped new native acceptance
for that wording extension.

Installed managed copies under `.agents/` and `.claude/` stay at the released
version; this source change is not hand-synchronized.

## Quick 039 local behavior evidence

Walked the wrap-up invocation boundary on 2026-09-11 in worktree
`worktree-quick-039-wrap-up-from-available-context`. This is local source-
guidance authoring evidence under AGENTS.md, not native installed-host
acceptance. No actual story cleanup was performed.

Shared fixture (held constant except where a variant names a change): a
completed feature story "Export the nightly billing CSV" in
`seeds/SEED-EXPORT.md`; maintained product fact "Nightly billing export writes
one CSV of posted invoices" already in `docs/PRODUCT.md`; recoverable Git
revision `abc1234` containing the spent plan, story, and Taken entry; queue
entry under **Taken** linking that story; sibling story "Retry failed exports"
left untouched. Bounded-correction identity continues to require the
correction-input contract in an existing plan.

### Invocation context

Description and body now apply when the coordinator is ready to close selected
completed work. They no longer require a finished retrospective. Triggers name
wrap-up, close completed work, and delete spent history without an after-
retrospective qualifier.

### Required context

Planned work still needs plan identity and status. Planless feature work
needs the story, changes, and execution results; a missing plan is not a
closure block for that path. A bounded correction still stops when a required
correction-input field is missing. Missing Git recovery conventions leave
material intact. Retrospective advice is optional.

### Useful outcome

Each variant inspects closure decisions and proposed edits. Unrelated sibling
work, the maintained product fact, and Git recovery stay preserved.

#### Variant A — completed plan and available review advice

Input: completed plan with every slice done; review advice to assimilate the
CSV column order already stated in the spent plan and to leave queue order
otherwise unchanged.

Closure: execution complete from the plan. Authorized applicable advice is
applied. The product fact is already in `docs/PRODUCT.md`, so no extra
product sentence is invented. Recovery commit first, then delete spent plan,
story section, and Taken entry.

#### Variant B — completed planless story with changes and execution results

Input: no plan. Story, delivered CSV-export change, and execution results
showing the promised file is written.

Closure: completion judged from that supplied context. Recovery uses the
current revision of those files. Spent story and Taken entry are deleted after
recovery. No plan path is invented.

#### Variant C — retrospective output absent

Input: same completed planned story as A, no review artifact.

Closure: ordinary closure. Known product fact remains in maintained docs.
Selected Taken entry is removed after recovery. No review is launched.

#### Variant D — empty retrospective result

Input: review finished with nothing to act on.

Closure: same ordinary closure as C. Empty advice changes nothing beyond
supported closure and follow-up actions.

#### Variant E — absent review with existing active correction plan

Input: completed predecessor; existing follow-up plan
`plans/002-retry-failed-export/PLAN.md` satisfying the correction-input
contract; no retrospective advice.

Closure: queue that plan's canonical home first before predecessor cleanup.
Include the uncommitted follow-up and queue edit in the before-cleanup
revision. Preserve the follow-up plan. Delete only the predecessor's spent
history.

#### Variant F — incomplete implementation

Input: planned work with an in-progress slice.

Closure: refuse. Source, plan, Taken entry, and sibling story remain intact.
Report identifies unfinished implementation. No
`## STORY WRAP-UP COMPLETE`.

#### Variant G — unresolved attribution or Git recovery

Input: a process-log issue that might belong to this execution or to a
sibling; or commit conventions cannot be resolved.

Closure: affected material remains intact. Report names the actual gap.
No deletion of the ambiguous log issue or of spent history whose only copy
cannot be recovered.

#### Variant H — current workflow wording

Input: the changed description, body, examples, and linked references.

Result: the skill states the current closure flow positively. The
retrospective-completion prerequisite, dedicated completion-record lookup,
and "unfinished because review is missing" gate are deleted. Linked
`dough-execution-retrospective`, execute-plan, planning cleanup, and
product-backlog guidance still separate review, delivery, and closure; they
do not restore the removed gate. Installed managed copies were not edited.

### Candidate revision

`src/skills/dough-story-wrap-up/SKILL.md` and this record. No contradictory
edit was required in retrospective, execute-plan, planning cleanup, or
product-backlog source.

### Limitations

This walkthrough inspects closure decisions against the updated source. It
does not run wrap-up on SEED-010 Story 7, delete this plan, or prove native
host behavior. Story 2 retains that acceptance.

## Quick 042 closure durability evidence

Walked the proposed source guidance on 2026-09-11 in disposable local Git
repositories. This is the representative behavior review required by
`AGENTS.md`, not native Codex, Cursor, or Claude Code acceptance.

### Input

The primary fixture had a completed planned story, a sibling story, a Taken
entry, maintained product documentation, execution mode `worktree`, and the
recorded originating checkout, execution checkout/branch, and integration
target. `DearDough.md` began with unrelated `DD-001`; selected-execution
`DD-002` was then added as an uncommitted retrospective occurrence. A second
fixture selected `direct-current-branch` mode. Refusal fixtures varied only
completion (`Slice 1: in-progress`) or attribution (log prose that might belong
to the selected or a sibling execution).

### Actions and observations

In `/private/tmp/dough-wrap-up-slice3.Mdhgrm`, the literal sequence
`git status --short`, `git diff -- DearDough.md`,
`git add DearDough.md`, and
`git commit -m "Record selected retrospective finding"` produced
before-cleanup commit `a304fb8a03a5e459a37de001a61fbe5a74c9ae18`.
`git show a304fb8a03a5e459a37de001a61fbe5a74c9ae18:DearDough.md`
showed both unrelated `DD-001` and selected `DD-002`. The fixture retained the
resolved mode and checkout/branch/target values outside the deleted plan for
the remainder of the walkthrough.

After applying the existing spent-history removals, the literal commands
`git status --short`, `git diff -- .planning/PRODUCT-BACKLOG.md
.planning/seeds/SEED.md DearDough.md
.planning/quick/001-selected/PLAN.md`,
`git add .planning/PRODUCT-BACKLOG.md .planning/seeds/SEED.md DearDough.md
.planning/quick/001-selected/PLAN.md`, and
`git commit -m "Close selected story"` produced final-closure commit
`af994741017c69cdc125ce6eef51ad46f08d5aed`. `git status --short` was
empty. `git show af994741017c69cdc125ce6eef51ad46f08d5aed:DearDough.md`
retained unrelated `DD-001` while the selected occurrence was absent, and
`git show a304fb8a03a5e459a37de001a61fbe5a74c9ae18:DearDough.md` still
recovered it. The final snapshot retained the sibling story and backlog entry;
`test ! -e .planning/quick/001-selected` succeeded.

In `/private/tmp/dough-wrap-up-slice3-direct.weKtlS`, direct-current-branch
mode followed the same two-commit boundary: before-cleanup commit
`30f8acb3c80943982235aa56261e70a4a801203e` contained its retrospective
edit and final-closure commit
`3389cd82b23f162e6e4b87251082035027140f3b` removed the spent plan and
selected occurrence. `git status --short` was empty and
`git show HEAD:DearDough.md` retained the unrelated issue. No integration or
worktree-removal action was introduced for this mode.

For incomplete fixture `/private/tmp/dough-wrap-up-slice3-stop.EH2CJb/incomplete`,
`git rev-parse HEAD`, `git status --short`, `test -f
.planning/quick/003-incomplete/PLAN.md`, and `rg -n
"in-progress|Uncommitted retrospective"
.planning/quick/003-incomplete/PLAN.md DearDough.md` showed unchanged tip
`4f05a58`, the plan still present, and the retrospective edit still uncommitted.
For ambiguous fixture `/private/tmp/dough-wrap-up-slice3-stop.EH2CJb/ambiguous`,
the equivalent commands showed unchanged tip `7a43520`, the completed plan
still present, and the ambiguous log prose intact. Neither refusal gained a
closure commit or qualifies for the success marker.

### Candidate identity

`src/skills/dough-story-wrap-up/SKILL.md` and this recognition record. No
other runtime guidance needed a competing lifecycle rule: story wrap-up owns
both closure commits, while later integration/removal remains separate.

### Limitations

The commands manually exercise ordinary Git state transitions selected by the
candidate guidance. They do not prove native agent compliance, integration,
worktree removal, remote behavior, or release readiness. ADR 0005 acceptance
therefore remains pending; installed managed copies and payload declarations
were not changed.
