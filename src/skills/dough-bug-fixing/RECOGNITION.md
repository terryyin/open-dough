# Recognition: dough-bug-fixing

Review: ready for maintainer review

## Original clues

Extracted from Donut's on-demand `bug-fixing` skill at
`.agents/skills/bug-fixing/SKILL.md`. Its Claude discovery path shares the same
source. Project identity is provenance, not a recognition condition.

Inspected source SHA-256 values (2026-09-15):

- `.agents/skills/bug-fixing/SKILL.md`: `5f6e05732fb290b6c28283ff72f1f52fb10fdfc4b7dbc2549584877123df5f47`
- `.cursor/rules/unit-testing.mdc`: `ea1e217ca122efa82ad90450992c1ab1b0dc8f15a924f6838de110f7094719f0`
- `.agents/skills/dough-post-change-refactor/SKILL.md`: `a5629fa8f6d806a7902dd37d6437752e8303d6247bf2c01794cd0175d1389c56`

## Purpose

Correct an observable defect with demonstrated failing proof, the smallest fix,
and passing focused tests before delivery.

## Triggers

A reported bug, defect, regression, broken behavior, or unexpected result that
the user wants corrected.

## Distinguishing behavior

Existing matching E2E scenarios determine test level; otherwise use a small
stable-boundary test. Confirm the failure's cause and clarity before fixing.
Prefer updating overlapping tests, constrain E2E runs, remove debugging residue,
and require post-change refactoring before commit, possibly through caller
wrap-up. Preserve the `BUG FIX COMPLETE` handoff marker.

## Client project context

Expected behavior, navigation, tooling wrapper and focused commands, existing
E2E scenarios, stable test boundaries, fixture helpers and testing exceptions.
The post-change-refactor skill remains an explicit runtime dependency.
Generalized the Nix prefix, Cypress spec command, framework names, `makeMe`, and
local testing-rule path without imposing Donut's test taxonomy or ADRs.

## Differences that rule out replacement

Not equivalent to workflows that fix before proving failure, test private helpers
by default, routinely run all E2E tests, or omit pre-commit refactoring. The
referenced always-applied testing rule was inspected for context, not extracted:
this on-demand skill does not replace its repository-wide application or its
additional destructive-operation and fixture policies.

## Validation needed

Representative authoring walkthrough completed: a CLI prints the wrong exit
code, with no matching E2E scenario. The trigger selects this skill; project
commands and a public CLI boundary supply context; a focused expected-versus-
actual assertion fails for the reported code, the smallest fix turns it green,
related tests pass, and refactoring is completed or explicitly handed to the
caller before commit. Missing test commands stop the affected work; an
environment failure cannot count as reproduction.

Before promotion, maintainer review must confirm invocation context, required
client project context, and useful outcome under [AGENTS.md](../../../AGENTS.md),
including the refactoring handoff. This is a guidance walkthrough, not execution
of a bug fix. Extraction leaves the guidance outside payload declarations.
