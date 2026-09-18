# Safely edit and reconcile the product backlog through scripts

Status: executing. Created and slice-refined 2026-09-18. Execution started
2026-09-18 under `/dough-execute-plan 57`.

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
Status: planned
Proof: `node --test --test-name-pattern='complete' tests/support/product-backlog.test.mjs`

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
Status: planned
Proof: `node --test --test-name-pattern='place in queue' tests/support/product-backlog.test.mjs`

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
Status: planned
Proof: `node --test --test-name-pattern='refresh reference' tests/support/product-backlog.test.mjs`

Given an explicitly renamed or relocated canonical story/plan, refresh its
backlog title/link while carrying its ID. Preserve membership, order, and other
items. References to old/new active homes must not permit the same ID twice.
Use established canonical-home changes as input; this slice is not a general
document renamer or repository-wide link-repair engine.

Boundary: actual canonical fixtures and resulting active reference.
Hypothesis: one metadata refresh; no new identity model.

### 7. Set the near-future direction explicitly
Type: Behavior
Status: planned
Proof: `node --test --test-name-pattern='direction update' tests/support/product-backlog.test.mjs`

Given supplied text and the expected prior direction, create, replace, or clear
that section exactly as requested. Preserve both lists and unrelated text.
Stale expectations fail unchanged; item operations retain the direction.
The caller supplies the chosen text, so applying it needs no model invocation.

Boundary: real Markdown bytes and untouched entries through the CLI.
Hypothesis: one value update with the same validated write boundary.

### 8. Reconcile identified work across three backlog versions
Type: Behavior
Status: planned
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
Status: planned
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
Status: planned
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
Status: planned
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
Status: planned
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
Status: planned
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
Status: planned
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
Status: planned
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
Status: planned
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
Status: planned
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

## Coverage, stopping points, and remaining concerns

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
