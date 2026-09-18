---
id: SEED-008
status: active
planted: 2026-09-08
planted_during: unknown
trigger_when: when evaluating or designing branch/worktree workflows for trunk-based development
scope: unknown
---

# SEED-008: Execute stories with continuous trunk integration

## Why This Matters

Developers want agents to work in separate worktrees while sharing small,
verified changes through the team's trunk throughout a story. Workspace
isolation must not postpone integration until the story is complete.

## Stories

<a id="claude-code-background-mode"></a>

### 5. Complete execution and wrap-up in fresh Claude Code background mode

**Status:** Refined 2026-09-18; third backlog priority. Not planned.

**Goal:** A developer running Open Dough work in Claude Code background mode can
take a queued story, execute it, and close it, ending with committed closure on
the branch they already have checked out. The developer keeps ownership of
branch publication and any pull request. This contributes to the seed's parent
goal because background mode is how a developer launches several agents at
once, so Open Dough must be usable there before parallel execution is
worth pursuing.

**Observed problem:** With its default `worktree.bgIsolation` setting, Claude
Code background mode starts work in a host-created Git worktree on a branch
that is not the project's integration branch. Three current rules do not
compose with that checkout:

1. `dough-execute-plan` requires the **Taken** claim to be committed on the
   resolved integration branch, and explicitly stops queued current-branch
   execution when that branch is not available. A host-provided feature-branch
   checkout therefore stops before the backlog changes.
2. Story Branch Mode would create a second, nested worktree inside the
   host-provided one.
3. Story Branch Mode wrap-up integrates the execution branch into `main`
   locally and pushes `origin main`, which is unsafe from a host checkout the
   developer expects to publish themselves.

An earlier capture also asserted that background mode integrates results through
a pull request by default. Review on 2026-09-18 did not confirm that: the
observed background-mode instruction is to commit or push only when asked and to
branch first when on the default branch, with a pull request named only as one
possible reported outcome. This story therefore treats pull-request cooperation
as unproven and out of scope rather than as a requirement.

**Scope — required behavior:**

- Installed Open Dough guidance states the supported background-mode
  configuration, `worktree.bgIsolation` set to `none`, so a fresh installation
  runs in the developer's project checkout rather than a host-created worktree.
- Background-mode execution uses the existing direct-current-branch execution
  location: it records the current checkout and branch for both execution and
  integration and creates no worktree.
- The claim rule resolves for a checkout that is not on the resolved integration
  branch: either the claim is recorded safely, or execution stops before
  changing the backlog with a diagnostic naming the current branch, the
  resolved integration branch, and the action required.
- Wrap-up ends at committed closure, as direct-current-branch mode already
  specifies, and reports the branch the developer must publish.

**Scope — rejection constraints:** Do not create a nested or replacement
worktree inside a host-provided one; ADR 0002 requires recoverable work, and a
second worktree layer hides which checkout the host and the developer own. Do
not advance or push the integration branch from a host-provided checkout. Do not
change Story Branch Mode or Trunk Mode behavior; ADR 0007 remains Proposed and
this story is not authorization to alter the other lifecycles.

**Deferred promises:** This delivery does not build or verify pull-request
creation, merge, or post-merge cleanup; cooperation with the default
`bgIsolation` worktree isolation beyond stopping safely; a host-worktree
detector, registry, or worktree manager; host keep-or-remove worktree exit
handling; Codex or Cursor background equivalents; cloud or remote background
sessions; or cleanup of pre-existing stale worktrees.

**Key examples:**

1. *Documented configuration.* A developer installs Open Dough into a fresh
   project and follows the installed guidance to configure background mode.
   Starting a background session leaves the session working in the project
   checkout, and `git worktree list` gains no host-created entry.
2. *Claim from a non-integration branch.* A background session sits on a feature
   branch while the resolved integration branch is `main`, and the developer
   selects a queued story. Execution either records the claim on the resolved
   integration branch through the recorded originating checkout, or stops with
   the backlog unchanged and reports the current branch, the resolved
   integration branch, and the required action. It does not stall silently and
   does not commit the claim to the wrong branch.
3. *Closure without publication.* A story executes to completion in
   direct-current-branch mode. Wrap-up commits the before-cleanup revision and
   the final closure, removes the **Taken** entry, and stops. Local `main` is
   not advanced, nothing is pushed to `origin main`, no branch or worktree is
   deleted, and the report names the branch the developer publishes.
4. *Unsupported configuration, boundary.* A background session starts under the
   default `bgIsolation` inside a host-created worktree. Open Dough reports the
   unsupported configuration and stops rather than nesting a second worktree or
   guessing an integration target.

**Evaluation:** Run the examples above in a scratch repository from an
installation with no prior workflow personalization, meaning default Claude Code
settings for worktree isolation and no retained memory of this maintainer's
preferences. This maintainer's own machine already sets `bgIsolation` to
`none`, so reproducing the default behavior means reverting that setting rather
than using the existing setup. Judge the outcome from the session's working
directory, `git`
refs and worktree list, the backlog file contents, and the presence or absence
of pushes — not from the agent's self-report, per ADR 0005 section 4.

**Value / learning:** The documentation slice establishes cheaply whether a
supported configuration alone makes a fresh installation work, which would
retire the worktree half of this problem. The remaining slices establish whether
the existing direct-current-branch mode is a sufficient host adaptation, and
resolve where a queue claim can be recorded when the executing checkout is not
on the integration branch. That question is shared with the same-machine merge
queue story.

**Effort hypothesis:** S–M, medium confidence. Refinement removed the
pull-request lifecycle unknown and identified an existing execution mode that
already fits, so the remaining cost is the claim-location resolution and one
native background-mode observation.

**Depends on:** No hard product prerequisite. Terry Yin sequenced this story
after the now-delivered scripted product backlog updates
and [Queue trunk integration for agents on the same machine](#same-machine-merge-queue)
on 2026-09-18, because both touch the same claim-commit seam: recording a claim
on the integration branch from an executing checkout that is not on it is the
shared-checkout contention the merge queue story owns, and the claim commit is
itself a backlog edit.

**Architecture and boundaries:** Follow
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
by preserving recoverable work and leaving publication with its owner;
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires fresh native evidence because background mode is a materially
different activation mode; and
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
is satisfied here by a documented configuration and a mode-selection rule rather
than a second behavior copy. Refinement resolved the previously open ownership
question: the developer owns branch publication and any pull request, and Open
Dough does not take that responsibility in this story. ADR 0007 remains Proposed
and is not adopted by this story.

**Open decision:** The product backlog's near-future direction still reads
"each agent working in its own Git worktree," while this story's chosen answer
is that a background-mode agent works in the developer's existing checkout and
creates no worktree. Refinement did not change that direction; a human decides
whether the direction wording, this story's approach, or neither needs revising.
This affects how this story is justified, not what it delivers.

**Safe stopping point:** After the documentation slice, a fresh installation has
a supported background-mode configuration and never nests a worktree. Cancelling
the later slices leaves every other execution mode unchanged.

<a id="same-machine-merge-queue"></a>

### 2. Queue trunk integration for agents on the same machine

**Status:** Captured; second backlog priority. Not refined or planned.

**Goal:** A developer running multiple agents in separate worktrees on the same
machine gets orderly integration into their shared trunk without manually
arbitrating each agent's turn or letting agents mutate the integration checkout
at the same time.

**Scope candidate:** Introduce a same-machine merge queue for Trunk Mode.
Agents submit ready increments; one integration runs at a time, reconciles with
current trunk, and reports its result to the submitting agent. Preserve the
local execution branches, trunk publication, and CI ownership established by
Trunk Mode. Failed or interrupted integration must preserve the submitted work
and leave a visible state that can be recovered without duplicate publication.

**Key example / evaluation:** Two agents submit increments from different
worktrees while sharing one integration target. Both increments eventually
reach trunk, each is reconciled against preceding integrated work, and neither
agent concurrently modifies the integration checkout. An integration that
cannot proceed reports its blocked state without losing either submission.

**Depends on:** completed Introduce Trunk Mode for plan execution, recoverable
from `ef6a59c:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#introduce-trunk-mode`.
Trunk Mode remains usable through explicit coordination without this queue.

**Deferred decisions:** Queue ordering/fairness, whether a blocked submission
allows later independent work through, admission and cancellation interfaces,
crash recovery, and how an agent knows who owns an integration. Resolve these
when refining this story; no daemon, storage format, or locking design is chosen.

**Boundaries:** One machine and one repository's shared integration target per
queue. Distributed queues, hosted cloud-agent integration, a parallel-agent
launcher, and global CI repair scheduling are not promised. Reuse an existing
solution if suitable; this capture authorizes no queue implementation.

<a id="gate-and-deliver-scripted-backlog"></a>

### 6. Gate Git backlog conflicts and deliver the scripted backlog

**Status:** Split on 2026-09-18 after the predecessor's slices 1-10 were marked
complete. Delivery review subsequently found core defects; their corrections,
including the human-confirmed relocation-safe identity contract, are owned by
[Plan 058](../quick/058-preserve-backlog-merge-intent/PLAN.md).
This story retains original slices 11-17 with their proof commands, boundaries,
and accumulated execution learnings by reference to the predecessor plan,
recoverable at
`46ce42d:.planning/quick/057-script-product-backlog/PLAN.md`. Re-plan before
executing: seven slices was judged too large for one execution, and the
delivered half changed what some of the remaining slices must say.

**Remaining scope from Plan 057:**

| Original slice | Work retained by this story |
| --- | --- |
| 11 | Gate Git merge results, including clean-but-invalid results, and validate human repair before resuming |
| 12 | Gate rebase reconciliation, preserve recoverable state, and prevent publication after failure |
| 13 | Gate cherry-pick reconciliation and validate human repair before continuation |
| 14 | Install/update the complete standalone script set and route ordinary workflows through it; core rule/identity guidance correction moves to Plan 058 |
| 15 | Prove installed use and feasible lightweight native edit protection in Codex |
| 16 | Prove installed use and feasible lightweight native edit protection in Cursor |
| 17 | Prove installed use and feasible lightweight native edit protection in Claude Code |

These are unexecuted inherited slices, not completed work or a new active
executable plan. Replanning must preserve human-only failure/resume, validation
of clean integrations, and the lightweight-guard feasibility boundary. Do not
silently broaden enforcement or add AI repair. Plan 058 repairs the predecessor;
it does not replace these seven remaining delivery responsibilities.

**Goal:** The scripted backlog operations that now exist reach the developers and
agents who need them, and hold at the moment they matter most — when an
authorized merge, rebase, or cherry-pick leaves the shared list conflicted. Today
the operations exist in this repository's source, are proven by 76 tests, and are
installed nowhere: no installer declares them and no guidance mentions them. The
observable outcome is that an ordinary install or update delivers them, that
guidance directs an agent to the script instead of to hand-editing or intellectual
conflict repair, and that a Git conflict in the backlog stops for the script's
decision rather than for an agent's reconstruction.

**Existing evidence and reuse:**

- Reuse the reconciliation core after the corrections in Plan 058. It takes
  three ordinary files, knows nothing about Git, and never reads its destination
  as input. Review reproduced removal overriding reprioritization, false
  no-change reports, and identity restrictions that violate the original scope.
  The core is not frozen against correction. Slices 11-13 supply real ancestor
  and branch inputs and must validate the corrected contract at the Git boundary.
- Its refusals are deliberately strict, and one of them will be met often. Two
  branches that each append to the queue put their new work in the same place,
  and nothing in the versions says which comes first, so the merge stops for a
  human. Priority remains a human decision under the agreed scope. Its daily-use
  cost is unmeasured because nothing calls it from Git yet; that uncertainty
  does not authorize an automatic tie-break or reopen the rule by default.
- The root helper `scripts/product-backlog-insert.mjs` still exists and still
  works, but now owns no rules that the new modules do not own better. Nothing
  operational references it: only this seed and the slice plan mention it.
- Installed guidance is untouched by the delivered work.
  [SKILL.md](../../src/skills/dough-product-backlog/SKILL.md) and its
  [merge rules](../../src/skills/dough-product-backlog/references/merge-conflicts.md)
  are byte-identical to what they were before execution began, and both still
  describe intellectual conflict repair.

**Known obligations carried out of execution:** the complete runtime script set must be
declared in both `install.sh` and `src/install/open-dough-release-version.sh`;
`merge-conflicts.md` must be rewritten as a script calling/recovery contract,
using the corrected domain rules from Plan 058. Git integration must enforce
undetermined queue-position refusal and scalar direction reconciliation even
when the text merge is clean. Guidance must tell a human what to do
when a refusal fires, and must read `complete`'s repeat-removal nonzero exit as
"the outcome already holds" rather than as a repair trigger; the root helper must
be retired or delegated; and the `EISDIR` limit needs a decision.

**Core correction ownership:** Plan 058 owns merge-report defects and missing
assertions, removal-versus-priority safety, the oversized merge test file, and
relocation-safe identity. Terry additionally authorized transferring the domain
merge-rule correction and preservation of recorded IDs in story/plan source
guidance from original slice 14 into Plan 058's existing slices 2 and 4. Those
are corrections to the core contract, not new installation or host journeys.
This story still owns routing ordinary workflows through the scripts and proving
that the complete corrected guidance/scripts are delivered and usable. Reuse
Plan 058's accepted proof when available; do not treat planned corrections as
completed or duplicate them as new delivery features. Root-helper retirement,
the bounded `EISDIR` input-error decision, and Git-specific human recovery remain
here; moving unrelated cleanup into Plan 058 would enlarge the correction.

**Assumption to validate:** that the reconciliation core, which has only ever
been given files a test wrote, behaves the same when given the real ancestor and
branch content of an actual conflicted merge, rebase, and cherry-pick. Deriving
those three inputs mechanically, before integration discards the context, is the
part not yet demonstrated.

## Research and Architectural Context

Research on 2026-09-16 established precedent for frequent mainline integration
from local branches, including after each healthy commit. It did not establish
that this exact worktree lifecycle is a mainstream built-in mode, or measure its
agent overhead. [Fowler's branching patterns](https://martinfowler.com/articles/branching-patterns.html)
and [Git rebase](https://git-scm.com/docs/git-rebase) inform the selected approach.
This resolves the original feasibility concern sufficiently for refinement;
host-specific behavior still needs evidence when implemented.

[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
principle 2, supports continuous integration and resolving conflicts through
shared intent. [ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
governs proof and native acceptance. [ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one shared behavior with only necessary host adaptation, written for
the executing project. Follow [maintainer guidance](../../AGENTS.md) when authoring.

[ADR 0007 — Software development lifecycles](../../docs/adrs/0007-software-development-lifecycles.md)
remains Proposed. Its Story Branch Mode waits until closure to integrate;
Trunk Mode introduces another mode without accepting or superseding that draft.
The existing source guidance assumes execution-branch publication and end-only
integration; changing those assumptions for Trunk Mode is within this story,
not grounds for silently changing the behavior of the other modes.

## Breadcrumbs

- Original seed: `5e424b7`, 2026-09-08; removed in `ac4519b`, 2026-09-09;
  recovered on 2026-09-16.
- Related historical seed: `5e424b7:.planning/seeds/SEED-002-trunk-based-multi-agent-collaboration.md`.
- Terry Yin named Trunk Mode and requested first backlog priority on 2026-09-16;
  subsequent research and discussion selected rebase followed by trunk
  publication. This seed is planning input, not implementation authorization.
