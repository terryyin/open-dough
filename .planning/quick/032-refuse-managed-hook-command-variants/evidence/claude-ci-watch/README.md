# Slice 3 evidence: this coordinator's own native CI-watch boundary

Unlike Slices 1-2, this exercises the *coordinator's own* native Bash/hook
boundary in this real session — not a separately launched `claude` process —
per the plan's instruction to "verify the execution coordinator's own
readiness separately from disposable acceptance sessions."

## Readiness (real, unplanned evidence)

Before any controlled-failure setup, this coordinator ran the real probe and
started a real observer against this repository (`terryyin/open-dough`,
`main`) as required before any push under `dough-execute-plan`'s own
contract (a gap in this execution: it should have been running before the
Slice 1 push too, and was only started afterward). That real observer then
delivered a genuine `CI_INCOMPLETE` event for the Slice 1 merge push, which
led to the CI-timeout repair recorded under Slice 2's outcome
(`.github/workflows/ci.yml`, commit `9037a6a`). That is real, unscripted
native-hook evidence in its own right, distinct from the controlled checks
below.

## Controlled-failure check

Quick 031 left a `gh` stand-in (`evidence/controlled-gh.py`) that only
implements the startup `run list` call and returns a jobs-shaped body for
*any* other invocation regardless of the fields actually requested — it
would not have produced valid data for `watch-ci-execution.mjs`'s real
polling contract (`run list` → `run view --json attempt,status,conclusion,url`
for tracked runs → `run view --json jobs` for a completed failure). This
slice's `controlled-gh.py` implements all three shapes correctly by parsing
the actual `--json` field list requested, so the real, unmodified
`watch-ci-execution.mjs` / `ci-failures.mjs` state machine runs against it.

Procedure (`CONTROLLED_GH_MODE=failure`, the default):

1. Snapshotted `.claude/settings.json` / `.cursor/hooks.json` (`settings-before.sha256`).
2. Started an observer with the fixture `gh` first on `PATH`, pointed at a
   fake repo/branch (`fixture/dough-032-ci-watch`, `main`) with a random
   token (`acceptance-309dc40a158b36ec`) embedded as a job name — unknown to
   the prompt, generated fresh per run.
3. At the *next* tool boundary, the `PostToolUse` hook delivered
   `CI_FAILURE` with `failedJobs[0].name` equal to the token — exactly once.
4. Two further boundaries stayed quiet — no duplicate delivery.
5. `ci-mailbox.mjs stop <mailbox>` returned
   `{"recordedThrough":1,"deliveredThrough":1,"unread":0}` (`fixture-stop-result.txt`).
6. Settings files were byte-identical before and after (`settings-after.sha256`).

## Unavailable-hook check

`CONTROLLED_GH_MODE=unavailable` makes the fixture `gh` always exit 1.
Started a second, independent observer (`fixture/dough-032-ci-unavailable`);
after three consecutive failed polls (~65s, matching the real 30s poll
interval and 3-error threshold in `watch-ci-execution.mjs`), the next tool
boundary delivered `CI_MONITOR_UNAVAILABLE` with the real underlying `gh`
error text — no monitoring promise, no partial/fabricated result. Stopped
cleanly (`fixture-unavailable-stop-result.txt`); settings files again
byte-identical before/after.

## Outcome

No product, adapter, or runtime defect was found — `watch-ci-execution.mjs`,
`ci-failures.mjs`, `ci-runs.mjs`, and `ci-mailbox.mjs` already satisfy every
proof point in Slice 3's Behavior exactly as designed. The relevant existing
regression suite (`ci-host-hook.test.mjs`, `ci-host-hook-process.test.mjs`,
`ci-claude-lifecycle.test.mjs`) was re-run unaffected (no source changes were
needed in `src/skills/dough-execute-plan/scripts/`).

Note: while this check was running, the human maintainer was independently
committing and pushing unrelated work (`dough-execution-retrospective`
skill) directly in this same checkout. That work is untouched by anything
here.
