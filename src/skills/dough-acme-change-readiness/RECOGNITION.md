# Recognition: dough-acme-change-readiness

Status: ready for maintainer review

## Original clues

- Original guidance name: `acme-change-readiness`
- Original source-relative location:
  `.agents/skills/acme-change-readiness/SKILL.md`
- Guidance form: an on-demand skill

These clues are provenance only. A project name or repository identity is not
required for recognition.

## Purpose

Produce a compact readiness brief for a proposed change without implementing it,
and leave approval with a human.

## Triggers

- Someone asks whether a change is ready to build.
- A maintainer wants a readiness brief before implementation.

## Distinguishing behavior

- Reads the proposal only; does not implement.
- Extracts user, outcome, main failure risk, and a rollback signal.
- Requires an adopter-declared work-item reference and refuses to invent one.
- Returns a brief with fixed headings, including `Missing context`.
- Labels `ready for human review` only when headings are concrete and the
  work-item reference is present; humans own approval and exceptions.

## Adopter-provided context

- Work-item identifier convention (for example `TASK-NNN`).

## Differences that rule out replacement

Guidance is not an equivalent substitute if it invents work-item identifiers,
implements the proposal, omits user/outcome/risk/rollback fields, or claims
approval authority for the agent.

## Validation needed

Walk one representative proposal under `AGENTS.md`: confirm invocation context,
required adopter convention, useful brief fields, and human-owned decision.
