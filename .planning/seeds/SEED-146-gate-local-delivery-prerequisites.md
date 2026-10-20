---
id: SEED-146
status: active
planted: 2026-10-20
planted_during: Source-level comparison with Gojko Adzic's lights-on software factory and clarification of ODF-097
trigger_when: A coordinator continues to commit or deliver after a required prerequisite failed
scope: one story
---

# SEED-146: Make local delivery depend on successful prerequisites

## Why This Matters

A developer using Open Dough should be able to rely on a failed required local
operation stopping its dependent commit or delivery. Today individual commands
correctly report failure, but the coordinator can discard that result through
shell sequencing, a pipeline, or an ignored tool return. This causes avoidable
commit attempts and repairs, and can publish code without a required plan update.

The canonical evidence is
[ODF-097 — Publishing after a failed check](../../docs/maintainer/findings/ODF-097.md#odf-097).
Preserve the qualifications in that record: several occurrences were refused
commit attempts or local commits repaired before publication. The previous-SHA
delivery occurrence did not publish the rejected change. Do not turn those cases
into a claim that Open Dough's current hook accepts its own lint failures.

## Current Diagnosis and Existing Owners

The 2026-10-20 investigation inspected Open Dough at
[`359d3d22e9433c7e67414028544ac9f473f7cbf2`](https://github.com/terryyin/open-dough/tree/359d3d22e9433c7e67414028544ac9f473f7cbf2).
These are observed boundaries to recheck during refinement, not a second runtime
contract:

- The active [.githooks/pre-commit](../../.githooks/pre-commit) already refuses
  lint/format failures on its selected staged paths and conditionally runs the
  dashboard typecheck. It does not run every local prerequisite. It is this
  repository's project hook, not a hook installed into every project by Open Dough.
- [agent-commit.mjs](../../src/skills/dough-execute-plan/scripts/agent-commit.mjs)
  awaits ordinary Git commit, preserving project hooks; rejection returns
  `ok: false`, `status: "commit-failed"`, and CLI exit 1. Failure is not lost
  inside this helper. Caller contexts that use ordinary Git commit retain their
  existing authorship and hook contract.
- [story-obligations.mjs](../../src/skills/dough-execute-plan/scripts/story-obligations.mjs)
  correctly reports refusals. The obligation check and successful selective
  formatting are currently prerequisites expressed in
  [slice wrap-up](../../src/skills/dough-execute-plan/references/wrap-up.md),
  rather than checks invoked by the commit helper or this repository's hook.
  Required plan updates and staged whitespace checks likewise have their own
  commands; lint cannot establish whether an intended update happened.
- [execution-increment-delivery.mjs](../../src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs)
  owns managed publication and observation, consuming existing commits. It does
  not know whether a preceding commit attempt or prerequisite failed.
  [execution-increment-publication.mjs](../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs)
  reads the branch candidate, checks a supplied `validatedCandidate` against its
  SHA, and preserves already-published recovery. Initial publication assumes
  the caller has accepted proof; reconciliation requires applicable proof through
  [execution-increment-reconciliation.mjs](../../src/skills/dough-execute-plan/scripts/execution-increment-reconciliation.mjs)
  and [applicable-candidate-proof.mjs](../../src/skills/dough-execute-plan/scripts/applicable-candidate-proof.mjs).
  These are existing protections to retain.

Historical evidence remains in ODF-097: plan 298's failed commit followed by
delivery of the previous SHA; plans 299/304's local whitespace failures; the
Pygardon obligations refusal followed by a correction before publication; and
the failed plan updates that required later planning-only publications. Read the
record for execution identities, revisions, releases, effects, and limitations;
do not count this investigation as another occurrence.

The existing pre-commit lint, pre-commit typecheck, and agent-commit suites passed
during this investigation (19 tests). This is evidence for their existing
protections, not reproduction or validation of the proposed repair.

## Alternatives and Decision

Terry selected a narrow implementation using the existing delivery machinery:
required preparation succeeds, then commit succeeds, then delivery consumes that
successful commit's SHA. Mechanical failure propagation belongs in the existing
execution/delivery ownership, with project-specific commands and requirements
resolved from the project being worked on.

Another prose reminder repeats the current contract and leaves the observed
control-flow gap. Repeating all checks in a new universal hook would duplicate
project checks and cannot establish every required plan mutation or accepted
proof. A general workflow engine, new execution ledger, or imported Bash parser
is outside this story. Refinement selects the smallest coherent integration with
the existing owners rather than prescribing a new module or command here.

## Story Decomposition

<a id="gate-local-prerequisites-before-commit-and-delivery"></a>

### 1. Block commits and delivery after failed local prerequisites

**Identity:** SEED-146#gate-local-prerequisites-before-commit-and-delivery
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** A developer delegating execution needs failed required local work
to stop dependent repository mutations without relying on the coordinator to
remember or reinterpret an earlier failure.

**Goal:** The existing execution delivery path enforces successful required local
prerequisites before commit, and successful commit before delivery, while
preserving legitimate recovery of a SHA the remote already accepted.

**Scope:**

- Connect the mechanical local preparation, commit, and managed delivery
  boundaries through existing owners. A required operation's terminal failure
  prevents its dependent operation from starting. Merely awaiting a command,
  receiving output, or observing a successful final pipeline stage is not success.
- Cover the applicable project prerequisites, including required formatting,
  plan/status updates, obligation validation for planned work, and staged
  whitespace checking where required. Preserve existing judgment and proof
  acceptance; do not turn every historical failed command into a global veto or
  invent checks for unrelated work. Missing required context stops the affected
  operation rather than silently skipping its gate.
- Retain ordinary project hooks and the existing agent-commit/authorship rules.
  Pass the successful commit result and its exact SHA into the existing delivery
  path. A failed commit must not start that attempt's delivery or its observer.
  A different later branch tip must not silently substitute for the committed
  candidate; retain the publisher's reconciliation and renewed-proof handling.
- Report the failed prerequisite and terminal result with a usable recovery
  path. Preserve owned edits, staged content, unowned work, publication authority,
  and existing continuation rules; add no destructive rollback or duplicate
  observer/retry lifecycle.
- Keep already-published acceptance and lost-response recovery valid. Do not
  reject legitimate recovery simply because the candidate is already on the
  remote, equals the current HEAD, or requires no new commit or push.
- Keep shared behavior portable across Codex, Cursor, and Claude Code with the
  smallest necessary host adaptation. Update the runtime guidance at its shared
  source; installed copies change only through a released payload.

**Key examples and evaluation:**

1. A required local command fails, including a formatter/tool failure or staged
   whitespace rejection. The operation reports that failure; no dependent commit
   or delivery starts. Verify absence of downstream effects, not only a returned
   failure flag. Retain existing hook-refusal tests as controls.
2. A required plan/status update fails while product files are otherwise clean.
   No commit or delivery starts with the update missing. An obligations refusal
   for the selected planned slice likewise prevents commit and delivery.
3. All prerequisites pass, but Git or a project hook rejects commit. HEAD remains
   unchanged, staged work remains recoverable, and no delivery/observer is started
   by that failed attempt. Output filtering must not turn refusal into success.
4. All prerequisites and commit succeed. The existing managed delivery receives
   the exact successful commit SHA and retains its authorization, observation,
   and publication behavior. A changed candidate follows existing mismatch or
   reconciliation/proof rules rather than silently publishing another revision.
5. After repairing a failed prerequisite, the same owned work can continue
   through its existing recovery path. Reuse still-valid proof and repeat checks
   when the repair invalidates them; do not require a new commit merely to retry.
6. A push was accepted but its response was lost. Existing recovery recognizes
   the already-published SHA without manufacturing a new commit or duplicate
   push, while preserving the applicable acceptance and observation contract.
   This is distinct from calling delivery after a known failed fresh commit.

Use the real execution boundary and real lower layers in disposable repositories,
with substitute processes only for external effects. Record command invocation,
HEAD/index state, remote changes, and observer creation as appropriate. Cover a
nonzero prerequisite, obligation refusal, failed plan update, hook/Git commit
rejection, success, and already-published recovery through the maintained path.
Keep native host requirements distinct from deterministic proof under ADR 0005;
fixture success alone does not establish native agent follow-through.

**Completion:** Update ODF-097 at its canonical finding record after delivery
under [retained finding evidence](../../docs/maintainer/finding-names.md#retained-evidence).
Record the implemented response and remaining limits truthfully; queueing or
implementation alone does not prove effectiveness or resolve every occurrence.

**Value / learning:** Prevent incomplete execution metadata, avoidable local
repair commits, and pointless delivery attempts while retaining current valid
publication and recovery behavior.

**Dependencies:** No new blocking story dependency is established. Existing
delivery machinery is available; shared code alone does not create a block.

**Safe stopping point:** This story leaves one usable guarded delivery journey
with its failure and recovery behavior proved. It needs no later workflow-engine
or telemetry story to provide value.

## Ordering and Scope Reduction

Terry explicitly requested this story first in Backlog list on 2026-10-20.
Preserve Taken, the near-future direction, and every unrelated entry's order.
Keep the implementation bounded to the success dependencies above. A broader
policy engine, exact-index lint redesign, automatic repair of semantic proof,
and unrelated runner improvements remain outside this story.

Effort is unestimated. This is queued, non-executable input; no refinement,
execution approach, readiness assessment, slice plan, or Take is granted here.

## Breadcrumbs

- Terry's 2026-10-20 instruction to queue this narrow fix at the top, preserve
  known references/details and already-published recovery, and sync directly
  from main to origin. Implementation is future work, not part of queueing.
- [ODF-097 evidence and selected response](../../docs/maintainer/findings/ODF-097.md#odf-097),
  with [ODF-100's distinct pipeline-status mechanism](../../docs/maintainer/findings/ODF-100.md)
  as related context, not an additional selected finding or occurrence.
- Existing controls: [pre-commit lint tests](../../tests/support/pre-commit-lint-hook.test.mjs),
  [pre-commit typecheck tests](../../tests/support/pre-commit-typecheck-hook.test.mjs),
  and [agent-commit tests](../../src/skills/dough-execute-plan/scripts/agent-commit.test.mjs).
  Existing publication coverage:
  [initial/already-published cases](../../src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs),
  [reconciliation proof gates](../../src/skills/dough-execute-plan/scripts/execution-increment-publication-reconciliation.test.mjs),
  and [managed delivery](../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs).
- [Publication contract](../../src/skills/dough-execute-plan/references/trunk-publication.md),
  [agent commit contract](../../src/skills/dough-execute-plan/references/agent-commits.md),
  [runtime setup](../../src/skills/dough-execute-plan/references/runtime-setup.md),
  and [native verification setup](../../tests/native-setup.md).
- Gojko's [lights-on software factory, inspected snapshot](https://github.com/gojko/lights-on-software-factory/tree/5a34ef30a9120900e301cbb5d7b5398dff3eef83)
  and [deterministic orchestrator](https://github.com/gojko/lights-on-software-factory/blob/5a34ef30a9120900e301cbb5d7b5398dff3eef83/ORCHESTRATOR.md)
  inspired executable control flow. Borrow the principle, not its whole runner
  or its weaker completion/recovery assumptions.
- [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md),
  [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md),
  [maintainer guidance](../../AGENTS.md), and [product backlog](../PRODUCT-BACKLOG.md).
