# Execute in a worktree by default and merge back at wrap-up

## Source, goal, and scope

[SEED-004 Story 16](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#execute-in-worktree-and-merge-at-wrap-up).
Status: planned, 2026-09-11. Planning only; execution not authorized.

Deliver one lifecycle: locally claim queued planned work, execute in a new
branch/worktree by default, preserve it for separately invoked review/closure,
commit closure, integrate into main, and remove the owned worktree and branch.
The refined story owns the complete contract. Caller-selected current-branch
execution bypasses creation and integration/cleanup of a worktree. Preserve the
existing quick path; this story changes the planned-execution default only.

No scheduler, locking, configuration/state format, worktree manager, new host
adapter, PR/rebase policy, remote deletion, automatic target-branch push,
automatic retrospective, release, installation changes, or native-host runs.
Use existing Git and host capabilities. Unknown ownership or unsafe state stops
only the affected operation, retaining work and reporting its actual state.

## Constraints and existing seams

- [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  author Proposed revisions in `src/skills/`; leave installed copies and release
  declarations unchanged.
- [ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  use representative behavior review for conventional guidance authoring.
  Native behavior proof for the changed execution and closure requirements is
  pending for Codex, Cursor, and Claude Code; existing discovery evidence does
  not prove it. This plan cannot authorize release. Before release, assign and
  complete the affected requirements in a native acceptance story or establish
  justified reusable evidence. Do not expand this implementation into host runs.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one authoritative home per rule, project-relative runtime perspective, no
  maintainer analysis in runtime prose. No conflict with current Accepted ADRs
  was identified; no ADR status change is proposed.

Primary seams are `src/skills/dough-execute-plan/SKILL.md` (context, Take queued
work, finish), `src/skills/dough-product-backlog/SKILL.md` (entry transition),
and `src/skills/dough-story-wrap-up/SKILL.md` (Git recovery, cleanup, report).
Inspect execution's `references/wrap-up.md`, delegation, and CI references only
for directly contradictory checkout or delivery assumptions. The existing
slice delivery contract already owns commit/push and observer shutdown; retain
it rather than inventing a second delivery flow. Keep the existing entry
movement rule in product-backlog and mode-specific Git sequencing in execution.
Keep closure commits and integration/removal in story-wrap-up. Prefer existing
files so this change does not require new payload declarations.

Common model: one execution identity, originating checkout, execution checkout
and branch, and integration target. Retain this context in the existing plan
and conversation, available before deleting the spent plan. Main is the target
unless the caller/project establishes another. On resume, verify actual Git
state against that identity; Taken alone is insufficient. No parallel registry.
Read-only preflight precedes the first project mutation; the Taken commit stays
first. Respect unrelated staged/unstaged changes without automatic stashing or
reset. Non-main origins follow the same identity rule, not a separate mode.

## Outside-in proof and delivery gates

The product is agent guidance. For each slice, perform the AGENTS.md behavior
review: invocation context, required context, useful result, and truthful stop.
Walk a small disposable local Git repository with main, a queued story, its
plan, and a log; use the candidate guidance to choose actions and inspect the
resulting Git/filesystem state. Vary only the relevant boundary. Record input,
actions, observations, candidate identity, and limitations in the affected
skill's recognition record. Manual Git execution confirms the walkthrough and
Git assumptions, not native agent compliance. No prose-matching test suite or
new acceptance runner is needed.

Literal observation commands, run inside that disposable repository as relevant:
`git status --short`, `git diff --name-only HEAD^ HEAD`, `git log --oneline --all`,
`git worktree list --porcelain`, `git branch --list`,
`git merge-base --is-ancestor <saved-execution-tip> main`, and
`git show <before-cleanup-commit>:DearDough.md`. Record actual substituted
commands and results in proof; exit success alone does not prove file contents,
checkout identity, or absence. Use a local bare remote only when checking that
claiming does not push and ordinary execution pushes the execution branch.
Never use this source checkout as the destructive walkthrough fixture.

No uncertain storage engine or new infrastructure is introduced; ordinary Git
worktree/merge behavior will be checked with the relevant walkthrough rather
than a separate planning experiment. Before source edits, walk the existing
current-branch path as regression evidence; slice 2 owns preserving it.

At each slice, review changed frontmatter and relative links and run
`git diff --check`. Do not run installer suites for prose-only behavior or
claim those establish worktree correctness. Run focused maintained tests only
if their implementation is actually affected. Follow dough-execute-plan for
independent implementation/refactor, selective formatting, plan status updates,
coordinator commits/pushes, and asynchronous CI repair. Resolve actual runtime,
formatting/hook, and push context at execution start; do not infer a hook
contract from `npm run format`. No numeric timing limit has been supplied;
each sizing judgment includes implementation, walkthrough, and local cleanup.

## Ordered slices

### 1. Record the claim locally before isolated execution
Type: Behavior
Status: planned

Behavior: An authorized planned execution in worktree mode records its existing
queued entry as Taken in a local commit on the originating branch before any
execution branch/worktree is created.

Extend the existing entry transition with mode selection and owned bookkeeping
commit ordering. Already-Taken and absent-entry cases preserve their existing
meaning without empty commits or invented entries. A preflight failure leaves
the queue intact; failed setup after a committed claim leaves it Taken for retry.

Proof: Walk the claim boundary in the fixture; inspect exact backlog membership,
commit parent and changed paths, unchanged local-remote refs, and originating
branch. Repeat at the same boundary with already-Taken and ambiguous staged
ownership: no duplicate/empty commit or unrelated changes included. Stop the
walk before worktree creation, owned by slice 2.
Safe stopping point: a truthful locally recorded claim; default creation is
still pending and this slice alone is not the complete lifecycle.
Sizing: bounded, high confidence; one existing transition and Git commit boundary.

### 2. Execute in the owned checkout and retain it for review
Type: Behavior
Status: planned

Behavior: Given the recorded claim, planned execution uses a new branch/worktree
by default, or the caller-selected current branch, and retains that execution
checkout through pause and completion for separately invoked review/closure.

Resolve names and location from project/host conventions, record identity in
existing context, and pass the execution checkout to delegation, refactor, and
normal branch delivery. Resume reuses the identified checkout instead of nesting
worktrees. No automatic retrospective or wrap-up; retain observer shutdown.
Do not extend the new default to explicitly selected planless quick execution.

Proof: One execution-location walkthrough with default, explicit-current-branch,
and resumed variants. Verify branch ancestry includes the claim, implementation
and ordinary push occur on the intended branch, the original checkout contains
no execution edit, and completion leaves the worktree/branch present. Override
and existing quick behavior preserve their current-branch regression. Ambiguous
identity or creation failure reports retained claim/work rather than guessing.
Safe stopping point: isolated execution can be reviewed; closure integration
remains pending and retained work is available.
Sizing: bounded, medium confidence; one checkout-selection rule across existing
callers. Refine if inspection reveals a new host mechanism rather than ordinary
path/context propagation; do not build one silently.

### 3. Commit review material and final closure
Type: Behavior
Status: planned

Behavior: On valid wrap-up, all owned review and closure changes are committed
and recoverable before integration, including applicable DearDough.md edits.

Use existing completion and Git-recovery gates. Include retrospective log edits
in the before-cleanup commit, then follow existing spent-history removal and
commit the final closure. Preserve unrelated log entries and sibling work.
Keep checkout/branch/target context available after deleting the plan. Apply
this commit completion rule to direct-current-branch wrap-up as well.

Proof: Walk closure with an uncommitted retrospective occurrence and unrelated
log content. Verify `git show` recovers the occurrence at the before-cleanup
revision; the final committed snapshot follows existing cleanup and retains
unrelated content. Missing completion or ambiguous ownership leaves material
intact with no success claim. Observe a committed tip, not merely staged edits.
Safe stopping point: closure is recoverable in Git; retain the worktree/branch
until the remaining integration and cleanup slices are delivered.
Sizing: bounded, high confidence; extends existing recovery/cleanup ordering.

### 4. Integrate the committed work into the target branch
Type: Behavior
Status: planned

Behavior: Completed, committed worktree closure is merged into the resolved
target branch without overwriting unrelated target changes.

Run integration from the target checkout using ordinary project Git conventions.
Verify the saved execution tip is an ancestor of the target after merge. Keep
direct-current-branch mode outside this step. Do not add remote push, rebase, or
CI waiting policy. On conflict or unsafe target state, preserve branches and
worktrees, report the unresolved state, and do not claim wrap-up complete.

Proof: Walk merge with a separate nonconflicting change on main; inspect both
changes and execution-tip ancestry. A conflicting variant preserves the branch,
worktree, and conflict state without success reporting. A subsequent invocation
can recognize an already-integrated tip without duplicating integration.
Safe stopping point: committed work is on main; the owned branch/worktree remain
until slice 5 removes them safely.
Sizing: bounded, medium confidence; one integration boundary and its refusal.

### 5. Remove only the integrated execution worktree and branch
Type: Behavior
Status: planned

Behavior: After verified integration, wrap-up removes the owned clean execution
worktree and its branch, then reports complete closure from a surviving checkout.

Leave the execution directory before removing it. Use ordinary non-force Git
removal/deletion only after inspecting tracked and untracked state and verifying
ownership and integration. Do not remove an original checkout, caller-owned
branch, or remote branch. Report integration separately if cleanup fails; retain
remaining resources and allow retry using saved identity/Git state. Successful
repeat closure must not reconstruct history or operate on another execution.

Proof: Continue the integrated fixture: verify the directory, worktree listing,
and local branch are absent while main contains the saved execution tip and
closure. A dirty/untracked-content variant retains the worktree and data; a
partial cleanup failure reports remaining resources without a completion marker.
Repeat the completed case with known identity and confirm no unrelated deletion.
Safe stopping point: the complete requested lifecycle is delivered; no unmerged
work or active execution directory has been force-removed.
Sizing: bounded, medium confidence; one ownership-and-integration removal gate.

## Proof ownership and assessment

| Story promise | Owning slice |
| --- | --- |
| Local Taken-only commit before branch creation; no separate claim push | 1 |
| Already-Taken, absent-entry and claim/setup failure boundaries | 1, with setup in 2 |
| Default isolation, caller override, normal execution delivery and resume | 2 |
| Preserve branch/worktree for separately invoked retrospective/wrap-up | 2 |
| DearDough recovery plus committed final closure, including direct mode | 3 |
| Merge execution and closure into main; preserve target edits/conflicts | 4 |
| Safe removal, failure reporting, retry and truthful completion | 5 |

Cumulative design: one execution identity and an ordered Git lifecycle. Failure
cases retain state at the failed boundary; they do not introduce new modes,
registries, or duplicated ownership rules. Each slice owns one observable gate
and one walkthrough with boundary variants. No Structure slice is needed.
No slice-specific concern remains beyond the stated ordinary execution checks;
no unsupported sizing limit or readiness certification is inferred. A separate
slice-plan refinement pass was not triggered by this assessment.

## Learnings

None from execution; implementation has not started.
