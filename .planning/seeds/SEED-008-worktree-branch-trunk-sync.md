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
after [Update the product backlog without hand-editing the shared list](#script-product-backlog-list-updates)
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

<a id="script-product-backlog-list-updates"></a>

### 4. Update the product backlog without hand-editing the shared list

**Status:** Refined and planned 2026-09-18; first backlog priority. Execution
has not started. [Slice plan](../quick/057-script-product-backlog/PLAN.md). Terry Yin
confirmed stable identity, scripted conflict resolution, and delivery to all
projects using Open Dough as scope. Scripted near-future direction updates and
a bounded assessment of lightweight direct-edit protection are also in scope.

**Goal:** A developer or agent maintaining this project's product backlog can
apply a clear update safely and deterministically, without spending AI judgment
or tokens reconstructing and checking a straightforward list edit. Queued and
Taken work must not disappear accidentally. The developer retains a single,
readable Markdown list that supports inexpensive coordination between parallel
worktrees.

There are two observable outcomes: preserve work and the explicitly requested
change, and perform the mechanical edit, Git-conflict resolution, and their
validation without model calls.
Choosing valuable work, deciding priority, and resolving genuinely incompatible
intentions still require judgment. A script is the proposed means, not the goal;
this story promises no numerical reduction in total conversation tokens.

**Existing evidence and reuse:**

- [The local insertion helper](../../scripts/product-backlog-insert.mjs) already
  validates one exact-line insertion and replaces the file through a temporary
  file. Its targets depend on full bullet text, duplicate detection compares
  whole lines, and it supports neither lifecycle changes nor Git reconciliation.
  Its read-then-replace sequence also does not detect an intervening writer;
  replacement alone does not establish protection against lost updates.
- [Product backlog guidance](../../src/skills/dough-product-backlog/SKILL.md)
  already owns membership, order, stable anchors, and story-to-plan references.
  Its [merge rules](../../src/skills/dough-product-backlog/references/merge-conflicts.md)
  specify preservation and compatible transitions, but require an agent to
  reconstruct those transitions and inspect the result on each conflict.
- A seed ID identifies several stories; a title can change; a stable story
  anchor already survives a title change. Taking a planned story changes its
  backlog destination to its plan. These are different concerns: identity must
  remain stable while title, location, and active link can change.

**Alternatives and recommended direction:**

| Possibility | Assessment against the goals |
| --- | --- |
| Continue direct Markdown editing with agent review | Keeps reading simple, but repeats judgment and preservation checks for mechanical work. |
| Store each backlog item in its own file or folder | May reduce overlapping text edits; the earlier exploration is an assumption, not measured evidence here. It fails the requested single-file reading experience unless another view is maintained. |
| Add validated operations over the existing Markdown file | Smallest useful direction for safe, model-free edits; by itself it does not resolve overlapping Git changes. |
| Combine those operations with scripted resolution of compatible backlog conflicts | Selected direction. Git conflicts may occur; the script resolves and validates them without manual or AI reconstruction. Reuse the existing domain and merge rules; leave genuinely competing intentions visible. |

Keep one authoritative backlog and one shared owner of its editing rules. Assess
extending or relocating the existing helper before creating an overlapping
implementation. A semantic three-way merge or replay of explicit operations
could satisfy reconciliation; this refinement chooses neither a merge driver
nor an operation-log design. A permanent second backlog representation is not
required or authorized by this story.

**Assumption to validate:** Stable identities and explicit backlog rules provide
enough information for a script to resolve compatible product-backlog Git
conflicts safely, without a human or AI agent inspecting and interpreting each
conflict. This is the intended capability, not an already demonstrated fact.
Evaluate it against actual conflicted Git inputs, including lifecycle changes
and ordering, before relying on it. If the available information is insufficient,
identify the missing intent or rule and revisit the design; do not count an AI
fallback or a conflict-free text merge as fulfillment of this outcome.

**Feasibility findings — 2026-09-18:** Disposable probes with Git 2.50.1
established two concrete cases, using both `git merge-file` and actual branch
merges in scratch repositories:

- Independently closing A and B from **Taken** = [A, B] produced a text
  conflict. A small three-way membership probe resolved both removals using
  identity and the ancestor: unchanged on one side accepts the other side's
  change. This supports feasibility for that rule, not full resolver correctness.
- Moving B after H on one branch and after P on the other, in a queue A through
  T, produced a successful Git merge containing B twice. A tool invoked only
  after Git reports a conflict misses this failure. Scripted validation must
  also cover clean backlog integrations before accepting their result.

The critical design issue is ordering policy, not whether scripts can parse
conflicts. A fixed tie-break for independent additions to the same priority gap
could eliminate an unnecessary human decision, if that convention is explicitly
chosen. This would amend the current prohibition on using identity for queue
ordering only for that defined tie; it must not override explicit priority
instructions. Treat this as a policy proposal, not an adopted rule. Likewise,
three file versions show changes but cannot establish whether an arbitrary
deletion was authorized. Validated edit operations and a resolver have
complementary responsibilities; the resolver cannot repair absent intent by
itself. No permanent operation log has yet been shown necessary.

**Scope — required behavior:**

- Keep **Taken** and **Backlog list** in one ordinary Markdown file, with exact
  titles linked to canonical active homes and a compact stable identity. Keep
  story details in their canonical homes. Preserve the near-future direction
  except through an explicitly requested direction update, and preserve
  unrelated human text and the relative order of unaffected entries.
- Edit **Near-future direction** through the same scripted interface. An
  explicit human instruction may create, replace, or clear it using supplied
  text; choosing or drafting that text can require judgment, while applying
  and validating the update does not. A direction operation leaves all backlog
  entries and their order unchanged, checks the expected previous direction,
  and reports a stale value without overwriting a newer one. Ordinary item
  operations never infer, rewrite, or remove the direction.
- Reconcile the direction as one explicitly chosen value: a change on one
  side combines with item changes on the other, and identical direction changes
  apply once. Different changes to the direction, including removal versus
  replacement, require a decision and must not be synthesized into new strategy
  text, even if Git merges the text cleanly.
- Apply explicit additions, relative reprioritization, take/resume transitions,
  authorized completion/removal, and title/link updates by identity. Preserve
  existing lifecycle rules: taking moves an entry once to the end of **Taken**;
  resume does not duplicate or reorder it; pauses, failures, plan completion,
  and retrospective do not implicitly remove it. An explicit maintenance
  decision remains necessary to return cancelled work to the queue.
- Give each affected story one immutable, project-scoped work identity that is
  carried through its seed, backlog reference, and active plan when present.
  Preserve it through renaming, relocation, reprioritization, taking, and
  completion. Title, priority, filename, and current link are not identity.
  Existing bounded corrections need the same targeting guarantees using their
  own work identity; do not invent a story or seed for them.
- Safely establish identities for existing queued and Taken entries when the
  capability is adopted, retaining membership, order, titles, and links.
  Reuse suitable existing immutable identities; report ambiguous mappings or
  collisions instead of guessing. Allocate identities without AI decisions or
  silently assigning one identity to different work in parallel branches.
  Retrying adoption must retain assignments already made.
- Given the same backlog, explicit request, and relevant preconditions, produce
  the same result or diagnostic without a model call. Requests identify the
  work, action, and any priority relationship; they do not require the agent to
  supply a rewritten backlog. Report the affected identity and transition, or
  the unmet condition, without requiring interpretation of a whole-file diff.
- Validate before publishing an edit. A failed operation leaves the file
  unchanged; an intervening write cannot be silently overwritten. A retry must
  not duplicate work or apply a stale transition to a different entry: report
  already applied when established, otherwise report the unmet precondition.
- When Git reports a product-backlog conflict, resolve compatible changes from
  separate worktrees with a script, including identification of each side's
  changes and validation of the resolved result. Neither step requires a human
  or AI agent to inspect the conflict intellectually. Preserve additions,
  takes, removals, and unrelated order from both sides.
  An unchanged entry must not resurrect work removed on the other side.
  Preserve explicit relative-priority intentions; do not infer priority from
  identity, timestamp, branch name, or lifecycle state. Genuine competing
  intentions stop with the relevant identities and decision identified.
- If scripted reconciliation cannot produce and validate a result, stop the
  affected integration or publication process and require a human fix before
  resuming. Preserve recoverable Git state and report the diagnostic; do not
  ask an AI agent to inspect and repair the backlog, choose a side, skip work,
  or continue Git automatically. Revalidate a human-supplied resolution before
  the workflow resumes. Terry Yin selected this rule on 2026-09-18 for all
  script limitations, not only conflicts already classified as ambiguous.
- Validate backlog integrations even when Git reports a clean merge. Detect
  duplicate identities and invalid lifecycle or order combinations before the
  calling workflow accepts the result; clean text merging is not proof of
  backlog correctness.
- Make the behavior available through the normal backlog-maintenance,
  execution-claim, and wrap-up paths that currently edit or reconcile the list.
  A helper that leaves those paths hand-editing the file does not meet the goal.

**Conditional scope — prevent routine direct agent edits:** Assess a small,
deterministic guard for the entire canonical backlog Markdown file, including
its direction, in Codex, Cursor, and Claude Code. The user confirmed protection
is wanted when it can stay simple; stronger or substantially more complex
enforcement needs a later decision. Deliver the guard when the bounded
assessment confirms that simple approach works. Target routine agent editing tools, allow
reading and the approved backlog operations, and explain a blocked edit with
the script operation to use. This protects the backlog file, not every linked
story or plan. It is separate from coordinating concurrent script writes.

Official documentation inspected on 2026-09-18 identifies a plausible common
mechanism, not yet native-tested for this backlog:

- [Codex hooks](https://learn.chatgpt.com/docs/hooks#tool-coverage) cover
  `apply_patch` and shell calls through `PreToolUse`, with a deny result. The
  documentation explicitly describes incomplete tool-path coverage; existing
  terminal-session input also does not repeat the pre-tool check.
- [Cursor hooks](https://cursor.com/docs/hooks#pretooluse) provide `preToolUse`
  denial for agent tool calls. Agent hooks and Tab-completion hooks are separate
  surfaces, so success for Agent edits must not be reported as Tab coverage.
- [Claude Code hooks](https://code.claude.com/docs/en/hooks#pretooluse) can deny
  `Edit`/`Write` calls before execution; shell writes are a different tool route.

Prefer one shared path-protection rule with thin host adapters and existing
installation support. Use deterministic command hooks, not model-based policy
checks. Native checks must establish that the ordinary direct edit is refused
before bytes change, reading remains possible, script edits and scripted merge
resolution still work, and unrelated edits and existing hooks remain usable.
Document exactly which routes are covered and any unsupported host/version;
documentation alone does not establish protection in the supported runtimes.

This is a guard against routine accidental editing, not a claim that arbitrary
programs running with the same filesystem authority cannot write the file.
Do not grow a general shell interpreter, privileged writer service, or custom
sandbox merely to close every route. A read-only file flag by itself does not
distinguish the agent from its script, and a shared temporary unlock can expose
the file to other writers. If useful protection requires that complexity,
report the limitation and options for a human decision; the core scripted
operations and reconciliation remain required independently. No host settings
or filesystem permissions are changed during this refinement.

**Why stable identity belongs here:** Rename survival alone would not justify
a new numbering system: the existing stable anchors already supply that value.
The stronger need is deterministic targeting and duplicate detection across
story/plan links, moves, and concurrent lifecycle changes. Keep one work ID for
that purpose, with the active link serving navigation. A suitable existing
anchor may supply the ID if it meets the project-wide uniqueness and persistence
contract; an extra sequential story number is not itself a requirement. Exact
syntax and allocation are implementation choices. “Permanent” means the same
identity for the same work, never deliberately recycled for other work; it does
not require retaining completed stories or a live registry after closure. Git
retains their historical identity. Splitting work creates distinct identities
for distinct resulting stories; this story does not automate resplitting.
Terry Yin confirmed this identity requirement is in scope on 2026-09-18.

**Scope — rejection constraints:** The user's safety goal requires refusing
ambiguous or duplicate identities, missing targets or priority anchors, invalid
lifecycle preconditions, malformed relevant sections, and unsupported conflicting
intentions before writing. A renamed title alone is not a stale identity.
Explicitly removing one item never authorizes removing another. The user's
reading constraint rules out folders as the authoritative backlog, a database,
or a generated view that requires rebuilding to read current work. Clear
mechanical edits cannot require model access. No automated priority policy is
introduced.

**Key examples:** Here A, B, and so on denote stable work identities, not titles
or priority numbers.

1. *Precise local update.* **Taken** = [T], **Backlog list** = [A, B, C]. Add X
   between A and B: the result is [A, X, B, C], with T, all existing metadata,
   and the direction unchanged. Moving C before A later affects only C's
   position. Both operations and validation run without model access.
2. *Take, resume, close.* Taking B from [A, X, B, C] leaves [A, X, C] and appends
   B after T in **Taken**, carrying B's identity when its link changes to the
   selected plan. Resuming B changes no membership or order. Authorized closure
   removes only B; T and every queued item survive.
3. *Rename without losing identity.* B's title and canonical location change
   while it retains its ID. An operation targeting B still selects B, and an
   attempted second addition under its new title/link is detected as the same
   work. Adoption of IDs into an older list preserves all its entries; a
   repeated adoption retains the same assignments.
4. *Compatible concurrent additions.* Two worktrees start from [A, B, C]. One
   inserts X between A and B; the other inserts Y between B and C. Integration
   produces [A, X, B, Y, C] and leaves **Taken** unchanged. Where the text edits
   produce a Git conflict, the script resolves and validates it without manual
   or AI reconstruction. A conflict-free merge alone does not prove this
   conflict-resolution capability.
5. *Concurrent lifecycle preservation.* From **Taken** = [A, B], one branch
   closes A and the other closes B. Reconciliation leaves **Taken** empty;
   neither surviving branch-local entry resurrects its completed sibling.
   Taking queued C concurrently with closing Taken A retains C in **Taken**
   and removes only A.
6. *Unsafe or genuinely undecided update.* A requested anchor is absent, an ID
   is duplicated, or the file changes during an edit: no unrelated content is
   lost and the operation reports the specific failed condition. One branch
   removes B while another explicitly returns B to the queue: reconciliation
   preserves the unresolved conflict. Competing queue orders, including a
   same-gap insertion whose order is not established, require an explicit
   ordering decision rather than an invented priority.
7. *Explicit direction update.* With direction D0 and existing queued/Taken
   entries, a human requests D1. The script replaces D0 with the exact supplied
   D1 and leaves every item untouched. If the direction has already changed to
   D2, a request expecting D0 refuses to overwrite it. An item-only change on
   another branch combines with D1; different concurrent direction updates
   remain unresolved, including text changes that Git could merge cleanly.
8. *Lightweight edit guard, conditional on feasibility.* An agent attempts a
   direct edit of the backlog file or its direction using a covered native edit
   tool. The guard refuses before the file changes and names the script route.
   Reading the file, executing an authorized script update, and editing an
   unrelated story still work. Assess Codex, Cursor, and Claude Code separately;
   report gaps without claiming an unrestricted filesystem lock.

**Evaluation:** Observe final membership, identities, titles, links, direction,
and ordering in the real Markdown file, and exercise compatible integration in
scratch Git worktrees. Include cases whose default Git text merge demonstrably
conflicts; observe the script's resolved result and
deterministic validation, including preservation of unrelated work and compatible
removals. Run without a model service, agent credentials, manual conflict edits,
or an agent reconstructing per-item intent for the script. Include a genuinely
incompatible case that remains unresolved with a specific diagnostic. A human
may assess the evaluation evidence; routine conflict resolution must not depend
on that assessment. A custom merge driver may resolve during Git's merge without
first exposing conflict markers; compare against the default text-merge baseline
in that case. Also exercise a clean text merge that duplicates a moved identity
and establish that scripted validation refuses it. Verify adoption on an existing backlog, not only an already
converted fixture. These observations evaluate the automation assumption; a
shorter prompt, a clean text merge, or an agent's claim of correctness does not.
This is a refinement contract, not an executable plan or a complete test inventory.

**Delivery scope:** Terry Yin confirmed on 2026-09-18 that this capability is for
all projects using Open Dough. Required scripts and guidance must be installed
locally, operate on the executing project's backlog and conventions, and remain
standalone in ordinary use. The root-level helper is evidence to reuse; projects
must not depend on access to the Open Dough source checkout. Applicable
installation and update checks must cover delivery of this support.

**Deferred promises:** No general Git integration queue, cross-machine locking
service, automatic product prioritization, model interpretation of ambiguous
requests, backlog UI, historical reporting, global cross-project ID registry,
automatic split/merge of stories, or retroactive numbering of completed work.
An AI-assisted fallback and configurable script/AI/human recovery ladder are
future possibilities, not features or extension machinery for this delivery.
The story does not promise that arbitrary direct file edits are safe or that
all Git conflicts disappear. Direct-edit protection has the conditional,
lightweight boundary above; enforcement against every shell, external program,
or deliberate bypass is not promised. It does not decide execution ownership, completion
eligibility, branch publication, or where claim commits belong; those remain
with their existing workflows and the adjacent merge-queue story.

**Value / learning:** Establish whether validated operations plus persistent
identity and compatible reconciliation remove repeated judgment from backlog
maintenance while retaining its simple reading experience. File-per-item
storage is not needed to learn this, and IDs alone do not establish edit safety.

**Effort hypothesis:** M, medium-low confidence. Local operations have a useful
starting point; identity adoption, integration preservation, and replacing
existing workflow edit paths make this more than an insertion-script change.

**Depends on:** Existing backlog lifecycle and canonical-home conventions; no
new product prerequisite. It need not wait for the same-machine merge queue:
protecting an individual backlog edit is distinct from serializing whole Git
integrations.

**Architecture and boundaries:**
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports continuous integration, one coherent domain representation, and
reducing repeated judgment. Follow
[ADR 0004 — Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md)
for standalone installed support and
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for one shared behavioral owner with project-supplied context. Under
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md),
identity persistence must not create a completed-story archive; use deterministic
checks for shared behavior and affected delivery checks or justified native
evidence reuse across Codex, Cursor, and Claude Code. Follow
[maintainer guidance](../../AGENTS.md) when authoring. No Accepted ADR conflict
was found; ADR 0007 remains Proposed and is not adopted here.

**Safe stopping point:** Validated local operations with stable identities are
useful independently, but do not complete this story's concurrent-reconciliation
promise. Later work on the general integration queue may be cancelled without
losing the delivered backlog behavior.

**Remaining uncertainty and design choices:** Validate the scripted
conflict-resolution assumption beyond the bounded probes above. Same-gap order
without an established priority stops for a human under the current rule;
the proposed automatic tie-break is not included in this delivery. Establish
whether the native edit guards can meet their bounded
outcome with small shared logic and thin adapters; seek a decision before
expanding to complex enforcement. ID spelling, safe
allocation, the write mechanism, and reconciliation approach remain design
choices constrained by these outcomes; no separate registry, operation log,
Git hook, or merge driver has been selected by refinement.

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
