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

Simplify the context-use path and its immediate callers in `tests/support/`.
Keep the existing behavior assessor and meaningful examples. Delete discovery
assessment and dedicated tests as their consumers are simplified. Update shared
callers together so the remaining checks form a working path.

Proof: Run `bash tests/native-adr-behavior.sh` and the affected credential-free
context wrapper checks. Use their existing concrete recommendation and conflict
examples. Review touched tests for their current functional purpose.

### 3. Judge an update check by the resulting installation and use

Type: Behavior
Status: planned
Behavior: A fixture receives an update and uses the resulting skill → evaluate
the observed state and response → report the functional outcome.

Simplify discovery-related fields and assertions in the updated-use path and
its shared reporting helpers. Keep the real update transition and behavior
checks. Delete helpers, fixtures, and tests dedicated to the removed process
once their remaining callers are handled.

Proof: Run `bash tests/native-journey-state.sh`,
`bash tests/native-delivery-updated-use.sh`, and
`bash tests/native-delivery-updated-use-adapters.sh` as applicable to the retained
checks. Their positive signal is the expected updated state and useful response.

### 4. Start the next skill task from concise current guidance

Type: Behavior
Status: planned
Behavior: The maintainer selects the next skill task → reads its linked guidance
and testing instructions → gets a short actionable workflow describing current work.

Delete obsolete discovery acceptance tasks, evidence, research, and explanatory
history from the affected planning and documentation. Simplify mixed documents
around their remaining functional purpose. Update incoming links and backlog
entries together. Reduce this story to its enduring goal and scope on completion.

Proof: Manually follow the next skill task's links and read the resulting
workflow. Run `npm run lint` and `npm test` once after cleanup to verify the
remaining repository checks work together. Keep any completion note brief and
about the delivered workflow.

## Execution readiness

Slices 1 and 4 use manual review of the complete maintainer interaction.
Slices 2 and 3 touch shared context/update reporting and several test consumers;
refinement is recommended for those two slices before execution. Resolve their
shared edits into one green check at a time. Aim for about five minutes per leaf;
reassess a leaf when its work exceeds that scale.

Slices 2–4 remain. Each remaining slice owns its cleanup and proof; positive
behavior examples supply acceptance. The plan uses the existing checks and
manual review.

## Learnings

2026-09-08 execute-plan: borrowed Donut execute-plan in Open Dough. No local CI
mailbox / nix wrap-up tools (`pendingCi: unobserved`). Slice 1 delivered the
shared authoring guideline; discovery assessment deletion stays in slices 2–3
and still needs refinement before execution.
