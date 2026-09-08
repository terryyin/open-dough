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

Owner direction: delete obsolete discovery process; write concise current
guidance. ADR 0005 and ADR 0000 history convention aligned. Codex/Cursor share
`.agents/skills/`; Claude Code uses `.claude/skills/`. Guideline lives in
`AGENTS.md`.

## Ordered slices

### 1. Review a skill through the concise authoring workflow

Type: Behavior
Status: done
Behavior: Maintainer follows shared guideline → skill trigger and useful outcome
are clear.

Delivered: `AGENTS.md` authoring guideline; extract-guidance and ADR-awareness
aligned; ADR 0005 / 0000 wording updated.

Proof: Manual `dough-adr-awareness` walk; `npm run lint`;
`bash tests/install-omits-internal.sh`.

### 2. Judge a skill-use check by its useful result

Type: Behavior
Status: done
Behavior: ADR-awareness example → recommendation/conflict handling → behavior
result.

Delivered: Context retention judges via behavior `assessment-*` only; no
`prerequisite-*` / `assessment-interpretation`.

Proof: `bash tests/native-adr-behavior.sh`; `bash tests/native-result-retention.sh`;
`bash tests/native-stream-completeness.sh`; `bash tests/native-run-timeout.sh`;
`bash tests/native-runner-failures.sh`.

### 3. Judge an update check by the resulting installation and use

Type: Behavior
Status: done
Behavior: Fixture update + use → functional outcome from state and response.

Delivered: Journey path drops discovery fields; activation/prerequisite stack
deleted; update state and conflict use remain.

Proof: `bash tests/native-journey-state.sh`;
`bash tests/native-delivery-updated-use.sh`;
`bash tests/native-delivery-updated-use-adapters.sh`;
`bash tests/native-result-retention.sh`;
`bash tests/native-stream-completeness.sh`.

### 4. Start the next skill task from concise current guidance

Type: Behavior
Status: done
Behavior: Maintainer selects next skill task → linked guidance describes current
work.

Delivered: Story 10 reduced to enduring goal/scope; backlog queues Story 9 with
links to `AGENTS.md` and `extract-guidance`; discovery-gate prose removed from
`tests/README` and related notes. Historical Quick 023 evidence records kept.

Proof: Manual backlog → Story 9 → AGENTS.md / extract-guidance walk;
`npm run lint`; `npm test`.

## Learnings

Borrowed Donut `execute-plan` in Open Dough (`pendingCi: unobserved`). Context
then journey dropped discovery assessment; shared gate deleted last. Concurrent
backlog commits during execution absorbed separately.
