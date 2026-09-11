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
- After saved-tip integration is verified, removes only the exact owned clean
  execution worktree and integrated local branch with non-force Git operations.
  Dirty or ambiguous state, partial cleanup, and retry are reported without
  risking caller-owned, original-checkout, unrelated, or remote resources.

## Client project context

The executing project must supply repository root, selected feature-story or
bounded-correction identity, and Git conventions for a recoverable commit.
Planned work also needs plan location and status vocabulary. Planless feature
work needs the story, changes, and execution results instead of a plan.
Seed conventions apply only to feature stories. Backlog path is required only
when a **Taken** or queue entry points at the selected work. Retrospective
advice is used when present and is not a required completion record.
Worktree-mode cleanup also requires the retained execution checkout, local
branch, saved tip, originating checkout, and integration-target identity.

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

## Quick 042 local integration evidence

Walked the proposed worktree-mode integration guidance on 2026-09-11 in
disposable local Git repositories. This is the representative behavior review
required by `AGENTS.md`, not native Codex, Cursor, or Claude Code acceptance.

### Input

The primary fixture retained one planned-execution identity: originating and
target checkout on `main`, execution checkout and branch `codex/execution`, and
the execution branch's committed closure tip. The target had a separate,
committed, nonconflicting change after the execution branch split. A conflict
fixture changed the same tracked line on target and execution branches. An
unsafe-target fixture added unrelated untracked target work before integration.
The direct-current variant reused the completed Slice 3 fixture and its recorded
mode; it had one checkout on `main` and no separate execution branch.

### Actions and observations

In `/private/tmp/dough-wrap-up-slice4.GdydHF/nonconflict`, the walkthrough first
entered the execution checkout, saved
`fb7c212e306b8f46b0348159cc920b7cc09cf5c4` with `git rev-parse HEAD`, then
left that directory for the target checkout. The literal target inspection
commands `pwd`, `git branch --show-current`, and `git status --short` showed
`/private/tmp/dough-wrap-up-slice4.GdydHF/nonconflict`, `main`, and a clean
checkout. `git merge-base --is-ancestor
fb7c212e306b8f46b0348159cc920b7cc09cf5c4 main` returned 1 before integration.
`git merge --no-edit fb7c212e306b8f46b0348159cc920b7cc09cf5c4`
created merge commit `9a5f3f4234192a4668d8374338038933e81114c0`.

The literal observations `git diff --name-only HEAD^ HEAD`, `git log --oneline
--all --decorate`, `git show HEAD:target-only.txt`, and `git show
HEAD:closure.txt` showed only `closure.txt` in the merge's first-parent diff,
the separate `a174e45 Unrelated main change`, target content `unrelated
committed target change`, and execution content `committed execution closure`.
`git merge-base --is-ancestor
fb7c212e306b8f46b0348159cc920b7cc09cf5c4 main` then succeeded. `git worktree
list --porcelain` and `git branch --list` showed that the execution worktree and
`codex/execution` branch remained for the later cleanup action.

On a subsequent invocation, `git merge-base --is-ancestor
fb7c212e306b8f46b0348159cc920b7cc09cf5c4 main` succeeded before any merge.
The literal `git rev-parse HEAD` values before and after the decision were both
`9a5f3f4234192a4668d8374338038933e81114c0`, and `git status --short` was empty.
The already-integrated tip therefore caused no duplicate merge.

In `/private/tmp/dough-wrap-up-slice4.GdydHF/conflict`, saved execution tip
`56a4d5ac87924f605efa3d0549f3a542e449d3e4` conflicted with the target's
separate commit. The literal `git merge --no-edit
56a4d5ac87924f605efa3d0549f3a542e449d3e4` returned 1 and reported a content
conflict in `shared.txt`. `git status --short` returned `UU shared.txt`, and
`git diff --name-only --diff-filter=U` returned `shared.txt`. `git worktree list
--porcelain`, `git branch --list`, and `git rev-parse codex/execution` showed
both worktrees and branches retained and the execution branch still at the
saved tip. The ancestry check returned 1, so this state cannot receive the
completion marker; the merge was not aborted or reset.

In `/private/tmp/dough-wrap-up-slice4.GdydHF/unsafe`, target inspection with
`git branch --show-current` and `git status --short` showed `main` and
`?? local-draft.txt`. No merge command was run. `git rev-parse HEAD` returned
`791b4c9982105acfe0ff9009dd2b62d662ecffff` both before and after the refusal,
`test -f local-draft.txt` succeeded, and the final `git status --short` still
showed the untracked file. `git worktree list --porcelain` and `git branch
--list` showed both owned execution resources retained. The saved execution tip
was not yet an ancestor of `main`, so the report must identify unresolved
integration rather than success.

For direct-current mode in
`/private/tmp/dough-wrap-up-slice3-direct.weKtlS`, the candidate rule selected no
integration action. Literal `git branch --show-current`, `git status --short`,
`git worktree list --porcelain`, and `git branch --list` showed a clean `main`
checkout and no execution worktree or branch. `git rev-parse HEAD` remained
`3389cd82b23f162e6e4b87251082035027140f3b` before and after the decision.

### Candidate identity

`src/skills/dough-story-wrap-up/SKILL.md` and this recognition record. The
candidate extends the existing retained execution identity and closure commits
with one mode-aware local integration boundary. It introduces no registry,
remote delivery, rebase, conflict-resolution, or CI policy. No competing rule
was needed in execution, backlog, retrospective, or cleanup guidance.

### Limitations

The commands manually exercise ordinary local Git inspection and merge behavior
selected by the candidate guidance. They do not prove native agent compliance,
owned worktree removal, target-branch push behavior, remote deletion behavior,
CI behavior, or release readiness. Slice 5 owns local resource cleanup. ADR 0005
native acceptance remains pending; installed managed copies and payload
declarations were not changed.

## Quick 042 local integrated-resource cleanup evidence

Walked the proposed post-integration cleanup guidance on 2026-09-11 in
disposable local Git repositories. This is the representative behavior review
required by `AGENTS.md`, not native Codex, Cursor, or Claude Code acceptance.

### Input

The primary fixture retained the worktree-mode identity after local integration:
originating and target checkout on `main`, execution checkout
`/private/tmp/dough-wrap-up-slice5.yPRdBD/owned-success-execution`, local
execution branch `codex/execution`, and saved committed closure tip
`bde84de054b442015787586f8c7325db5461165f`. The repository also contained
unrelated local branch `unrelated-keep`. A dirty variant added an unstaged
tracked edit and untracked `local-draft.txt` in the execution checkout. A
partial-failure variant simulated a race after worktree removal by attaching
the saved branch to a different worktree before local branch deletion. The
repeat used the primary fixture's saved identity after completed cleanup.

### Actions and observations

In `/private/tmp/dough-wrap-up-slice5.yPRdBD/owned-success`, `git worktree list
--porcelain` identified the target checkout on `main` and the exact execution
path on `codex/execution` at the saved tip; `git rev-parse codex/execution`
returned that same tip. Execution-checkout inspection used the literal commands
`git status --short`, `git diff --cached --name-only`, and `git rev-parse
--git-path MERGE_HEAD`. The first two produced no output, and the resolved
`MERGE_HEAD` path did not exist, establishing clean tracked, untracked, index,
and merge-operation state for this fixture. From the target checkout,
`git merge-base --is-ancestor
bde84de054b442015787586f8c7325db5461165f main` succeeded. With the shell's
working directory at `/private/tmp/open-dough-plan-042.5nAk5N/worktree`, outside
both fixture paths, the walkthrough ran exactly `git worktree remove
/private/tmp/dough-wrap-up-slice5.yPRdBD/owned-success-execution` and `git branch
-d codex/execution`; Git reported `Deleted branch codex/execution (was
bde84de)`.

The literal observations `test ! -e
/private/tmp/dough-wrap-up-slice5.yPRdBD/owned-success-execution`, `git worktree list
--porcelain`, and `git branch --list` showed the directory absent, only the
surviving target checkout listed, and only `main` plus unrelated branch
`unrelated-keep`. The ancestry command above still succeeded, and `git show
main:closure.txt` returned `committed execution closure`. This satisfies target
ancestry and committed-closure verification after resource absence, from the
surviving checkout.

For the repeat, no removal command was run. Checks of the known path, exact
worktree-listing path, and `git branch --list codex/execution` all remained
empty or absent. `git branch --list unrelated-keep` still returned
`unrelated-keep`; the saved-tip ancestry check still succeeded; and `git show
main:closure.txt` still returned `committed execution closure`. The candidate
therefore recognizes completed cleanup from retained identity without history
reconstruction or unrelated deletion.

In `/private/tmp/dough-wrap-up-slice5.yPRdBD/dirty`, `git status --short`
returned ` M closure.txt` and `?? local-draft.txt`; `git diff --cached
--name-only` was empty, and `git merge-base --is-ancestor
24245d48913f2054ada3623dbadc06901804f7c1 main` succeeded. No removal or branch
deletion command was run. `test -f
/private/tmp/dough-wrap-up-slice5.yPRdBD/dirty-execution/local-draft.txt`
succeeded, while `git worktree list --porcelain` and `git branch --list` still
showed the execution checkout and `codex/execution`. Integration is complete,
but dirty cleanup is refused and the data remains recoverable.

In `/private/tmp/dough-wrap-up-slice5.yPRdBD/partial`, the execution checkout
was clean and saved tip `24245d48913f2054ada3623dbadc06901804f7c1` was an
ancestor of `main`. From the target checkout, `git worktree remove
/private/tmp/dough-wrap-up-slice5.yPRdBD/partial-execution` succeeded. The
fixture then attached the execution branch to
`/private/tmp/dough-wrap-up-slice5.yPRdBD/partial-race`; the literal non-force
`git branch -d codex/execution` returned 1 with `cannot delete branch
'codex/execution' used by worktree at
'/private/tmp/dough-wrap-up-slice5.yPRdBD/partial-race'`. No force or unrelated
removal followed. Observations showed the original owned directory absent, the
branch and new worktree retained, saved-tip ancestry still verified, and `git
show main:closure.txt` returned `closure`. This is successful integration with
partial cleanup, so it must report remaining resources without
`## STORY WRAP-UP COMPLETE`.

### Candidate identity

`src/skills/dough-story-wrap-up/SKILL.md` and this recognition record. Story
wrap-up remains the authoritative home for committed closure, integration, and
owned resource removal. No competing cleanup rule was added to execution,
backlog, retrospective, or installed managed copies.

### Limitations

The commands manually exercise ordinary local Git inspection, removal,
non-force branch deletion, and retry decisions selected by the candidate
guidance. The partial case injects an identity-changing worktree race to make
the ordinary deletion fail; it does not claim every filesystem or Git failure
mode was run. This evidence does not prove native agent compliance, target
push behavior, remote deletion behavior, CI behavior, or release readiness.
ADR 0005 native acceptance remains pending; payload declarations and installed
managed copies were not changed.
