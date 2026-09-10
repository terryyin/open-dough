# Preserve recurring process findings in DearDough.md

## Source and outcome

[SEED-010 Story 1](../../seeds/SEED-010-learn-from-execution-retrospectives.md#turn-retrospectives-into-learning-loop),
selected on 2026-09-10 as the second backlog item. Preserve backlog order.
A developer receives one readable local process log with stable issue entries
and distinct execution occurrences, without inflated counts from rereview.

Use the refined story's project-root DearDough.md default, explicit project
location override, minimal Markdown format, stable execution identity, and
conservative matching. One issue heading/ID, description, and occurrence list
suffice; the rows are the count. No redundant total, registry, or new parser.

Exclude cross-tool testing and acceptance explicitly: no per-host runs, matrix,
or integration-reuse audit. Also exclude release/adoption (Story 2), consumers,
remote exchange, automatic guidance edits, token measurement, migration, pruning,
locking infrastructure, causal inference engines, and direction changes.

## Execution context

- Planning only is authorized. Two Behavior slices, no Structure preparation or
  numeric timing guarantee. Use `planned`, `in-progress`, `done`; update this
  plan in place. Preserve other tasks' backlog, Quick 034/035, and seed changes.
- Edit `src/skills/dough-execution-retrospective/SKILL.md` and its recognition
  record. Use one conditional log-format reference if it materially shortens
  the entrypoint; do not duplicate behavior. No installed-copy, release metadata,
  or payload edits. The retrospective remains Proposed source.
- Current source forbids DearDough.md writes and allows only plan/product edits.
  Reconcile both with enabled process recording. Process recording requires no
  product-maintenance authority. Gate `--skip-process` before any log read;
  `--skip-product` does not suppress recording. Keep existing direction,
  correction-planning, review-completion, marker, and attention-banner rules.
- Reuse existing evidence standards: one-off costs, useful practices, and the
  retrospective's own supported process observations qualify. Missing evidence
  or identity yields a limitation, not fabricated records or a new tracking system.
- During authorized execution, use the established independent post-change
  refactor and owned-file delivery workflow; resolve checkout/push then. For
  Markdown use `git diff --check`; do not bulk-format unrelated code.

Follow [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for concise agent-facing instructions and [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
for source/release separation. Keep local behavior review distinct from native
acceptance under [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md).
The human excluded cross-tool work from this story; no release waiver is inferred.

## Ordered slices

### 1. Preserve a first supported process finding locally
Type: Behavior
Status: planned
Proof: A local walkthrough creates a readable first issue; skipped, unsupported,
or unsuccessful recording never appears as a successful log write.

Behavior: Given an identified execution, supported process evidence, and no log,
enabled process review creates canonical DearDough.md and returns its concise
report. Include a stable issue ID, concrete description, execution identity,
decisive evidence, observed effect, and qualified inference only where needed.
Use the story's execution identity rule; neither review date nor later commits
turn a rereview into another execution. Do not create an empty log.

Add the narrow write allowance, location and format rules, and recording result.
An explicit project location wins over the root default. Missing/conflicting
location or identity, and write failure, stop recording only; other supported
reviews continue. With process skipped, do not read/create/edit the log. Keep
product-only findings outside it and preserve all unrelated files.

Local proof: a disposable project and supplied process record produce the first
entry. Reuse Quick 034's process case if adequate and label representative events.
Vary no findings, skip flags, missing identity, and failed write at this same
recording boundary. Inspect actual output/file state, not exact wording. No
runner or static prose test suite is needed.

Safe stop: First capture works. Until Slice 2, an existing log remains unchanged
and findings are returned with that interim limitation; do not overwrite it or
append unverified duplicates. Slice 2 removes this restriction.

### 2. Maintain recurring findings without double counting
Type: Behavior
Status: planned
Proof: One local maintenance journey leaves one occurrence on rereview, reaches
two for a distinct matching execution, and preserves human notes/other entries.

Behavior: Given an interpretable log, reuse stable issue and execution identities.
The same issue in the same execution retains one occurrence. Add only new decisive
evidence or a corrected qualified conclusion to that row. A distinct execution
with evidence of the same concrete issue adds one occurrence. Similar symptoms
alone do not prove a match: uncertain issues remain separate with a brief caveat
and next-unused local ID. Count occurrence rows rather than storing a total.

Add maintenance to the same authoritative format instructions and remove Slice 1's
existing-log refusal. Preserve IDs, human notes, and prior evidence. Unsupported
or ambiguous content remains untouched with a recording limitation; no migration,
normalization, deletion, or automatic merging. An identical rereview makes no edit.

Local proof: use Slice 1's log plus a human note and unrelated entry. Rereview the
original execution, enrich its evidence, then supply one distinct matching
execution. Inspect one enriched original occurrence and one new occurrence.
Supply uncertain similar symptoms and inspect a separate issue. A malformed-log
variation stays byte-identical. Use stable references in labeled representative
records if no second real execution is available. Repeat skip checks only if
changed routing invalidates Slice 1 proof.

Safe stop: A developer can read/count the log and act manually; no consumer,
infrastructure, release, or cross-tool acceptance is needed for source completion.

## Proof ownership and completion

| Promise | Owner and observation |
| --- | --- |
| Canonical local log, readable evidence, qualified findings | Slice 1: generated file and response |
| Skip/no findings/missing context/failed write | Slice 1: untouched destination or explicit limitation |
| Rereview and added evidence do not inflate count | Slice 2: one occurrence before/after |
| Distinct recurrence, conservative matching, stable IDs | Slice 2: two matching occurrences; uncertain issue separate |
| Existing notes/evidence and ambiguous files preserved | Slice 2: scoped diff or byte-identical refusal |
| Cross-tool testing and acceptance | Explicitly excluded; no completion gate |

Perform AGENTS.md's local behavior review for each slice: invocation, required
context, useful outcome. Record concise inputs, candidate, observations, and
limitations in recognition evidence. Manual walkthroughs are not native acceptance.
Inspect changed frontmatter/runtime links and run `git diff --check`; no installer
suite for this Proposed source-only change. Preserve historical Quick 034 evidence
that correctly reports its earlier no-log-writing contract.

Both journeys must pass and the final skill must have no competing write ban or
interim existing-log refusal. Mark the story source-complete, not released or
installed. Retain enduring rules/evidence, then reduce spent seed/plan detail
under the normal lifecycle; preserve unfinished siblings and required evidence.

## Planning assessment

Ready for direct execution. Two cohesive slices with one proof journey each;
no hidden infrastructure or independent preparation identified. No additional
slice-plan refinement is needed. Conservative matching deliberately leaves
uncertainty visible instead of creating a matching-engine subtask.
