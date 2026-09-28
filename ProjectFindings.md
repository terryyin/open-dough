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
   queued.** One execution (plan 135): agent time spent on paired A/B runs
   overestimated the CI job time that CI's own test-times artifact reports.

4. **Direct shell-check runs with macOS Bash 3.2 (DD-159) — low, not
   queued.** One execution (plan 140): a coordinator-prescribed direct run
   bypassed the runner's Bash 5 guard and cost one diagnosis agent.

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

#### Occurrences

- Execution: `SEED-028#native-one-shot-acceptance` / plan 135, first related implementation commit `d44069f1`
  - Timestamp: 2026-09-27 (slice 1 and slice 2 implementation, between Take `fc3393d2` and `5181d769`); exact times unknown
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision 2b46e651; base 0.3.43
  - Evidence: slice 1 ran 3 paired A/B runs (estimate 54–56 s); slice 2 ran 5+5 sequential runs judged too noisy, then 3 concurrent pairs (estimate 61–62 s; agent total 1,708 s). CI run 36325895856 of `5181d769`, artifact `test-times-*`: `52.2 tests/git-publication-native.sh`.
  - Observed effect: a large share of slice 2's agent time went to timing, and the projection was about 10 s high.
  - Inference: Qualified. With a wide projected margin, the pushed revision's CI test-times artifact settles the budget more cheaply; a CI breach already fails the split job.

## Direct shell-check runs with macOS Bash 3.2 (low priority, not selected)

### DD-159 — A shell check run directly failed locally because its substitute host resolved macOS Bash 3.2

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

## Retention

- Moved from `DearDough.md` at `7ebcb07c`: ODF-060, DD-113, DD-114.
- Recovery: `7ebcb07c:DearDough.md` (ODF-060 before its resolved removal).
