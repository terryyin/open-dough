# Integration through origin

Status: in progress; slice 5 next.

## Learnings

- Publication remote facts stay in `publish-the-candidate.md`; default-checkout
  access, preservation, and independent maintenance outcome live in
  `maintain-default-checkout.md`. Callers defer to both; full opportunistic
  refresh decision remains for slice 5.
- Publication and preparation Git proof is
  `publication.test.mjs`, `publication-resume.test.mjs`,
  `publication-racing-suffix.test.mjs`,
  `publication-racing-suffix-replay.test.mjs`,
  `preparation-publication.test.mjs`, and
  `preparation-publication-resume.test.mjs`. Those suites exercise Git
  mechanics, not guidance-following.
- Owned-workspace publication pushes the candidate SHA and does not
  fast-forward the default checkout. `git branch -d` then treats a
  session-created branch as merged only after its upstream is the fetched
  authorized remote; a lagging default-checkout `HEAD` is not an unmerged
  branch. Slice 5 still owns whether a clean checkout is refreshed.
- Resume classifies the retained candidate by ancestry of the SHA kept
  immediately before the push, not by the remote tip. After a rewrite that
  SHA is the rewritten one. A lost success plus a later writer's commit is
  already published: record it, register it when an observer is already
  bound, and do not push. Maintenance stays an inspection result and cleanup
  stays with its caller. Unpublished fast-forward resume pushes that SHA
  once. A remote advance while the candidate is still absent stays
  rejected-push recovery, not this classification. Proof is
  `publication-resume.test.mjs` and `preparation-publication-resume.test.mjs`.
- An owned-suffix replay is
  `rebase --onto <fetched-trunk> --ref <base-the-suffix-extends> --branch <owned-branch>`
  through the backlog rebase adapter when the suffix touches the backlog.
  After a rewrite, that base is the trunk just replayed onto, not the older
  published revision and not the candidate tip. `--pre-rebase-tip` and
  `--destination-at-start` name aggregate endpoints only. One replay and one
  retry push follow the initial rejection; a conflict during that replay, or
  a second rejection, stops with the Git state left in place.

### Accepted proof — slice 1

Promise: publication and default-checkout maintenance have distinct owners;
existing external Git outcomes stay the same.

```text
command: node --test src/skills/dough-execute-plan/scripts/publication.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication-resume.test.mjs
boundary: Git mechanics on disposable remotes/worktrees
setup: none (suites build fixtures)
observations: publication.test.mjs claim, owned-suffix rebase, unrelated-local stop, one rejected-push recovery; preparation keep/leave-unpublished/discard and cleanup only after confirmed publication
guidance walk: preparation-disposition.md and trunk-publication.md defer to publish-the-candidate.md and maintain-default-checkout.md
result: pass (11/11) after slice 2 renamed these suites; original 14/14 covered the same outcomes before that rename
```

### Accepted proof — slice 2

Promise: an explicit keep publishes the retained record from the owned workspace; a pending human edit on the default checkout stays out of that candidate and is reported as deferred maintenance. Leave-unpublished and discard stay local.

```text
command: node --test src/skills/dough-execute-plan/scripts/publication.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication-resume.test.mjs
boundary: Git mechanics on disposable remotes/worktrees
setup: fixtures create the remotes and workspaces; tests plant the human edit and unrelated commit before the push
observations: publication.test.mjs pending-human-edit test asserts remote candidate SHA, parent trunk, unchanged checkout HEAD/bytes, deferred maintenance, and an origin tree without unrelated.txt or human-* files; preparation-publication.test.mjs keep test asserts seed-draft.md content on a second clone, the other writer as parent, unchanged checkout, and worktree removal only after confirmed publication
guidance walk: preparation-disposition.md step 3 and publish-the-candidate.md step 5; decomposition, refinement, slice planning, and plan refinement share that disposition
result: pass (11/11)
```

### Accepted proof — slice 3

Promise: a rejected push replays only the owned suffix once, rechecks the combined backlog, and pushes once. A conflicting backlog change or a second rejection keeps that Git state and does not try again.

```text
command: node --test src/skills/dough-execute-plan/scripts/publication-racing-suffix.test.mjs src/skills/dough-execute-plan/scripts/publication-racing-suffix-replay.test.mjs tests/support/product-backlog-git-rebase-onto.test.mjs tests/support/product-backlog-git-rebase.test.mjs tests/support/product-backlog-git-rebase-clean.test.mjs tests/support/product-backlog-git-rebase-clean-accepted.test.mjs tests/support/product-backlog-git-rebase-sequence.test.mjs
boundary: Git mechanics
setup: fixtures; a second clone advances origin before the rejected push, and again before a second rejection
observations: publication-racing-suffix.test.mjs asserts parent is the other writer's commit, the log range is only "verified increment", the affected backlog check sees sibling B and owned D, and the checkout is unchanged; the conflict test leaves exec/story on the rejected candidate; the second-rejection test does not absorb the later remote commit; publication-racing-suffix-replay.test.mjs uses the trunk just replayed onto as the next cutoff; product-backlog-git-rebase-onto.test.mjs replays only the owned suffix
result: pass (4/4 racing cases after the split; adapter suite reused, 21/21 before the split)
```

### Accepted proof — slice 4

Promise: resume classifies the retained candidate from remote ancestry. A lost success followed by another writer's advance is already published and is not pushed again. An unpublished candidate is pushed once.

```text
command: node --test src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication-resume.test.mjs
boundary: Git mechanics
setup: fixtures; the lost-success case pushes the rewritten SHA, drops the response, then another writer advances origin
observations: publication-resume.test.mjs asserts the later tip's parent is rewrittenSha, the pre-rebase SHA is not an ancestor, published revisions record only rewrittenSha, and a later resume push count is 0; preparation-publication-resume.test.mjs removes the worktree only after already-published, and an unconfirmed keep leaves origin at trunk
result: pass (5/5); refactor reused this proof after moving message and worktree counters
```

## Execution identity

- Mode: Story Branch Mode
- Originating / integration checkout: `/Users/terryyin/git/open-dough` on `main`
- Authorized remote target: `origin/main`
- Execution checkout: `/Users/terryyin/git/open-dough-worktrees/070-integration-through-origin`
- Execution branch: `cursor/070-integration-through-origin`
- Claim published revision: `ca99ff262ef1939276046164de6781bca642f453` (trunk claim; Story Branch `pendingCi: unobserved`)
- Retained published revisions (this execution): `ca99ff262ef1939276046164de6781bca642f453`
- CI observer: `/tmp/dough-ci-501/watch-bap1mT` observing `terryyin/open-dough` branch `cursor/070-integration-through-origin` (GitHub Actions workflow `ci.yml` / `CI`)
- Replanning permission: allowed (existing planning authority retained; no `--no-replan`)
- Concurrent Taken work: SEED-008#prepare-execution-worktree on `cursor/069-prepare-execution-worktree` (coordinate exclusive integration turns when publishing to trunk)

## Source and outcome

Identity: SEED-008#migrate-git-branching-and-integration

Source: [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#migrate-git-branching-and-integration).
Terry authorized complete refinement, slice planning, and necessary plan
refinement on 2026-09-21. The requested output is a plan. All slices are planned.

A developer runs independent tasks in owned workspaces and publishes validated
changes to the designated remote history while preserving other tasks' pending
local work. Complete the migration across implemented journeys and strengthen
the architecture that expresses their common responsibilities.

## Current decisions and boundaries

- The configured remote trunk is the shared integration authority. `origin` and
  `main` below are fixture names; runtime guidance resolves project context.
- An owned workspace prepares a candidate against fetched remote history. The
  caller supplies publication authority, destination, owned changes, and proof.
  Candidate construction preserves published history: unpublished suffixes can
  be rebased; a published story can be merged using the project's supported
  history policy. The remote's acceptance establishes publication.
- Workspace ownership, candidate preparation, publication/recovery, checkout
  maintenance, backlog semantics, and CI attribution are distinct concepts.
  Each behavioral rule has one authoritative home with small caller adaptations.
- Establish an owned workspace before a queued claim. Publish the claim before
  implementation in isolated modes. A matching retained execution resumes;
  another execution's published claim requires a recoverable conflict outcome.
  Use existing retained execution context and stable backlog identity to decide
  that distinction. Preserve the worktree-preparation story's readiness boundary
  before any project command depends on setup.
- Each trunk publication attempts an opportunistic default-checkout refresh
  under established local ownership. Successful publication and deferred refresh
  are independently reportable. Independent task setup can use fetched trunk.
- Preserve explicit local-only authority: commit/retain the authorized result in
  its owned workspace and report any pending publication. Preparation retains
  its keep/draft/discard decision. Caller-selected current-branch execution and
  its closure retain their existing publication owner. Existing task-authorized
  local merges remain local operations with truthful completion reporting.
- Retry reconciliation after a racing remote advance using the existing bounded
  policy: one ordinary retry after the initial rejected attempt, then preserve
  state and report persistent contention. Recovery first checks whether the
  candidate is already in remote history. Respect project protection/review
  requirements and use established supported publication routes.
- Keep the accepted remote revision and target as the input to CI registration.
  The existing observer lifetime and failure-repair contract remain owned by CI
  guidance. Cleanup uses actual publication, work ownership, and runtime state.
- Strengthen the implicated architecture up front and through slice-local
  refactoring. Necessary restructuring may cross existing file and skill
  boundaries. Select changes by conceptual ownership and current callers, with
  product behavior and proof kept coherent at each delivery boundary.
- Write all maintained guidance, names, examples, and test explanations around
  the supported contract. Delete superseded representations with their
  replacement. History remains in Git. Safety rules explain present ownership,
  preservation, authority, and recovery requirements.

Later outcomes retain their own stories: automated local locks and scheduling;
CI-observer overhead; dashboard features; new background/cloud-host capability;
changes to Story Branch integration timing; general hosted-review automation.
This plan changes the Git mechanics used at an already-authorized lifecycle
boundary. It leaves the ADR 0007 timing question with its human decision owner.

## Architectural basis and PFE findings

Inspection baseline: `3543fad2167169092ac47ba5afbbeba4d0a0d40b`.

Follow [AGENTS.md](../../../AGENTS.md), Accepted
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(domain mapping, cohesion, continuous integration),
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
(shared released payload),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(behavior and native evidence), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one behavioral source written for the executing agent).
[ADR 0009](../../../docs/adrs/0009-git-branching-and-integration.md) remains
Proposed; Terry explicitly selected its Git direction for this story. The
existing [North Star topic](../../NORTH-STAR.md#remote-publication-and-default-checkout-ownership)
already supplies sufficient short-term direction.

| Responsibility | Existing evidence | Selected architectural treatment |
| --- | --- | --- |
| Candidate publication and observed recovery | `dough-execute-plan/references/publish-the-candidate.md` owns fetch, validation, push, and resume; its preconditions and success test also embed checkout state | Change this shared owner. Separate remote facts from local-maintenance obligations; callers use the same acceptance/recovery rules. |
| Candidate construction and lifecycle authority | `trunk-publication.md`, execution `wrap-up.md`, preparation disposition, and story wrap-up each select owned work and destinations | Retain caller decisions; represent unpublished-suffix replay and published-history merge as explicit inputs/strategies at their actual domain boundary. |
| Default-checkout access and freshness | Publication preconditions, execution-location, preparation cleanup, and story closure repeat local-state requirements | Extract one focused maintenance reference beside the publisher, invoked for local edits/refresh with an independent outcome. |
| Workspace ownership and readiness | `dough-manual-testing/references/exploration-workspace.md` is reused by preparation; `execution-location.md` owns execution identity and setup | Reuse the shared ownership lifecycle, leaving execution-specific readiness and resume identity with execution. Reorder claim setup around the owned workspace. |
| Backlog meaning and concurrent reconciliation | Product-backlog document/identity/mutation modules and Git merge/rebase/cherry-pick adapters | Reuse these owners. Any reconciliation capability genuinely needed by the chosen Git operation belongs here, with its own existing adapter tests. |
| CI attribution and repair | `ci-monitor.md`, `runtime-setup.md`, and target-branch/worktree runtime tests already separate target from working directory | Reuse accepted-SHA/target registration and repair ownership; route repair publication through the common contract. |
| Durable bug-triage artifacts | `dough-bug-fixing/SKILL.md` independently commits, locally integrates, rebases, and cleans exploration records | Route artifact retention/disposition to the preparation owner, with explicit caller authority and preserved evidence. |
| Installed behavior and evidence | Payload declaration/tests, shared native supervision/result/host helpers, Git fixtures | Reuse delivery and native infrastructure; update domain assertions and add only the missing journey/assessor. |

Paths in this table are relative to `src/skills/` unless otherwise specified.
The current publication and preparation tests execute Git commands directly.
They establish Git mechanics, not that the agent follows the guidance. Preserve
that distinction when assigning proof.

A cohesive design is demonstrated by a rule change reaching its owning source,
with callers supplying their context. A low file count is not an acceptance
criterion. Shared wording with duplicated decision logic is still duplication.
Avoid constructing a generic workflow engine merely to consolidate prose.

## Completeness inventory

This is the active plan's coverage map; update it when execution discovers an
additional affected caller. All listed journeys are part of the one outcome.

| Journey / representation | Inspected source owner | Slice ownership |
| --- | --- | --- |
| Remote candidate, retries, and resume | execute-plan `publish-the-candidate.md`, `publication-rebase-conflict.md`, `trunk-publication.md` | 1–4 |
| Default checkout and explicit direct edits | publication preconditions; execution/preparation location and cleanup guidance | 1, 5 |
| Workspace selection and Taken claim | execute-plan `SKILL.md`, `execution-location.md`; product-backlog take and Git adapters | 6–7 |
| Planned, planless, contextual, correction, and repair delivery | execute-plan `wrap-up.md`, `ci-monitor.md`, `runtime-setup.md`; bug-fixing, retrospective, test-optimization handoffs | 8 |
| Trunk final closure and resources | story-wrap-up, execute-plan trunk closure and wrap-up observer | 9 |
| Story Branch progress and final integration | execute-plan branch delivery; story-wrap-up merge/push and cleanup | 8, 10 |
| Explicit current-branch and existing host-owned contexts | execution-location, direct-current-branch closure and report | 11 |
| Decomposition/refinement/planning/plan-refinement disposition | shared preparation workspace and disposition references | 2, 4–5 |
| Bug investigation and durable remaining-work artifacts | bug-fixing remaining-work route; exploration workspace lifecycle | 12 |
| Authoritative source, manifests, delivered references, docs, tests, names, comments | installer/release payload declarations, tests, ADR/requirements links, public guidance | every affected slice; 13 |
| Native agent use and preservation | shared native harness and observable fixture state | 14 |

The manual-testing exploration lifecycle and internal release-version workflow
have separate owners for evidence retention and release/tag authority. Review
references that touch this migration, preserving those domain responsibilities.
Apply the same inventory to `src/`, `tests/`, `docs/`, and applicable internal
maintainer guidance. Managed installed copies are updated through released
payload delivery under AGENTS.md.

## Proof and delivery conventions

Each slice owns implementation, affected guidance and tests, representative
agent behavior review, and cleanup of superseded material in that footprint.
After changes, apply the established independent post-change refactoring and
execution proof/delivery gates. Review the implicated concept across its
representations, including untouched callers needed for cohesion. Then run the
focused proof and applicable checks. Each committed boundary stays usable and
green; whole-story completion requires the complete coverage map.

Use real disposable bare remotes, linked worktrees, and a second clone for Git
observations. Assert remote refs/ancestry, retained owned commits, working-tree
bytes and index state, backlog identity/order, and actual command locations.
Inject competing updates at the push boundary. A fixture-created desired result
or a hand-run protocol alone cannot establish agent invocation behavior.

The following capability-named test entry points are proposed outputs, to be
added or formed by renaming/consolidating the affected existing suites. Keep
one shared fixture and assessor per domain responsibility:

- **P:** `node --test src/skills/dough-execute-plan/scripts/publication.test.mjs src/skills/dough-execute-plan/scripts/publication-racing-suffix.test.mjs src/skills/dough-execute-plan/scripts/publication-racing-suffix-replay.test.mjs`
- **W:** `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs`
- **R:** `node --test src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs`
- **C:** `node --test src/skills/dough-story-wrap-up/scripts/closure-publication.test.mjs`
- **B:** `node --test src/skills/dough-bug-fixing/scripts/retained-artifacts.test.mjs`
- **N:** `bash tests/git-publication-native.sh` (credential-free runner/assessor checks)

Tests of Git mechanics must be labeled as such. A guidance behavior claim uses
an assessed representative walkthrough and, where required, the native evidence
owned by slice 14. Reuse the current suites' supported cases while replacing
their obsolete expectations; each slice states the new observable promise.
Wire maintained deterministic suites into the existing test runner as they land.

Available regression entry points:
`bash tests/product-backlog-git.sh`, `bash tests/execution-ci-runtime.sh`,
`bash tests/execution-payload-update.sh`, `bash tests/story-payload-update.sh`,
and `bash tests/story-payload-assertions.sh`.
Follow repository environment/setup and formatting conventions. Run focused
checks per slice; run applicable final regression, `npm run lint`, and `npm test`
once after the complete change unless new changes or failures warrant another
run. Release/tag selection remains the release workflow's responsibility.

## Ordered slices

### 1. Give publication and checkout maintenance distinct owners

Type: Structure
Status: done

Separate the shared publisher's candidate/remote facts from default-checkout
access, refresh, and local preservation. Keep the existing external workflow
behavior while consolidating duplicated rule ownership in its consumers. The
immediate next Behavior is owned-workspace preparation publication in slice 2.
Use focused references and caller inputs; preserve conditional caller authority.

Proof: Existing publication/preparation Git suites retain their supported
outcomes. Walk one preparation and one execution caller to the same publication
owner and one local-maintenance owner; inspect that recovery and cleanup use
those owners. Run the affected current suites before their capability rename.
Sizing: one responsibility separation, medium confidence. Stop safely with the
existing external contract and consolidated ownership; slice 2 changes the
publication outcome.

### 2. Publish retained preparation from its owned workspace

Type: Behavior
Status: done

Given an owned preparation workspace and an explicit keep instruction, publishing
its retained records produces an accepted candidate in the authorized remote
history and a truthful disposition, including when the default checkout has a
pending human edit. Draft/discard/local-only authority preserves the selected
local disposition. Decomposition, refinement, planning, and plan refinement
all consume this shared disposition.

Change the common publisher and its actual preparation caller together. Update
execution publication references that repeat shared preconditions so they defer
to the common owner. Retain applicable resource ownership and record the separate
checkout maintenance outcome; the full refresh decision belongs to slice 5.

Proof: P and R observe the remote candidate, owned artifact content, unchanged
human working tree/index, correct disposition and retained resources. Review the
invocation using the actual skill input, rather than supplying Git commands as
its answer. Native preparation evidence is owned by slice 14.
Sizing: one retained-result publication gate, medium confidence. Safe stopping
point: preparation has a complete shared publication path; remaining caller
migrations stay explicitly unfinished in this plan.

### 3. Reconcile a racing remote update in the owned workspace

Type: Behavior
Status: done

Given a validated unpublished candidate, when another writer advances the target
before push, the publication owner fetches, reconciles only the owned change,
rechecks affected behavior, and retries within the bounded policy. Substantive
conflicts or exhausted retries retain exact recovery state and report the issue.

Use the existing backlog Git adapters whenever backlog content is combined.
Choose a Git operation whose range matches the owned suffix. If that operation
needs an adapter capability, extend the existing adapter and its proof in this
slice; keep backlog meaning with the backlog owner. Preserve published ancestry.

Proof: P plus the affected backlog adapter tests drive an actual rejected push
using two writers, then observe accepted combined history, affected validation,
and sibling backlog preservation. Exercise conflicting intent and a second
rejection as recoverable outcomes of the same decision. Native evidence samples
this boundary in slice 14.
Sizing: one reconciliation decision, medium confidence; exact suffix handling is
the main risk. Safe stopping point: bounded remote contention is recoverable.

### 4. Resume from observed remote publication state

Type: Behavior
Status: done

Given an interrupted publication, resume classifies the retained candidate from
remote history and completes the first unfinished obligation. A lost success
response followed by another writer's advance is recognized as published.
An unpublished candidate remains an owned recoverable candidate.

Use the same recovery owner for preparation and execution. Keep publication,
checkout maintenance, observer registration, and cleanup outcomes separate in
existing retained context. Carry a rewritten candidate's identity correctly.

Proof: P and R cover interruption before acceptance and after acceptance with a
lost response and later remote advance. Observe candidate ancestry, the number
of accepted publications, preserved commits, and remaining obligation handling.
An observer stub validates receipt attribution only; native use validates the
agent's recovery decision in slice 14.
Sizing: one observed-state recovery classification, medium confidence. Safe
stopping point: resume preserves and correctly reports each publication state.

### 5. Maintain the default checkout under local ownership

Type: Behavior
Status: planned

Given a refresh or bounded direct edit, established local ownership and current
checkout state determine safe mutation. Eligible clean checkouts fast-forward;
pending human edits, staged changes, unpublished commits, ongoing operations,
and ambiguous ownership are preserved with a deferred maintenance result.
Owned-workspace publication reports success independently of that result.

Use the focused maintenance owner established by slice 1. Attempt refresh after
trunk publication and verify freshness before using the default checkout as a
base. A direct-edit owner publishes only its authorized change through the
shared contract. Re-read current state after access/handoff; existing explicit
coordination supplies ownership until the separate automation story delivers.

Proof: P observes clean advancement and exact preservation of index/working-tree
state, unpublished commits, and another writer's ownership. A busy-checkout
case accepts a remote publication and records deferred refresh; a later
coordinated attempt advances to current remote history. Review a direct edit's
ownership interval through commit and safe release.
Sizing: one local mutation eligibility decision, medium confidence. Safe
stopping point: baseline maintenance works with explicit coordination.

### 6. Give workspace selection one reusable ownership lifecycle

Type: Structure
Status: planned

Consolidate reusable checkout ownership, retained identity, and safe selection
with the existing exploration/workspace lifecycle. Keep execution mode,
project-command readiness, and execution resume context with execution-location;
preparation supplies its own disposition. Preserve external setup ordering in
this structural slice. This immediately enables the claim-order change in 7.

Reconcile with the then-current result of plan 069. Reuse its readiness rule and
proof, preserving the active owner's work. Record target selection and local
checkout role separately in retained context, using actual established paths.

Proof: Existing setup and preparation lifecycle checks retain their behavior.
Walk preparation, contextual execution, and queued execution through the shared
ownership rule with their own domain-specific continuations. Run plan 069's
applicable focused checks if present on the integrated base.
Sizing: one ownership responsibility consolidation, medium confidence. Safe
stopping point: reusable ownership with unchanged caller outcomes.

### 7. Publish a Taken claim from an owned workspace

Type: Behavior
Status: planned

Given queued work, select/reuse the owned execution workspace, prepare commands
as required, and publish the claim to remote trunk before implementation begins.
Concurrent claims for distinct stories preserve both changes. Competing claims
for the same identity result in one published owner and a recoverable conflict
for the other execution. A matching retained execution resumes its own claim.

Update startup and location selection together. Reuse backlog identity,
mutation, and adapter semantics; establish ownership from retained execution
context and the actual claim candidate's publication provenance. Recheck remote
membership before replaying a competing claim; identical Taken text alone is
insufficient evidence that this execution owns it. Ambiguous ownership retains
the conflict for resolution. Dashboard developer-name allocation remains with
its own story. Remote claim success is retained if
later environment preparation fails, with a recoverable continuation.

Proof: W and backlog adapter tests observe workspace selection, command
readiness when needed, claim mutation/publication, and implementation ordering.
Race two distinct identities and two attempts on one identity; assert published
membership and ownership outcomes. A setup failure preserves usable recovery
context. Native execution in slice 14 proves actual invocation sequencing.
Sizing: one claim acquisition gate, medium confidence because startup ordering
crosses readiness and publication. Safe stopping point: isolated execution starts
from its published claim; shared backlog meaning remains coherent.

### 8. Publish execution increments and repair results through the common owner

Type: Behavior
Status: planned

Given a prepared execution workspace, a validated increment or owned repair is
published to the mode's authorized destination and registered using the accepted
revision and target. Planned, planless, contextual, bug-repair, and retrospective
correction entry points converge on this delivery outcome.

Trunk Mode uses its local branch to construct candidates for remote trunk.
Story Branch Mode publishes to its recorded remote execution branch. Preserve
caller proof and the existing asynchronous observer lifetime, pause/stash/restore
repair contract, and execution workspace identity. Use shared publication and
recovery rather than a second CI-repair delivery procedure.

Proof: W and `bash tests/execution-ci-runtime.sh` observe mode-correct remote
history and accepted-SHA receipts. A repair case preserves unfinished owned work
and restores it after its publication. Trace each wrapper to this same delivery
owner; sample the materially different entry authorities in behavior review and
native acceptance.
Sizing: one execution delivery gate, medium confidence. Safe stopping point:
all execution entry routes share attributable increment and repair publication.

### 9. Complete Trunk Mode closure with recoverable resource cleanup

Type: Behavior
Status: planned

Given completed Trunk Mode work, publish before-cleanup and final-closure
revisions through the common owner, finish the existing observer obligation,
and remove eligible session-owned resources. A deferred default-checkout refresh
is reported separately. Interruption resumes outstanding obligations from actual
remote and resource state.

Keep lasting knowledge assimilation and backlog closure with story-wrap-up;
publication and maintenance retain their shared owners. Protect active observers,
other workspaces, dirty state, and unique unpublished work through the existing
cleanup ownership rule.

Proof: C observes closure records on remote trunk, accepted-SHA attribution,
resource removal eligibility, and a retry after partial cleanup. Preserved
resources carry an explicit reason and remain usable. Native evidence is part
of the completed execution journey in slice 14.
Sizing: one closure completion gate, medium confidence. Safe stopping point:
Trunk Mode completes or resumes closure truthfully.

### 10. Integrate a published Story Branch closure through remote trunk

Type: Behavior
Status: planned

Given a published story and an authorized integration boundary, prepare a
validated candidate in an owned workspace that preserves published history and
sibling backlog changes, publish it to remote trunk, and complete eligible
resource cleanup. Project merge policy determines candidate construction.

Use the same publication/recovery owner with a history-preserving candidate;
retain the existing backlog merge adapter. A racing trunk advance recomputes a
candidate preserving both published histories. Recognize an already-accepted
closure on retry. Remote story-branch cleanup uses the project's integration
proof and retained exact identity.

Proof: C and backlog merge tests observe the story's accepted closure and
sibling backlog state after concurrent target changes. Assert published ancestry
for the supported merge convention, validated combined behavior, and exact
eligible branch/worktree cleanup. Native Story Branch use belongs to slice 14.
Sizing: one story integration completion gate, medium confidence. Safe stopping
point: Story Branch publication and closure share remote authority.

### 11. Preserve explicit current-branch publication authority

Type: Behavior
Status: planned

Given explicit current-branch or an already-supported host-owned execution,
work remains in its recorded checkout and follows the caller's established
commit/publication authority. Local-only closure is reported as committed and
pending publication; an authorized delivery uses the common remote contract.

Adapt target/workspace references, preservation, and reporting to the shared
model. Compose default-checkout access where that workspace is selected and
retain contextual local-base decisions. Preserve existing supported host choices.

Proof: W and C pair local-only and publish-authorized invocations, observing
actual remote refs, retained commits, checkout identity, and reports. Existing
local commit/merge requests remain accurately classified as local operations.
Review existing host-owned callers against the same authority inputs.
Sizing: one authority-controlled delivery decision, medium confidence. Safe
stopping point: supported explicit caller contexts use the common model.

### 12. Retain bug-triage artifacts through preparation disposition

Type: Behavior
Status: planned

Given durable authorized records from bug investigation, remove only disposable
reproduction changes and retain the records under preparation's disposition.
Publish explicitly retained results from their owned workspace when authorized;
local drafts remain recoverable with their pending disposition stated.

Route bug-fixing remaining-work retention to the shared preparation/publication
owners. Preserve the existing backlog selection policy and the exploration
lifecycle's session-created versus reused ownership. Repair execution itself
already routes through slice 8.

Proof: B and R observe the canonical story/backlog record, unrelated exploration
content preservation, selected disposition, remote acceptance when authorized,
and eligible workspace retention or cleanup. Review a bug report that produces
remaining work and a caller that deliberately retains local evidence.
Sizing: one durable-artifact disposition gate, medium confidence. Safe stopping
point: bug investigation and ordinary preparation share artifact ownership and
publication behavior.

### 13. Receive the complete contract through an ordinary payload update

Type: Behavior
Status: planned

Given a project with a supported prior installation, an ordinary candidate
update delivers the coherent references and runtime dependencies required by
the migrated journeys while preserving project-owned configuration.

Update affected source payload declarations and reference links as needed.
Review the completeness inventory against all current source callers, public
and maintainer documents, examples, fixtures, test names, and comments. Give
current behavior affirmative explanations and current domain names. Assess
architectural cohesion after the full migration and resolve implicated duplicate
owners through refactoring within the owning slices' promises.

Proof: `bash tests/execution-payload-update.sh`,
`bash tests/story-payload-update.sh`, and
`bash tests/story-payload-assertions.sh` exercise ordinary update and installed
references with preserved project sentinels and configuration. Include every
new or relocated runtime reference in its existing payload owner. Use the
installed entry points to establish that the complete required contract is
available in each supported layout. The source inventory maps every affected
journey to its current owner and proof.

Sizing: one ordinary-update contract with existing fixture infrastructure;
medium confidence. Safe stopping point: the candidate payload is complete and
inexpensive checks pass. Native acceptance remains owned by slice 14 before
release qualification.

### 14. Use the installed publication contract in supported native sessions

Type: Behavior
Status: planned

Given that updated candidate in a fresh supported host session, an ordinary
skill invocation follows the shared Git contract and produces the intended
remote, workspace, and preservation outcome. The same shared behavior applies
through Codex, Cursor, and Claude Code's existing supported interfaces.

Reuse the native supervision, stream, result-retention, and host adapters.
Extend only the bounded journey and outcome assessor for this publication
contract. Fixtures supply starting repositories, human edits, concurrent writers,
and controlled response interruptions. The native agent performs actual
workspace selection, claim, publication, and recovery from installed guidance.
Prompts state the task and authority; observable state establishes the result.

Proof entry points to add:

```sh
bash tests/git-publication-native.sh
bash tests/git-publication-native.sh --native codex
bash tests/git-publication-native.sh --native cursor
bash tests/git-publication-native.sh --native claude
```

The credential-free invocation tests maintained runner/assessor behavior with
substitute processes, complete streams, and counterexamples. For native runs,
reuse slice 13's candidate and follow these evidence boundaries:

- Exercise the shared publication boundary from an owned workspace on each
  host while another checkout holds a human edit. Observe accepted remote
  history, preserved index/working-tree state, and separate local maintenance.
- Select representative preparation, queued execution through Trunk closure,
  Story Branch closure, and durable bug-artifact disposition cases across the
  hosts. Trace each distinct caller's authority and useful outcome. Cover
  explicit local-only authority in the corresponding invocation.
- Select the materially different claim-race and uncertain-response recovery
  cases against the same common model. Observe actual claim ownership before
  implementation and accepted candidate ancestry after another remote advance.
  Use the existing bounded runner controls; preserve inconclusive evidence for
  the current assessment.
- Record each affected requirement and host as fresh proof or justified reuse,
  with candidate, invocation, runtime, decisive state, and result. Shared source
  and equivalent adapter behavior can support a reuse argument; identify what
  was actually observed. Distinguish mechanical Git checks, guidance review,
  payload proof, and native agent behavior.

The native assessor accepts equivalent wording and checks observable outcomes.
Test it against a claimed success with missing remote acceptance, captured human
edits, wrong claim ownership, and a stale or incomplete native stream. Separate
host failures remain explicit acceptance work under ADR 0005; release coverage
requires current proof or justified reuse.

Sizing: one installed-use contract and common assessor, with bounded independent
host runs. Medium confidence after separating update from use and reusing native
infrastructure. Adapter-specific evidence gaps are resolved at this boundary;
keep each case independently inspectable. Safe stopping point: supported native
use has assessed evidence or an explicit outstanding acceptance obligation.

## Promise ownership

| Refined-story promise | Owning slices and observations |
| --- | --- |
| Full caller coverage and one shared Git contract | inventory, 1–12, final source/behavior review in 13 |
| Fresh/explicit base and reusable owned workspace | 6–7, 11; retained identity and setup trace |
| Claim publication before implementation; concurrent identity protection | 7; remote membership, owner context, implementation ordering |
| Trunk increments, Story Branch publication and integration | 8–10; remote target, published history, closure records |
| Bounded races, conflicts, and uncertain response recovery | 3–4; real rejected push, remote ancestry, preserved recovery state |
| Safe default-checkout edits and opportunistic refresh | 5; index/working-tree preservation, freshness, independent publication result |
| Preparation and bug durable-record disposition | 2, 12; explicit disposition, canonical artifacts, owned resource state |
| Current-branch authority and local-only retention | 11; caller authority, local commits, truthful pending publication |
| CI attribution, repair, and resource recovery | 4, 8–10; accepted revision/target, restored work, observer-aware cleanup |
| Strong domain architecture and slice-local refactoring | 1, 6 and every slice review; owner/caller walkthrough, cumulative inventory |
| Affirmative maintained guidance and current tests | every changed footprint; final inventory review in 13 |
| Supported payload and host behavior | 13: ordinary update; 14: native observations and justified evidence reuse |

## Plan refinement assessment

The plan has 14 slices: two Structure and twelve Behavior. Refinement separated
payload update from native use, giving each its own observable gate and proof.
No completed slices existed. All story promises remain mapped above; both
Structure slices immediately precede the Behavior they enable.

The cumulative model uses one publication owner with explicit candidate and
caller inputs. Claim acquisition, preparation disposition, closure, and CI
observation retain their domain-specific decisions. Each new scenario exercises
that model. Discovery of a duplicated rule triggers refactoring at its owning
boundary and reassessment of affected caller proof.

| Slices | Assessment | Boundary checked |
| --- | --- | --- |
| 1–2 | Ready | Responsibility separation immediately enables retained-result publication. |
| 3–4 | Ready | Remote reconciliation and observed-state recovery are separate, bounded decisions. |
| 5 | Ready | Local mutation eligibility owns direct-edit/refresh preservation and maintenance reporting. |
| 6–7 | Ready | Shared workspace lifecycle immediately enables an owned-workspace claim; readiness composes from plan 069. |
| 8 | Ready | Existing execution and repair callers converge on one increment-delivery gate. |
| 9–10 | Ready | Each mode's closure has its own externally visible completion gate and preservation proof. |
| 11–12 | Ready | Explicit authority and durable investigation-artifact disposition have separate caller outcomes. |
| 13–14 | Ready | Installed payload availability and native use have separate evidence and proof loops. |

No unresolved story-scope or architectural question remains. Execution review
points are concrete: slice 3 must use an exact owned-range Git operation and its
matching backlog adapter; slices 6–7 compose the integrated worktree-readiness
contract; slice 14 assesses host-specific evidence rather than assuming parity.
These points have owners, evaluation criteria, and recoverable boundaries.
The assessment identifies no additional slice-specific refinement concern.

No numeric slice target, hard limit, or repeated-overrun threshold is supplied.
Sizing includes implementation, focused proof, refactoring, and cleanup. The
plan remains within the user's planning authority; implementation awaits its
own instruction. The 14-slice count yields no resplit recommendation.

## Preparation context

Owned checkout: `/Users/terryyin/.codex/worktrees/refine-origin-integration/open-dough`.
Branch: `codex/refine-origin-integration`.
Starting revision: `3543fad2167169092ac47ba5afbbeba4d0a0d40b`.
Originating checkout: `/Users/terryyin/git/open-dough`, branch `main`.
Recorded remote target: `origin/main`.

The story stays queued. This preparation owns its story section and this plan;
the Taken worktree-preparation story, plan, and execution remain with their owner.
Preparation is retained locally for review. Implementation and native acceptance
have not run in this planning session.
