# Open Dough Project Findings

Project-owned retrospective findings: problems in how this repository builds,
tests, and proves Open Dough, rather than in the published Open Dough skills or
their release payload. General execution lessons and published-skill defects
remain in [DearDough.md](DearDough.md), which also keeps local-number
allocation (DD-NNN) and removed-finding recovery references. An occurrence in
this repository alone does not make a cause project-specific. Original finding
codes and occurrence evidence are retained.

Reviewed on 2026-09-27 against `7ebcb07c`. Frequency counts distinct
executions, not commands, retries, or repairs.

## Priority assessment

1. **Test-runner settings reaching what the runner starts (DD-114) — first.**
   Two executions on 2026-09-27 (plans 122 and 120): one red CI run, and one
   product guard whose test passed even with the guard removed. Both concrete
   leaks are repaired, and the runner now keeps every `OPEN_DOUGH_TEST_*`
   setting from its jobs (SEED-051#isolate-runner-settings, `6b2ca78f`).
   Its generic facet, a consumer check that misses non-import consumers, is
   already published guidance tracked as ODF-003 and ODF-118 in
   [DearDough.md](DearDough.md); this file owns the runner's own design.
2. **Behavior audits that miss guidance-directed actions (DD-113) — low, not
   queued.** One execution; its missed merge was corrected by plan 121
   (`178e0346`), and no recurrence is recorded. A story would buy little until
   it recurs.

3. **Local time-budget measurement under load (DD-158) — low, not
   queued.** Two executions (plans 135 and 139): agent time spent on paired
   A/B runs misjudged the CI job time that CI's own test-times artifact
   reports, once about 10 s high and once about 11 s low.
4. **Assessor counterexamples narrower than the planned state (DD-160) —
   low, not queued.** One execution (plan 139): a paid run's inconclusive
   shape was first assessed fail; corrected in `afa43926`.
5. **Paid native runs refused by the host's permission check (DD-161) — low,
   not queued.** One execution (plan 139): the developer's approval did not
   let the coordinator start the run; the developer had to request it again.
6. **Direct shell-check runs with macOS Bash 3.2 (DD-162) — low, not
   queued.** One execution (plan 140): a coordinator-prescribed direct run
   bypassed the runner's Bash 5 guard and cost one diagnosis agent.
7. **Negated assessor counterexamples never failed (DD-164) — resolved in plan
   142.** `! assess` lines under `set -e` were not enforced; all 38 now run
   through `git_publication_suite_expect_rejected`.

8. **The host's `NODE_ENV` reaching the dashboard build (DD-166) — resolved
   in plan 148.** One execution: read-count specs flaked locally but not in
   CI; `eecfefc6` makes every build production.

No other project-owned problem is supported, so only one story is queued.

Resolved and removed on 2026-09-27: ODF-060 (a new payload file published
without its declarations). `install.sh`'s `managed_files` is now the only
declaration, `tests/payload-declaration-links.sh` (`c7112a5`) catches an
undeclared linked file locally without installing, and the 17 payload files
added from 2026-09-26 through `40cb0bca` needed no declaration repair. Its
record is recoverable at `7ebcb07c:DearDough.md`.

ODF-096 (native acceptance fixtures that could not pass) was reviewed and left
in DearDough.md: its plan's rule came from published slice planning, and the
published planning-premise response covers it.

## Test-runner settings reaching what the runner starts (first priority)

**Follow-up:** delivered: "Keep the test runner's own settings from reaching
the checks it starts" (story at `6ddfcf01`:`.planning/seeds/SEED-051-isolate-test-runner-settings.md`)
covers the split occurrence (plan 122). The plan 120 occurrence, a setting the
runner shares with every check on purpose reaching product code under test, is
not part of it: `23a3a759` repaired that case, and the general proof-design
concern stays with the published guidance tracked as ODF-003 and ODF-118.

### DD-114 — A new runner setting reached checks that start the runner; only CI's split jobs showed it

Slice 1 proved `OPEN_DOUGH_TEST_SPLIT` over substitute checks, but runner tests that start the runner themselves inherited the CI job's split and ran only a share of their own substitutes. The existing precedent that jobs do not inherit `OPEN_DOUGH_TEST_TIMES` was not applied to the new setting.

**Response:** SEED-051#isolate-runner-settings (plan 132, `6b2ca78f`). `scripts/test.sh` unsets every `OPEN_DOUGH_TEST_*` variable in one prefix-wide `unset` after listing the jobs, in place of one `unset` per setting, so a setting added later stays with the runner too. `tests/test-runner-split.sh` gives the runner a job count and an unknown `OPEN_DOUGH_TEST_ANYTHING`, and its substitute checks fail naming any `OPEN_DOUGH_TEST_*` variable they inherited.

#### Occurrences

- Execution: `SEED-046#ci-verdict-round-2` / plan 122, first related implementation commit `a034dfd`
  - Timestamp: 2026-09-27T02:16:29Z (CI run 36287963592 `test (1/2)` failed)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac`
  - Evidence: run 36287963592 of `a2a3765`: five `tests/test-runner-*.sh` failures, e.g. `all.record names [alpha.sh delta.sh]`; repair `ceae01c` unsets the split after listing jobs and asserts no substitute inherits it.
  - Observed effect: one red CI run, two agents paused behind a repair stash, and a repair plus refactor pass (about 10 minutes).
  - Inference: Qualified. Slice 1's proof could have run the suite as each share (`OPEN_DOUGH_TEST_SPLIT=1/2 npm test`), which reproduced the failure locally during the repair.
- Execution: `SEED-048#explicit-test-environment` / plan 120, first related implementation commit `818907d`
  - Timestamp: 2026-09-27T10:00:37+08:00 (`818907d`, concurrent with plan 122's `ceae01c`, so not a recurrence after that repair)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown
  - Evidence: `818907d` made `scripts/test-environment.bash` export `user.useConfigOnly=true` through `GIT_CONFIG_COUNT` to every check. Product code started by `workspace-publication-startup-agent-credit.test.mjs` inherited it, so with `workspace-agent-authorship.mjs`'s own `-c user.useConfigOnly=true` guard removed the check still passed. Found by plan 120's retrospective mutation (correction plan 127, finding 1); repaired by `23a3a759`.
  - Observed effect: a product safeguard without effective proof until the retrospective; one correction slice.
  - Inference: Qualified, related mechanism. Here the runner gave a setting to checks on purpose, and it also reached the product code under test. Together with the split leak, each runner-level setting was repaired separately, and nothing states which settings may reach what the runner starts.

## Behavior audits that miss guidance-directed actions (low priority, not selected)

Open Dough's behavior is carried by both scripts and the skill guidance that
directs agents, so an audit of where a behavior happens has to cover both.

### DD-113 — The planning audit of commit paths missed commits made by following guidance

The planning audit listed only the scripts that create agent-authored commits. It missed the merge commit that guidance tells the agent to make in its owned workspace, so a scope promise went unplanned until the retrospective.

#### Occurrences

- Execution: `SEED-047#agent-and-developer-credit` / plan 119, first related implementation commit `01a3e2c`
  - Timestamp: 2026-09-27T07:47:40+08:00 (plan `e023a7f`)
  - Tool: Codex
  - Open Dough release: modified; revision 1b66466; base 0.3.41
  - Evidence: plan 119's PFE names the scripts that create commits (`--author` / `commit-tree`). `publish-the-candidate.md` "Preserve published history" and `product-backlog-git-merge.mjs` `commitAcceptedMerge` still make an agent-authored integration merge without the credit, as merge `199ae44` shows. Correction plan 121.
  - Observed effect: one follow-up correction story. Qualified inference: an audit that greps scripts for commit creation cannot see commits that guidance directs.

## Local time-budget measurement under load (low priority, not selected)

`tests/time-budget` is judged only on CI, and CI's `test-times-*` artifacts
report each job's seconds.

### DD-158 — Local paired A/B runs under load were spent proving a CI-judged budget, and overestimated it

Plan 135's slices required the native job to stay inside `per-job-seconds=71`.
Both implementation agents measured it locally under heavy load and projected
the CI time from ratios; CI's measurement after the push was lower.
Plan 139 repeated the method and its projection came out low instead.

#### Occurrences

- Execution: `SEED-028#native-one-shot-acceptance` / plan 135, first related implementation commit `d44069f1`
  - Timestamp: 2026-09-27 (slice 1 and slice 2 implementation, between Take `fc3393d2` and `5181d769`); exact times unknown
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision 2b46e651; base 0.3.43
  - Evidence: slice 1 ran 3 paired A/B runs (estimate 54–56 s); slice 2 ran 5+5 sequential runs judged too noisy, then 3 concurrent pairs (estimate 61–62 s; agent total 1,708 s). CI run 36325895856 of `5181d769`, artifact `test-times-*`: `52.2 tests/git-publication-native.sh`.
  - Observed effect: a large share of slice 2's agent time went to timing, and the projection was about 10 s high.
  - Inference: Qualified. With a wide projected margin, the pushed revision's CI test-times artifact settles the budget more cheaply; a CI breach already fails the split job.
- Execution: `SEED-028#native-one-shot-escalation` / plan 139, first related implementation commit `23663a21`
  - Timestamp: 2026-09-28 (slice 1 implementation, between Take `0466e5ba` and `23663a21`); exact times unknown
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision 0466e5ba
  - Evidence: slice 1's agent ran 3 paired A/B runs under load (72.5 s → 80.5 s) and scaled the seed's recorded 52.2 s to a 58 s projection. CI run 36379953372 of `23663a21`, artifact `test-times-*`: `69.0 tests/git-publication-native.sh`; recent main runs 48.5–61.2 s. Follow-up split `82fbd2ec` measured 41.5 s and 17.2 s on CI.
  - Observed effect: the projection was about 11 s low. It hid a 2 s margin, which needed a further split commit and refactor pass.
  - Inference: Qualified. Scaling one stale CI number ignores CI's own spread; recent CI `test-times-*` for trunk gives the baseline range without local timing.

## Assessor counterexamples narrower than the planned state (low priority, not selected)

### DD-160 — An escalation counterexample removed two signals at once, hiding an assessor ordering defect

Plan 139 slice 1 planned "admission with no prior one-shot edits (admitted up
front) → inconclusive". The counterexample removed the `--one-shot` start and
the carried edits together, so an assessor that checked a clean workspace
before checking whether anything was carried still passed it. The first paid
run showed the uncovered shape: the agent started one-shot, edited nothing, and
admitted with `--carry`, and the assessor reported fail instead of the story's
inconclusive.

#### Occurrences

- Execution: `SEED-028#native-one-shot-escalation` / plan 139, first related implementation commit `23663a21`
  - Timestamp: 2026-09-28 (paid run 1, results `test-results/native-escalation-1`, before `afa43926`); exact time unknown
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision 0466e5ba
  - Evidence: `23663a21:tests/support/git-publication-native-one-shot-escalation.sh` counterexample "Admitted up front" and assessor order. Run 1 observations `one-shot-start-observed: true`, `edits-carried: false`, `workspace-edits:` empty → `fail`. Corrected in `afa43926` with a separate "admitted before editing" counterexample.
  - Observed effect: a transcript investigation and a correction commit before run 2; the paid run itself was needed anyway, because its fixture also had to change.
  - Inference: Qualified. Counterexamples that vary one planned signal at a time would have exposed the ordering; proof acceptance checked each named case, not whether each case isolated its signal.

## Paid native runs refused by the host's permission check (low priority, not selected)

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

## Direct shell-check runs with macOS Bash 3.2 (low priority, not selected)

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

## Negated assessor counterexamples never failed (resolved)

### DD-164 — `! assess` counterexamples under `set -e` were never enforced

Bash exempts negated commands and all but the last command of `&&` lists from
`set -e`, so native-harness counterexamples written as `! …assess` passed even
when the assessor accepted them; this also hid an unenforced live `ignored-only`
clause.

**Response:** plan 142 (`ddbcb90a`) routes every counterexample through
`git_publication_suite_expect_rejected`; a mutation check shows all 38 enforced.

#### Occurrences

- Execution: `SEED-008#owned-context-start-and-truthful-refresh` / plan 142, first related implementation commit `7e86f615`
  - Timestamp: unknown (harness repair after the 2026-09-28 native runs)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: trunk-closure, story-branch, and delivery-evidence assessors; mutation check in the repair's refactor report.
  - Observed effect: 38 counterexamples provided no protection until repaired.

## The host's `NODE_ENV` reaching the dashboard build (resolved)

### DD-166 — A host-exported `NODE_ENV=development` made the suite's dashboard build a development bundle

Claude Code exports `NODE_ENV=development` to its shells. Vite honored it on
`npm run build:dashboard`, so the suite's preview served React's development
bundle, whose StrictMode mounts effects twice: each page open sent a second,
aborted opening read that under load could still reach the fake `gh`. CI sets
no `NODE_ENV`, so only local runs saw it. Same family as DD-114: a setting
from outside the test's intent reaching what the suite starts.

**Response:** `eecfefc6` sets `NODE_ENV=production` for `vite build` in
`dashboard/vite.config.mts`, as the dashboard README already promised.

#### Occurrences

- Execution: `SEED-052#launch-claude-refinement-background` / plan 148, first related implementation commit `78ded931`
  - Timestamp: unknown (whole-suite run between `78ded931`'s slice work, committed 2026-09-29T08:08:33+08:00, and the fix `eecfefc6` at 08:25:40+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: `direction-disclosure.spec.ts:28` saw `pathsRead` `"main"` twice at load ≈12.7; reproduced under CPU burners in `project-read-isolation.spec.ts:216`; trace showed two opening `__authenticated-read` requests, the first `ERR_ABORTED`, and React's DevTools banner in `dashboard/dist`
  - Observed effect: one flaky whole-suite run; one diagnosis agent (about 15 minutes) and a one-file fix
  - Inference: Qualified. Other read-count specs (`refresh`, `read-failure`, `project-keyboard-navigation-focus`) shared the exposure; the build fix covers them all

## Retention

- Moved from `DearDough.md` at `7ebcb07c`: ODF-060, DD-113, DD-114.
- Recovery: `7ebcb07c:DearDough.md` (ODF-060 before its resolved removal).
