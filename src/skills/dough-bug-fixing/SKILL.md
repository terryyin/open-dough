---
name: dough-bug-fixing
description: Fixes reported bugs with a test-first workflow, from a confirmed failing test through the smallest fix and focused verification. Use for a bug report, defect, regression, broken behavior, or unexpected behavior that needs correction.
---

# Fix a reported bug

Reproduce the defect in a failing test, apply the smallest fix, confirm green,
and hand off for refactoring and commit. Keep the change focused on observable
behavior and make test failures explain what went wrong.

## Resolve project context

Use this project's reported and expected behavior, relevant code and tests,
tooling wrapper, focused test commands, fixture conventions, and testing rules.
Resolve these from the established task and repository. If required behavior
or tooling context is missing, report the gap and stop the affected work rather
than inventing it.

Choose the test level:

- If the bug matches an existing E2E scenario's feature and user interaction,
  extend or add an E2E test.
- Otherwise write a small test through a stable boundary, such as a controller,
  mounted component, CLI entry point, or deliberate domain API. Exercise real
  lower layers with crafted data and this project's fixture helpers; mock only
  external dependencies, subject to the project's explicit testing exceptions.
  Do not test internal helpers when a stable boundary is available or widen
  exports solely for tests.

## Reproduce before fixing

1. Locate the likely defect. Treat this as a hypothesis until the test confirms it.
2. Write the minimum test or smallest addition that reproduces the bug. Prefer
   updating an overlapping or contradictory test over adding duplicate coverage.
3. Assert observable output, such as the response, rendered text, terminal output,
   or exit code. Prefer expected-versus-actual assertions to boolean checks so
   the diff identifies the mismatch. Tighten assertions that could pass while
   the bug remains.
4. Run the test and confirm it fails because of the reported bug, not a typo or
   environment issue. Improve an unclear assertion or failure message before
   proceeding. If the failure cannot be confirmed, return to the hypothesis;
   do not skip this step or claim reproduction.

## Fix and verify

1. Make the smallest change that passes the test. Remove debugging and dead code.
2. Run the regression test and related tests in the same file or feature.
   Select only relevant E2E specs using this project's test runner. Do not run
   the full E2E suite unless explicitly requested.
3. Simplify overlap introduced among tests. Before commit, run
   [dough-post-change-refactor](../dough-post-change-refactor/SKILL.md) on the full
   uncommitted change, or explicitly delegate that step to the caller's wrap-up.
   If that skill is unavailable, report the missing dependency and pending
   pre-commit step. An unresolved refactoring stop prevents commit.

## Report

Report the bug location, test level and rationale, test files added or updated,
confirmed failure and its cause, fix, and passing focused commands. State
whether refactoring completed or remains delegated to caller wrap-up.
Return control to the caller for delivery.

Only after the regression and related tests pass, with no debugging residue,
end the summary with `## BUG FIX COMPLETE`. If blocked or verification fails,
report the gap without the completion marker.
