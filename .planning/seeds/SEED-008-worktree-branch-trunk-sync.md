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

**Status:** Refined and replanned 2026-09-19; queued, not Taken. The earlier
story was split after Plan 057 slices 1-10. This review assumes its core and
corrections 058/059 are complete, as Terry requested; it does not certify or
change correction 059's current execution status. The remaining work is in
[Plan 060](../quick/060-gate-and-deliver-scripted-backlog/PLAN.md).
Original slices 11-17 and their learnings remain recoverable at
`46ce42d:.planning/quick/057-script-product-backlog/PLAN.md`; correction 058 at
`30dc6bd:.planning/quick/058-preserve-backlog-merge-intent/PLAN.md`.

**Goal:** A developer using an installed Open Dough workflow can maintain and
integrate the shared backlog through the existing deterministic scripts, with
compatible branch intent preserved and unresolved decisions returned to a human
before continuation or publication. This makes parallel trunk work safer without
requiring the developer or agent to reconstruct backlog changes by hand.

**Scope — required behavior:**

- Ordinary install/update delivers the complete standalone runtime and routes
  backlog maintenance, execution claims, integration, and closure through it.
  Installation does not adopt identities or migrate project data implicitly.
- Authorized merge, rebase, and cherry-pick obtain their actual Git inputs
  mechanically and use the existing reconciliation rules. A clean Git result
  receives the same semantic scrutiny as a conflict; valid Markdown alone does
  not establish compatible priority or direction changes.
- A failed gate preserves recoverable refs, worktree, and index evidence and
  stops the affected workflow before continuation/publication. A human supplies
  the resolution; a script validates that result before resume without rerunning
  the disputed reconciliation over it. Unrelated conflicts stay with their owner.
- Installed use is demonstrated separately in Codex, Cursor, and Claude Code.
  Lightweight protection of the whole backlog against ordinary native agent
  edits remains conditional on demonstrated feasibility for each host. Reads,
  scripted changes, unrelated edits/hooks, and human repair remain usable.

**Scope — rejection constraints:** Preserve the corrected identity and merge
contract, including human decisions for undetermined queue priority and differing
direction values. No automatic side selection, AI repair, abort, skip, reset, or
discard after a refusal. A human resolution can settle disputed meaning but must
still satisfy the document's invariants. Missing or ambiguous Git inputs stop
explicitly rather than prompting an agent to invent ancestor or branch intent.

**Deferred promises:** Core redesign; automatic priority policy; a new identity
scheme or registry; whole-Git scheduling or the next story's merge queue; a
generic Git orchestrator; automatic Git merge-driver installation; universal
filesystem or arbitrary-shell enforcement; Cursor Tab protection; background-mode
changes; and publishing a release tag. A host requiring complex enforcement
needs a human scope decision; missing guard proof is not a pass or an automatic
waiver. Native requirements remain pending until proved or explicitly disposed.

**Key examples:**

1. *Standalone use.* A project updates from the preceding release, then the
   release source becomes unavailable. An agent uses the installed command to
   make an authorized change at the project's non-default backlog path, even
   when launched in a subdirectory. Existing work and unrelated settings survive.
2. *Compatible conflict.* Ancestor Taken is `[A, B]`; one branch removes A and
   the other removes B. A real merge produces empty Taken, with both removals
   reported and neither sibling restored.
3. *Clean but incompatible.* Git accepts edits on different direction lines, or
   concurrent queue changes leave no supported ordering. The semantic gate stops
   before publication even if the result parses and has no duplicate identities.
4. *Human recovery.* A refused merge, rebase, or cherry-pick retains its work.
   An invalid human candidate remains stopped; a valid supplied resolution is
   validated and resumed once, without overwriting it or replaying accepted work.
5. *Rebase boundary.* A multi-commit unpublished suffix encounters either a
   conflict or a clean incompatible replay. Its retained inputs identify both
   intentions and its publication remains blocked until resolved. A clean local
   rebase commit is not itself permission to publish.
6. *Host boundary.* On each supported host, an ordinary request uses the installed
   script and a refusal stops for a human. Where a lightweight native guard is
   feasible, a direct agent edit is denied before bytes change while reads,
   scripts, unrelated edits, and human repair remain possible.

**Critical scope assessment:** Retain this delivery outcome. Merely shipping the
CLI would provide useful direct use but leave ordinary integration callers
ungated. Guidance that only reacts to conflict markers misses clean semantic
conflicts. A Git merge driver alone would not prove those callers or human
recovery and is not needed for this outcome. The smallest supported solution is
the existing core, thin Git adapters, shared calling guidance, and complete local
delivery. Native guards are the conditional edge, not grounds to build a new
enforcement system. More, smaller slices make the inherited work resumable; they
do not make this entire remainder a small single execution or remove its scope.

**Reuse and remaining uncertainty:** The predecessor owns ordinary mutations,
identity, ordering, direction, and three-file reconciliation. Core-rule guidance
has already changed; the old claim that it is untouched and the fixed test count
are obsolete. What remains unproved is selecting real Git inputs, validating a
human candidate independently, gating actual callers, standalone delivery, and
native use/guard feasibility. Plan 060 owns those proofs and the bounded
root-helper and input-error cleanup. Do not reopen predecessor corrections or
duplicate their proof unless this boundary produces contrary evidence.

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
