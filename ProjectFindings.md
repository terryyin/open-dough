# Open Dough Project Findings

Project-owned retrospective findings: problems in how this repository builds,
tests, and proves Open Dough, rather than in the published Open Dough skills or
their release payload. General execution lessons and published-skill defects
remain in [DearDough.md](DearDough.md), which also keeps local-number
allocation (DD-NNN) and removed-finding recovery references. An occurrence in
this repository alone does not make a cause project-specific. Original finding
codes and occurrence evidence are retained.

Reviewed on 2026-10-09 against `36ac46f63786fe8b814627e81bba63851e71009d`;
classification and current-source recheck against `2677ad0d`.
Frequency counts distinct executions, not commands, retries, or repairs.
Grouping related symptoms does not establish a shared cause or duplicate an
execution. A repaired individual race does not resolve every suite failure.

## Priority assessment

1. **Dashboard suite interference and load-sensitive results — first, already
   queued.** Six distinct executions: plans 231 (DD-226), 238 (DD-224), 264
   and 266 (DD-246), 257 (project DD-240), and 276 (DD-257). Lost traces, false failures,
   and whole-suite reruns cost minutes and leave causes unexplained. The
   configured shared output/build paths still exist; load is a qualified cause
   for DD-240/DD-257, not a reproduced explanation. Keep the existing first
   story, [SEED-123#dashboard-suite-stable-under-load](.planning/seeds/SEED-123-dashboard-suite-stable-under-load.md#dashboard-suite-stable-under-load),
   unchanged. Its scope already covers retained failure output, concurrent
   builds, and the named load failures. No duplicate is queued.
2. **Local checks miss the dashboard's typed fixture imports — second,
   queued.** DD-171 recurred in two executions (plans 146 and 191), each
   producing a red dashboard CI job and a repair cycle after focused Node
   proof passed. Both signature errors were repaired, but no local gate
   connects shared fixture changes to the dashboard typecheck. Queue
   [SEED-124#check-dashboard-fixture-consumers-locally](.planning/seeds/SEED-124-dashboard-fixture-consumer-checks.md#check-dashboard-fixture-consumers-locally)
   second. This is a repository tooling gap; generic proof selection remains
   with ODF-150 in DearDough.md.
3. **Quiet passing checks obscure the selected proof — open, unqueued.**
   DD-216 and the later DD-243 reports describe the same reporter behavior in
   four executions (plans 217, 261, 263, 264). Extra runs cost seconds to
   minutes, with no observed false acceptance. Retain one finding with both
   codes; the repository deliberately requires silent passing runs, so a
   response must preserve that contract.
4. **Shell observations can invert a result on Linux — open, unqueued.**
   DD-187 has one demonstrated SIGPIPE repair cycle. The reported observer
   was fixed, but the same early-exit pipeline shape remains in two test
   helpers. Those sites are a confirmed residual risk, not additional
   observed failures. Lower priority than DD-171's two CI failures.
5. **Local native-run prerequisites and host permission handoff — low,
   unqueued.** DD-162 and DD-161 each have one execution. The Bash failure
   bypassed the documented runner; the paid-run refusal belongs to the host's
   permission boundary. Neither justifies changing public Open Dough guidance
   or adding a second high-priority story.

## Dashboard suite interference and load-sensitive results (first priority, already queued)

**Follow-up:** queued, not resolved:
[The dashboard Playwright suite gives the same result on a loaded developer machine as in CI](.planning/seeds/SEED-123-dashboard-suite-stable-under-load.md#dashboard-suite-stable-under-load)
— SEED-123#dashboard-suite-stable-under-load (DD-224, DD-226, DD-246,
project DD-240, DD-257). It is already first in the product backlog.

**Recurrence after earlier repairs:** DD-232's removal recorded 20 passing CI
runs on `06dfb716`; that established the repaired CI paths, not every local
wait or concurrent run. Plans 266 and 276 subsequently exposed different
local suite failures. The specifically repaired DD-247 paths are removed
below, while DD-257 and the older unexplained DD-240 remain open. Existing
SEED-123 already owns this remaining work; neither prior closure nor a green
rerun proves these findings resolved.

<a id="dd-226"></a>

### DD-226 — Concurrent Playwright runs in one checkout rebuild the shared `dashboard/dist` under each other

The dashboard suite builds production assets into `dashboard/dist` once per run (`dashboard/tests/support/globalSetup.ts`). A second run started from the same checkout rebuilds that directory while the first is still serving it.

#### Occurrences

- Execution: `SEED-091#story-card-information-radiator` / plan 231, first related implementation commit `c58dc07d`
  - Timestamp: unknown (slice 1 implementation, before `c58dc07d` committed 2026-10-03T21:36:52+08:00)
  - Tool: Claude Code (delegated implementation agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: the slice 1 agent's full dashboard run gave 1002 passed and 1 failed, `agent-launch-claude-verification.spec.ts` "Recheck records the one session…" (Taken membership heading mismatch), while its other Playwright runs in the same checkout rebuilt `dashboard/dist`; the spec passed 3 of 3 alone and again in a later isolated run.
  - Observed effect: one unexplained full-run failure and later delegations carrying a "never run two Playwright invocations at once" rule.
  - Inference: Qualified. The rebuild is the likely cause, but the failing run was not kept and the cause is not reproduced. A per-run output directory or a lock would make overlapping runs safe. DD-224 lost a failure to the same kind of fixed location, `dashboard/test-results`.

<a id="dd-224"></a>

### DD-224 — A delegated rerun overwrote the only output of an unexplained test failure

A refactor agent's rerun of a combined Playwright command replaced the output of an earlier run in which one spec failed, so the failure's assertion and trace were lost. The coordinator could then only try to reproduce it, and the cause stayed unknown.

#### Occurrences

- Execution: `SEED-052#unread-report-apart-from-engagement` / plan 238, first related implementation commit `f1221461`
  - Timestamp: unknown (slice 2 refactor pass, before `88357912` committed 2026-10-03T20:03:40+08:00)
  - Tool: Claude Code (delegated refactor agent and coordinator)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: the slice 2 refactor report says one run of its alert command failed `session-unread-report.spec.ts` (13 passed, 3.1m, load about 40) and that "the rerun overwrote its output"; the coordinator then ran that spec `--repeat-each 6 --workers 6` and the full command `--repeat-each 3` (48 passes at load about 42–44); plan 238 slice 2 records the failure as an open observation.
  - Observed effect: two extra reproduction runs (about one minute) and a flaky-test question left without a cause.
  - Inference: Qualified. The failure may have been load alone, but nothing retained can show it; keeping a failed run's report or `test-results` before rerunning would have answered it. One sample.

<a id="dd-246"></a>

### DD-246 — Concurrent Playwright runs in one checkout delete each other's trace output

Two agents ran dashboard Playwright commands in the same execution checkout at
the same time. Both used the default `dashboard/test-results` output folder, and
one run's cleanup removed the other's `.playwright-artifacts-*` trace files, so
passing tests were reported as failed with `ENOENT`. Giving each concurrent run
a private `--output` folder removed the noise.

#### Occurrences

- Execution: `SEED-113#reuse-unchanged-records-after-publication` / plan 266, first related implementation commit `945857c9`
  - Timestamp: unknown (slice 3 implementation and the load-flake fix ran together, before `7d8319bc` at 2026-10-07T10:01:13+09:00)
  - Tool: Claude Code (delegated implementation agents)
  - Model: claude-opus-5-5
  - Open Dough release: modified; installed guidance 0.3.56, updated to 0.3.57 by the mid-execution merge `8cc33280`
  - Evidence: slice 3 return: first 42-file run "had 4 failures, all `ENOENT` on `dashboard/test-results/.playwright-artifacts-*` trace files"; flake-fix return: first run "failed both specs, but only with trace ENOENT errors"; both reran with `--output` and passed.
  - Observed effect: one rerun per agent (minutes each); no false acceptance, because both agents read the error kind.
  - Inference: Qualified. The coordinator launched the two agents together without assigning output folders; delegation that runs tests concurrently in one checkout could name a private `--output` per agent.

**Additional occurrence moved from ODF-209 / former DD-221.** The concrete
collision is the same project test-output mechanism as DD-246. The source’s
general coordination concern remains in DearDough.md; this execution counts
once in the project suite group, and does not prove that CPU load caused the
other timeouts. Original observation and qualified inference:

- Execution: `SEED-113#recover-consistently-from-rate-limits` / plan 264, first related implementation commit `a2d43dde`
  - Timestamp: unknown (2026-10-07, while the refactor pass that preceded `823c1eda`, committed 2026-10-07T09:30:10+09:00, overlapped the CI repair delivered as `9935c040`)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION` after the merge at `fefab16d`)
  - Evidence: the coordinator ran a CI repair (run 37545377335) and a refactor pass concurrently in the same execution checkout. The repair's `--repeat-each=10 --workers=8` Playwright run cleared the shared `dashboard/test-results`, so the refactor pass's `production-watcher-updates` stress failed 8 of 8 with trace `ENOENT`, and its first `shared-observer-reads`/`story-readiness` stress failed 8 of 48 with 30-second timeouts at load about 101. Both passed on rerun, the first with a private `--output`. Later delegations required a private `--output` for every Playwright run.
  - Observed effect: two invalid stress runs and their diagnosis; no wrong verdict was accepted.
  - Inference: Qualified. Same concurrency as the earlier row, plus a shared-output-directory collision that only arises when both run in one checkout.

<a id="dd-240"></a>

### DD-240 — Claude completion and kept-start specs failed early in one full dashboard run and passed alone and in the next full run

In one full local dashboard run, seven tests failed with a poll timeout or a
start that "did not finish within the wait". They were every Claude
early-binding variant in `agent-completion-binding.spec.ts`, plus
`agent-completion-attention.spec.ts`, `agent-completion-early-recovery.spec.ts`
and `agent-launch-preparation-resume.spec.ts:128`. All seven failed among the
first tests the 8 workers ran. The same files passed when run alone (10 tests),
and the next full run passed every test. The cause is unknown.

#### Occurrences

- Execution: `SEED-107#recently-done-correction` / plan 257, first related implementation commit `5cb0984a`
  - Timestamp: unknown (slice 3 implementation, between `1d2724d6` committed 2026-10-06T12:31:18+09:00 and `ee0b21b7` committed 2026-10-06T13:07:51+09:00)
  - Tool: Claude Code (delegated implementation agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts --reporter=dot` reported 1091 passed and 7 failed in 9.0 min; the failures were in the dot line's first 20 marks. Rerunning the four files alone gave 10 passed, and a second full run gave 1098 passed in 6.5 min. Slice 3 changed the server's listed-record reads and the fake GitHub listings, not the completion or launch code. The job-local logs are not retained in the repository. No load average was recorded.
  - Observed effect: a second full run of about 6.5 minutes. The failure question is left without a cause.
  - Inference: Qualified. The longer first run and the early position point to contention at suite start (load, or the concurrent `dashboard/dist` rebuild of DD-226), but nothing retained shows which. One sample.

<a id="dd-257"></a>

### DD-257 — A twelve-spec dashboard group failed in unchanged code at default workers under load and passed at three workers

Under a load average of 7–8, two runs of the same twelve-spec Recently done
progressive group at default local workers each failed 3–4 tests, a different
set each time, in code the change did not touch: Vite not reporting its
address within 20000ms, the column "row rests" wait
(`dashboard/tests/dashboardColumnsPage.ts:49`), and an empty Backlog heading
(`dashboard/tests/dashboardPage.ts:137`). The failed specs passed alone, and
the whole group passed at `--workers=3`. The cause is unknown.

#### Occurrences

- Execution: `SEED-119#done-catalog-currency-correction` / plan 276, first related implementation commit `24fb8d48`
  - Timestamp: unknown (slice 4 refactor pass, between `f49e686f` committed 2026-10-08T12:21:15+09:00 and `e634f974` committed 2026-10-08T12:51:47+09:00)
  - Tool: Claude Code (delegated refactor agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: `npm run test:dashboard -- recently-done-progressive-loading.spec.ts … dashboard-columns-height.spec.ts --reporter=line` (the plan's Progressive range group plus helper consumers) failed 4 then 3 tests; the failed files alone gave 9 passed; the same command with `--workers=3` gave 34 passed. Slice 4 changed `dashboard/src/doneDetails.ts` and test helpers, not Vite start, column scrolling, or the Backlog column. Plan 276 slice 4 records it; the run logs are not retained.
  - Observed effect: a third run at reduced workers to obtain a green group; the failures stay unexplained.
  - Inference: Qualified. Like DD-240, contention looks likely (the machine ran other workloads), but nothing retained separates load from a shared-output collision such as DD-226. One sample.

<a id="dd-260"></a>

### DD-260 — Unchanged dashboard specs failed once in a full local suite and passed alone

During one execution's full local dashboard runs, specs the change did not
touch failed once each and then passed when run alone or repeated:
`tests/cursor-session-recovery.spec.ts:168` (session state "at the follow-up
prompt" instead of "Activity unknown…"; also `:106` once),
`tests/frame-launch-look.spec.ts:101`, and
`tests/recently-done-progressive-failed-read-refresh.spec.ts:120` (first entry
still named by its identity at the 5 s timeout). The cause is unknown.

#### Occurrences

- Execution: `SEED-126#steady-dashboard-refresh` / plan 284, first related implementation commit `5accd572`
  - Timestamp: unknown (full local runs between 2026-10-10T08:14:20+09:00 and 2026-10-10T11:51:41+09:00)
  - Tool: Claude Code (delegated implementation agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: slice 1's full run failed `cursor-session-recovery.spec.ts:168`, which then failed 1 of 3 alone and passed `--repeat-each 5` at the coordinator; slice 3's full run (1380/1384) failed `cursor-session-recovery:106` and `frame-launch-look:101`, both passing alone (4/4 for the latter); slice 4's consumer group failed `recently-done-progressive-failed-read-refresh:120` once, then passed in the rerun and 8/8 alone. Slice 4's full run passed. Plan 284 slices 1, 3, and 4 record them; logs are not retained.
  - Observed effect: extra reruns in three slices to separate these from the change; no CI failure observed for them.
  - Inference: Qualified. Matches the load-sensitive pattern SEED-123 owns (other workloads ran on the machine), but nothing retained separates load from a timing race in these specs.

## Local checks miss the dashboard's typed fixture imports (second priority, queued)

**Follow-up:** queued, not resolved:
[Catch shared fixture signature breaks in the dashboard's local checks](.planning/seeds/SEED-124-dashboard-fixture-consumer-checks.md#check-dashboard-fixture-consumers-locally)
— SEED-124#check-dashboard-fixture-consumers-locally (DD-171).

**Project boundary:** `dashboard/tests/preparingJourney.ts` imports the
repository's JavaScript Land fixture, and `dashboard/tsconfig.node.json`
includes these tests with `allowJs`. CI runs `npm run typecheck:dashboard`;
`npm test` and the check-only pre-commit hook do not. The proposed response
belongs to this repository's local check tooling and test documentation.
The general obligation to select consumer proof stays in DearDough.md.

<a id="dd-171"></a>

### DD-171 — A Land test-fixture signature change failed only the dashboard's TypeScript check

`dashboard/tests/preparingJourney.ts` imports `landWorktree` from
`src/skills/dough-story-refinement/scripts/dough-land-test-fixtures.mjs`, so the
dashboard's `tsc --build` types that JavaScript fixture from its destructuring
defaults. Slice 1 added a required-looking `identity` parameter; the focused
Node suites passed and only CI's `dashboard` job failed.

#### Occurrences

- Execution: `SEED-008#installed-wrap-up-command` / plan 146, first related implementation commit `aa4fd510`
  - Timestamp: 2026-09-29T09:20:42+08:00 (`aa4fd510`)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: CI run `36507473752` job `dashboard (1/2)`: TS2345 at `preparingJourney.ts(88,38)`; repair `de81cb96` (`identity = undefined`), then `npm run typecheck:dashboard` and `backlog-preparing.spec.ts` passed.
  - Observed effect: one red CI run, a repair stash cycle, and one repair commit.
  - Inference: Qualified. A consumer search limited to `src/skills` misses the dashboard's typed imports; running `npm run typecheck:dashboard` when a shared fixture's signature changes would catch it locally.
- Execution: `SEED-066#composable-lightweight-session-options` / plan 191, first related implementation commit `ef745cb5`
  - Timestamp: 2026-10-01T03:16:46Z (CI run 36809768647)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Evidence: slice 5 changed `landWorktree`'s destructured parameters in `dough-land-test-fixtures.mjs`; its proof never ran `npm run typecheck:dashboard`, and `dashboard/tests/preparingJourney.ts` failed with TS2345 again; repair `716c933b`. Original delegation-facet evidence is recoverable in
    `80043764511288cf27c5f14b128c2820110a8b45:DearDough.md` under DD-191
    (plan 191); that entry is no longer in the active DearDough.md.
  - Observed effect: one red CI run and a stash-protocol repair cycle; the same file and error as plan 146.

## Quiet passing checks obscure the selected proof (open, unqueued)

**Follow-up:** open, unqueued. The default quiet reporter still prints no
passing selection/count. Do not change the silent-pass contract just to obtain
a count; refine a repository-specific way to retain selection evidence if
this cost warrants work.

<a id="dd-216"></a>

### DD-216 — Literal proof commands printed no pass counts, so agents reran passing suites

The plan's focused Playwright commands used the default reporter. Under the agents' shell, a passing run printed no summary, and two agents reran the same selection with `--reporter` just to report counts.

#### Occurrences

- Execution: `SEED-052#cursor-native-activity-and-controls` / plan 217, first related implementation commit `7053bc62`
  - Timestamp: unknown (slice 1 implementation and refactor, between the claim at 2026-10-02T16:31:54+08:00 and `7053bc62` at 16:42:11+08:00)
  - Tool: Cursor (delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION`)
  - Evidence: plan 217 slice 1 proof is `env -u NO_COLOR npm run test:dashboard -- … --workers=2` with no reporter. The slice 1 implementer reported "The run exited 0 but printed no summary, so I'm rerunning with the list reporter" (41 passed). The slice 1 refactor agent reported "The test run exited 0 but printed no pass count, so I'm rerunning it with the line reporter" (30 passed). From slice 2 the coordinator added `--reporter=line` to delegated commands, and there were no further count reruns.
  - Observed effect: two extra Playwright runs of 30–41 tests each.
  - Inference: Qualified. Diagnosed at refinement on 2026-10-03: the dashboard's quiet reporter (`dashboard/playwright.config.ts`) and the Node runner print nothing on a passing run by design; the shell was not the cause.

<a id="dd-243"></a>

**Same finding, later reports: DD-243.** Retained under DD-216 rather than
counted as a second cause. Plans 261, 263, and 264 are three additional
executions; repeated agents within each execution count once.

`npm run test:dashboard` prints nothing on a pass, so a delegated agent cannot see which or how many tests its filtered command selected, which proof acceptance asks it to report. Agents reran passing commands with `--reporter=line`, `--reporter=list`, or `--reporter=dot` to obtain the count.

#### Additional occurrences

- Execution: `SEED-113#share-repeated-observer-reads` / plan 261, first related implementation commit `a1c593a9`
  - Timestamp: unknown (slice 3 and slice 4 refactor returns, 2026-10-06, before `74f6904b` and `572faa6f`)
  - Tool: Claude Code (delegated refactor agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: slice 3's refactor return: "The first run of this command without `--reporter=line` cut off its output before the result, so I ran it again"; slice 4's refactor return: "The default reporter printed nothing on a pass, so I added `--reporter=list` to see the counts"; slice 4's implementation reported its whole-suite count from a `--reporter=dot` run.
  - Observed effect: at least two repeated focused runs (seconds to tens of seconds each); counts were reported for acceptance.
  - Inference: Qualified. The silence is the project's chosen contract for passing journeys; the cost is small but recurs per agent. Stating in the delegation which reporter yields a selection count would avoid the rerun.
- Execution: `SEED-113#shared-read-waiter-residue-correction` / plan 263, first related implementation commit `11ddc3db`
  - Timestamp: unknown (2026-10-07, before commit `11ddc3db`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: coordinator conversation: the plan's focused command `npm run test:dashboard -- <12 specs> --workers=2`, piped to `tail -8`, showed only the npm header; the coordinator reran it as `npx playwright test ... --reporter=line` to see `53 passed`.
  - Observed effect: one repeated focused run (about 15 seconds).
  - Inference: Qualified. The plan's literal proof command has the same gap as the delegation; naming a counting reporter in the plan's Proof section would avoid it.
- Execution: `SEED-113#recover-consistently-from-rate-limits` / plan 264, first related implementation commit `a2d43dde`
  - Timestamp: unknown (refactor returns of slices 1, 3, 5, and 7, 2026-10-07)
  - Tool: Claude Code (delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 at claim `0edabd1c`; 0.3.57 after the merge at `fefab16d`
  - Evidence: slice 1's refactor return: "the default reporter printed no summary", rerun with `--reporter=line`; slices 3, 5, and 7's refactor returns invoked `npx playwright test ... --reporter=line|list` directly "because the default reporter's output did not show".
  - Observed effect: repeated or reshaped focused runs to obtain counts; counts were reported for acceptance.
  - Inference: Qualified; the same recurring cost, unchanged by the release.

## Shell observations can invert a result on Linux (open, unqueued)

**Follow-up:** open, unqueued. Current `producer | grep -q` sites remain in
`tests/support/product-backlog-native-use.sh` (unresolved-index and driver
checks) and `tests/helpers/product-backlog-payload-runtime.bash` (status
checks). They are repository test helpers, outside the published payload.
Do not claim these residual sites have failed without an observed occurrence.

<a id="dd-187"></a>

### DD-187 — A `git log | grep -q` observation under `pipefail` flipped on CI when git lost the race to SIGPIPE

The startup observer read `claim-owned` from `git log --format=%B … | grep -Fq`
in a suite run under `set -euo pipefail`. When `grep -q` matched and exited
while git was still writing, git died of SIGPIPE (141) and `pipefail` turned
the match into `claim-owned: false`. macOS usually let git finish first; the
Ubuntu runner did not.

#### Occurrences

- Execution: `SEED-055#assessor-counterexample-discipline` / plan 165, first related implementation commit `84b4f28f`
  - Timestamp: 2026-09-29T15:40:33Z (CI failure on `00cc1b62`)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: CI run 36591803631 `test (1/2)`: `FAIL: counterexample command-only (signal setup-marker) changes signals remote-claim, setup-marker (fields claim-owned, …)`; local `tests/git-publication-native.sh` passed. A repro with one extra commit under the claim gave `claim-owned: false` with `PIPESTATUS` `141 0`. Repaired in `66f96e34`; slice 7 (`abf2fc4f`) fixed three more observer derivations of the same shape.
  - Observed effect: one CI repair cycle (pause, stash, diagnosis agent, refactor pass, publication) during slice 6.
  - Inference: Qualified. A different mechanism from DD-186's load-dependent races. The new counterexample helper made the flip visible: it refuses a case whose change spans two signals, where the old primitive only checked the verdict. Other `producer | grep -q` pipelines under `pipefail` remain in `tests/support/product-backlog-native-use.sh` and `tests/helpers/product-backlog-payload-runtime.bash`.

## Layout thresholds fitted to macOS fonts (open, unqueued)

**Follow-up:** open, unqueued. DD-227 (a one-line layout check fitted to
macOS fonts) was repaired with `expectOnOneLineWhenRoom`; DD-259 is the same
class in viewport sizing, not a recurrence of that repaired check.

<a id="dd-259"></a>

### DD-259 — A short test viewport was raised to the lowest height that passed on macOS and failed on CI's Linux fonts

A header that grew about 20 px pushed an edge control out of two specs'
864×480 views. The viewports were raised to 500 px because 494 was the lowest
height that passed locally. On CI the control's long "Entry count incomplete"
label wraps taller under Linux fonts, so `dashboard-columns-height.spec.ts`
still failed at 500. In the same run, `agent-launch-ad-hoc-terminal.spec.ts`
compared a kept scroll of 0 with 0 locally because its page could not scroll,
and failed on CI once the Linux page could.

#### Occurrences

- Execution: `SEED-126#steady-dashboard-refresh` / plan 284, first related implementation commit `5accd572`
  - Timestamp: unknown (CI run 38003440839 on `5accd572`, committed 2026-10-10T08:14:20+09:00; repaired by `e1058c67`, committed 2026-10-10T08:32:01+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: CI `dashboard (3/9)`: `dashboard-columns-height.spec.ts:156` `toBeInViewport` ratio 0.9566 at 864×500; `dashboard (2/9)`: `agent-launch-ad-hoc-terminal.spec.ts:129` expected 18, received 0. Repair `e1058c67` uses 864×600 with the measured needs (≈495 px macOS, ≈515 px Linux) and a 1280×480 window plus `expect(scroll).toBeGreaterThan(0)`. The coordinator had asked for the viewport to be raised "minimally".
  - Observed effect: one CI repair cycle (stash of slice 2's work, diagnosis agent, refactor pass, publication).
  - Inference: Qualified. A threshold measured on one machine's fonts is not a margin; `published-facts-reading.spec.ts` stays at 500 with about 7 px to spare and would be next to fail if header fonts change.

## Local native-run prerequisites and host permission handoff (low priority, unqueued)

**Follow-up:** open, unqueued. Use the documented runner with Bash 5 first
on PATH; paid native runs retain their manual authorization boundary.

<a id="dd-162"></a>

### DD-162 — A shell check run directly failed locally because its substitute host resolved macOS Bash 3.2

`tests/README.md` requires Bash 5 first on `PATH` and running checks through
`scripts/test.sh`, whose guard refuses Bash 3.2. A direct
`/opt/homebrew/bin/bash tests/git-publication-native.sh` bypassed that guard;
its substitute `claude` host (`#!/usr/bin/env bash`) resolved `/bin/bash` 3.2
and aborted on an empty-array expansion under `set -u`.

#### Occurrences

- Execution: `SEED-008#same-machine-merge-queue` / plan 140, first related implementation commit `9597bf61`
  - Timestamp: unknown (slice 1 return, before `9597bf61` at 2026-09-28T12:45:56+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: slice 1 return reported `substitute claude one-shot-result exited 1 … stream-status: missing`, identical at claim `5a5087c6`; `native-agent-one-shot.sh` line 35 `named[@]: unbound variable` under `/bin/bash`; `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/git-publication-native.sh` passed.
  - Observed effect: one diagnosis agent (about 66k tokens) spent on a failure CI never had.
  - Inference: Qualified. The coordinator's delegation prompt prescribed the direct absolute-Bash run; later prompts named `scripts/test.sh` with Homebrew Bash first on `PATH` and saw no recurrence.

<a id="dd-161"></a>

### DD-161 — The developer's approval of paid runs did not let the coordinator start them

Paid native runs are manual-only and need the developer's go-ahead. On Claude
Code in auto mode, the host's permission check refused the coordinator's
native run after the developer approved all planned runs. The developer then
had to request the run explicitly.

#### Occurrences

- Execution: `SEED-028#native-one-shot-escalation` / plan 139, first related implementation commit `23663a21`
  - Timestamp: 2026-09-28 (slice 2 start, after "approve all"); exact time unknown
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision 0466e5ba
  - Evidence: the coordinator conversation: "approve all" → `tests/git-publication-native.sh --native claude` refused by the host's auto-mode classifier as agent creation. Run 1 started once the developer sent the command as a message; run 2 on "run 2".
  - Observed effect: two extra developer round trips before paid runs started.
  - Inference: Qualified. The request for go-ahead could offer the exact command, or the permission rule, the developer can use, instead of assuming approval lets the coordinator launch it.

## Review and recovery

Moved from DearDough.md on 2026-10-09: DD-243, DD-246, DD-247, DD-252.
Recovery for both input files:
`36ac46f63786fe8b814627e81bba63851e71009d:DearDough.md` and
`36ac46f63786fe8b814627e81bba63851e71009d:ProjectFindings.md`.
DD-243's unchanged occurrence evidence joins DD-216; DD-246 stays open.
The second classification pass moves ODF-209 / former DD-221’s plan-264
collision occurrence into DD-246 without allocating a new identity. Recovery:
`2677ad0d:DearDough.md`. The six-execution suite group and two-execution local
fixture-check group remain first and second; both already have queued stories.
Their fixes belong to repository test tooling and documentation, rather than
published skills or rules. No duplicate story or queue change is needed.

Resolved or mitigated entries removed from the active findings on 2026-10-09:

- **DD-247:** the named watcher/pace and completion waits were repaired in
  `7d8319bc` and `0b2613f4`; the supposedly unfixed `expectSettledPage`
  agent-profile-read race was subsequently fixed in `823c1eda`, and the
  current helper awaits `untilPageReadsAnswered`. These concrete repairs
  remove this entry's remaining causes; DD-240/DD-257 still track other
  unexplained failures under the existing suite story.
- **DD-252:** `62b21604` replaces whole-card visibility with the reachable
  card-end control and waits for settled geometry. Its retained plan-271
  acceptance records eight repeats at four workers plus the related height,
  paging, and sidebar specs passing. Current source keeps the correction.
- **DD-249:** the temporary CI probe was corrected in `2afb6ab1`; run
  `37553839091` retained the deliberately completed failure's trace and error
  context. Plan 265 records the actual alphabetic ordering, and `8958faf1`
  removes the temporary probe. No unfinished correction remains.
- **DD-250:** plan 258's retained checkout setup at `c1875574` records a
  checksum-verified Node 24.21.0 with successful npm, browser, and check
  stages. That selected runtime is still available and reports v24.21.0.
  This resolves the recorded machine's missing prerequisite, without
  removing the legitimate pinned-runtime requirement or ODF-087's separate
  preparation-gate problem.
- **DD-205:** the recorded explicitly authorized detached batch completed
  27 native sessions without further babysitting. Retain its launch practice
  in Git; DD-161 still records the separate host permission limitation.

**Classification cross-check:** These active findings require changes only
to repository test configuration, helpers, local checks, or native-run setup.
DD-238/239/240 (the DearDough occurrence, not project DD-240), DD-241/242,
DD-245/248/251/253/254/255 and the ODF entries stay in DearDough.md: their
reported mechanism concerns published planning, delegation, proof acceptance,
format-result handling, CI repair, or delivery, even when the example uses
dashboard code. In particular, DD-253's delivery command is a published
runtime, and DD-251's masked formatter exit is the shared ODF-100 class.
Neither is a project-only backlog candidate.

### Earlier reviews

Moved from DearDough.md on 2026-10-05 (recovery: `a5c0ded1:DearDough.md`):
DD-220's plan 233 and 240 occurrences, which used the same code for the same
cause seen from the readiness check, merged into DD-220; DD-224; and
DD-229, removed below as resolved. Returned to DearDough.md: DD-169 and DD-173,
whose cause is a planning premise left to the developer (the ODF-074 class).

Resolved and removed on 2026-10-08 (recovery: `49ca78ce:ProjectFindings.md`):
DD-220 (sessions the dashboard launched inherited its `NODE_ENV=production`,
`npm_*` variables and deployment `node_modules/.bin`, so `npm ci` installed no
dev dependencies). Every session the dashboard starts now runs in the
developer's shell environment (`dashboard/server/developerShellEnvironment.ts`,
described in `dashboard/AGENT-LAUNCH-HOSTS.md`). The readiness check that
still passed on another checkout's tools stays with ODF-087 in DearDough.md.

Resolved and removed on 2026-10-05 (recovery: `941cf860:ProjectFindings.md`):
DD-232 (dashboard specs failing CI on revisions that changed no code). Its
open causes were repaired in the product with forced-order specs (`3589f469`,
`759f9134`, `06dfb716`), and 20 repeated CI runs on `06dfb716` all passed.
`scripts/ci-repeat.sh` repeats that on demand. This answers CI's runners only;
a loaded developer machine stays with DD-224 and DD-226. Two later occurrences from
plan 245 (repairs `97728d3f`, `866d5a31`) are recoverable at
`b40ba186:ProjectFindings.md`.

Resolved and removed on 2026-10-05 (recovery: `a5c0ded1:ProjectFindings.md`,
and `a5c0ded1:DearDough.md` for DD-229):

- DD-186, DD-195, DD-199, and DD-222 (named timing races and launch-card
  waits): each race was repaired in its execution (`4e0b2420`, `bb5ee6a1`,
  `2929df75`, `aeb9c33d`, `a25a762f`, `85cb7d44`), and the launch-card specs
  now wait as long as a start may (`4f0d2cc4`, closed in `0123c307`), which
  also covers DD-195's unexplained `agent-launch-start-taken.spec.ts:53`. The
  class recurred after these repairs and is recorded as DD-232.
- DD-197 (hook tests needing CI's shell tools and Linux Git): repaired in
  `6be8fccc` and `8a165806`; no recurrence in the `test` job.
- DD-227 (one-line layout check fitted to macOS fonts): repaired in
  `138f693c` with `expectOnOneLineWhenRoom`.
- DD-229 (terminal width proof read visible rows whose count depended on
  resize coalescing): repaired in `d02ade82`.
- DD-202 and DD-203 (native observation drivers that assumed host state):
  both repaired in plan 192; the drivers have not been used since.
- DD-113 (planning audit missed a guidance-directed merge commit): corrected
  by plan 121 (`178e0346`); no recurrence.
- DD-184 (layout proof missed a narrowed page column's content): fixed one
  slice later with the `@container page` rule and `expectStagesStacked`.

Earlier removals: DD-160, DD-175, DD-204, and the lint half of DD-178 and
DD-194 (2026-10-03, recovery `99292557:ProjectFindings.md`); DD-168, DD-178,
and DD-194 (2026-10-03, recovery `7fa7e3f7:ProjectFindings.md`); DD-114,
DD-164, DD-166 (2026-09-29, recovery `d68fcde4:ProjectFindings.md`); DD-158
(2026-09-29, recovery `3f0f1ad3:ProjectFindings.md`); DD-179 (2026-09-30,
recovery `34ceff06:ProjectFindings.md`). DD-155 and DD-159 were returned to
DearDough.md on 2026-09-29.

### Earlier moves

- Moved from `DearDough.md` at `7ebcb07c`: ODF-060, DD-113, DD-114.
- Recovery: `7ebcb07c:DearDough.md` (ODF-060 before its resolved removal).
- Moved from `DearDough.md` at `d68fcde4` on 2026-09-29: DD-173, DD-175, and
  ODF-096's plans 142 and 146 occurrences as DD-179 (recovery:
  `d68fcde4:DearDough.md`).
- Moved from `DearDough.md` at `99292557` on 2026-10-03: DD-194, DD-195,
  DD-197, DD-199, DD-202, DD-203, DD-204, DD-205, DD-216 (recovery:
  `99292557:DearDough.md`). DD-204 was removed as resolved in the same review.
- Moved from `DearDough.md` at `a5c0ded1` on 2026-10-05: DD-220 (plans 233
  and 240, merged), DD-224, DD-229 (removed as resolved in the same review).
  Returned to `DearDough.md`: DD-169, DD-173 (recovery:
  `a5c0ded1:ProjectFindings.md`).
