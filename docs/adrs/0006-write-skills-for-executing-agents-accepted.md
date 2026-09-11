# 0006 — Write skills for executing agents

**Status:** Accepted

**Date:** 2026-09-08

**Clarified:** 2026-09-09, at Terry Yin's direction.

**Decision makers:** Terry Yin

**Consulted:** Terry Yin supplied the guideline and approved this decision.

## Context

Runtime skills guide an AI agent's actions. Author-facing explanations and
duplicated procedures obscure what the agent should do and can drift apart.
The story-skill refinement established a general writing guideline worth
preserving across Open Dough skills.

## Decision

1. Write runtime instructions for the agent reading and executing them. Use
   direct, actionable language. Include rationale only when it helps choose
   between valid actions or prevents behavioral drift. Address the agent in the
   project where the skill is being used. “This project” means the project
   established by the task, including an explicitly selected target; it does
   not mean the Open Dough source repository or the skill's directory. Resolve
   project paths, decisions, vocabulary, and workflow from that context. Do not
   ask the user to identify a separate “client project” when the task already
   establishes the project. Open Dough's internal ADRs may inform authoring,
   but must not become runtime dependencies or decisions imposed on that project.
2. Keep provenance, extraction history, checksums, and maintainer analysis in
   recognition or other maintainer records, outside runtime instructions.
   This includes the North Star's decision-cache interpretation and effort/token
   rationale. Public guidance describes architectural direction and its lifecycle.
   Maintainer concepts such as “client project,” “client payload,” recognition
   records, and guidance promotion describe Open Dough's production and delivery
   work; they are not vocabulary requirements for published skills or rules.
   When execution needs multiple locations, name their roles explicitly—for
   example, the target project, installed skill directory, and Open Dough
   release source in the updater. Include only the delivery detail needed to
   perform that task.
3. Give each behavioral rule one authoritative home. Link to it instead of
   repeating procedural rules across `SKILL.md` and references. Keep one shared
   behavioral source across tools, with only necessary host adaptation.
4. Keep `SKILL.md` concise: discovery-relevant purpose, essential constraints,
   workflow boundaries, required context, and links. Put conditional or detailed
   behavior in focused references; specify when to load them. Do not add reference
   files when a simple skill is already self-contained.
5. Preserve non-obvious invariants, user intent, authorization boundaries, and
   conventions supplied by the executing project. Specify choices precisely
   when correctness requires it; leave judgment where multiple approaches are
   valid. Perspective corrections retain checks for genuinely missing context.
6. Apply the same audience and location review to descriptions, headings,
   examples, templates, and linked runtime references. Check meaning in context;
   a phrase replacement alone does not establish correct instructions.

## Consequences

Skill reviews focus on useful agent behavior and necessary context, using the
representative review in [AGENTS.md](../../AGENTS.md) and the existing validation
boundaries in [ADR 0005](./0005-cross-tool-validation-accepted.md). Shorter prose
must not remove safeguards or make required dependencies undiscoverable.

This decision adds no approval gate or mandatory file layout. Human consultation,
announcement, and acceptance remain governed by
[ADR 0000](./0000-use-adrs-accepted.md).
