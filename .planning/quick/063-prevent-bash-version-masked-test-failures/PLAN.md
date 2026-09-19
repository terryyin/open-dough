# Prevent bash-version-masked shell test failures

Status: planned. No execution has started or been authorized.

## Source and scope

Execution retrospective of
[the gate-and-deliver scripted backlog plan](../060-gate-and-deliver-scripted-backlog/PLAN.md)
(SEED-008), recovered as `DD-059` (two occurrences) and `DD-060` (two
occurrences) in `DearDough.md`. Review date: 2026-09-19. At Terry Yin's
direction, queued as its own story rather than folded silently into that
plan, since it is a durable tooling gap, not a defect in that plan's own
delivered behavior.

macOS ships bash 3.2 as its default `bash`. On that version, a standalone
failing `[[ ... ]]` test under `set -e` does not abort the script — in any
tested context (top level, inside `if`/`while`/`for`) — while the same
script correctly aborts under bash 4+ (including the bash 5.x this
project's GitHub Actions CI runs). A survey during DD-059's first occurrence
found 128 bare `[[ ]]` assertion lines across 27 shell test files in this
repository, 13 of them inside a loop body. Every one of those assertions is
currently silent on a contributor's default macOS shell and enforcing only
in CI. Two independent executions have now each lost time to this: a defect
reached CI despite a passing local run (DD-059's first occurrence), and this
project's own retrospective needed two extra live CI round-trips to
diagnose a real fixture bug that every local run reported as passing
(DD-059's second occurrence, this plan's own execution).

Goal: a contributor cannot get a false "all tests passed" result from this
project's shell test suite on an unsupported bash version. Do not promise
detection of every possible shell portability issue — only this specific,
now twice-recurring `set -e`/`[[ ]]` silent-pass failure mode.

**Execute this together with
[the file-size split correction](../062-split-oversized-installer-doc-and-fixture-files/PLAN.md),
also queued from the same retrospective.** Both are bounded, low-risk
follow-ups from the same review; completing them together finishes that
plan's full retrospective follow-up in one pass rather than two separate
pickups.

## Decisions that constrain execution

- Prefer a preflight check over rewriting the 128 existing bare `[[ ]]`
  assertions. Rewriting every assertion across 27 files is a much larger,
  higher-risk change for the same outcome; a bash-version guard makes the
  entire class of assertion safe at once, going forward, without touching
  their individual logic.
- The check must be genuinely enforced, not advisory: a contributor running
  the ordinary test entrypoint (`npm test` / `bash scripts/test.sh`) under an
  unsupported bash must see the suite refuse to proceed (or clearly fail),
  not a quiet warning easy to scroll past.
- Do not require a specific bash *installation method* (Homebrew, Nix, etc.);
  detect the resolved `bash`'s version, not its origin.
- Do not change CI itself (GitHub Actions already runs a supported bash);
  scope is the local/contributor path.

## Ordered slices

### 1. Refuse to run the shell test suite under an unsupported bash
Type: Behavior
Status: planned
Proof: a scripted invocation of `scripts/test.sh` (or its ordinary entrypoint)
under a simulated/substituted bash below version 4 refuses clearly, before
running any test file; the same invocation under a supported bash proceeds
unchanged.

Add a preflight version check to this project's shell test entrypoint
(`scripts/test.sh`, and any other independent entrypoint that runs these
`[[ ]]`-bearing files directly) that refuses with a clear, actionable message
naming the resolved `bash` path and version, and how to obtain a supported
one, before executing any test file. Verify both outcomes directly — do not
assume the check's own bash-version comparison logic is correct without
exercising it against a real substitute/older bash, per this project's own
"actually attempt the failing case" testing convention.

## Sizing, stopping points, and remaining concerns

One planned Behavior slice; no supplied numeric target or hard limit. This
plan does not attempt the separate, larger effort of rewriting existing bare
`[[ ]]` assertions to a version-independent form — the preflight guard makes
that unnecessary for this specific failure mode. If a future review finds
the guard itself insufficient (for example, an entrypoint it does not cover),
that is new evidence for a follow-up, not a gap in this plan's stated scope.

Execution requires separate authorization. When authorized, retain the
established project execution/refactor/delivery gates, run focused proof per
slice, and use `npm run lint` / `npm test` for the required broader checks
(from a supported bash). Planning alone performs no commit, push, or code
change.
