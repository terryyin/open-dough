# Prevent bash-version-masked shell test failures

Status: complete. Authorized on 2026-09-19 to settle the first backlog item with a proportional fix.

## Source and scope

Execution retrospective of the gate-and-deliver scripted backlog plan,
recoverable at `a3c732c:.planning/quick/060-gate-and-deliver-scripted-backlog/PLAN.md`
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

The current instruction selects this first backlog item independently. The
file-size cleanup remains queued and is not a prerequisite.

## Execution identity

Story Branch Mode: originating/integration checkout
`/Users/terryyin/git/open-dough`, integration target `origin/main`;
execution checkout `/Users/terryyin/git/open-dough-bash-test-preflight`,
branch and push target `codex/bash-test-preflight` on `origin`
(`git@github.com:terryyin/open-dough.git`). Queue claim: `32c2f26`.
If this ceases to fit one small change, retain the work and plan the remainder
rather than silently expanding execution.

CI observer: GitHub Actions `ci.yml` / `CI`, coordinator `root`, runtime
`.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs` in execution checkout;
cell `13`, session `64355`, PID `82553`, directory
`/tmp/dough-ci-501/watch-x5Jn2U`. No project CI override exists.

## Current findings

Direct reproduction confirms system Bash 3.2 ignores a failing standalone
`[[ ]]` with `set -e`, while `/opt/homebrew/bin/bash` stops. The one suite
entrypoint, `scripts/test.sh` (also used by `npm test`), launches child tests
through PATH. Checking only the runner's version would leave the modern-runner /
old-child combination unsafe. Keep the requirement in this existing runner and
check the resolved child Bash. Document Bash 4+ on PATH for direct focused tests;
raw test files are not an alternative suite launcher. No framework or assertion
rewrite is needed, and installer runtime compatibility stays unchanged.

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
Status: done
Proof: a scripted invocation of `scripts/test.sh` (or its ordinary entrypoint)
under a simulated/substituted bash below version 4 refuses clearly, before
running any test file; the same invocation under a supported bash proceeds
unchanged.

Add a preflight version check to this project's shell test entrypoint
(`scripts/test.sh`, also used by `npm test`) that refuses with a clear, actionable message
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

Execution is now authorized. Retain the
established project execution/refactor/delivery gates, run focused proof per
slice, and use `npm run lint` / `npm test` for the required broader checks
(from a supported bash). Planning alone performs no commit, push, or code
change.

## Accepted focused proof

The coordinator inspected `scripts/test.sh`, the complete disposable fixture
and observable assertions in `tests/test-runner-bash.sh`, and the existing
`tests/story-payload-assertions.sh` runner consumer. Commands run from the
execution checkout:

- `PATH="/opt/homebrew/bin:$PATH" bash tests/test-runner-bash.sh` — exit 0;
  unsupported substitute refuses before checks, real supported Bash propagates
  a failing assertion, valid test and self-check both run successfully.
- `PATH="/opt/homebrew/bin:$PATH" bash tests/story-payload-assertions.sh` —
  exit 0; missing dependency still fails through the suite with the expected
  diagnostic, and restored valid payload passes.
- `PATH=/usr/bin:/bin /opt/homebrew/bin/bash scripts/test.sh` and
  `PATH=/usr/bin:/bin /bin/bash scripts/test.sh` — expected exit 1;
  actual Bash 3.2 child is identified with path/version/remedy before any
  `Running` output, regardless of runner interpreter.
- A disposable copy of the runner with one passing assertion and a self-check,
  launched using `PATH="/opt/homebrew/bin:/usr/bin:/bin" /bin/bash`, exits 0
  and prints both success sentinels. This proves an old runner can safely
  select supported child Bash. Fixture command is retained in the execution
  conversation; it changes no repository files.

## Verification learning

The first full suite ran all 52 test scripts but ended with a runner parse error
because the coordinator added a ShellCheck comment to the executing shell file
mid-run. `bash -n scripts/test.sh` passes on the final bytes. That run is not
accepted as full-suite proof; rerun `PATH="/opt/homebrew/bin:$PATH" npm test`
against unchanged files and own its terminal outcome before delivery.
The fix is operational ordering: leave executing shell files untouched until
their verification exits. No product or framework change follows from this.

## Final verification and review

- `PATH="/opt/homebrew/bin:$PATH" npm test` — final unchanged-file run exits 0:
  52 test scripts plus self-installation pass. Local output:
  `/tmp/open-dough-bash-suite-final.log`. Existing native opt-in scenarios remain
  pending as before; this correction makes no native-host behavior claim.
- `PATH="/opt/homebrew/bin:$PATH" npm run format` — exits 0, including all
  repository lint/format checks. Only shell formatting and the intentional
  child-shell expansion annotation were needed; behavior proof stays valid.
- `PATH=/usr/bin:/bin:/opt/homebrew/bin npm test` — expected exit 1 with
  actual system Bash path/version and remedy, before any test starts.
- Independent `dough-post-change-refactor` review: none — already clean;
  no refactor edits or proof invalidation. All touched files are under 250 lines.
- Retrospective: outcome and three regression scenarios match the bounded
  correction. No further product correction or backlog expansion is needed.
  The mid-run edit mistake and clean rerun are recorded above; no new process
  mechanism is justified. Existing findings belong to predecessor executions
  and remain untouched.
