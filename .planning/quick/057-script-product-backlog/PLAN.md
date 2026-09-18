# Safely edit and reconcile the product backlog through scripts

Status: concluded 2026-09-18 at a deliberate boundary after slice 10.
Created and slice-refined 2026-09-18; execution started 2026-09-18 under
`/dough-execute-plan 57`.

Slices 1-10 are delivered, proven, and pushed. Slices 11-17 remain written below
as refined scope and now belong to
[Gate Git backlog conflicts and deliver the scripted backlog](../../seeds/SEED-008-worktree-branch-trunk-sync.md#gate-and-deliver-scripted-backlog),
which sits at the top of the queue. Terry Yin judged the seventeen-slice plan too
large to run to its end in one execution and asked for a safe split. The boundary
was verified rather than assumed: no installer declares any of the delivered
script modules, and `SKILL.md` with its `references/` are byte-identical to `main`,
so concluding here changes nothing for any project using Open Dough. Re-plan the
remainder before executing it; seven slices is again too large for one run, and
what slices 11-17 must say has changed in places — the learnings below record
where.

## Execution identity

- Mode: Story Branch Mode.
- Originating checkout and resolved integration branch:
  `/Users/terryyin/git/open-dough`, `main`. The queue claim commit `4441586`
  was recorded there.
- Execution checkout and branch:
  `/tmp/dough-057-script-product-backlog.SdZIJi/worktree`,
  `dough/057-script-product-backlog`.
- Integration checkout and branch for later integration:
  `/Users/terryyin/git/open-dough`, `main`.
- Authorized push destination: `origin`
  (`git@github.com:terryyin/open-dough.git`), branch
  `dough/057-script-product-backlog`.
- CI observer: GitHub Actions, workflow `ci.yml`, display name `CI`, verified
  push-triggered. Observer directory `/tmp/dough-ci-501/watch-KJZzNL`,
  armed against `terryyin/open-dough` `dough/057-script-product-backlog`.
- Replanning permission: preserved project default (replanning allowed); no
  `--replan` or `--no-replan` was supplied.
- Project commands: `npm run format` (formatting), `npm run lint`, `npm test`.
  No Git commit hooks are installed in this repository.

## Source and outcome

Source: [SEED-008, Update the product backlog without hand-editing the shared
list](../../seeds/SEED-008-worktree-branch-trunk-sync.md#script-product-backlog-list-updates),
first item in the [product backlog](../../PRODUCT-BACKLOG.md).
Terry Yin requested planning and refinement, not implementation. Execution
was separately authorized afterwards by `/dough-execute-plan 57`, which the
"When execution is separately authorized" gate below anticipates.

For projects using Open Dough, an explicit backlog change is applied and
validated without model reasoning, without accidentally losing queued or Taken
work. One Markdown file remains the authoritative readable backlog. The same
tool owns near-future direction updates and compatible three-way reconciliation.
Any reconciliation failure stops the affected Git workflow for human repair;
there is no AI repair fallback. Lightweight native edit guards are included
only where they can stay small and their actual behavior can be established.

Keep the story queued during planning. This plan does not authorize taking it,
changing the current backlog direction, assigning production IDs, installing
hooks, committing, publishing a release, or running implementation slices.

## Boundaries and current decisions

- Cover add, relative placement, take/resume, authorized removal, explicit
  return to the queue, title/link refresh, and create/replace/clear direction.
  Existing execution and wrap-up workflows still decide authority and closure.
  The script applies an already selected operation; it does not decide value,
  prerequisites, priority, whether work is complete, or who may execute it.
- Keep one persistent, project-scoped identity per work item across canonical
  story, backlog, and active plan. Links remain navigation. Reuse suitable
  existing immutable IDs; canonical seed ID plus stable anchor can establish
  an initial identity if retained when location changes. New allocations must
  be script-owned and collision-checked without a shared numbering registry.
  Exact spelling is an implementation choice, not a new product decision.
- Migrate existing active entries explicitly and safely; ordinary installation
  does not silently rewrite the project's backlog or seeds. No historical
  inventory, completed-item registry, or retroactive numbering is needed.
- Resolve by identity and changes relative to the ancestor, not surviving-line
  union or ours/theirs preference. Unchanged on one side accepts the other
  side's change; identical changes apply once. Different changes require a
  supported combination. Preserve compatible removals and unrelated order.
- Priority ties with no established ordering stop for a human. Do not add the
  earlier proposed lexical tie-break, priority settings, or automatic priority
  policy. The existing deterministic Taken interleaving rule is retained;
  Taken display order and queue priority have different meanings.
- Treat the direction as one value: a one-sided change or identical updates
  merge, different values stop. Do not synthesize strategy text. Preserve other
  human text unless a supported explicit operation changes it; unexpected
  conflicting text stops rather than being regenerated.
- A failed reconciliation, missing required input, unsupported format, or
  invalid merged result returns a nonzero outcome with actionable context.
  The caller must stop before accepting/publishing the integration. Preserve
  refs, worktree, and conflict/index evidence; do not automatically abort,
  discard changes, skip commits, select a side, or delegate repair to AI.
  Resume after a human supplies the resolution and the script validates it.
  Human resolution is authoritative; validation must not continually rerun the
  same disputed merge and overwrite it.
- Guard the whole backlog file, including direction, against covered native
  agent editing tools. Keep reads, approved scripts, and unrelated edits usable.
  A human can still repair the file. Cover routine native edits, not arbitrary
  shell programs, Tab completions, deliberate bypass, or filesystem access by
  every process. If a useful host guard requires complex enforcement, stop that
  extension for a human decision and retain the core operations independently.
- Use one local shared script/model with thin Git and host adapters. No service,
  database, second authoritative backlog, durable operation log, generic merge
  framework, general shell parser, privileged writer, automatic Git driver
  installation, or general integration queue is planned. A custom Git driver
  is a possible later adapter; existing managed workflows can invoke the tool.
- Use bounded coordination for cooperating script writers to the same physical
  backlog plus stale-input checks and safe replacement. This is not the next
  story's whole-Git integration queue. Detect unexpected changes when possible;
  do not claim an absolute guarantee against arbitrary uncooperative external
  writers, which the source already excludes. Unrecoverable/stale write locks
  stop for a human instead of requiring an ownership service.

## Existing solutions, architecture, and proof boundaries

PFE findings carried forward and checked against current callers:

| Existing responsibility | Evidence and decision |
| --- | --- |
| One validated insertion into Markdown | [Local helper](../../../scripts/product-backlog-insert.mjs) uses exact bullet identity and atomic replacement, with no intervening-writer protection. Evolve/relocate this responsibility into `src/skills/dough-product-backlog/scripts/`; retire or delegate the maintainer entry point so it cannot remain a second rule owner. |
| Backlog identity, lifecycle, relative order | [Backlog skill](../../../src/skills/dough-product-backlog/SKILL.md) owns these rules. Extend it and the seed/plan identity references only where needed. Do not create a competing schema or identity registry. |
| Ancestor-based reconciliation | [Merge guidance](../../../src/skills/dough-product-backlog/references/merge-conflicts.md) owns compatible transitions and Taken ordering. Move its mechanical decisions and validation into the shared script; retain concise calling and human-stop guidance. |
| Backlog edit/reconciliation callers | Maintenance; [execution claims](../../../src/skills/dough-execute-plan/SKILL.md); [Trunk publication](../../../src/skills/dough-execute-plan/references/trunk-publication.md); [wrap-up integration](../../../src/skills/dough-story-wrap-up/SKILL.md). Claims change membership, wrap-up removes work, and integration combines different branches. Each must use the shared contract; proof cannot cover only direct CLI use. |
| Complete standalone delivery | `install.sh`, `src/install/open-dough-release-version.sh`, `tests/helpers/public-payload-fixture.bash`, and `tests/story-payload-update.sh` already own payload declaration and real install/update journeys. Extend these seams, not another installer. |
| Native hook coexistence | `src/install/open-dough-register-hooks.mjs`, its merge module, and `tests/install-ci-host-hooks.sh` protect existing handlers/settings. Reuse the shared merge policy; Codex registration is a new host seam and needs its own proof. Do not copy CI-specific lifecycle behavior into backlog guards. |

The cumulative model is one parsed backlog with ID-keyed items, membership,
ordered queues, direction, and preserved surrounding text. Mutations and merges
use the same identity/invariant checks and publication boundary. Field and
membership comparison can share three-way logic; queue priority is a separate
domain relationship, not an integer-position scalar. Do not preserve unchanged
positions as if they were competing explicit moves. Conflicting meaning stops.
Keep the document parser sufficient for the established backlog format; support
larger valid lists naturally without fixture-sized gates or a general Markdown
editing framework.

Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for cohesive domain ownership, continuous integration, and reduced recurring
judgment; [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
and [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
for complete standalone delivery and preservation; [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
for deterministic/native proof and recoverable cleanup; and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
and [AGENTS.md](../../../AGENTS.md) for one authoritative runtime rule and
representative skill review. ADR 0007 remains Proposed. No new North Star topic
or ADR is needed: this extends existing responsibilities without adopting a
new lifecycle or storage architecture.

## Prior observations and limits

Disposable probes during refinement used Git 2.50.1 (Apple Git-155). The actual
branch-merge command was:

```sh
git -c core.hooksPath=/dev/null -c commit.gpgsign=false -c user.name='Backlog probe' -c user.email=probe@example.invalid merge --no-commit --no-ff left
```

In isolated repositories with committed base/left/right versions:

- Base Taken `[A,B]`; left removes A, right removes B: exit 1 and three unmerged
  index entries. A small in-memory ancestor/identity comparison retained both
  removals. This supports the rule's feasibility, not production implementation.
- Base queue A through T; branches independently move B after H and after P:
  exit 0, no unmerged entries, B appears twice. Every integration needs backlog
  validation even if Git reports success.

The scratch repositories were discarded; no product resolver or native edit
guard was implemented. These observations do not mark any slice done. Recreate
the cases as maintained tests in their owning slices. Hook documentation in the
seed establishes candidate APIs only, not actual runtime blocking or delivery.

## Proof ownership and execution gates

| Source promise | Owning slices and observable boundary |
| --- | --- |
| Safe add, no collateral changes, deterministic output, writer safety, retries | 1: real CLI, bytes and competing-process outcomes |
| Existing active identity adoption and nonduplicating allocation | 2: canonical homes and unchanged backlog meaning |
| Take/resume, completion, explicit queue return | 3–5: actual membership/order after each operation |
| Identity through rename, move, and story/plan link transition | 2, 3, 6: same ID in canonical homes and active reference |
| Scripted direction updates and stale-value refusal | 7: exact supplied text with entries unchanged |
| Compatible branch additions, transitions, removals, priority | 8–9: real three-version inputs and exact merged Markdown |
| Direction reconciliation including clean text merges | 10: scalar semantic decision on both branch values |
| Actual Git conflict resolution, clean-merge validation, human-only failure/resume | 11–13: separate merge, rebase, and cherry-pick Git state and no continuation/publication after failure |
| All ordinary callers use scripts; local standalone install/update | 14: installed operations and updated runtime guidance; 15–17: native use |
| Lightweight guards, reads/approved scripts preserved, unrelated hooks retained | 15–17: each host's installed native journey, or explicit unresolved feasibility disposition |
| No AI reasoning in mechanical edits/merge/validation | 1–14: real scripts without model service; 15–17: native trace shows routing only and human stop on unresolved merge |

All slices start `planned`. Proposed new test commands below name proof owners;
the test files do not exist yet. Reuse Node's test runner and the repository's
shell-test discovery rather than adding a framework. Keep deterministic tests
credential-free and native cases explicitly selected, as existing runners do.
Assertions must inspect persisted results and refused-write preservation, not
just exit codes or claimed success. Native checks inspect actual tool calls and
file/Git state, not an agent's self-report.

No numeric slice target/hard limit is supplied for this work; do not inherit
another story's timing policy. Each sizing hypothesis includes implementation,
focused verification, and local cleanup. Stop and reassess a failed sizing or
domain assumption; do not keep expanding the handler to force a green test.

When execution is separately authorized, use the established execution workflow:
independent post-change refactoring, focused proof, owned-file formatting and
check-only commit-hook contract, staged-diff review, and asynchronous CI repair.
Resolve execution checkout, branch/publication authority, actual formatter and
hook contract then. `npm run lint` and `npm test` are the existing CI checks;
do not run the full suite for every slice. This documentation-only task requires
link/ownership review and `git diff --check`, not product execution or native runs.
Keep this plan through retrospective; wrap-up owns spent-plan/seed/evidence
cleanup, with recovery in Git. Do not hand-synchronize installed managed skills.

## Ordered slices

### 1. Add an identified item without losing existing work
Type: Behavior
Status: done (2026-09-18)
Proof: `node --test --test-name-pattern='add|write safety' tests/support/product-backlog.test.mjs tests/support/product-backlog-write-safety.test.mjs`,
and `bash tests/product-backlog.sh` as the discovered entry point. The planned
single-file command was superseded when post-change refactoring split the write-
safety cases into their own file; the named assertions are unchanged.

Given a valid backlog and an already identified canonical work reference, an explicit insertion at a
named relative position adds exactly one identified entry. Preserve all existing
items, direction, surrounding text, and unrelated order. Introduce only the
shared parser/validator/writer required for this operation. Missing identity,
an ambiguous canonical home, or a collision fails unchanged and points to the
identity-adoption operation owned by slice 2. Do not generate IDs inside insertion.
Exercise missing anchors, malformed sections, duplicates, and a repeated request.
Run two real cooperating script processes against one file and establish no lost
update: serialize/revalidate or refuse stale input without replacing newer data.
Do not claim protection from every arbitrary external writer.

Boundary: the real CLI writes a scratch project's file, not an inner reducer.
No canonical home is mutated by insertion. Hypothesis: one single-file insertion
transaction with shared parsing and writer coordination, without multi-file
identity publication hidden inside it.
Safe stop: one useful validated operation; later verbs remain unpromised until
their slices complete.

### 2. Adopt identities for an existing active backlog
Type: Behavior
Status: done (2026-09-18)
Proof: `node --test --test-name-pattern='adopt identity' tests/support/product-backlog-adopt.test.mjs tests/support/product-backlog-adopt-refusals.test.mjs`,
and `bash tests/product-backlog.sh` as the discovered entry point. Adoption
lives in its own test files for cohesion, so the planned single-file command
matches no tests and was superseded.

Given existing queued stories, Taken planned stories, and a bounded correction,
explicit identity adoption/allocation records one identity for each work item in its established
canonical homes and references. A story and its plan remain one item; a correction
does not acquire a fabricated story. Titles, links, membership, order, and
direction retain their meaning. Repeating adoption retains assignments; missing
homes, conflicting mappings, and concurrent allocation collisions are reported
without silently combining work. Validate the entire requested adoption before
publishing backlog changes, reusing slice 1's write boundary. Keep allocation
separate from queue mutation: a minted identity does not itself queue or take
work. For adoption spanning canonical documents, preserve already recorded
identities and report incomplete work on interruption; a retry must reuse them
and retain every active entry. Do not introduce a general multi-file transaction
engine. No archive or updater-driven backlog migration is introduced.

Boundary: actual old-format fixture files and canonical homes before/after the
command. Hypothesis: one adoption journey; mixed story/plan identity mapping is
the focused uncertainty. Stop for human input on genuinely ambiguous legacy work.

### 3. Claim and resume the same identified work once
Type: Behavior
Status: done (2026-09-18)
Proof: `node --test --test-name-pattern='take|resume' tests/support/product-backlog-take.test.mjs`,
and `bash tests/product-backlog.sh` as the discovered entry point. Take lives in
its own test file, so the planned single-file command was superseded.

Given a queued ID and the caller's selected plan where required, taking it moves
it to the end of Taken with the same identity and appropriate active link.
Resuming does not duplicate or reorder it. Preserve every sibling and reject
missing/ambiguous targets or unresolved required plans. A quick story remains
valid without a plan. Execution authority and the claim's Git commit location
stay with the caller; this script does not implement exclusive agent ownership.

Boundary: real CLI membership and link transition, including retry.
Hypothesis: one state transition using the existing identity/write model.

### 4. Remove only the explicitly completed item
Type: Behavior
Status: done (2026-09-18)
Proof: `node --test --test-name-pattern='complete' tests/support/product-backlog-complete.test.mjs`,
plus `node --test --test-name-pattern='write safety' tests/support/product-backlog-write-safety.test.mjs`
for the write-boundary defect fix below, and `bash tests/product-backlog.sh` as
the discovered entry point. Completion lives in its own test file, so the
planned single-file command was superseded.

Given an explicitly selected completed ID, remove only that active entry from
its current list. Preserve siblings and order in both lists. Cover standalone
maintenance and a Taken closure without making the script judge completion or
delete story/plan files. Missing files alone do not establish completion.
Repeated requests either establish already-applied safely or report a missing
precondition; they must not remove another item. Pauses, failures, retrospective,
and plan completion do not invoke removal implicitly.

Boundary: persisted lists plus untouched canonical homes.
Hypothesis: one removal transition; wrap-up ownership remains unchanged.

### 5. Place selected work at an explicit queue position
Type: Behavior
Status: done (2026-09-18)
Proof: `node --test --test-name-pattern='place in queue' tests/support/product-backlog-place.test.mjs`,
and `bash tests/product-backlog.sh` as the discovered entry point. Placement
lives in its own test file, so the planned single-file command was superseded.

Given an identified item and an explicit destination relationship, place it in
the queue without changing unrelated order. A queued item is reprioritized;
a Taken item requires the explicitly requested return transition. Missing or
self-contradictory anchors fail unchanged. No dependency ranking, inferred
priority, or ID-based tie-break is added. Reuse one relative-placement rule
for insertion and movement rather than interpreting line numbers as identity.

Boundary: before/after queue and Taken membership through the CLI.
Hypothesis: one placement operation with validated origin-state preconditions.

### 6. Refresh an item's presentation without changing its identity
Type: Behavior
Status: done (2026-09-18)
Proof: `node --test --test-name-pattern='refresh reference' tests/support/product-backlog-refresh.test.mjs tests/support/product-backlog-refresh-refusals.test.mjs`,
and `bash tests/product-backlog.sh` as the discovered entry point. Refresh lives
in its own test files, so the planned single-file command was superseded.

Given an explicitly renamed or relocated canonical story/plan, refresh its
backlog title/link while carrying its ID. Preserve membership, order, and other
items. References to old/new active homes must not permit the same ID twice.
Use established canonical-home changes as input; this slice is not a general
document renamer or repository-wide link-repair engine.

Boundary: actual canonical fixtures and resulting active reference.
Hypothesis: one metadata refresh; no new identity model.

### 7. Set the near-future direction explicitly
Type: Behavior
Status: done (2026-09-18)
Proof: `node --test --test-name-pattern='direction update' tests/support/product-backlog-direction.test.mjs tests/support/product-backlog-direction-refusals.test.mjs`,
and `bash tests/product-backlog.sh` as the discovered entry point. Direction
lives in its own test files, so the planned single-file command was superseded.

Given supplied text and the expected prior direction, create, replace, or clear
that section exactly as requested. Preserve both lists and unrelated text.
Stale expectations fail unchanged; item operations retain the direction.
The caller supplies the chosen text, so applying it needs no model invocation.

Boundary: real Markdown bytes and untouched entries through the CLI.
Hypothesis: one value update with the same validated write boundary.

### 8. Reconcile identified work across three backlog versions
Type: Behavior
Status: done (2026-09-18)
Proof: `node --test --test-name-pattern='merge items' tests/support/product-backlog-merge.test.mjs`

Given ancestor and two branch versions, combine compatible ID-keyed membership
and metadata changes. Prove independent closures from Taken `[A,B]` leave it
empty, a take combines with another item's closure, identical changes occur
once, and unchanged entries cannot resurrect removals. Combine compatible
metadata/state changes through the common model; conflicting changes to the
same meaning return a diagnostic and publish no partial result. Malformed or
duplicate input and delete-versus-explicit-return stop for human repair.

Boundary: CLI consumes real files and produces a complete validated candidate
or unchanged destination. Hypothesis: one ancestor-based item merge rule; do
not implement an accumulating list of scenario-specific recognizers.
Safe stop: candidate generation works; automatic Git acceptance remains absent
until slices 11–13 and caller delivery in slice 14.

### 9. Preserve compatible queue order during reconciliation
Type: Behavior
Status: done (2026-09-18)
Proof: `node --test --test-name-pattern='merge order' tests/support/product-backlog-merge.test.mjs`

Given `[A,B,C]`, combine X between A/B and Y between B/C into `[A,X,B,Y,C]`.
Retain an explicit one-sided reorder and unaffected relative order. Distinguish
unchanged ordering from an instruction to undo the other side's change. Apply
the established Taken interleaving rule separately. Conflicting moves or a
same-gap ordering not determined by the inputs stop for human repair. A clean
text merge that duplicates a moved ID must not be accepted. Evaluate reversing
branch arguments for rules that promise symmetric results.

Boundary: complete merged list and refusal diagnostics, using the shared model.
Hypothesis: one priority-reconciliation outcome; infer only established order,
with ambiguity a supported stop rather than a reason to add order metadata.

### 10. Preserve direction intent during reconciliation
Type: Behavior
Status: done (2026-09-18)
Proof: `node --test --test-name-pattern='merge direction' tests/support/product-backlog-merge.test.mjs`

Combine a one-sided direction update with other item edits; apply identical
direction changes once. Different direction values, including deletion versus
replacement, stop without synthesizing text. Include edits to different lines
that ordinary Git text merging would accept. Reuse three-way value comparison
and whole-result publication from slice 8.

Boundary: real merged document or unchanged destination and diagnostic.
Hypothesis: one scalar rule, no natural-language reconciliation.

### 11. Gate a Git merge and resume only after human repair
Type: Behavior
Status: moved to SEED-008#gate-and-deliver-scripted-backlog (2026-09-18)
Proof: `bash tests/product-backlog-git.sh merge`

Given an authorized merge affecting the backlog, derive
the actual ancestor and branch inputs mechanically, reconcile and validate the
backlog, and return an unambiguous success or human-required failure. Use index
stages for unresolved conflicts and capture the merge input revisions before
integration discards that context; do not ask an agent to reconstruct per-item
intent. At this managed boundary, keep an ordinary merge uncommitted until the
gate succeeds; handle a fast-forward as validation before accepting/publicizing
its outcome. Include the observed actual-conflict and clean-duplicate cases.

The Git-facing gate must be called for clean outcomes too. It owns only the
backlog path; unrelated conflicts remain with their existing workflow. On a
failure, retain recoverable Git state and prevent the managed caller from
continuing/publishing. Do not introduce a generic Git orchestrator or change
branch/publication ownership. After a human fixes the file, validate the supplied
resolution and allow the existing caller to resume; never loop back into an
automatic or AI repair attempt. An invalid human candidate stays stopped.

Boundary: scratch Git repositories, real merge state, and a
caller continuation/publication sentinel which remains uncalled on failure.
Hypothesis: one merge boundary and its human repair/resume path. Its success does
not prove replaying commits through a sequencer; slices 12–13 own those cases.

### 12. Gate backlog reconciliation during rebase
Type: Behavior
Status: moved to SEED-008#gate-and-deliver-scripted-backlog (2026-09-18)
Proof: `bash tests/product-backlog-git.sh rebase`

Given a rebase of the owned unpublished suffix, identify the actual current
upstream and replayed commit without interpreting ours/theirs as intent. Reuse
the same reconciliation core on the correct three inputs. At a backlog conflict,
resolve only supported changes and validate before the caller continues. On any
failure, keep the rebase state, index, and worktree recoverable, leave the suffix
unpublished, and stop for human repair; no skip, abort, or AI repair. Validate a
human resolution before continuing the existing rebase.

Also capture the pre-rebase revision inputs and check clean replay results before
publication, including moves that produce duplicate IDs. A clean replay may
already have created local commits; invalid results must remain unpublished and
recoverable, not be automatically reset. Include more than one replayed commit
so proof covers suffix preservation and the actual caller's continuation state.

Boundary: real scratch rebase state, retained revisions, resulting backlog, and
an uncalled publication sentinel on failure. Hypothesis: one replay boundary;
reuse merge validation without introducing another integration lifecycle.

### 13. Gate backlog reconciliation during cherry-pick
Type: Behavior
Status: moved to SEED-008#gate-and-deliver-scripted-backlog (2026-09-18)
Proof: `bash tests/product-backlog-git.sh cherry-pick`

Given an authorized cherry-pick affecting the backlog, mechanically obtain the
picked change's base and current destination, use the common resolver, and
validate before the existing workflow accepts the result. Cover a genuine
conflict and a clean but invalid result. Failure preserves the cherry-pick's
recoverable state and stops continuation/publication for a human. After human
repair, validate and resume without applying the picked change twice. A commit
form whose base cannot be determined from the supplied Git operation stops
explicitly; do not guess a mainline or add a new mainline-selection policy.

Boundary: actual scratch cherry-pick/sequencer state and caller sentinel.
Hypothesis: one operation adapter using the established model and diagnostics;
no claim of coverage from the rebase test alone.

### 14. Deliver the scripted backlog through ordinary installed workflows
Type: Behavior
Status: moved to SEED-008#gate-and-deliver-scripted-backlog (2026-09-18)
Proof: `bash tests/product-backlog-payload-update.sh`; representative guidance review

A fresh installation and an ordinary update from a prior tagged fixture install
the complete local helper/reference set into both managed roots. Invoke actual
operations with the release source unavailable and confirm they act on the
selected project, including a non-default backlog path and launch from a
subdirectory. Preserve installation/update ownership and existing customization
refusal policies. Do not migrate project backlog data during install/update.

Replace manual-edit and intellectual conflict-repair directions in maintenance,
execution claims, Trunk publication, and wrap-up with the shared script contract,
including clean-integration checks and human-only failure/resume. Align seed/plan
identity propagation in their existing authoritative templates. Keep one rule
owner; incoming links do not duplicate the operation logic. Declare all runtime
dependencies together with source changes; no released installed copy is edited.
Retire/delegate the root insertion helper. Human recovery instructions must work
when the agent editing guard is enabled and must not tell an agent to bypass it.

Boundary: real installer/update journey and commands from installed paths, plus
the AGENTS.md representative behavior review for changed guidance. Native use
and host guard evidence belong to slices 15–17, not the payload fixture.
Hypothesis: one update-to-standalone-use journey through existing delivery seams.
Caller changes route to the already-proved operations and gates; their native
behavior remains explicitly owned below rather than certified by a wording test.

### 15. Use the protected scripted backlog in Codex
Type: Behavior
Status: moved to SEED-008#gate-and-deliver-scripted-backlog (2026-09-18)
Proof: `bash tests/product-backlog-native.sh --native codex`

With a fresh installed candidate and the actual supported Codex runtime, an
ordinary direct patch targeting the backlog is denied before bytes change,
then the agent follows the installed guidance to perform the requested update
through the script. Reading and unrelated edits still work. Use deterministic
hook input/output and one shared protected-path policy. Safely register the
Codex hook through the existing installer support, preserving unrelated
settings and repeat/update behavior; it is a new host seam, not assumed proven
by Cursor/Claude registration.

Use the shared native scenario to observe an unresolved scripted merge causing
the agent to stop without intellectual repair or Git continuation, then explicit
human repair/resume through validation. Retain actual tool/file/Git evidence.
Hypothesis: one installed host journey; hook trust, tool coverage, and registration
compatibility remain unproved. If lightweight protection is infeasible, report
the exact gap for human disposition rather than expanding enforcement or marking
the guard passed. The core installed-use proof remains independently required.

### 16. Use the protected scripted backlog in Cursor
Type: Behavior
Status: moved to SEED-008#gate-and-deliver-scripted-backlog (2026-09-18)
Proof: `bash tests/product-backlog-native.sh --native cursor`

Apply the same installed protected-backlog journey through Cursor's actual Agent
editing surface, adapting only its hook schema/tool paths. Preserve existing CI
hooks and avoid double invocation through any enabled Claude compatibility loader.
The ordinary edit is refused, reads and script use work, and an unresolved merge
stops for a human. Reuse shared operation assertions and runner support rather
than copying the full deterministic case matrix. Do not claim Tab coverage.

Boundary: native Agent tool calls and resulting project state after installation
or update. Hypothesis: one host adapter journey; native coverage and hook
coexistence are the specific risks. Apply the same conditional-guard decision
boundary as slice 15; do not infer success from another host.

### 17. Use the protected scripted backlog in Claude Code
Type: Behavior
Status: moved to SEED-008#gate-and-deliver-scripted-backlog (2026-09-18)
Proof: `bash tests/product-backlog-native.sh --native claude`

Apply the same installed journey through Claude Code's native Edit/Write route
and deterministic PreToolUse denial. Preserve unrelated handlers, reads,
approved script use, and ordinary updates. The workflow halts on script failure
and waits for human repair before validation/resumption. Reuse the shared domain
proof and native runner support; record the actual host/version and observations.

Boundary: native tool calls and actual bytes/Git state. Hypothesis: one host
adapter journey with bounded coexistence and coverage uncertainty. Complex
enforcement requires a human decision; absence of proof remains pending. Do not
infer native behavior from direct invocation of a hook with synthetic JSON.

## Execution learnings

### Slice 1 (done)

Delivered modules, all under the Open Dough source root:

- `src/skills/dough-product-backlog/scripts/product-backlog.mjs` — CLI boundary,
  currently the `add` verb only. Unknown verbs exit 1 with usage, so later
  verbs stay unpromised.
- `product-backlog-document.mjs` — the single owner of the entry grammar,
  identity derivation, sections, and parse/render.
- `product-backlog-add.mjs` — the add operation and the relative-placement rule
  that slice 5 reuses for movement.
- `product-backlog-store.mjs` — the single owner of lock acquisition, reading
  inside the lock, and atomic replacement.
- `tests/support/product-backlog.test.mjs`,
  `tests/support/product-backlog-write-safety.test.mjs`,
  `tests/support/product-backlog-fixture.mjs`, and the discovered entry point
  `tests/product-backlog.sh`.

Accepted observations: placement is asserted by whole-file byte equality rather
than spot checks; all ten refusal paths assert the file is byte-identical
afterwards; write safety uses four genuinely concurrent CLI processes plus a
case that holds the lock, replaces the file with newer bytes, releases it, and
shows the waiting run applied to the newer content. The real
`.planning/PRODUCT-BACKLOG.md` parses, yields its five expected identities
including the Taken entry's plan-link suffix, and renders back byte-identically.

Decisions and observations that bind later slices:

- **Test discovery.** `scripts/test.sh` globs `tests/*.sh` and excludes
  `tests/support/*`, so a Node test file is only reached through a thin
  discovered shell entry point. `tests/execution-ci-runtime.sh` already
  establishes that convention. Later slices add their Node test files to
  `tests/product-backlog.sh` (or a sibling wrapper) or CI will not run them.
- **Payload declaration is slice 14's.** The new scripts are deliberately absent
  from `install.sh` and `src/install/open-dough-release-version.sh`. Declaring
  them before slice 14 breaks `scripts/check-self-installation.sh`, which
  compares installed copies against the tagged release tree.
- **Identity spelling.** `SEED-NNN#anchor` for a seed-anchored story, or the
  canonical path when an entry carries no token. The backlog line itself remains
  the identity record; no separate registry was introduced, so slice 2's
  adoption can reuse the same derivation.
- **Entry equality covers identity and canonical home**, so two identities
  naming the same canonical home are refused as an ambiguous home. Slice 6's
  refresh and slices 8–9's merge inherit that invariant: a legitimate in-flight
  rename must go through refresh rather than a second add.
- **Parser strictness inside the two lists.** Only blank lines and entry bullets
  are accepted; anything else refuses unchanged with its line number. That is
  what makes "malformed sections" a real refusal, but a project keeping prose
  notes inside `## Taken` or `## Backlog list` would be refused rather than
  edited. The established format has no such prose. Revisit only if such a
  backlog appears.
- **The root maintainer helper now owns no rules.** `scripts/product-backlog-insert.mjs`
  derives identities from the supplied bullets and delegates to the shared
  modules, so there is one rule owner. It is functionally redundant with the
  shared CLI and has no automated coverage; slice 14 still owns retiring or
  delegating it. It keeps a dash-tolerant pairwise argument parse because every
  argument it takes is a Markdown bullet beginning with `-`, which `node:util`
  `parseArgs` rejects.

### Slice 2 (done)

New CLI verb `adopt --all`, which records a `**Identity:** <id>` line in each
work item's canonical home: under the `### N. Title` inside a seed's anchored
story section, or under a plan document's `# ` title. Identity is recoverable
from the home as well as the backlog line, which is what lets it survive a
rename or move; slice 6 then owns refreshing the link.

Modules added: `product-backlog-adopt.mjs` (the journey — derive, validate the
whole request, record homes one at a time, publish the backlog last),
`product-backlog-home.mjs` (the single owner of *where* an identity is written
in a canonical home), and `product-backlog-source.mjs` (line/newline handling
shared by the backlog and canonical homes). `product-backlog-store.mjs` now
owns `readFile` and `replaceFile` as well as the lock.

Decisions and observations that bind later slices:

- **No number is minted and no registry exists.** An anchored story reuses its
  seed's existing immutable frontmatter `id:` plus the stable anchor. This
  satisfies "reuse suitable existing immutable IDs" without a shared numbering
  registry, as the boundaries require.
- **A bounded correction's identity is its canonical plan path** — exactly
  slice 1's token-less derivation. No seed is fabricated. Giving corrections a
  `QUICK-NNN`-style token instead would be a product decision, not a refactor.
- **The entry grammar was relaxed, and this binds slices 8–13.** The ` — TOKEN`
  segment and the `([plan](...))` suffix are each optional, because a genuinely
  pre-adoption entry has no token and adoption must be able to read the very
  backlog it migrates. Consequence: a token-less entry's identity is its `href`,
  while the same work after adoption is `SEED-NNN#anchor`. The safety net that
  still recognises them as one work item is `requireDistinctWork`, which
  compares **both** identity and canonical home. Merge slices must not weaken
  that comparison, or a merge between an adopted and a non-adopted branch can
  duplicate the same work.
- **`renderEntry` now renders the active-plan suffix.** Slice 3's take/resume
  must reuse it rather than adding a second way to write that suffix.
- **Homes are written inside the backlog lock**, and `recordIdentity` re-reads
  the home at write time and never replaces an identity already recorded there.
  That is what makes the concurrent-collision report honest and what allows one
  seed to be the canonical home of several stories.
- **Interruption is a resumable journey, not a transaction engine.** Homes are
  recorded one at a time and the backlog is published last, so a failure leaves
  recorded identities in place, reports how many remain, and a re-run reuses
  them. The plan forbids a general multi-file transaction engine and none was
  added.

Deliberately uncovered, and still owned elsewhere:

- The plan's "Align seed/plan identity propagation in their existing
  authoritative templates" is slice 14's guidance work.
  `src/skills/dough-story-refinement/references/planning.md` and
  `src/skills/dough-story-decomposition/references/seed-format.md` still do not
  mention the `**Identity:**` line.
- Adoption has not been run against this repository's own `.planning/` files.
  Slice 2 delivers the capability; migrating this project's backlog is a
  separate explicit act that execution has not authorized.
- **Test environment limit:** the interruption case injects failure with an
  unwritable directory and skips when running as uid 0. It is exercised on
  developer machines and on GitHub Actions' `runner` user, but a root-running
  CI would silently skip it.
- Slice 14 now has these additional files to declare:
  `product-backlog-adopt.mjs`, `product-backlog-home.mjs`,
  `product-backlog-source.mjs`.

### Slice 3 (done)

New CLI verb `take --identity <id> (--plan <path> | --no-plan)`. A claim moves
the entry to the end of `## Taken` in one update; a resume rewrites it in place,
so it is never duplicated or reordered and can gain a plan link it was missing
without losing its position. `product-backlog-placement.mjs` was extracted from
the add operation and now owns where an entry line sits in a list, the blank
line before a following heading, and the move between lists; slice 5 extends it
rather than forking it.

Decisions and observations that bind later slices:

- **`--plan` or `--no-plan` is mandatory and exclusive.** The script cannot
  distinguish "quick story, needs no plan" from "planned story, caller omitted
  the plan", and either guess writes a wrong entry. Requiring the caller to
  state it keeps that decision with the caller, as the source demands, and gives
  "unresolved required plan" a definite meaning. Accepting an omitted plan
  silently would be a product decision, not a refactor.
- **Taking never repoints an already recorded plan link.** That is a reference
  refresh, which slice 6 owns; `--no-plan` against an entry that already links
  a plan is refused as a contradiction rather than silently dropping the link.
- **`--plan` naming the entry's own canonical home is refused.** A bounded
  correction's home already is its plan, so a second link would name it twice.
- **The plan check is mechanical and existence-only.** `--plan <target>` must
  resolve to a file relative to the backlog's directory, with no judgment about
  the plan's content. A link `take` accepts can still be refused later by
  `adopt`, which additionally needs a `# ` title to record an identity under.
- **The plan link label is the literal `plan`**, matching the established
  backlog. A project using another label would need slice 6's refresh or a
  future option.
- **`requireField` in the document model is the shared missing-input refusal.**
  Later verbs reuse it with an optional hint instead of respelling the message.
- The script decides no execution authority, no claim commit location, and no
  exclusive ownership of a work item across agents. Concurrency for `take`
  rests on the existing lock proved by slice 1's write-safety cases.
- Slice 14 now also has `product-backlog-take.mjs` and
  `product-backlog-placement.mjs` to declare.

### Slice 4 (done)

New CLI verb `complete --identity <id>`, which removes exactly the one named
entry from whichever active list holds it. `product-backlog-placement.mjs` now
also owns `findEntry` and `removeEntryLine`. The CLI gained
`applyReportedChange`, so the three verbs that need an outcome back from the
write boundary share one protocol.

Decisions and observations that bind later slices:

- **A repeated removal refuses; it does not report "already applied".** The
  boundaries forbid a completed-item registry, so the script keeps no record of
  removed work and genuinely cannot distinguish an earlier run's removal from a
  mistyped identity. Claiming success would report a removal it did not make and
  would mask a typo while the item the caller meant is still listed. The refusal
  names both possibilities. **Consequence for slice 14:** installed guidance must
  read that specific nonzero exit as "the outcome already holds", not as a
  failure needing repair, so a wrap-up caller re-running closure after an
  interruption is not sent into a repair path.
- **The script never judges completion and never deletes a canonical home.** A
  missing plan file, a missing seed, and a plan's status text establish nothing.
  The proof asserts seed and plan files are byte-identical after every removal
  and after every refusal. `dough-story-wrap-up` keeps its ownership of closure,
  including seed, plan, and proof cleanup; this verb is the mechanical entry
  removal it will call once slice 14 rewrites the guidance.
- **Removal is never implicit.** It is reachable only through its own verb with
  an explicit identity, proved by driving take, resume, and add and asserting
  every title still occurs exactly once.

Defect found and fixed in already-delivered slice 1 code:

- `applyToBacklog` tried to create the lock beside the backlog before
  establishing that the backlog was there, so a `--file` path whose directory
  was absent crashed with a raw `ENOENT` from `mkdirSync` instead of refusing.
  That contradicted the boundary requiring missing input to return a nonzero
  outcome with actionable context, and it affected every verb. The guard now
  refuses with `Backlog file not found: <path>` and creates nothing — no
  directory, no file, no lock. The new write-safety case was confirmed to fail
  against the pre-fix store with exactly the reported crash, so it pins the
  defect rather than merely passing.
- **Known limit, deliberately not expanded:** a `--file` path that exists but is
  a *directory* still fails with an unhandled `EISDIR` from `readFileSync`
  inside the lock. Fixing it would widen `readFile`'s error translation across
  every caller including canonical homes. Slice 14's installed-use review
  decides whether it needs the same treatment.
- Slice 14 now also has `product-backlog-complete.mjs` to declare.

### Slice 5 (done)

New CLI verb `place --identity <id> (--after <id> | --before <id> |
--position first|last) [--return]`. `queueIndexFor` moved into
`product-backlog-placement.mjs` and is now the single owner of "where does an
entry belong in the queue for this explicit destination"; `add` and `place` are
its only callers. The CLI's self-description moved to
`product-backlog-usage.mjs` to keep the composition root under the size seam.

Decisions and observations that bind later slices:

- **`--return` is required both ways.** Taken work without it is refused, and
  queued work with it is refused as having nothing to return. Beyond honouring
  the rule that returning taken work is an explicit backlog decision, this makes
  the flag a validated origin-state precondition: a request written against a
  stale reading of the backlog is refused rather than applied to whichever list
  happens to hold the work now.
- **A placed entry's line is carried across verbatim, including any recorded
  plan link.** `place` moves work and decides nothing about the work's plan;
  dropping the link on return would be the script deciding the plan is no longer
  active. `renderEntry` therefore remains the only thing that ever *composes* an
  entry line or its plan suffix.
- **A queued entry carrying a plan suffix is now a reachable, valid state.**
  Slices 8–9 must not treat "has a plan link" as a proxy for "is Taken"; list
  membership is the only membership signal.
- **The destination is resolved with the entry already lifted out** — remove,
  re-render, re-parse, then `queueIndexFor` — rather than adjusting indexes
  after a move. That is what genuinely keeps insertion and movement one rule
  instead of two that happen to agree, and `parseBacklog(renderBacklog(document))`
  re-runs `requireDistinctWork` and the parser's strictness on the candidate.
  Slices 8–13 can reuse that as a cheap, already-exercised way to validate an
  intermediate document before publishing it. Do not replace it with index
  arithmetic.
- **A placement an entry already satisfies succeeds with a byte-identical
  file**, because the requested outcome holds.
- `place` never moves an entry into `## Taken`; that stays `take`'s.
- No dependency ranking, inferred priority, ID-based tie-break, or priority
  policy was added, as the boundaries require.
- Slice 14 now also has `product-backlog-place.mjs` and
  `product-backlog-usage.mjs` to declare.

### Slice 6 (done)

New CLI verb `refresh --identity <id> [--title] [--link] [--plan]`, which
rewrites one listed entry's title, canonical link, and/or active plan link in
place while carrying the identity unchanged. This closes the loop slice 2
opened: the identity recorded in a canonical home is what survives a rename,
and entry equality treats two identities naming one canonical home as
ambiguous, so a legitimate in-flight rename comes through here rather than
through a second `add`.

Decisions and observations that bind later slices:

- **Refresh reads canonical homes and writes none.** Slice 2's recorded
  identity is used purely as evidence that a move already happened. The module
  contains no write call of any kind; the entry line is the only thing that
  changes.
- **Three guards keep one identity from being reachable twice:** the new home
  must not already be listed; the new home must record that identity; and the
  reference being dropped — old canonical home or old plan — must no longer
  record it. That third guard covers an old and a new copy both sitting on
  disk, and refuses with the project untouched rather than half-applying.
- **`stillRecords` is deliberately lenient**: a path that is gone or no longer
  readable as a home claims nothing. Anything stricter would turn ordinary
  post-rename states into refusals.
- **A path-identified work item cannot be relocated by refresh.** A bounded
  correction's identity *is* its canonical plan path, so moving that document
  changes its identity. That is an explicit refusal directing a human to
  decide, never a silent re-identification.
- **Deliberately unpromised by this verb:** adding a first plan link (refused,
  pointing at `take --plan`), dropping a plan link (`--no-plan` refused),
  changing an anchor, and any direction change.
- **Reports moved to `product-backlog-report.mjs`.** Adding `refresh` pushed the
  CLI to 263 lines, so the report builders were extracted alongside
  `product-backlog-usage.mjs`, leaving the CLI as parse-args, operate, print.
  Slices 7–13 add their reports there, not in the CLI.
- Two shared seams now have one owner each: `requireUnlistedHome` in
  `product-backlog-placement.mjs` (used by `add` and `refresh`) and
  `product-backlog-plan.mjs` (`planLabel` plus the mechanical existence-only
  plan check, used by `take` and `refresh`).
- Slice 14 now also has `product-backlog-refresh.mjs`,
  `product-backlog-report.mjs`, and `product-backlog-plan.mjs` to declare.

Open item this slice exposed, owned by nobody yet:

- **Relocating a bounded correction's canonical plan** has no owner. Because
  such an item is identified by its plan path, moving that document changes its
  identity, and refresh explicitly refuses rather than re-identifying it. If
  this becomes real it is an identity/adoption decision, not a refresh, and it
  needs a human decision before any slice takes it on.

Recurring structural note:

- `product-backlog-document.mjs` sits at ~245 lines, just under the size seam,
  and two refactor passes have now declined to move naturally related code into
  it for that reason alone. If a later slice has to split the document model
  anyway, those deferred moves should land together rather than one at a time.

### Slice 7 (done)

New CLI verb `direction (--text <text> | --clear) (--expect <text> |
--expect-none)`, which creates, replaces, or clears the
`## Near-future direction` section. This completes the local operations; slices
8–13 own reconciliation.

Decisions and observations that bind later slices:

- **`--expect ""` is refused, not read as "expect no direction."** An empty
  string cannot be told apart from `--expect "$DIR"` where the variable was
  never set, so accepting it would silently turn "I forgot to read it" into "I
  expect nothing" — exactly the accident the precondition exists to catch.
  "I read none" is its own flag, so neither state is the default.
- **Supplied text is written verbatim and never tidied.** "Never synthesises or
  edits" is enforced mechanically: the candidate is re-parsed and the direction
  read back must equal the caller's bytes, so padding or text carrying its own
  `## ` heading is refused rather than corrected. No model invocation is
  involved in applying a direction.
- **Clearing removes the heading with its body**, so the direction is genuinely
  one value — text or nothing — rather than a tri-state of absent,
  present-empty, and present-with-text.
- **Slice 10 reads the direction through `directionOf(parseBacklog(source))`**,
  where `""` means no direction for both an absent and an empty section.
  `directionHeading` is exported from the same module. Do not reintroduce a
  tri-state.
- **Known boundary, not a defect:** a project spelling the heading differently
  (for example `## Near-term direction`) reads as carrying no direction, and a
  create would add a second section beside it. This matches the parser's
  existing strictness posture from slice 1; the established format has one
  spelling.

The recurring structural note is now discharged. `product-backlog-document.mjs`
was split along the seam the plan had already identified:

- `product-backlog-refusal.mjs` (25 lines) — `BacklogError` and `requireField`,
  extracted first to break the import cycle the plan predicted, and now the one
  refusal vocabulary the whole tool shares.
- `product-backlog-identity.mjs` (89 lines) — what an identity is:
  `adoptionHint`, `ambiguousHome`, `splitHref`, `composeIdentity`,
  `identityFor`, `tokenFor`.
- `requireUnlistedHome` rejoined `requireDistinctWork` in the document model:
  they are the same invariant — the backlog lists each work item once, by
  identity and by canonical home — asked backwards of a parsed document and
  forwards of a home about to be written. `placement.mjs` keeps only list
  positions and line mechanics.
- Where a `## ` section sits now has one owner, `sectionsNamed`, instead of the
  direction module re-deriving it.

The document model is 188 lines and every module is well under the size seam
(largest is the CLI at 231). The import graph was independently verified
acyclic across all 18 modules, the root maintainer helper still resolves its
imports, and the contractual refusals were spot-checked through the real CLI
after the split.

Slice 14 now also has `product-backlog-direction.mjs`,
`product-backlog-refusal.mjs`, and `product-backlog-identity.mjs` to declare.

### Slice 8 (done)

New CLI verb `merge --ancestor <path> --branch <path> --branch <path>
[--file <path>]`, which reads three ordinary backlog files and writes one
complete reconciled backlog, or leaves the destination untouched and reports
what it will not decide. New modules: `product-backlog-combine.mjs` (110, the
rule), `-merge.mjs` (181), `-version.mjs` (197), `-work.mjs` (92), and
`-request.mjs` (71, the shared reading of a request's options and paths,
extracted because this verb pushed the CLI past the size seam).

Decisions and observations that bind later slices:

- **The verb is deliberately not Git-aware.** It consumes three files named on
  the command line and knows nothing about index stages, `MERGE_HEAD`, or
  rebase state. Slices 11–13 own placing it inside a Git operation and must
  supply the three versions themselves; they must not push Git knowledge down
  into these modules.
- **The reconciliation is one rule, asked three times.** `mergeValue` is a
  plain three-way comparison; `mergeWork` asks it of each value of one work
  item; `mergeOrder` asks it of a list's order. There is no per-scenario
  recogniser anywhere, and the plan's named cases fall out of the rule rather
  than each being detected. Slices 9 and 10 extend what the rule is asked
  about, not the rule.
- **A value unchanged on one side is no evidence at all about the other side's
  change.** This is the property that stops an entry no branch touched from
  resurrecting an entry a branch removed, and it is what distinguishes this
  from a surviving-line union. Flipping it to a union fails exactly the two
  closure tests and the symmetry test.
- **Removal versus change is handed back, not ordered.** A branch that removed
  an item and a branch that changed it have stated different intentions about
  the same work, and no lifecycle order (queued → taken → done) decides
  between them. `mergeWork` refuses rather than picking one.
- **The same-work relation across versions is the existing same-identity-OR-
  same-canonical-home rule**, reused from `requireDistinctWork` rather than
  restated. Identity alone would duplicate work across an adopted and a
  non-adopted branch; canonical home alone would let a one-sided link refresh
  resurrect a removal. When a chain of that relation makes one version say two
  things about one item, the verb stops for a human.
- **`requireEstablishedShape` refuses a version carrying a `## ` section
  between the direction and the two lists.** That whole region is re-rendered
  from the merged state, so such text would be silently dropped. This is a
  silent-data-loss guard, not strictness for its own sake; do not weaken it.
- **The destination is never read as an input.** The three named versions are
  the only evidence, so running the verb twice with the same inputs gives the
  same result, and a half-written destination cannot influence a merge.
- **Argument order does not change the result.** Entries whose position no
  version establishes are ordered by identity, so swapping the two `--branch`
  arguments produces byte-identical output.

Left explicitly unimplemented, with the seams named:

- **Slice 9's interleaving case is not met yet.** Given `[A, B, C]` with X
  added after A on one branch and Y after B on the other, slice 8 produces
  `[A, B, C, X, Y]`, not `[A, X, B, Y, C]`. The seam is the `rest` computation
  in `mergeBacklogs`. The Taken interleaving rule of
  `references/merge-conflicts.md` step 4 (retain survivors in order, append
  preserving each side's addition order, tie-break by lexically smallest
  identity) is also slice 9's, as is proving the order-conflict refusal that
  `mergeOrder` already implements but nothing yet exercises.
- **Slice 10 owns the direction cases** the plan names: an identical direction
  update on both branches applying once, deletion versus replacement, and
  edits to different lines of one direction that ordinary Git text merging
  would wrongly accept. The direction is already a single merged value in
  `renderCandidate`; that is slice 10's seam.

The post-change refactor collapsed three duplications without touching the
rule: `directionLines` in `product-backlog-direction.mjs` is now the one owner
of how a direction is written as lines (the merge renderer had become a second
composer of that section); `valueNames` moved beside `stateOf` in
`product-backlog-version.mjs`, so the state's values, their human names, and
the state builder have one home and a value added to one cannot be silently
compared by nothing; and the CLI now resolves its destination through
`resolvePath` like every other path a request names. The import graph stays
acyclic across all 23 modules with no new edges.

Slice 14 now also has `product-backlog-combine.mjs`,
`product-backlog-merge.mjs`, `product-backlog-version.mjs`,
`product-backlog-work.mjs`, and `product-backlog-request.mjs` to declare.

### Slice 9 (done)

The queue now keeps the place each branch gave a newly listed entry, so the
plan's named case — `[A, B, C]` with X added after A on one branch and Y after
B on the other — merges to `[A, X, B, Y, C]` rather than appending both. One
new module, `product-backlog-order.mjs` (179 lines), owns the merged order of
one list behind a single entry point `listOrder(list, orders, held, naming)`.

Decisions and observations that bind later slices:

- **The two lists order differently, and that difference is contractual.**
  `references/merge-conflicts.md` step 4 scopes append-and-lexically-interleave
  to **Taken** and ends with "Do not use this rule for queue priority"; step 3
  keeps queue order positionally. Slice 8 applied one shape to both. Taken is
  the display order of claimed work, so it can be settled here; a queue
  position is a priority, so it cannot. Do not unify them.
- **The one new concept is an entry's *placement*: the settled entry it comes
  after, or the start of the list.** That placement is decided by the existing
  `mergeValue` with `undefined` as the ancestral placement, because an entry
  the settled order does not place has no ancestral position. Every case falls
  out of that — a one-sided addition, an identical addition applied once, two
  different placements refused — with no scenario recogniser. Extend what the
  rule is asked about, never the rule.
- **`undefined` and `null` are different placements.** `undefined` means this
  version does not place the entry in this list; `null` means the head of the
  list. Collapsing them is a silent priority change, not a simplification. The
  literal phrase `at the start of the list` in the refusal is the only
  user-visible evidence that `null` survived as a real value, and it is
  asserted for exactly that reason.
- **An undetermined queue position refuses, including the everyday case.** Two
  branches that each append to the queue have both said "last", and nothing
  establishes which outranks the other, so the merge names both entries and the
  place they share and writes nothing. This will fire on ordinary concurrent
  queueing once slices 11–13 wire it into Git. It is the designed behaviour —
  queue position is priority, and priority is a human decision — not a defect
  and not a repair trigger. Slices 11–13 must not treat it as one.
- **Two behaviours fall out rather than being coded:** an addition whose anchor
  the other branch removed slides to the nearest surviving predecessor, and an
  entry that moved between the lists stops being a member of the old one, so it
  cannot be emitted twice.
- **The settled spine is the entries the ancestor listed in this list that
  survive**, not whatever the chosen branch's order happened to contain. An
  entry newly listed here — added, or moved from the other list — has no
  settled place and is placed separately.

Correcting the slice 8 record above: slice 8 said argument-order symmetry holds
because entries no version places are sorted by identity. Slice 9 removed that
mechanism. Symmetry still holds — it is asserted on whole-file bytes by `merge
order gives the same bytes whichever branch is named first` — but it now rests
on `mergeValue` being symmetric, `gapOrder`'s containment test returning the
containing sequence whichever side holds it, and Taken's lexical tie-break. The
only remaining lexical comparison is the one step 4 mandates for Taken.

Three mutation results worth keeping, because each names a guard whose loss is
otherwise invisible:

- Making `mergeOrder` prefer the unchanged side is caught by the symmetry test
  **and nothing else**; every value assertion still passes. Order asymmetry
  does not show up in what a merge says, only in which argument was named
  first.
- Collapsing the head anchor (`let after = null` to the first settled key)
  fails exactly the three head-placement tests and nothing else — verified
  independently by the coordinator, 8 pass and 3 fail. Under it the head
  conflict still *refuses*, but reports the wrong place, so only the literal
  phrase assertion catches it.
- Deleting `gapOrder`'s `sameOrder` guard makes the merge exit 0 and publish
  one branch's ordering of two items both branches queued in the same place —
  the tool choosing a priority, which is the one thing this design must never
  do. No other test noticed.

The post-change refactor split `product-backlog-combine.mjs` on the criterion
that its stated concept could no longer describe its contents: slice 9 had
extended its header to cover "where an entry that order does not place
belongs", but `appendedOrder`'s tie-break is a product convention from
`merge-conflicts.md`, not the ancestor-based rule. Combine returned to 110
lines, byte-identical to its slice 8 state apart from exporting `sameOrder`,
so `mergeValue`, `mergeWork` and `mergeOrder` stay adjacent — that adjacency is
the design's load-bearing documentation and the reason the other available
seam (all order merging together) was rejected. `product-backlog-merge.mjs`
fell to 173 lines and now derives each version's list order once. The import
graph is acyclic across 24 modules, with `order.mjs` imported only by
`merge.mjs`.

Deliberately not covered, with the reason: the `## Taken` spelling of the
shared-order refusal. No verb reorders Taken — `take` appends, and `place`
refuses Taken work without `--return`, which moves the entry to the queue — so
that spelling is reachable only by hand-editing, and a test for it would assert
a string substitution rather than a behaviour. A later slice that gives Taken
an explicit reorder should bring the case with it.

Slice 14 now also has `product-backlog-order.mjs` to declare, and should align
`references/merge-conflicts.md` steps 3–5 with the refusals this slice
produces: step 3 currently says nothing about an undetermined queue position,
and step 5 covers it only generically as "competing order". The installed
guidance must tell a human what to do when it fires — decide the two
priorities, repair one version by hand, merge again — the way slice 4's
"already applied" nonzero exit needs distinguishing from a failure.

### 10. Preserve direction intent during reconciliation — learnings

The direction needed no new code. It was already reconciled by the same
`mergeValue(ancestor, one, other)` that decides the preamble and the epilogue,
through the same loop, so the slice's source diff is empty by design. Adding a
direction-specific path would have bought nothing and broken the one rule.
What the slice delivered is proof, and the proof found two things the code had
been getting right without anyone knowing.

The plan's own proof command, `--test-name-pattern='merge direction'`, matched
zero tests before this slice: every test was named `merge items` or `merge
order`, so the command passed by running nothing. A proof line that names a
group nobody has created yet is indistinguishable from a passing one. Worth
checking on the remaining slices before trusting their proof commands.

`transitions()` pushes `changed the "## Near-future direction"` into the merge
report, and nothing asserted it. Deleting that block leaves all 25 pre-existing
tests passing. The report exists so a caller can check what they are accepting,
so an unreported direction change is a strategy rewrite accepted unseen. Both
halves are now asserted: that it appears when a branch moved the direction, and
that it is absent when neither did. A report naming the direction unconditionally
is as useless as one that never does, and nothing caught that either.

`mergeValue`'s identical-value arm had no coverage at all before this slice.
Item states reach agreement through `mergeWork`'s `sameState`, never through
`mergeValue`, so `merge items applies an identical change on both branches once`
does not exercise it. Making that arm return the ancestor fails only the two new
direction tests.

Argument-order symmetry stopped being a stylistic contract here. Making the
`one === ancestor` arm return the ancestor kills exactly one test and only in
its swapped-argument run: the forward run passes because the direction-changing
branch happens to be named first. The implementation's first draft ran one order
and missed it. Any future test of a value merge should run both orders and
compare whole-file bytes and stdout.

The Git contrast needs unchanged lines between the two edits, and that is not a
detail. Two edits to adjacent lines conflict in a line-by-line text merge by
themselves, so a test built on the two-line `direction` would assert our refusal
while proving nothing about the difference. On a four-line direction edited at
both ends, `git merge-file` exits 0 and composes a direction telling agents to
run stories one at a time while a human schedules stories in parallel — text
neither branch wrote. The test asserts the text merge *succeeded* before
asserting we refuse, so simplifying the edits closer together fails loudly with
"a text merge refused these versions itself, so they prove no contrast" rather
than quietly proving less.

Both direction tests that had been sitting in the `merge items` group moved into
this one rather than being copied: their content was direction behaviour, and
slice 8's recorded proof claims membership, metadata, malformed input and
delete-versus-return, not the direction. `merge items` drops from 14 to 12 and
loses no assertion the remaining 12 do not make. Identical-replacement and
identical-clearing earn separate places because a "clearing never counts as a
change" special case passes one while breaking the deletion-versus-replacement
refusal.

Process limit worth recording: the independent refactor pass stalled after
completing its edits but before reporting. Its work was accepted by direct
inspection of the diff — it moved `chosen`, `spreadDirection` and the
`textMerge` helper down beside the group that uses them, returning the shared
fixture to unmodified, and collapsed eight repetitions of
`backlogOf([takenEntry], queued, text)` into `saying(text)`. No report was
received on anything it may have found unproved, or on its judgement of the
deferred test-file split, so neither question was answered this slice. The
mutation testing behind the claims above was run by the coordinator directly,
before and after the refactor, so the refactor is known not to have weakened the
swapped-argument assertion or the text-merge self-guard.

For slice 14: `merge-conflicts.md` step 3 says only "preserve unrelated titles,
links, direction text, and queue order", and step 5 covers incompatible changes
generically. Neither tells a resolver what to do when both sides changed the
direction, and neither warns that a textually clean merge of the direction
section is not evidence of compatibility — which is exactly the failure this
slice now documents. The guidance must say that any two differing direction
values, including clearing against rewriting, stop for a human decision.

For slices 11-13: the merge report now has assertions on both the presence and
the absence of its direction line, so reshaping the report will be noticed.
`textMerge` in the test file is the only Git call in this subsystem's tests and
it is an observer used to draw a contrast — it is not the beginning of Git
support and should not be refactored into shared Git plumbing. The one test
using it needs `git` on PATH; without it the helper reports ENOENT and the test
fails loudly rather than passing silently.

## Coverage, stopping points, and remaining concerns

**What this plan delivered, and what it did not.** Slices 1-10 delivered the
validated backlog operations and the three-version reconciliation core that
decides them: 24 acyclic modules, 76 tests, CI green on every delivered slice.
What they did not do is reach anybody. Nothing is declared in `install.sh` or
`src/install/open-dough-release-version.sh`, no guidance mentions the scripts,
and `SKILL.md` and `references/merge-conflicts.md` still describe intellectual
conflict repair exactly as they did before this execution began. That is the
property that made concluding here safe, and it is also the reason the successor
story matters: until it runs, this work is proven and unused. The root helper
`scripts/product-backlog-insert.mjs` still exists and still works; it owns no
rule the new modules do not own better, but nothing operational references it,
so leaving it in place breaks nothing.


The first seven slices provide useful safe local operations. They do not finish
the merge promise. Slices 8–13 establish reconciliation and its Git boundaries;
slice 14 delivers them to ordinary project workflows. Slices 15–17 own actual
host use and the conditional guards. No slice's interim stopping point silently
removes a later promise. No release/native success is claimed by this plan.

Refinement performed after writing the initial 15-slice plan:

- Removed hidden identity allocation/publication from insertion. Slice 1 now
  accepts an existing ID; slice 2 owns allocation/adoption and interruption
  recovery. This avoids embedding a multi-file transaction in every queue edit.
- Replaced the combined Git gate with slices 11–13. Merge, rebase, and
  cherry-pick preserve different continuation state; each now has a real Git
  proof owner. The domain resolver remains shared, not one implementation per
  Git operation.
- Retained slice 14 as one ordinary update-to-standalone-use outcome, with
  source guidance review and native calling behavior explicitly separated in
  the proof table. Retained one installed native journey per host in 15–17;
  installation, denial, script use, and human-stop behavior must be observed
  together before that journey is marked done.

Cumulative assessment: the slices extend one identity/transition/reconciliation
model. Separate priority and direction rules reflect domain meaning, and Git
and host adapters translate concrete existing boundaries. No scenario-specific
merge handlers, permanent log, priority policy, AI fallback, backlog UI, or
whole-Git queue is introduced. All slices remain Behavior with focused external
proof; no unsupported preparatory Structure slice is needed.

Remaining concerns are bounded but real: legacy identity mapping/recovery in
slice 2; ordering inference in slice 9; capturing clean rebase inputs in slice
12; and actual native coverage, trust, and lightweight registration in slices
15–17. They have explicit refusal/proof boundaries rather than speculative
machinery. Missing native proof or a complex-enforcement decision remains
pending; this plan does not certify those assumptions as solved. There are no
numeric sizing exceptions because no numeric policy was supplied.

Resulting slice count: 17. Under the refinement skill's count guidance:
`story resplit recommended: 17 slices; use dough-resplit-story`.
This recommendation is not an execution gate and does not change story scope
or backlog placement. Resplitting was not requested and was not performed.
Execution has not started and this planning request does not authorize it.
