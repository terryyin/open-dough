# Maintain skills with a minimal shared guideline

## Source

[SEED-004 Story 10](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#maintain-skills-without-discovery-rechecks)

## Goal and scope

The maintainer adds or edits a skill using one short guideline and manual review
of its useful behavior. Delete the routine discovery process and its dedicated
code, tests, records, and documentation. Keep shared pieces for their current
functional use. Express the remaining workflow and its checks positively.

Story 9 owns extraction destinations. Installation and update stories own their
functional requirements. Unusual cases receive manual attention when encountered.

## Current decisions

The owner's direction in Story 10 governs this change: aggressively delete
obsolete process and supporting history; write concise current guidance.
Apply that direction to the discovery and retention requirements in
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) and the
history convention in [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md).
Keep relevant current policy in place and its index consistent.

Use the established platform convention: Codex and Cursor share `.agents/skills/`;
Claude Code uses `.claude/skills/`. Keep shared behavior in one source. The
installer already implements these paths. The guideline belongs in existing
maintainer guidance and is linked from its consumers.

## Ordered slices

### 1. Review a skill through the concise authoring workflow

Type: Behavior
Status: done
Behavior: A maintainer adds or edits a conventional skill → follows the shared
guideline → receives a skill whose trigger and useful outcome are clear.

`AGENTS.md` holds naming, frontmatter, layout, references, and behavior-review
instructions plus positive cross-tool delivery policy. Extraction skill,
ADR-awareness guidance/recognition, ADR 0005, and ADR 0000 history wording
align with that workflow.

Proof: Manual `dough-adr-awareness` walk (invocation, adopter context, conflict
stop). `npm run lint`; `bash tests/install-omits-internal.sh`.

### 2. Judge a skill-use check by its useful result

Type: Behavior
Status: planned
Behavior: An ADR-awareness example is evaluated → inspect the recommendation or
conflict handling → return the appropriate behavior result.

Gut prerequisite/discovery fill and assertions from the context retention path
(`native-result-retain.sh` context helpers) and update credential-free context
callers (`native-result-retention`, `native-stream-completeness`,
`native-run-timeout`, `native-runner-failures`, `dough-adr-awareness-context` as
affected). Keep `native_adr_behavior_*` and its examples. Leave the shared
activation/prerequisite modules in place while journey callers still need them;
do not delete `tests/native-prerequisite-gate.sh` until slice 3 removes those
callers.

Proof: `bash tests/native-adr-behavior.sh` plus the affected context wrapper
checks above. Positive signal is recommendation/conflict behavior, not
`prerequisite-*` fields.

### 3. Judge an update check by the resulting installation and use

Type: Behavior
Status: planned
Behavior: A fixture receives an update and uses the resulting skill → evaluate
the observed state and response → report the functional outcome.

Remove discovery fields and `native_prerequisite_assert_record_fields` from the
journey retention path and updated-use assert helpers. Keep
`native_journey_state_*`, the real update transition, and conflict use. Once no
callers remain, delete `native-activation-*.sh`, `native-prerequisite-gate.sh`
(support + dedicated test), and leftover `prerequisite-*` /
`assessment-interpretation` wiring.

Proof: `bash tests/native-journey-state.sh`,
`bash tests/native-delivery-updated-use.sh`, and
`bash tests/native-delivery-updated-use-adapters.sh`. Positive signal is
expected updated state and useful response.

### 4. Start the next skill task from concise current guidance

Type: Behavior
Status: planned
Behavior: The maintainer selects the next skill task → reads its linked guidance
and testing instructions → gets a short actionable workflow describing current work.

Delete obsolete discovery acceptance tasks, evidence, research, and explanatory
history from the affected planning and documentation. Simplify mixed documents
around their remaining functional purpose. Update incoming links and backlog
entries together. Reduce this story to its enduring goal and scope on completion.
Reconcile any concurrent uncommitted planning/ADR cleanup already in the tree
with this slice's ownership before staging.

Proof: Manually follow the next skill task's links and read the resulting
workflow. Run `npm run lint` and `npm test` once after cleanup to verify the
remaining repository checks work together. Keep any completion note brief and
about the delivered workflow.

## Execution readiness

Slice 2 leaves shared activation/prerequisite modules for slice 3. Slice 3
deletes them after journey callers are gone. One green focused check at a time;
~5 minutes per leaf, reassess past that. Concurrent uncommitted planning WIP
outside this PLAN stays unstaged until slice 4 ownership is clear.

## Learnings

2026-09-08 execute-plan: borrowed Donut execute-plan in Open Dough. No local CI
mailbox / nix wrap-up tools (`pendingCi: unobserved`). Slice 1 delivered the
shared authoring guideline. Refined slices 2–3 so context drops discovery first
while journey still uses the shared gate; slice 3 deletes the gate after.
Concurrent uncommitted seed/backlog/ADR-0006 cleanup left unstaged for slice 4.
